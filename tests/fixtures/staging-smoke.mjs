// Local-only harness exercising the deployed smoke against the generated site.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdtemp, cp, rm } from 'node:fs/promises';
import { resolve, extname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { stagingConfig, runStagingSmoke, requiredChecks } from '../../scripts/qa/staging-smoke.mjs';

const fixtureRoot = await mkdtemp(join(tmpdir(), 'website-staging-fixture-'));
await cp(resolve('dist'), fixtureRoot, { recursive: true });
const sessionId = 'c'.repeat(32), sourceSha = 'a'.repeat(40), releaseDigest = 'b'.repeat(64);
let failure = '', authenticated = 0, identityReads = 0;
const externalRequests = [];
const external = createServer((req, res) => {
  externalRequests.push({ url: req.url, headers: req.headers });
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('X-Staging-Session', sessionId);
  res.end('/* synthetic external response */');
});
external.on('upgrade', (req, socket) => { externalRequests.push({ url: req.url, headers: req.headers }); socket.destroy(); });
await new Promise((accept, reject) => { external.once('error', reject); external.listen(0, '127.0.0.1', accept); });
const externalUrl = `http://127.0.0.1:${external.address().port}/external.js`;
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
    identityReads++;
    let value = failure === 'identity' ? { ...identity, source_sha: 'f'.repeat(40) } : identity;
    if (failure === 'config-drift' && identityReads > 1) value = { ...identity, config_sha256: 'e'.repeat(64) };
    if (failure === 'dataset-drift' && identityReads > 1) value = { ...identity, dataset: 'changed-v1' };
    res.end(JSON.stringify(value)); return;
  }
  if (path === '/redirected.js') { res.writeHead(302, { Location: externalUrl }); res.end(); return; }
  const file = resolve(fixtureRoot, `.${path}${path.endsWith('/') ? 'index.html' : ''}`);
  try {
    assert.ok(file.startsWith(fixtureRoot + '/'));
    let content = await readFile(file);
    const type = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
      '.svg': 'image/svg+xml', '.png': 'image/png', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon' }[extname(file)];
    if (type) res.setHeader('Content-Type', type);
    if (failure === 'browser' && type === 'text/html') content = Buffer.from(content.toString().replace('</head>', '<script>throw new Error("Synthetic browser failure")</script></head>'));
    if (failure === 'websocket' && type === 'text/html') content = Buffer.from(content.toString().replace('</head>', `<script>new WebSocket('${externalUrl.replace('http:', 'ws:')}')</script></head>`));
    if (failure === 'redirect' && type === 'text/html') content = Buffer.from(content.toString().replace('</head>', '<script src="/redirected.js"></script></head>'));
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
  assert.deepEqual(good.identityAfter, good.identity);
  assert.ok(authenticated > 30);
  const cases = process.env.STAGING_FIXTURE_CASES?.split(',') || ['identity', 'browser', 'external', 'redirect', 'websocket', 'config-drift', 'dataset-drift'];
  for (failure of cases) {
    identityReads = 0; externalRequests.length = 0;
    const bad = await runStagingSmoke({ ...config, reportPath: config.reportPath.replace('.json', `-${failure}.json`) });
    assert.deepEqual(externalRequests, [], 'No external requests or session headers may escape through redirects');
    assert.equal(bad.exitCode, 1, `${failure} must invalidate the report`);
    assert.ok(bad.counts.failed > 0);
    assert.equal(bad.counts.skipped, 0);
    if (['config-drift', 'dataset-drift'].includes(failure)) {
      assert.equal(bad.checks.session_identity_after, 'failure');
      assert.ok(bad.identityAfter, 'Final observed identity must be retained on failure');
    }
    if (['redirect', 'websocket'].includes(failure)) assert.match(bad.error, /Privacy boundary/);
    if (failure === 'identity') assert.match(bad.error, /identity mismatch/);
    if (failure === 'browser') assert.match(bad.error, /Browser JavaScript/);
    if (failure === 'external') assert.match(bad.error, /Privacy boundary/);
    console.log(`Fixture ${failure}: rejected, no external requests, no skips`);
  }
  console.log('Staging fixture passed: generated site, session gates, browser errors, identity drift and external request refusal.');
} finally { await new Promise(resolve => server.close(resolve)); await new Promise(resolve => external.close(resolve)); await rm(fixtureRoot, { recursive: true, force: true }); }
