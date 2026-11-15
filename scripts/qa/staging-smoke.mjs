import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const requiredChecks = ['session_identity', 'session_missing_rejected', 'session_stale_rejected',
  'http_routes', 'browser_routes', 'browser_assets', 'browser_javascript', 'browser_navigation',
  'browser_overflow', 'privacy_boundary', 'session_identity_after'];
export const routes = ['/', '/en/', '/dossier/', '/en/dossier/', '/contact/', '/en/contact/',
  '/privacy/', '/en/privacy/', '/blog/', '/en/blog/', '/audit-observabilite/', '/en/observability-audit/',
  '/consultant-opentelemetry/', '/en/opentelemetry-consulting/',
  '/fractional-observability-lead/', '/en/fractional-observability-lead/'];

export function stagingConfig(env = process.env) {
  let url;
  try { url = new URL(env.STAGING_BASE_URL); } catch { throw new Error('Invalid STAGING_BASE_URL'); }
  const loopback = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
  if (!(url.protocol === 'https:' || (loopback && url.protocol === 'http:')) ||
      ['amineamanzou.fr', 'www.amineamanzou.fr'].includes(url.hostname.replace(/\.$/, '')) ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new Error('Invalid staging origin');
  for (const [key, pattern] of [['STAGING_SESSION_ID', /^[a-f0-9]{32}$/],
    ['STAGING_SOURCE_SHA', /^[a-f0-9]{40}$/], ['STAGING_RELEASE_DIGEST', /^[a-f0-9]{64}$/]]) {
    if (!pattern.test(env[key] ?? '')) throw new Error(`Invalid ${key}`);
  }
  if (!env.STAGING_TEST_REPORT || !isAbsolute(env.STAGING_TEST_REPORT)) throw new Error('Invalid STAGING_TEST_REPORT');
  return { origin: url.origin, sessionId: env.STAGING_SESSION_ID, sourceSha: env.STAGING_SOURCE_SHA,
    releaseDigest: env.STAGING_RELEASE_DIGEST, reportPath: env.STAGING_TEST_REPORT, chromePath: env.CHROME_PATH };
}

export function permitBrowserRequest(origin, url, method) {
  try { return new URL(url).origin === origin && ['GET', 'HEAD'].includes(method); } catch { return false; }
}

export async function sessionRequest(config, path, sessionId = config.sessionId, status = 200) {
  const url = new URL(path, config.origin);
  assert.equal(url.origin, config.origin, 'Request origin must remain in staging');
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(20_000),
    headers: { 'Cache-Control': 'no-cache', ...(sessionId ? { 'X-Staging-Session': sessionId } : {}) } });
  assert.equal(response.status, status, `Unexpected HTTP status for ${url.pathname}`);
  if (status === 200) assert.equal(response.headers.get('x-staging-session'), config.sessionId, 'Session response header mismatch');
  return response;
}

function validateIdentity(config, identity) {
  for (const [key, value] of Object.entries({ application: 'amineamanzou-website', session_id: config.sessionId,
    source_sha: config.sourceSha, release_digest: config.releaseDigest, dataset: 'empty-v1' })) {
    assert.equal(identity[key], value, `Session identity mismatch: ${key}`);
  }
  assert.match(identity.config_sha256 ?? '', /^[a-f0-9]{64}$/, 'Session identity mismatch: config_sha256');
}

async function readIdentity(config) {
  return (await sessionRequest(config, '/.well-known/staging-session')).json();
}

async function browserChecks(config) {
  const { chromium } = await import('playwright-core');
  const executablePath = config.chromePath || chromium.executablePath();
  assert.ok(existsSync(executablePath), 'Chrome not found; set CHROME_PATH to a local browser executable');
  const browser = await chromium.launch({ executablePath, headless: true });
  const errors = [], forbidden = [], assets = new Set();
  try {
    for (const width of [390, 1440]) {
      const context = await browser.newContext({ serviceWorkers: 'block', viewport: { width, height: 900 },
        extraHTTPHeaders: { 'X-Staging-Session': config.sessionId, 'Cache-Control': 'no-cache' } });
      try {
        await context.route('**/*', async route => {
          const request = route.request();
          if (!permitBrowserRequest(config.origin, request.url(), request.method())) {
            forbidden.push(`${request.method()} ${new URL(request.url()).origin}`);
            await route.abort(); return;
          }
          let upstream;
          try {
            // The browser must never see a redirect: route handlers do not guard redirect hops.
            upstream = await route.fetch({ maxRedirects: 0, timeout: 20_000,
              headers: { ...request.headers(), 'x-staging-session': config.sessionId, 'cache-control': 'no-cache' } });
            if (upstream.status() >= 300 && upstream.status() < 400) {
              forbidden.push(`redirect ${new URL(request.url()).pathname}`);
              await route.abort(); return;
            }
            await route.fulfill({ response: upstream });
          } catch {
            errors.push(`Guarded request failed: ${new URL(request.url()).pathname}`);
            await route.abort();
          } finally { await upstream?.dispose(); }
        });
        await context.routeWebSocket('**/*', socket => { forbidden.push('websocket'); socket.close(); });
        const page = await context.newPage();
        page.on('pageerror', error => errors.push(error.message));
        page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
        page.on('requestfailed', request => errors.push(`Request failed: ${new URL(request.url()).pathname}`));
        page.on('response', response => {
          if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${new URL(response.url()).pathname}`);
          if (response.headers()['x-staging-session'] !== config.sessionId) errors.push('Browser response session mismatch');
          if (['script', 'stylesheet', 'image', 'font'].includes(response.request().resourceType())) assets.add(response.url());
        });
        for (const path of routes) {
          const response = await page.goto(`${config.origin}${path}`, { waitUntil: 'networkidle' });
          assert.equal(response.status(), 200, `Browser route failed: ${path}`);
          assert.equal(new URL(page.url()).origin, config.origin);
          assert.equal(await page.locator('html').getAttribute('lang'), path.startsWith('/en/') ? 'en' : 'fr');
          assert.ok(await page.locator('h1').innerText(), `Missing page title: ${path}`);
          const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
          assert.equal(canonical, `https://amineamanzou.fr${path}`, 'Canonical URL changed');
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `Horizontal overflow: ${path} at ${width}`);
          assert.ok(await page.locator('img').evaluateAll(images => images.every(image => !image.complete || image.naturalWidth > 0)), `Broken image: ${path}`);
        }
        await page.goto(`${config.origin}/`, { waitUntil: 'networkidle' });
        const before = await page.locator('html').getAttribute('data-theme');
        await page.locator('.theme-toggle').click();
        assert.notEqual(await page.locator('html').getAttribute('data-theme'), before, 'Theme JavaScript failed');
        await page.locator('[data-locale-target="en"]').click();
        await page.waitForURL(`${config.origin}/en/`);
        assert.equal(await page.locator('html').getAttribute('lang'), 'en', 'Locale navigation failed');
        assert.equal(await page.evaluate(() => navigator.serviceWorker.controller), null, 'Service worker controls the session');
      } finally { await context.close(); }
    }
    assert.ok(assets.size > 0, 'No browser assets checked');
    assert.deepEqual(forbidden, [], 'Privacy boundary: external or mutating browser request');
    assert.deepEqual(errors, [], 'Browser JavaScript, asset or session errors');
    return { viewports: [390, 1440], routeCount: routes.length, assetCount: assets.size };
  } finally { await browser.close(); }
}

export async function runStagingSmoke(config) {
  const report = { schemaVersion: '1.0', application: 'amineamanzou-website',
    sourceSha: config.sourceSha, releaseDigest: config.releaseDigest, sessionId: config.sessionId,
    baseUrl: config.origin, requiredChecks, checks: Object.fromEntries(requiredChecks.map(key => [key, 'pending'])),
    startedAt: new Date().toISOString(), exitCode: 1 };
  const check = async (name, run) => { await run(); report.checks[name] = 'success'; };
  try {
    report.identity = await readIdentity(config);
    validateIdentity(config, report.identity);
    report.checks.session_identity = 'success';
    for (const [name, sid] of [['session_missing_rejected', null],
      ['session_stale_rejected', `${config.sessionId[0] === '0' ? '1' : '0'}${config.sessionId.slice(1)}`]]) {
      await check(name, async () => {
        for (const path of ['/', '/en/', '/.well-known/staging-session', '/favicon.ico']) await sessionRequest(config, path, sid, 409);
      });
    }
    await check('http_routes', async () => {
      for (const path of routes) {
        const html = await (await sessionRequest(config, path)).text();
        assert.match(html, /<h1[\s>]/, `Missing route content: ${path}`);
      }
    });
    report.browser = await browserChecks(config);
    for (const name of ['browser_routes', 'browser_assets', 'browser_javascript', 'browser_navigation', 'browser_overflow', 'privacy_boundary']) report.checks[name] = 'success';
    await check('session_identity_after', async () => {
      report.identityAfter = await readIdentity(config);
      validateIdentity(config, report.identityAfter);
      assert.deepEqual(report.identityAfter, report.identity, 'Session edge identity changed during smoke');
    });
    report.exitCode = 0;
  } catch (error) {
    report.error = error.message;
  } finally {
    // Pending checks count as failures, never as skipped evidence.
    for (const name of requiredChecks) if (report.checks[name] === 'pending') report.checks[name] = 'failure';
    report.completedAt = new Date().toISOString();
    report.counts = { passed: Object.values(report.checks).filter(value => value === 'success').length,
      failed: Object.values(report.checks).filter(value => value === 'failure').length, skipped: 0 };
    await mkdir(dirname(config.reportPath), { recursive: true });
    await writeFile(config.reportPath, JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
  }
  return report;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = await runStagingSmoke(stagingConfig());
  console.log(JSON.stringify({ exitCode: report.exitCode, counts: report.counts, report: process.env.STAGING_TEST_REPORT }));
  process.exitCode = report.exitCode;
}
