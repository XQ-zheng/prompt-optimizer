import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { apply } from '../src/index.mjs';

async function fixture(t, stream) {
  let handler, cleanup;
  const calls = [];
  const session = { events: [{ type: 'user/message', data: { source: { kind: 'user' }, content: [{ type: 'text', text: '不要新增技术栈' }] } }] };
  const ctx = {
    effect: fn => { cleanup = fn(); },
    webServer: { host: '127.0.0.1', port: 0, register: route => { handler = route.handler; return () => {}; } },
    agents: { get: id => id === 'known' ? { session } : undefined },
    apiProxy: { sessions: { models: async () => ({ result: { ok: true, value: { routable: true, current: { provider: 'selected', model: 'current-model' } } } }) } },
    llm: { stream: options => { calls.push(options); return stream(options); } },
  };
  apply(ctx);
  const server = createServer((req, res) => handler(req, res));
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  ctx.webServer.port = server.address().port;
  t.after(() => { cleanup(); server.closeAllConnections(); server.close(); });
  const origin = `http://127.0.0.1:${server.address().port}`;
  return { calls, post: (body, options = {}) => fetch(origin + '/api/prompt-enhancer/optimize', { method: 'POST', headers: { origin, 'content-type': 'application/json', 'x-dsh-prompt-enhancer': '1' }, body: JSON.stringify(body), ...options }) };
}
async function* success() {
  yield { type: 'text-delta', index: 0, text: '请整理需求，保留 Python，不要新增技术栈。' };
  yield { type: 'finish', reason: { kind: 'stop' } };
}
test('real HTTP handler uses selected model, frames human context, tools empty, no session writes', async t => {
  const f = await fixture(t, success);
  const response = await f.post({ sessionId: 'known', draft: '整理需求，保留Python', includeContext: true });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.contextMessages, 1);
  assert.equal(body.model, 'current-model');
  assert.ok(body.optimized.includes('Python'));
  assert.equal(f.calls[0].provider, 'selected');
  assert.deepEqual(f.calls[0].tools, []);
  assert.deepEqual(JSON.parse(f.calls[0].messages[0].content[0].text), { original: '整理需求，保留Python', userContext: ['不要新增技术栈'] });
});
test('unknown sessions and oversized requests never call model', async t => {
  const f = await fixture(t, success);
  assert.equal((await f.post({ sessionId: 'unknown', draft: 'hello' })).status, 400);
  assert.equal((await f.post({ sessionId: 'known', draft: 'x'.repeat(150000) })).status, 400);
  assert.equal(f.calls.length, 0);
});
test('failed provider does not expose credentials or replace with partial result', async t => {
  const f = await fixture(t, async function* () { throw new Error('会话 api_key=secret-token'); });
  const response = await f.post({ sessionId: 'known', draft: 'hello' });
  assert.equal(response.status, 400);
  assert.equal((await response.text()).includes('secret-token'), false);
});
test('stream EOF without explicit finish never offers an incomplete optimization', async t => {
  const f = await fixture(t, async function* () { yield { type: 'text-delta', index: 0, text: 'partial' }; });
  const response = await f.post({ sessionId: 'known', draft: 'hello' });
  assert.equal(response.status, 400);
  assert.equal((await response.text()).includes('optimized'), false);
});
test('duplicate request is refused; client cancellation aborts host model stream', async t => {
  let started, canceled;
  const ready = new Promise(r => { started = r; });
  const aborted = new Promise(r => { canceled = r; });
  const f = await fixture(t, async function* (options) {
    started();
    await new Promise(r => options.signal.addEventListener('abort', r, { once: true }));
    canceled();
    options.signal.throwIfAborted();
  });
  const controller = new AbortController();
  const first = f.post({ sessionId: 'known', draft: 'hello' }, { signal: controller.signal }).catch(() => null);
  await ready;
  assert.equal((await f.post({ sessionId: 'known', draft: 'hello' })).status, 429);
  controller.abort();
  await first;
  await aborted;
  assert.ok(f.calls[0].signal.aborted);
});
