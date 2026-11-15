// Local-only harness exercising the deployed smoke against the generated site.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { stagingConfig, runStagingSmoke, requiredChecks } from '../../scripts/qa/staging-smoke.mjs';

const sessionId = 'c'.repeat(32), sourceSha = 'a'.repeat(40), releaseDigest = 'b'.repeat(64);
let failure = '', authenticated = 0;
const identity = { application: 'amineamanzou-website', session_id: sessionId, source_sha: sourceSha,
  release_digest: releaseDigest, config_sha256: 'd'.repeat(64), dataset: 'empty-v1' };
const server = createServer(async (req, res) => {
  if (req.headers['x-staging-session'] !== sessionId) { res.writeHead(409); res.end('Staging session mismatch'); return; }
  authenticated++;
  res.setHeader('X-Staging-Session', sessionId);
  res.setHeader('Cache-Control', 'no-store');
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/.well-known/staging-session') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(failure === 'identity' ? { ...identity, source_sha: 'f'.repeat(40) } : identity)); return;
  }
  const file = resolve('dist', `.${path}${path.endsWith('/') ? 'index.html' : ''}`);
  try {
    assert.ok(file.startsWith(resolve('dist') + '/'));
    let content = await readFile(file);
    const type = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
      '.svg': 'image/svg+xml', '.png': 'image/png', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon' }[extname(file)];
    if (type) res.setHeader('Content-Type', type);
    if (failure === 'browser' && type === 'text/html') content = Buffer.from(content.toString().replace('</head>', '<script>throw new Error("Synthetic browser failure")</script></head>'));
    if (failure === 'external' && type === 'text/html') content = Buffer.from(content.toString().replace('</head>', '<script src="https://external.example.test/private.js"></script></head>'));
    res.end(content);
  } catch { res.writeHead(404); res.end('not found'); }
});
await new Promise((accept, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', accept); });
try {
  const config = stagingConfig({ STAGING_BASE_URL: `http://127.0.0.1:${server.address().port}`,
    STAGING_SESSION_ID: sessionId, STAGING_SOURCE_SHA: sourceSha, STAGING_RELEASE_DIGEST: releaseDigest,
    STAGING_TEST_REPORT: process.env.STAGING_FIXTURE_REPORT || '/tmp/website-staging-fixture-report.json', CHROME_PATH: process.env.CHROME_PATH });
  const good = await runStagingSmoke(config);
  assert.equal(good.exitCode, 0, good.error);
  assert.deepEqual(good.counts, { passed: requiredChecks.length, failed: 0, skipped: 0 });
  assert.ok(authenticated > 30);
  for (failure of ['identity', 'browser', 'external']) {
    const bad = await runStagingSmoke({ ...config, reportPath: config.reportPath.replace('.json', `-${failure}.json`) });
    assert.equal(bad.exitCode, 1, `${failure} must invalidate the report`);
    assert.ok(bad.counts.failed > 0);
    assert.equal(bad.counts.skipped, 0);
    if (failure === 'identity') assert.match(bad.error, /identity mismatch/);
    if (failure === 'browser') assert.match(bad.error, /Browser JavaScript/);
    if (failure === 'external') assert.match(bad.error, /Privacy boundary/);
  }
  console.log('Staging fixture passed: generated site, session gates, browser errors, identity drift and external request refusal.');
} finally { await new Promise(resolve => server.close(resolve)); }
