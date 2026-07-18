import { existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { chromium } from "playwright-core";

const pageUrl = process.env.PRODUCT_ANALYTICS_QA_URL ?? "http://127.0.0.1:4321/";
const endpointOrigin = "https://eu.i.posthog.com";
const timeout = 20_000;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitFor(predicate, message) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(message);
}

const playwrightExecutablePath = chromium.executablePath();
const relative = playwrightExecutablePath.match(/(?:^|\/)(chromium-\d+\/.*)$/)?.[1];
const candidates = [
  process.env.CHROME_PATH,
  relative && process.env.HOME ? `${process.env.HOME}/Library/Caches/ms-playwright/${relative}` : undefined,
  relative && process.env.HOME ? `${process.env.HOME}/.cache/ms-playwright/${relative}` : undefined,
  playwrightExecutablePath,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].filter(Boolean);
const executablePath = candidates.find(existsSync);
assert(executablePath, `Chrome executable not found; checked ${candidates.join(", ")}`);

const browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

async function installEndpointRoute(page, records) {
  await page.route(`${endpointOrigin}/**`, async (route) => {
    const request = route.request();
    const body = request.postDataBuffer() ?? Buffer.alloc(0);
    const decodedBody = body[0] === 0x1f && body[1] === 0x8b ? gunzipSync(body).toString("utf8") : body.toString("utf8");
    records.push({ method: request.method(), url: request.url(), body: decodedBody, headers: request.headers() });
    const cors = {
      "access-control-allow-origin": new URL(pageUrl).origin,
      "access-control-allow-methods": "POST, OPTIONS, GET",
      "access-control-allow-headers": "content-type",
    };
    if (request.method() === "OPTIONS") await route.fulfill({ status: 204, headers: cors, body: "" });
    else await route.fulfill({ status: 200, headers: cors, contentType: "application/json", body: "{}" });
  });
}

try {
  const browserUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
  const context = await browser.newContext({ userAgent: browserUserAgent });
  await context.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "webdriver", { configurable: true, get: () => false });
  });
  const page = await context.newPage();
  const requests = [];
  const scriptRequests = [];
  const pageErrors = [];
  const consoleMessages = [];
  const allRequests = [];
  page.on("request", (request) => {
    allRequests.push(`${request.method()} ${request.url()}`);
    if (request.resourceType() === "script") scriptRequests.push(request.url());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  page.on("console", (message) => consoleMessages.push(`${message.type()}: ${message.text()}`));
  await installEndpointRoute(page, requests);

  await page.goto(`${pageUrl}?utm_source=linkedin&utm_campaign=p2-qa&email=secret@example.test#private`, { waitUntil: "networkidle", timeout });
  await page.locator("[data-analytics-panel]").waitFor({ state: "visible", timeout });
  assert(requests.length === 0, "PostHog endpoint contacted before consent");
  assert(!scriptRequests.some((url) => url.includes("module.no-external")), "PostHog SDK chunk loaded before consent");
  assert(!(await context.cookies()).some((cookie) => cookie.name.startsWith("ph_")), "PostHog cookie created before consent");

  await page.locator("[data-analytics-accept]").click();
  await waitFor(() => scriptRequests.some((url) => url.includes("module.no-external")), "PostHog SDK chunk did not load after consent");
  await page.waitForTimeout(1500);
  if (!requests.some((request) => request.method === "POST")) {
    const storage = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)])));
    throw new Error(`PostHog did not receive the manual pageview: ${JSON.stringify({ requests, pageErrors, consoleMessages, storage, allRequests })}`);
  }

  await page.evaluate(() => {
    document.querySelector("[data-analytics-cta-id='start_observability_diagnostic']")?.addEventListener("click", (event) => event.preventDefault(), { once: true });
  });
  const requestsBeforeClick = requests.filter((request) => request.method === "POST").length;
  await page.locator("[data-analytics-cta-id='start_observability_diagnostic']").first().click();
  await waitFor(
    () => requests.filter((request) => request.method === "POST").length === requestsBeforeClick + 1,
    "One CTA click did not emit exactly one additional request",
  );

  const serialized = requests.map((request) => {
    try {
      return decodeURIComponent(`${request.url}\n${request.body}`.replaceAll("+", " "));
    } catch {
      return `${request.url}\n${request.body}`;
    }
  }).join("\n");
  for (const forbidden of ["secret@example.test", "email=", "#private", "$current_url", "$referrer", "business.lead_created"]) {
    assert(!serialized.includes(forbidden), `Forbidden analytics data reached the endpoint: ${forbidden}`);
  }
  assert(serialized.includes("site.cta_click"), "CTA event name is missing from PostHog payload");
  assert(serialized.includes("start_observability_diagnostic"), "Closed CTA id is missing from PostHog payload");
  assert(serialized.includes("p2-qa"), "Normalized campaign attribution is missing");

  await page.locator("[data-analytics-settings]").click();
  const navigated = page.waitForEvent("framenavigated");
  await page.locator("[data-analytics-withdraw]").click();
  await navigated;
  await page.waitForLoadState("networkidle");
  const denied = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((candidate) => candidate.startsWith("amineamanzou-product-analytics-consent-"));
    return key ? JSON.parse(localStorage.getItem(key) ?? "null") : null;
  });
  assert(denied?.state === "denied", "Withdrawal did not persist denied state");
  assert(!(await context.cookies()).some((cookie) => cookie.name.startsWith("ph_")), "PostHog cookie remained after withdrawal");
  await context.close();

  const privacyContext = await browser.newContext({ userAgent: browserUserAgent });
  await privacyContext.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "webdriver", { configurable: true, get: () => false });
    Object.defineProperty(Navigator.prototype, "globalPrivacyControl", { configurable: true, get: () => true });
  });
  const privacyPage = await privacyContext.newPage();
  const privacyRequests = [];
  await installEndpointRoute(privacyPage, privacyRequests);
  await privacyPage.goto(pageUrl, { waitUntil: "networkidle", timeout });
  await privacyPage.locator("[data-analytics-settings]").click();
  assert(await privacyPage.locator("[data-analytics-accept]").isDisabled(), "GPC did not disable analytics opt-in");
  assert(privacyRequests.length === 0, "PostHog endpoint contacted under GPC");
  await privacyContext.close();

  assert(pageErrors.length === 0, `Browser errors: ${pageErrors.join(" | ")}`);
  console.log(JSON.stringify({
    ok: true,
    phases: ["pre-consent", "manual-events", "withdrawal", "gpc"],
    postRequests: requests.filter((request) => request.method === "POST").length,
    sdkLoadedOnlyAfterConsent: true,
    sensitiveValuesExcluded: true,
  }, null, 2));
} finally {
  await browser.close();
}
