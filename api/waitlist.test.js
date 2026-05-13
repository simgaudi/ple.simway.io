import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert/strict';

// Dynamic import to control the module load timing (env vars must be set first)
let handler;

describe('/api/waitlist', () => {
  before(async () => {
    // Default env — both services configured
    process.env.RESEND_API_KEY = 're_test_key';
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test';
    handler = (await import('./waitlist.js')).default;
  });

  after(() => {
    delete process.env.RESEND_API_KEY;
    delete process.env.DISCORD_WEBHOOK_URL;
  });

  function buildRes(statusCode = 200) {
    const res = {
      statusCode: null,
      headers: {},
      ended: false,
      body: null,
    };
    res.setHeader = (k, v) => { res.headers[k] = v; };
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.body = data; res.ended = true; return res; };
    res.end = () => { res.ended = true; return res; };
    return res;
  }

  function buildReq(method, body) {
    return { method, body };
  }

  // --- OPTIONS (CORS preflight) ---
  it('returns 200 for OPTIONS', async () => {
    const res = buildRes();
    await handler(buildReq('OPTIONS'), res);
    assert.equal(res.statusCode, 200);
    assert.ok(res.ended);
  });

  // --- Method guard ---
  it('returns 405 for GET', async () => {
    const res = buildRes();
    await handler(buildReq('GET'), res);
    assert.equal(res.statusCode, 405);
    assert.equal(res.body.error, 'Method not allowed');
  });

  // --- Validation ---
  it('returns 400 for missing email', async () => {
    const res = buildRes();
    await handler(buildReq('POST', {}), res);
    assert.equal(res.statusCode, 400);
  });

  it('returns 400 for invalid email (no @)', async () => {
    const res = buildRes();
    await handler(buildReq('POST', { email: 'notanemail' }), res);
    assert.equal(res.statusCode, 400);
  });

  // --- Happy path (both succeed) ---
  it('returns 200 when Resend and Discord both succeed', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock.fn(async (url, opts) => {
      return { ok: true, status: 200 };
    });

    const res = buildRes();
    await handler(buildReq('POST', { email: 'test@example.com' }), res);

    globalThis.fetch = originalFetch;
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
  });

  // --- Resend succeeds, Discord fails → still 200 ---
  it('returns 200 when only Resend succeeds', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock.fn(async (url) => {
      if (url.includes('resend')) return { ok: true, status: 200 };
      return { ok: false, status: 500 };
    });

    const res = buildRes();
    await handler(buildReq('POST', { email: 'test@example.com' }), res);

    globalThis.fetch = originalFetch;
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
  });

  // --- Discord succeeds, Resend fails → still 200 ---
  it('returns 200 when only Discord succeeds', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock.fn(async (url) => {
      if (url.includes('discord')) return { ok: true, status: 200 };
      return { ok: false, status: 500, json: async () => ({ message: 'fail' }) };
    });

    const res = buildRes();
    await handler(buildReq('POST', { email: 'test@example.com' }), res);

    globalThis.fetch = originalFetch;
    assert.equal(res.statusCode, 200);
  });

  // --- Both fail → 500 ---
  it('returns 500 when both Resend and Discord fail', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock.fn(async () => ({
      ok: false,
      status: 500,
      json: async () => ({ message: 'fail' }),
    }));

    const res = buildRes();
    await handler(buildReq('POST', { email: 'test@example.com' }), res);

    globalThis.fetch = originalFetch;
    assert.equal(res.statusCode, 500);
  });

  // --- Missing env vars → graceful failure ---
  it('handles missing RESEND_API_KEY gracefully', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mock.fn(async (url) => {
      if (url.includes('discord')) return { ok: true };
      return { ok: false, status: 500, json: async () => ({ message: 'fail' }) };
    });

    const saved = process.env.RESEND_API_KEY;
    delete process.env.RESEND_API_KEY;

    const { default: freshHandler } = await import('./waitlist.js?t=' + Date.now());
    const res = buildRes();
    await freshHandler(buildReq('POST', { email: 'test@example.com' }), res);

    process.env.RESEND_API_KEY = saved;
    globalThis.fetch = originalFetch;
    // Discord still works → 200
    assert.equal(res.statusCode, 200);
  });
});
