export class InputError extends Error {}

export function validateRequest(value) {
  if (!value || typeof value.sessionId !== 'string' || !value.sessionId || value.sessionId.length > 256) throw new InputError('缺少有效会话。');
  if (typeof value.draft !== 'string' || !value.draft.trim() || value.draft.length > 16384 || value.draft.includes('\ufffc')) throw new InputError('请输入不超过 16384 字符的纯文本提示词；引用芯片暂不支持。');
  if (value.includeContext !== undefined && typeof value.includeContext !== 'boolean') throw new InputError('上下文选项无效。');
  return { sessionId: value.sessionId, draft: value.draft, includeContext: value.includeContext ?? true };
}

// This web-only companion intentionally refuses non-loopback deployments.
export function allowRequest(req, server) {
  if (server.host !== '127.0.0.1' || req.method !== 'POST') return false;
  const h = req.headers;
  const hosts = [`127.0.0.1:${server.port}`, `localhost:${server.port}`];
  return hosts.includes(h.host) && h.origin === `http://${h.host}` && h['x-dsh-prompt-enhancer'] === '1' && /^application\/json(?:;|$)/i.test(h['content-type'] ?? '');
}

export function replacementReason(captured, sessionId, live) {
  if (!captured || captured.sessionId !== sessionId) return '会话已切换，请重新优化。';
  if (live.phase !== 'plain') return '输入框正在提交或处理命令，请稍后重试。';
  if (live.occurrences?.length || live.draft.includes('\ufffc')) return '引用芯片暂不支持替换，请使用纯文本草稿。';
  if (captured.draftRev !== live.draftRev || captured.draft !== live.draft) return '草稿已修改，为保护新输入，请重新优化。';
  return '';
}

export function replaceDraft(captured, sessionId, live, text, actions) {
  if (replacementReason(captured, sessionId, live) || !text.trim() || text.includes('\ufffc')) return false;
  // A synchronous revision check and the public write action share one JS turn.
  // Only text is replaced; attachment actions and submit() are never called.
  actions.setDraft(text);
  return true;
}

export function selectContext(events) {
  const context = events.filter(e => e.type === 'user/message' && e.data?.source?.kind === 'user')
    .map(e => e.data.content.filter(b => b.type === 'text').map(b => b.text).join('\n')).filter(Boolean);
  if (new TextEncoder().encode(JSON.stringify(context)).length > 65536) throw new InputError('本会话用户文字超过 64 KiB，未截断上下文。请取消“结合本会话用户消息”后重试，或使用较短会话。');
  return context;
}

export function validateOutput(blocks, finish) {
  if (finish.kind !== 'stop') throw new InputError('模型未正常完成优化（可能超长、取消或调用失败），草稿未替换。');
  if (blocks.some(b => b.type === 'tool-call')) throw new InputError('优化阶段不允许执行工具。');
  const text = blocks.filter(b => b.type === 'text').map(b => b.text).join('').trim();
  if (!text || text.length > 32768 || text.includes('\ufffc')) throw new InputError('模型返回的优化文本为空或不可用。');
  return text;
}
