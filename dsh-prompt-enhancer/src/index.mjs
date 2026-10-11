import { randomUUID } from 'node:crypto';
import { BlockAssembler, createUserMessage } from '@deepseek-ai/dsh-llm';
import { InputError, allowRequest, validateRequest, selectContext, validateOutput } from './core.mjs';
import { SYSTEM } from './prompt.mjs';

export const name = 'dsh-prompt-enhancer';
export const inject = ['webServer', 'apiProxy', 'agents', 'llm'];
const PATH = '/api/prompt-enhancer/optimize';

function json(res, status, body) {
  if (res.destroyed || res.writableEnded || res.headersSent) return;
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 131072) throw new InputError('请求过大。');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export function apply(ctx) {
  const active = new Map();
  ctx.effect(() => {
    const dispose = ctx.webServer.register({ kind: 'exact', path: PATH, handler: async (req, res) => {
      if (!allowRequest(req, ctx.webServer)) { json(res, 403, { error: '仅支持本机 DSH Web 页面内发起的 JSON 请求。' }); return; }
      const controller = new AbortController();
      const timer = setTimeout(() => {
        controller.abort();
        json(res, 408, { error: '优化已超过 90 秒，草稿未替换。' });
      }, 90000);
      const disconnect = () => { if (!res.writableEnded) controller.abort(); };
      res.on('close', disconnect);
      let sessionId;
      try {
        const request = validateRequest(await readBody(req));
        sessionId = request.sessionId;
        if (active.has(sessionId) || active.size >= 3) { json(res, 429, { error: '已有优化请求运行，请稍后再试。' }); return; }
        active.set(sessionId, controller);
        // Existing session only: enhancement must not open/resume an arbitrary task.
        if (!ctx.agents.get(sessionId)) throw new InputError('会话尚未加载，请等待会话打开后重试。');
        const response = await ctx.apiProxy.sessions.models({ rpcId: randomUUID(), payload: { sessionId } });
        controller.signal.throwIfAborted();
        if (!response.result.ok || !response.result.value.routable) throw new InputError('当前会话模型不可用，请先在 DSH 选择可用模型。');
        const route = response.result.value.current;
        const agent = ctx.agents.get(sessionId);
        if (!agent) throw new InputError('会话已关闭。');
        const context = request.includeContext ? selectContext(agent.session.events) : [];
        const assembler = new BlockAssembler();
        let finished = false;
        const options = {
          provider: route.provider, model: route.model,
          ...(route.reasoningEffort ? { reasoningEffort: route.reasoningEffort } : {}),
          system: SYSTEM,
          messages: [createUserMessage({ source: { kind: 'user' }, content: [{ type: 'text', text: JSON.stringify({ original: request.draft, userContext: context }) }] })],
          tools: [], maxTokens: 8192, signal: controller.signal,
        };
        for await (const chunk of ctx.llm.stream(options)) {
          controller.signal.throwIfAborted();
          if (chunk.type === 'finish') finished = true;
          assembler.push(chunk);
        }
        controller.signal.throwIfAborted();
        if (!finished) throw new InputError('模型未正常完成优化，未收到完成标记。草稿未替换。');
        const optimized = validateOutput(assembler.blocks(), assembler.finish);
        json(res, 200, { optimized, model: route.model, provider: route.provider, contextMessages: context.length });
      } catch (err) {
        // Provider errors may contain request URLs or credentials; never echo raw errors.
        json(res, 400, { error: controller.signal.aborted ? '优化已取消或超过 90 秒，草稿未替换。' : err instanceof InputError ? err.message : '优化调用失败，请检查 DSH 模型配置或连接后重试。草稿未替换。' });
      } finally {
        clearTimeout(timer);
        res.off('close', disconnect);
        if (active.get(sessionId) === controller) active.delete(sessionId);
      }
    } });
    return () => { dispose(); for (const controller of active.values()) controller.abort(); active.clear(); };
  }, 'dsh-prompt-enhancer: local optimize endpoint');
}
