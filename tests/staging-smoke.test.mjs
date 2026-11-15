import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';

// These contracts run without browser dependencies or a remote session.
test('smoke configuration requires complete candidate/session identity and rejects production origins', async () => {
  const { stagingConfig } = await import('../scripts/qa/staging-smoke.mjs');
  const env = { STAGING_BASE_URL: 'https://staging.example.test', STAGING_SESSION_ID: 'c'.repeat(32),
    STAGING_SOURCE_SHA: 'a'.repeat(40), STAGING_RELEASE_DIGEST: 'b'.repeat(64), STAGING_TEST_REPORT: '/tmp/staging-contract.json' };
  assert.equal(stagingConfig(env).origin, env.STAGING_BASE_URL);
  for (const key of Object.keys(env)) assert.throws(() => stagingConfig({ ...env, [key]: '' }), /Invalid/);
  for (const url of ['https://amineamanzou.fr', 'https://www.amineamanzou.fr', 'http://example.test',
    'https://user:secret@staging.example.test', 'https://staging.example.test/path', 'https://staging.example.test/?q=1']) {
    assert.throws(() => stagingConfig({ ...env, STAGING_BASE_URL: url }), /Invalid/);
  }
});

test('HTTP smoke authenticates every positive request and refuses redirects without following them', async () => {
  const { stagingConfig, sessionRequest } = await import('../scripts/qa/staging-smoke.mjs');
  const requests = [];
  const server = createServer((req, res) => {
    requests.push({ url: req.url, session: req.headers['x-staging-session'] });
    res.setHeader('X-Staging-Session', 'c'.repeat(32));
    res.writeHead(req.url === '/redirect' ? 302 : 200, req.url === '/redirect' ? { Location: 'https://amineamanzou.fr/' } : {});
    res.end('ok');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const config = stagingConfig({ STAGING_BASE_URL: `http://127.0.0.1:${server.address().port}`,
      STAGING_SESSION_ID: 'c'.repeat(32), STAGING_SOURCE_SHA: 'a'.repeat(40),
      STAGING_RELEASE_DIGEST: 'b'.repeat(64), STAGING_TEST_REPORT: '/tmp/staging-contract.json' });
    assert.equal((await sessionRequest(config, '/')).status, 200);
    await assert.rejects(sessionRequest(config, '/redirect'), /Unexpected HTTP status/);
    await assert.rejects(sessionRequest(config, 'https://amineamanzou.fr/'), /origin/);
    assert.equal(requests.length, 2);
    assert.ok(requests.every(r => r.session === config.sessionId));
  } finally { await new Promise(resolve => server.close(resolve)); }
});

test('browser request policy only permits same-origin read-only HTTP with session isolation', async () => {
  const { permitBrowserRequest } = await import('../scripts/qa/staging-smoke.mjs');
  const origin = 'https://staging.example.test';
  assert.ok(permitBrowserRequest(origin, `${origin}/_astro/site.js`, 'GET'));
  for (const [url, method] of [['https://amineamanzou.fr/', 'GET'], ['https://analytics.test/', 'POST'],
    [`${origin}/contact/`, 'POST'], ['mailto:example@example.test', 'GET']]) {
    assert.equal(permitBrowserRequest(origin, url, method), false);
  }
});
