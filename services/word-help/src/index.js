import {
  CACHE_TTL_MS, MODEL, ServiceError, cacheKey, configuration, errorResponse,
  fetchExplanation, jsonResponse, readBoundedJson, validateExplanation, validateInput
} from './core.js';

function allowedOrigin(request, env) {
  const origin = request.headers.get('Origin');
  const configured = String(env.ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
  // Exact origins only: no paths, wildcard subdomains, credentials, or opaque origins.
  return origin && configured.some(value => {
    try {
      const parsed = new URL(value);
      return parsed.origin === value && ['http:', 'https:'].includes(parsed.protocol) && value === origin;
    } catch { return false; }
  }) ? origin : null;
}

function cors(response, origin) {
  const headers = new Headers(response.headers);
  headers.set('Vary', 'Origin');
  if (origin) headers.set('Access-Control-Allow-Origin', origin);
  return new Response(response.body, { status: response.status, headers });
}

export default {
  async fetch(request, env) {
    const origin = allowedOrigin(request, env);
    try {
      if (new URL(request.url).pathname !== '/explain') throw new ServiceError(404, 'not_found', 'Not found.');
      if (!origin) throw new ServiceError(403, 'origin_not_allowed', 'Please open word help from the classroom site.');
      if (request.method === 'OPTIONS') {
        const headers = (request.headers.get('Access-Control-Request-Headers') || '').split(',').map(value => value.trim().toLowerCase()).filter(Boolean);
        if (request.headers.get('Access-Control-Request-Method') !== 'POST' || headers.some(value => value !== 'content-type')) {
          throw new ServiceError(403, 'origin_not_allowed', 'This request is not allowed.');
        }
        return cors(new Response(null, { status: 204, headers: {
          'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '600'
        } }), origin);
      }
      if (request.method !== 'POST') return cors(jsonResponse({ error: { code: 'method_not_allowed', message: 'Use POST for word help.' } }, 405, { Allow: 'POST, OPTIONS' }), origin);
      if ((request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase() !== 'application/json') {
        throw new ServiceError(415, 'unsupported_content_type', 'Word help needs a JSON request.');
      }
      if (request.headers.has('Content-Encoding')) throw new ServiceError(415, 'unsupported_content_type', 'Compressed requests are not supported.');
      const input = validateInput(await readBoundedJson(request));
      configuration(env);
      // One stable object for every visitor and edge location: budget cannot reset
      // with an isolate, IP address, cached entry, or concurrent request.
      const service = env.WORD_HELP.get(env.WORD_HELP.idFromName('classroom-global-v1'));
      return cors(await service.fetch(new Request('https://internal/explain', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input)
      })), origin);
    } catch (error) { return cors(errorResponse(error), origin); }
  }
};

export class WordHelpService {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.pending = new Map();
    this.sql = ctx.storage.sql;
    this.sql.exec('CREATE TABLE IF NOT EXISTS quotas (name TEXT PRIMARY KEY, period INTEGER NOT NULL, used INTEGER NOT NULL)');
    this.sql.exec('CREATE TABLE IF NOT EXISTS explanations (key TEXT PRIMARY KEY, value TEXT NOT NULL, expires INTEGER NOT NULL, created INTEGER NOT NULL)');
    this.sql.exec('CREATE INDEX IF NOT EXISTS explanations_expiry ON explanations (expires)');
    this.sql.exec('CREATE INDEX IF NOT EXISTS explanations_created ON explanations (created)');
  }

  reserve(name, period, maximum, retryAfter) {
    // Synchronous SQLite transaction is atomic across concurrent requests.
    this.ctx.storage.transactionSync(() => {
      const row = this.sql.exec('SELECT period, used FROM quotas WHERE name = ?', name).toArray()[0];
      const used = row?.period === period ? row.used : 0;
      if (used >= maximum) throw new ServiceError(429, name === 'daily' ? 'daily_limit' : 'rate_limit',
        name === 'daily' ? 'Today’s word-help allowance has been used. Try again tomorrow.' : 'Lots of words are being checked. Please wait a moment.', retryAfter);
      this.sql.exec('INSERT INTO quotas (name, period, used) VALUES (?, ?, ?) ON CONFLICT(name) DO UPDATE SET period = excluded.period, used = excluded.used', name, period, used + 1);
    });
  }

  async fetch(request) {
    try {
      const limits = configuration(this.env);
      const input = validateInput(await readBoundedJson(request));
      const now = Date.now();
      this.reserve('minute', Math.floor(now / 60000), limits.minute, Math.ceil((60000 - now % 60000) / 1000));
      const key = await cacheKey(input, this.env.OPENAI_MODEL || MODEL);
      if (!this.pending.has(key)) {
        const promise = this.explain(input, key, limits);
        this.pending.set(key, promise);
        promise.finally(() => this.pending.delete(key)).catch(() => {});
      }
      return jsonResponse(await this.pending.get(key));
    } catch (error) { return errorResponse(error); }
  }

  async explain(input, key, limits) {
    const now = Date.now();
    this.sql.exec('DELETE FROM explanations WHERE expires <= ?', now);
    const cached = this.sql.exec('SELECT value FROM explanations WHERE key = ?', key).toArray()[0];
    if (cached) {
      try {
        const { source, ...value } = JSON.parse(cached.value);
        return validateExplanation(value, input);
      } catch { this.sql.exec('DELETE FROM explanations WHERE key = ?', key); }
    }
    if (this.pending.size >= 60) throw new ServiceError(503, 'busy', 'Word help is busy. Please try again shortly.', 10);
    this.reserve('daily', Math.floor(now / 86400000), limits.daily, Math.ceil((86400000 - now % 86400000) / 1000));
    // Failed attempts still consume the allowance; no retries can create unbounded spend.
    const value = await fetchExplanation(input, this.env);
    this.ctx.storage.transactionSync(() => {
      this.sql.exec('INSERT OR REPLACE INTO explanations (key, value, expires, created) VALUES (?, ?, ?, ?)', key, JSON.stringify(value), now + CACHE_TTL_MS, now);
      this.sql.exec('DELETE FROM explanations WHERE key IN (SELECT key FROM explanations ORDER BY created DESC, key DESC LIMIT -1 OFFSET ?)', limits.cache);
    });
    return value;
  }
}
