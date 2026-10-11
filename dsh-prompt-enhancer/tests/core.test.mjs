import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRequest, allowRequest, replacementReason, replaceDraft, selectContext, validateOutput } from '../src/core.mjs';

const draft = { draft: '写一封邮件，不超过 100 字，不编造事实。', draftRev: 4, phase: 'plain', occurrences: [], imageIds: [] };
test('replace requires unchanged revision/session/phase/chips, preserves image ids, never submits', () => {
  let calls = [];
  const actions = { setDraft: t => calls.push(t), submit: () => assert.fail('must not send') };
  const captured = { sessionId: 'a', ...draft };
  assert.equal(replaceDraft(captured, 'a', draft, '请写一封邮件，不超过 100 字，不编造事实。', actions), true);
  assert.equal(calls.length, 1);
  for (const live of [{ ...draft, draftRev: 6 }, { ...draft, phase: 'submitting' }, { ...draft, occurrences: [{}] }, { ...draft, draft: '新稿' }]) {
    assert.equal(replaceDraft(captured, 'a', live, '旧结果', actions), false);
  }
  assert.equal(replaceDraft(captured, 'b', draft, '旧结果', actions), false);
  assert.equal(calls.length, 1);
  assert.ok(replacementReason(captured, 'b', draft));
  const images = { ...draft, imageIds: ['image-1'] };
  assert.equal(replaceDraft(captured, 'a', images, '优化稿', actions), true);
  assert.deepEqual(images.imageIds, ['image-1']);
});
test('nonempty bounded draft and session required; user code stays data', () => {
  assert.deepEqual(validateRequest({ sessionId: 'a', draft: draft.draft, includeContext: true }), { sessionId: 'a', draft: draft.draft, includeContext: true });
  for (const bad of [{}, { sessionId: 'a', draft: '  ' }, { sessionId: 'a', draft: 'x'.repeat(16385) }, { sessionId: 'a', draft: 'x', includeContext: 'yes' }]) assert.throws(() => validateRequest(bad));
  assert.equal(validateRequest({ sessionId: 'a', draft: '不要写代码' }).includeContext, true);
});
test('local same-origin POST only, deny CSRF, remote exposure and DNS rebinding', () => {
  const headers = { host: '127.0.0.1:3080', origin: 'http://127.0.0.1:3080', 'content-type': 'application/json', 'x-dsh-prompt-enhancer': '1' };
  assert.equal(allowRequest({ method: 'POST', headers }, { host: '127.0.0.1', port: 3080 }), true);
  for (const changes of [{ origin: 'https://evil.example' }, { host: 'evil.example:3080', origin: 'http://evil.example:3080' }, { origin: undefined }, { 'x-dsh-prompt-enhancer': undefined }, { 'content-type': 'text/plain' }]) assert.equal(allowRequest({ method: 'POST', headers: { ...headers, ...changes } }, { host: '127.0.0.1', port: 3080 }), false);
  assert.equal(allowRequest({ method: 'POST', headers }, { host: '0.0.0.0', port: 3080 }), false);
  assert.equal(allowRequest({ method: 'GET', headers }, { host: '127.0.0.1', port: 3080 }), false);
});
test('context uses human text only, keeps all constraints, never silently truncates', () => {
  const events = [
    { type: 'user/message', data: { source: { kind: 'user' }, content: [{ type: 'text', text: '预算 20 元。' }] } },
    { type: 'assistant/message', data: { message: { content: [{ type: 'text', text: '擅自建议技术栈' }] } } },
    { type: 'user/message', data: { source: { kind: 'plugin' }, content: [{ type: 'text', text: '网页指令' }] } },
    { type: 'user/message', data: { source: { kind: 'user' }, content: [{ type: 'text', text: '保留 Python。' }, { type: 'image', data: 'secret' }] } }
  ];
  assert.deepEqual(selectContext(events), ['预算 20 元。', '保留 Python。']);
  assert.throws(() => selectContext([{ type: 'user/message', data: { source: { kind: 'user' }, content: [{ type: 'text', text: 'x'.repeat(65537) }] } }]));
});
test('reject empty, truncated, failed, tool or placeholder output; retain language and numbers literally', () => {
  const blocks = [{ type: 'text', text: 'Please write an email under 100 words. Do not invent facts.' }];
  assert.equal(validateOutput(blocks, { kind: 'stop' }), blocks[0].text);
  for (const kind of ['max-tokens', 'error', 'aborted', 'tool-calls']) assert.throws(() => validateOutput(blocks, { kind }));
  for (const bad of [[], [{ type: 'text', text: ' ' }], [{ type: 'tool-call' }], [{ type: 'text', text: '\ufffc' }]]) assert.throws(() => validateOutput(bad, { kind: 'stop' }));
});
