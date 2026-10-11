import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { replacementReason, replaceDraft } from './core.mjs';

const CSS = `
[data-prompt-enhancer] { color:inherit; font:inherit; }
button[data-prompt-enhancer], [data-prompt-enhancer] button { border:1px solid color-mix(in srgb, currentColor 20%, transparent); border-radius:8px; padding:6px 10px; background:transparent; color:inherit; cursor:pointer; font:inherit; white-space:nowrap; }
button[data-prompt-enhancer]:disabled, [data-prompt-enhancer] button:disabled { opacity:.45; cursor:default; }
dialog[data-prompt-enhancer] { background:var(--bg-primary, #fff); color:var(--text-primary, #222); border:1px solid #8886; border-radius:14px; width:min(880px, 88vw); max-height:85vh; padding:24px; box-shadow:0 16px 64px #0004; }
dialog[data-prompt-enhancer]::backdrop { background:#0007; }
[data-prompt-enhancer] .pe-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
[data-prompt-enhancer] pre { white-space:pre-wrap; overflow-wrap:anywhere; font:inherit; line-height:1.6; max-height:48vh; overflow:auto; border:1px solid #8885; border-radius:8px; padding:12px; user-select:text; }
[data-prompt-enhancer] footer { display:flex; gap:10px; justify-content:flex-end; margin-top:20px; }
[data-prompt-enhancer] .pe-status { font-size:13px; line-height:1.6; }
[data-prompt-enhancer] .pe-error { color:#c04a36; }
@media(prefers-color-scheme:dark) { dialog[data-prompt-enhancer] { background:var(--bg-primary, #202124); color:var(--text-primary, #eee); } }
@media(max-width:600px) { [data-prompt-enhancer] .pe-grid { grid-template-columns:1fr; } [data-prompt-enhancer] pre { max-height:22vh; } }
`;

export function EnhanceButton({ sessionId, useInput, useSession, inputActions }) {
  const input = useInput(s => s);
  const session = useSession(s => s);
  const live = useRef({ sessionId, input, session });
  live.current = { sessionId, input, session };
  const [view, setView] = useState(null);
  const [includeContext, setIncludeContext] = useState(true);
  const flight = useRef(null);
  const dialog = useRef(null);
  const generation = useRef(0);
  const available = s => !s.removed && s.openState === 'open' && !s.subagent;
  const unavailable = !available(session);
  const reason = unavailable ? '请先打开普通会话。' : input.phase !== 'plain' ? '正在处理输入，请稍后重试。' : input.occurrences?.length || input.draft.includes('\ufffc') ? '引用芯片暂不支持增强，请使用纯文本草稿。' : !input.draft.trim() ? '先输入提示词，再点击增强提示。' : input.draft.length > 16384 ? '草稿超过 16384 字符。' : '';

  function close() {
    generation.current++;
    flight.current?.abort();
    flight.current = null;
    setView(null);
  }
  useEffect(() => {
    close();
    return () => { generation.current++; flight.current?.abort(); };
  }, [sessionId]);
  useEffect(() => {
    if (view && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [view]);

  async function optimize(captured) {
    flight.current?.abort();
    const controller = new AbortController();
    flight.current = controller;
    const id = ++generation.current;
    setView({ captured, loading: true });
    const timeout = setTimeout(() => controller.abort(), 95000);
    try {
      const response = await fetch('/api/prompt-enhancer/optimize', {
        method: 'POST', headers: { 'content-type': 'application/json', 'x-dsh-prompt-enhancer': '1' },
        body: JSON.stringify({ sessionId: captured.sessionId, draft: captured.draft, includeContext }), signal: controller.signal,
      });
      const result = await response.json();
      if (id !== generation.current || captured.sessionId !== live.current.sessionId) return;
      if (!response.ok) throw new Error(result.error || '优化调用失败。');
      if (typeof result.optimized !== 'string' || !result.optimized.trim()) throw new Error('优化文本不可用。');
      setView({ captured, result, loading: false });
    } catch (err) {
      if (id === generation.current && captured.sessionId === live.current.sessionId) setView({ captured, loading: false, error: controller.signal.aborted ? '优化已取消或超时，草稿未替换。' : err.message });
    } finally { clearTimeout(timeout); if (flight.current === controller) flight.current = null; }
  }

  const stale = view ? replacementReason(view.captured, sessionId, input) || (unavailable ? '当前会话不能编辑，请稍后重试。' : '') : '';
  function confirm() {
    const current = live.current;
    if (!view?.result || !available(current.session) || !replaceDraft(view.captured, current.sessionId, current.input, view.result.optimized, inputActions)) return;
    close();
  }

  return <>
    <style>{CSS}</style>
    <button type="button" data-prompt-enhancer="button" title={reason || '优化当前草稿，预览确认后替换；不会发送。'} disabled={!!reason || !!view} onClick={() => optimize({ sessionId, draft: input.draft, draftRev: input.draftRev })}>增强提示</button>
    {view && createPortal(<dialog data-prompt-enhancer="preview" ref={dialog} aria-labelledby="pe-title" onCancel={e => { e.preventDefault(); close(); }}>
      <h2 id="pe-title">增强提示</h2>
      <p className="pe-status">仅优化文字，确认后替换草稿。保留原语言、原意与约束，不执行任务，也不会自动发送。</p>
      <label className="pe-status"><input type="checkbox" checked={includeContext} disabled={view.loading} onChange={e => setIncludeContext(e.target.checked)} /> 结合本会话用户消息（只取用户文字，不读取附件内容）</label>
      <div className="pe-grid">
        <section><h3>原始提示词</h3><pre>{view.captured.draft}</pre></section>
        <section><h3>优化后的提示词</h3>{view.loading ? <p role="status">正在优化…</p> : view.result ? <pre>{view.result.optimized}</pre> : <p role="alert" className="pe-error">{view.error}</p>}</section>
      </div>
      {view.result && <p className="pe-status">模型：{view.result.provider} / {view.result.model} · 参考用户消息：{view.result.contextMessages} 条。请核对优化稿中的约束。</p>}
      {stale && <p role="alert" className="pe-error">{stale}</p>}
      <footer>
        <button type="button" onClick={close}>{view.loading ? '取消优化' : '取消'}</button>
        {!view.loading && <button type="button" disabled={!!reason} onClick={() => optimize({ sessionId, draft: input.draft, draftRev: input.draftRev })}>重新优化</button>}
        <button type="button" disabled={view.loading || !view.result || !!stale} onClick={confirm}>替换草稿</button>
      </footer>
    </dialog>, document.body)}
  </>;
}

export const name = 'dsh-prompt-enhancer';
export const inject = ['slots'];
export function apply(ctx) {
  ctx.slots.inject('conversation.input.right', () => ctx.slots.register({ name: 'conversation.input.right', id: 'dsh-prompt-enhancer', order: 50 }, EnhanceButton), 'dsh-prompt-enhancer: composer button');
}
