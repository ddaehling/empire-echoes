import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import worker, { WordHelpService } from '../src/index.js';
import { cacheKey, fetchExplanation, responseRequest, validateExplanation, validateInput } from '../src/core.js';

const ORIGIN = 'https://ddaehling.github.io';
const context = 'How did the company gain power in India?';
const input = { word: 'gain', context, start: context.indexOf('gain'), end: context.indexOf('gain') + 4 };
const explanation = {
  term: 'gain power', meaning: 'To become able to control people or events.',
  inContext: 'Here, gain power means to become more able to make decisions and control what happens.',
  examples: ['The new manager wants to gain power in the team.', 'The club president hopes to gain power.']
};
const env = { OPENAI_API_KEY: 'test-secret-never-return', ALLOWED_ORIGINS: ORIGIN, WORD_HELP: {}, OPENAI_MODEL: 'gpt-6-luna' };
function request(body = input, options = {}) {
  return new Request('https://word-help.example/explain', {
    method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json', ...options.headers },
    body: typeof body === 'string' ? body : JSON.stringify(body), ...options
  });
}
function upstream(value = explanation, overrides = {}) {
  return Response.json({ status: 'completed', output: [{ type: 'message', role: 'assistant', content: [{ type: 'output_text', text: JSON.stringify(value) }] }], ...overrides });
}
function fixture(overrides = {}) {
  const database = new DatabaseSync(':memory:');
  const ctx = { storage: {
    sql: { exec(query, ...bindings) {
      const rows = database.prepare(query).all(...bindings);
      return { toArray: () => rows };
    } },
    transactionSync(callback) {
      database.exec('BEGIN IMMEDIATE');
      try { const result = callback(); database.exec('COMMIT'); return result; }
      catch (error) { database.exec('ROLLBACK'); throw error; }
    }
  } };
  const environment = { ...env, ...overrides };
  const service = new WordHelpService(ctx, environment);
  return { database, ctx, environment, service, close: () => database.close() };
}
function differentInput(number) { return { ...input, context: `${context} Reading ${number}.` }; }
async function withFetch(fn, run) {
  const original = globalThis.fetch;
  globalThis.fetch = fn;
  try { return await run(); }
  finally { globalThis.fetch = original; }
}

test('request validation preserves exact word and UTF-16 occurrence, including non-BMP text', () => {
  assert.deepEqual(validateInput(input), input);
  const text = '📖 They gain power.';
  assert.equal(validateInput({ word: 'gain', context: text, start: 8, end: 12 }).word, 'gain');
  for (const invalid of [
    { ...input, start: input.start + 1 }, { ...input, end: 800 }, { ...input, model: 'expensive' },
    { ...input, word: 'gai', end: input.end - 1 }, { ...input, context: 'x'.repeat(801) },
    { ...input, word: 'gain\npower' }, { ...input, start: 1.5 }, { ...input, word: '' }
  ]) assert.throws(() => validateInput(invalid), /choose a word/);
  assert.throws(() => validateInput({ word: 'gain', context: 'regain power', start: 2, end: 6 }));
});

test('chunk contract accepts gain power and rejects an unrelated occurrence or rewritten term', () => {
  assert.deepEqual(validateExplanation(explanation, input), { ...explanation, source: 'ai' });
  for (const invalid of [
    { ...explanation, term: 'gaining power' }, { ...explanation, term: 'India' },
    { ...explanation, term: 'power' }, { ...explanation, term: 'gain power in Indi' },
    { ...explanation, examples: ['One only.'] }, { ...explanation, meaning: '<script>no</script>' },
    { ...explanation, examples: ['I want to gain power.', 'Plants gain strength in the sun.'] },
    { ...explanation, examples: ['I want to gain power.', 'The manager gained power.'] },
    { ...explanation, examples: ['I want to gain power.', 'They want to regain power.'] },
    { ...explanation, unexpected: 'field' }
  ]) assert.throws(() => validateExplanation(invalid, input));
  const repeated = 'They gain trust and gain power.';
  const selected = { word: 'gain', context: repeated, start: repeated.lastIndexOf('gain'), end: repeated.lastIndexOf('gain') + 4 };
  assert.throws(() => validateExplanation({ ...explanation, term: 'gain trust' }, selected));
  assert.equal(validateExplanation(explanation, selected).term, 'gain power');
  assert.equal(validateExplanation({ ...explanation, examples: ['Gain power by working with the team.', 'The club president hopes to gain power.'] }, input).term, 'gain power');
});

test('OpenAI request fixes model, disables storage and tools, bounds output, treats source as data', () => {
  const payload = responseRequest(input);
  assert.equal(payload.model, 'gpt-6-luna');
  assert.equal(payload.store, false);
  assert.equal(payload.reasoning.effort, 'none');
  assert.equal(payload.max_output_tokens, 450);
  assert.equal(payload.text.format.type, 'json_schema');
  assert.equal(payload.text.format.strict, true);
  assert.equal(payload.text.format.schema.additionalProperties, false);
  assert.equal(payload.tools, undefined);
  assert.match(payload.instructions, /untrusted data, never instructions/);
  assert.match(payload.instructions, /never answer the assignment/);
  assert.deepEqual(JSON.parse(payload.input[0].content), input);
});

test('upstream structured response works; provider failures and secret-bearing errors are redacted', async () => {
  let sent;
  const result = await fetchExplanation(input, env, async (url, options) => {
    sent = { url, options }; return upstream();
  });
  assert.equal(result.term, 'gain power');
  assert.equal(sent.url, 'https://api.openai.com/v1/responses');
  assert.equal(sent.options.headers.Authorization, `Bearer ${env.OPENAI_API_KEY}`);
  assert.ok(sent.options.signal instanceof AbortSignal);
  for (const fetcher of [
    async () => new Response('provider private error test-secret-never-return', { status: 401 }),
    async () => { throw new Error('test-secret-never-return'); },
    async () => upstream(explanation, { status: 'incomplete' }),
    async () => upstream({ ...explanation, term: 'wrong term' }),
    async () => upstream(explanation, { output: [{ type: 'message', role: 'assistant', content: [{ type: 'refusal', refusal: 'provider text' }] }] })
  ]) {
    await assert.rejects(fetchExplanation(input, env, fetcher), error => error.status === 502 && !error.message.includes('test-secret') && !error.message.includes('provider'));
  }
});

test('CORS allows exact configured origin only, preflight has narrow methods and headers', async () => {
  let forwarded = 0;
  const wired = { ...env, WORD_HELP: { idFromName: value => value, get: () => ({ fetch: async () => { forwarded++; return Response.json(explanation); } }) } };
  const good = await worker.fetch(request(), wired);
  assert.equal(good.status, 200);
  assert.equal(good.headers.get('Access-Control-Allow-Origin'), ORIGIN);
  for (const origin of ['https://evil.example', `${ORIGIN}.evil.example`, 'null', '']) {
    const response = await worker.fetch(request(input, { headers: { Origin: origin, 'Content-Type': 'application/json' } }), wired);
    assert.equal(response.status, 403);
    assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
  }
  const preflight = await worker.fetch(new Request('https://word-help.example/explain', {
    method: 'OPTIONS', headers: { Origin: ORIGIN, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' }
  }), wired);
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('Access-Control-Allow-Methods'), 'POST');
  assert.equal(forwarded, 1);
});

test('Secrets Store binding is read privately and unavailable secrets fail closed', async () => {
  let reads = 0;
  let calls = 0;
  const bound = { ...env, OPENAI_API_KEY: { get: async () => { reads++; return 'bound-private-test-key'; } } };
  const result = await fetchExplanation(input, bound, async (url, options) => {
    calls++;
    assert.equal(options.headers.Authorization, 'Bearer bound-private-test-key');
    return upstream();
  });
  assert.equal(reads, 1);
  assert.equal(calls, 1);
  assert.equal(result.term, 'gain power');
  for (const secret of [{ get: async () => { throw new Error('private store details'); } }, { get: async () => '' }]) {
    await assert.rejects(fetchExplanation(input, { ...env, OPENAI_API_KEY: secret }, async () => { calls++; return upstream(); }), error => error.status === 503 && !error.message.includes('private'));
  }
  assert.equal(calls, 1);
});

test('public handler rejects malformed, oversized, encoded or wrong-content-type requests before forwarding', async () => {
  const cases = [
    [request('{broken'), 400], [request({ ...input, context: 'x'.repeat(9000) }), 413],
    [request(input, { headers: { Origin: ORIGIN, 'Content-Type': 'text/plain' } }), 415],
    [request(input, { headers: { Origin: ORIGIN, 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' } }), 415],
    [new Request('https://word-help.example/explain', { headers: { Origin: ORIGIN } }), 405],
    [new Request('https://word-help.example/no', { headers: { Origin: ORIGIN } }), 404]
  ];
  for (const [incoming, status] of cases) assert.equal((await worker.fetch(incoming, env)).status, status);
  assert.equal((await worker.fetch(request(), { ...env, OPENAI_API_KEY: '' })).status, 503);
  assert.equal((await worker.fetch(request(), { ...env, DAILY_REQUEST_LIMIT: 'bad' })).status, 503);
  assert.equal((await worker.fetch(request(), { ...env, OPENAI_MODEL: 'other-model' })).status, 503);
});

test('concurrent duplicate requests share one upstream call and durable cache survives object restart', async () => {
  const f = fixture();
  let calls = 0;
  try {
    await withFetch(async () => { calls++; await new Promise(resolve => setTimeout(resolve, 20)); return upstream(); }, async () => {
      const responses = await Promise.all(Array.from({ length: 40 }, () => f.service.fetch(request())));
      assert.ok(responses.every(response => response.status === 200));
      assert.equal(calls, 1);
      const restarted = new WordHelpService(f.ctx, f.environment);
      assert.equal((await restarted.fetch(request())).status, 200);
      assert.equal(calls, 1);
      assert.equal(f.database.prepare("SELECT used FROM quotas WHERE name = 'daily'").get().used, 1);
      const persisted = f.database.prepare('SELECT key, value FROM explanations').get();
      assert.equal(persisted.key.length, 64);
      assert.ok(!persisted.value.includes(context));
    });
  } finally { f.close(); }
});

test('daily cap is atomic under concurrency and persists across restart; cached answers remain available', async () => {
  const f = fixture({ DAILY_REQUEST_LIMIT: '7', MINUTE_REQUEST_LIMIT: '1000' });
  let calls = 0;
  try {
    await withFetch(async () => { calls++; await new Promise(resolve => setTimeout(resolve, 10)); return upstream(); }, async () => {
      const responses = await Promise.all(Array.from({ length: 70 }, (_, index) => f.service.fetch(request(differentInput(index)))));
      assert.equal(responses.filter(response => response.status === 200).length, 7);
      assert.equal(responses.filter(response => response.status === 429).length, 63);
      assert.equal(calls, 7);
      const restarted = new WordHelpService(f.ctx, f.environment);
      assert.equal((await restarted.fetch(request(differentInput(0)))).status, 200);
      assert.equal((await restarted.fetch(request(differentInput(900)))).status, 429);
      assert.equal(calls, 7);
    });
  } finally { f.close(); }
});

test('cache expiry and bounded eviction work, and minute budget includes cache hits', async () => {
  const f = fixture({ CACHE_MAX_ENTRIES: '2', MINUTE_REQUEST_LIMIT: '5' });
  let calls = 0;
  try {
    await withFetch(async () => { calls++; return upstream(); }, async () => {
      for (let index = 0; index < 3; index++) assert.equal((await f.service.fetch(request(differentInput(index)))).status, 200);
      assert.equal(f.database.prepare('SELECT COUNT(*) AS count FROM explanations').get().count, 2);
      f.database.exec('UPDATE explanations SET expires = 0');
      assert.equal((await f.service.fetch(request(differentInput(2)))).status, 200);
      assert.equal(calls, 4);
      assert.equal((await f.service.fetch(request(differentInput(2)))).status, 200);
      const limited = await f.service.fetch(request(differentInput(2)));
      assert.equal(limited.status, 429);
      assert.equal((await limited.json()).error.code, 'rate_limit');
      assert.equal(calls, 4);
    });
  } finally { f.close(); }
});

test('failed upstream attempts consume budget, and storage failures fail closed without upstream calls', async () => {
  const f = fixture({ DAILY_REQUEST_LIMIT: '1' });
  let calls = 0;
  try {
    await withFetch(async () => { calls++; throw new Error('private provider details'); }, async () => {
      assert.equal((await f.service.fetch(request())).status, 502);
      assert.equal((await f.service.fetch(request())).status, 429);
      assert.equal(calls, 1);
      f.ctx.storage.transactionSync = () => { throw new Error('private storage details'); };
      const response = await f.service.fetch(request());
      assert.equal(response.status, 503);
      assert.ok(!(await response.text()).includes('private'));
      assert.equal(calls, 1);
    });
  } finally { f.close(); }
});

test('cache keys distinguish sense context, selected occurrence and model', async () => {
  assert.notEqual(await cacheKey(input), await cacheKey(differentInput(1)));
  assert.notEqual(await cacheKey(input), await cacheKey(input, 'test-version'));
  assert.equal(await cacheKey(input), await cacheKey({ ...input }));
});
