import { existsSync } from "node:fs";
import { chromium } from "playwright-core";

const CONTROLLED_ERROR_SENTINEL = "CONTROLLED_BROWSER_ERROR_SENTINEL_DO_NOT_EXPORT";
const CONTROLLED_REJECTION_SENTINEL = "CONTROLLED_REJECTION_SENTINEL_DO_NOT_EXPORT";
const CONTROLLED_RESOURCE_SENTINEL = "CONTROLLED_RESOURCE_URL_SENTINEL_DO_NOT_EXPORT";

function parseOptions(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith("--")) continue;
    const [rawKey, inlineValue] = argument.slice(2).split("=", 2);
    const nextValue = argv[index + 1];
    options[rawKey] = inlineValue ?? (nextValue && !nextValue.startsWith("--") ? argv[++index] : "true");
  }
  return options;
}

const options = parseOptions(process.argv.slice(2));
const pageUrl = options.url ?? process.env.BROWSER_OBSERVABILITY_QA_URL ?? "http://127.0.0.1:4321/";
const endpoint = (options.endpoint ?? process.env.BROWSER_OBSERVABILITY_QA_ENDPOINT ?? "https://otel-browser-actions.test").replace(/\/$/, "");
const expected = {
  environment: options.environment ?? "production",
  service: options.service ?? "amineamanzou-frontend",
  site: options.site ?? "amineamanzou.fr",
  version: options.version ?? process.env.BROWSER_OBSERVABILITY_QA_VERSION ?? "0123456789abcdef0123456789abcdef01234567",
};
const timeout = Number.parseInt(options.timeout ?? "20000", 10);
const endpointUrl = new URL(endpoint);
const targetUrl = new URL(pageUrl);
const controlledResourceNetworkUrl = new URL(`/assets/${CONTROLLED_RESOURCE_SENTINEL}.png?token=secret`, targetUrl.origin).href;
const CONTROLLED_RESOURCE_URL = `${controlledResourceNetworkUrl}#private`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(endpointUrl.hostname.endsWith(".test"), `QA endpoint must use a reserved .test host, got ${endpointUrl.hostname}`);
assert(["127.0.0.1", "localhost", "::1"].includes(targetUrl.hostname), `QA page must be local, got ${targetUrl.hostname}`);
assert(/^[0-9a-f]{40}$/i.test(expected.version), `Expected service version must be a 40-character SHA, got ${expected.version}`);
assert(Number.isFinite(timeout) && timeout > 0, `Invalid timeout: ${options.timeout}`);

const playwrightExecutablePath = chromium.executablePath();
const playwrightCacheRelativePath = playwrightExecutablePath.match(/(?:^|\/)(chromium-\d+\/.*)$/)?.[1];
const playwrightCacheCandidates = playwrightCacheRelativePath && process.env.HOME
  ? [
      `${process.env.HOME}/Library/Caches/ms-playwright/${playwrightCacheRelativePath}`,
      `${process.env.HOME}/.cache/ms-playwright/${playwrightCacheRelativePath}`,
    ]
  : [];
const chromeCandidates = [
  process.env.CHROME_PATH,
  ...playwrightCacheCandidates,
  playwrightExecutablePath,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
].filter(Boolean);
const executablePath = chromeCandidates.find((candidate) => existsSync(candidate));
assert(executablePath, `Chrome executable not found; checked: ${chromeCandidates.join(", ")}`);

function decodeAnyValue(value = {}) {
  if ("stringValue" in value) return value.stringValue;
  if ("boolValue" in value) return value.boolValue;
  if ("intValue" in value) return Number(value.intValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("bytesValue" in value) return value.bytesValue;
  if (value.arrayValue) return (value.arrayValue.values ?? []).map(decodeAnyValue);
  if (value.kvlistValue) return decodeAttributes(value.kvlistValue.values ?? []);
  return undefined;
}

function decodeAttributes(attributes = []) {
  return Object.fromEntries(attributes.map(({ key, value }) => [key, decodeAnyValue(value)]));
}

function decodeOtlpJson(requestRecord) {
  assert(requestRecord.method === "POST", `Expected OTLP POST, got ${requestRecord.method}`);
  assert(requestRecord.contentType.includes("application/json"), `Expected OTLP JSON, got ${requestRecord.contentType}`);
  assert(requestRecord.body.length > 0, "OTLP request body is empty");

  let payload;
  try {
    payload = JSON.parse(requestRecord.body.toString("utf8"));
  } catch (error) {
    throw new Error(`Invalid OTLP JSON payload: ${error instanceof Error ? error.message : String(error)}`);
  }

  assert(Array.isArray(payload.resourceSpans), "OTLP JSON payload is missing resourceSpans");
  return payload;
}

function flattenSpans(payloads) {
  const spans = [];
  for (const payload of payloads) {
    for (const resourceSpan of payload.resourceSpans ?? []) {
      const resourceAttributes = decodeAttributes(resourceSpan.resource?.attributes ?? []);
      const scopeSpans = resourceSpan.scopeSpans ?? resourceSpan.instrumentationLibrarySpans ?? [];
      for (const scopeSpan of scopeSpans) {
        const scope = scopeSpan.scope ?? scopeSpan.instrumentationLibrary ?? {};
        for (const span of scopeSpan.spans ?? []) {
          spans.push({
            ...span,
            attributes: decodeAttributes(span.attributes ?? []),
            events: span.events ?? [],
            links: span.links ?? [],
            resourceAttributes,
            scope,
          });
        }
      }
    }
  }
  return spans;
}

function decodeSessionCookie(cookie) {
  assert(cookie, "Missing __rum_sid cookie");
  let session;
  try {
    session = JSON.parse(decodeURIComponent(cookie.value));
  } catch (error) {
    throw new Error(`Invalid __rum_sid cookie: ${error instanceof Error ? error.message : String(error)}`);
  }
  assert(/^[0-9a-f]{32}$/i.test(session.id ?? ""), `Invalid RUM session id: ${session.id}`);
  return session.id;
}

async function waitForActionSpans(postRequests) {
  const actionNames = new Set(["browser.error", "browser.unhandledrejection", "browser.resource.error"]);
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const spans = flattenSpans(postRequests.map(decodeOtlpJson));
    const actions = spans.filter((span) => actionNames.has(span.name));
    if (new Set(actions.map((span) => span.name)).size === actionNames.size) return actions;
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  const observedNames = flattenSpans(postRequests.map(decodeOtlpJson)).map((span) => span.name);
  throw new Error(`Timed out waiting for controlled actions; observed spans: ${observedNames.join(", ")}`);
}

async function waitFor(predicate, message) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    if (predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(message);
}

async function triggerControlledFailures(page) {
  await page.evaluate(({ errorSentinel, rejectionSentinel, resourceUrl }) => {
    setTimeout(() => {
      throw new TypeError(errorSentinel);
    }, 0);
    setTimeout(() => {
      void Promise.reject(new RangeError(rejectionSentinel));
    }, 25);
    const image = document.createElement("img");
    image.alt = "";
    image.src = resourceUrl;
    image.hidden = true;
    document.body.append(image);
  }, {
    errorSentinel: CONTROLLED_ERROR_SENTINEL,
    rejectionSentinel: CONTROLLED_REJECTION_SENTINEL,
    resourceUrl: CONTROLLED_RESOURCE_URL,
  });
}

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
let context;
let page;

try {
  context = await browser.newContext();
  page = await context.newPage();
  const endpointInteractions = [];
  const postRequests = [];
  const scriptRequests = [];
  const pageErrors = [];
  const protocolViolations = [];
  let controlledResourceRequests = 0;

  page.on("request", (request) => {
    if (request.resourceType() === "script") scriptRequests.push(request.url());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.route(`${endpoint}/**`, async (route) => {
    const request = route.request();
    const requestUrl = new URL(request.url());
    const method = request.method();
    const headers = request.headers();
    endpointInteractions.push({ method, url: request.url() });
    const corsHeaders = {
      "access-control-allow-origin": targetUrl.origin,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "authorization, content-type",
      "access-control-max-age": "600",
    };

    const pathIsValid = requestUrl.pathname === "/v1/traces" && requestUrl.search === "";
    const methodIsValid = method === "OPTIONS" || method === "POST";
    const contentType = headers["content-type"] ?? "";
    const contentEncoding = headers["content-encoding"] ?? "";
    const contentTypeIsValid = method === "OPTIONS" || /^application\/json(?:\s*;|$)/i.test(contentType);
    const contentEncodingIsValid = contentEncoding === "" || contentEncoding.toLowerCase() === "identity";
    if (!pathIsValid || !methodIsValid || !contentTypeIsValid || !contentEncodingIsValid) {
      protocolViolations.push({ method, path: `${requestUrl.pathname}${requestUrl.search}`, contentType, contentEncoding });
      await route.abort("blockedbyclient");
      return;
    }

    if (method === "OPTIONS") {
      await route.fulfill({ status: 204, headers: corsHeaders, body: "" });
      return;
    }

    const record = {
      method,
      url: request.url(),
      contentType,
      contentEncoding,
      authorization: headers.authorization ?? "",
      body: request.postDataBuffer() ?? Buffer.alloc(0),
    };
    postRequests.push(record);
    await route.fulfill({ status: 200, contentType: "application/json", headers: corsHeaders, body: "{}" });
  });
  await page.route(controlledResourceNetworkUrl, async (route) => {
    controlledResourceRequests += 1;
    await route.fulfill({
      status: 404,
      headers: { "cache-control": "no-store", "content-type": "image/png" },
      body: "",
    });
  });

  // Phase 1: loading the page alone must not create SDK traffic or storage.
  await page.goto(pageUrl, { waitUntil: "networkidle", timeout });
  await page.locator("[data-rum-panel]").waitFor({ state: "visible", timeout });
  await page.waitForFunction(() => document.activeElement?.hasAttribute("data-rum-accept"), undefined, { timeout });
  const scriptsBeforeConsent = scriptRequests.length;
  const resourceRequestsBeforeConsent = controlledResourceRequests;
  await triggerControlledFailures(page);
  await page.waitForTimeout(5500);
  assert(pageErrors.some((message) => message.includes(CONTROLLED_ERROR_SENTINEL)), "Pre-consent runtime error was not raised");
  assert(pageErrors.some((message) => message.includes(CONTROLLED_REJECTION_SENTINEL)), "Pre-consent rejected promise was not raised");
  assert(controlledResourceRequests === resourceRequestsBeforeConsent + 1, "Pre-consent resource failure was not triggered exactly once");
  assert(endpointInteractions.length === 0, "Endpoint contacted before consent");
  assert(scriptRequests.length === scriptsBeforeConsent, "Observability SDK chunk loaded before consent");
  assert(!(await context.cookies()).some((cookie) => cookie.name === "__rum_sid"), "RUM session cookie created before consent");

  // Phase 2: explicit consent loads the SDK, then three controlled failures
  // exercise only the privacy-safe addAction listeners.
  await page.locator("[data-rum-accept]").click();
  await page.waitForFunction(() => document.cookie.includes("__rum_sid="), undefined, { timeout });
  await waitFor(
    () => scriptRequests.length > scriptsBeforeConsent,
    `Timed out waiting for the consent-gated SDK chunk; script requests stayed at ${scriptsBeforeConsent}`,
  );
  const sessionCookie = (await context.cookies()).find((cookie) => cookie.name === "__rum_sid");
  const sessionId = decodeSessionCookie(sessionCookie);

  await triggerControlledFailures(page);

  const actionSpans = await waitForActionSpans(postRequests);
  const actionsByName = new Map(actionSpans.map((span) => [span.name, span]));
  const expectedActions = {
    "browser.error": { "error.type": "TypeError", "page.route": "/" },
    "browser.unhandledrejection": { "error.type": "RangeError", "page.route": "/" },
    "browser.resource.error": { "resource.type": "img", "page.route": "/" },
  };

  assert(actionSpans.length === 3, `Expected exactly three controlled action spans, got ${actionSpans.length}`);
  const traceIds = new Set();
  const spanIds = new Set();
  for (const [name, expectedAttributes] of Object.entries(expectedActions)) {
    const span = actionsByName.get(name);
    assert(span, `Missing controlled action span: ${name}`);
    assert(/^[0-9a-f]{32}$/i.test(span.traceId ?? ""), `${name} has invalid traceId: ${span.traceId}`);
    assert(/^[0-9a-f]{16}$/i.test(span.spanId ?? ""), `${name} has invalid spanId: ${span.spanId}`);
    assert(!span.parentSpanId || /^0+$/.test(span.parentSpanId), `${name} must be a root span`);
    traceIds.add(span.traceId);
    spanIds.add(span.spanId);
    assert(span.scope?.name === "custom-action", `${name} has unexpected scope: ${span.scope?.name}`);
    assert(span.events.length === 0, `${name} must not export events`);
    assert(span.links.length === 0, `${name} must not export links`);

    for (const [key, value] of Object.entries(expectedAttributes)) {
      assert(span.attributes[key] === value, `${name} attribute ${key}: expected ${value}, got ${span.attributes[key]}`);
    }
    const locationHref = span.attributes["location.href"];
    assert(typeof locationHref === "string", `${name} is missing the transient location.href attribute`);
    const actionLocation = new URL(locationHref);
    assert(actionLocation.origin === targetUrl.origin, `${name} location.href has unexpected origin: ${actionLocation.origin}`);
    assert(actionLocation.pathname === targetUrl.pathname, `${name} location.href has unexpected path: ${actionLocation.pathname}`);
    assert(actionLocation.search === "" && actionLocation.hash === "", `${name} location.href contains query or fragment data`);
    for (const forbiddenKey of ["error.message", "exception.message", "exception.stacktrace", "url.full", "http.url", "user_agent.original"]) {
      assert(!(forbiddenKey in span.attributes), `${name} leaked forbidden attribute ${forbiddenKey}`);
    }

    const resources = span.resourceAttributes;
    assert(resources["service.name"] === expected.service, `${name} service.name mismatch`);
    assert(resources["service.namespace"] === "web-frontend", `${name} service.namespace mismatch`);
    assert(resources["service.version"] === expected.version, `${name} service.version mismatch`);
    assert(resources["site.name"] === expected.site, `${name} site.name mismatch`);
    assert(resources["deployment.environment"] === expected.environment, `${name} deployment.environment mismatch`);
    assert(resources["deployment.environment.name"] === expected.environment, `${name} deployment.environment.name mismatch`);
    assert(resources["rum.sessionId"] === sessionId, `${name} session id does not match __rum_sid`);
  }
  assert(traceIds.size === 3, "Controlled action trace IDs must be unique");
  assert(spanIds.size === 3, "Controlled action span IDs must be unique");
  assert(postRequests.every((request) => request.url === `${endpoint}/v1/traces`), "Unexpected OTLP endpoint path");
  assert(postRequests.every((request) => request.authorization === "browser-public"), "Unexpected browser authorization marker");
  assert(protocolViolations.length === 0, `OTLP protocol violation(s): ${JSON.stringify(protocolViolations)}`);

  // This application contract owns the three explicit actions. HyperDX's
  // document instrumentation may transiently emit raw resourceFetch.http.url;
  // the collector allow-list is responsible for dropping it before storage.
  const serializedActionSpans = JSON.stringify(actionSpans);
  for (const sentinel of [CONTROLLED_ERROR_SENTINEL, CONTROLLED_REJECTION_SENTINEL, CONTROLLED_RESOURCE_SENTINEL, CONTROLLED_RESOURCE_URL, "token=secret", "#private"]) {
    assert(!serializedActionSpans.includes(sentinel), `Privacy sentinel leaked into a controlled action span: ${sentinel}`);
  }

  // Phase 3: withdrawal persists denial, removes the session and must not
  // restart telemetry when the page reloads.
  await page.locator("[data-rum-settings]").click();
  const reloaded = page.waitForEvent("framenavigated");
  await page.locator("[data-rum-withdraw]").click();
  await reloaded;
  await page.waitForLoadState("networkidle");
  // The old document may legitimately flush already-recorded spans during
  // pagehide. Establish the denied-document baseline only after that flush.
  await page.waitForTimeout(5500);

  const cookiesAfterWithdrawal = await context.cookies();
  const decision = await page.evaluate(() => {
    const key = Object.keys(localStorage).find((candidate) => candidate.startsWith("amineamanzou-browser-observability-consent-"));
    return key ? JSON.parse(localStorage.getItem(key) ?? "null") : null;
  });
  assert(!cookiesAfterWithdrawal.some((cookie) => cookie.name === "__rum_sid"), "RUM session cookie remained after withdrawal");
  assert(decision?.state === "denied", "Withdrawal did not persist denied consent");
  assert(await page.locator("[data-rum-settings]").isVisible(), "Privacy settings control is not visible after withdrawal");

  const postsAfterPagehideFlush = postRequests.length;
  const scriptsAfterWithdrawal = scriptRequests.length;
  const pageErrorsAfterWithdrawal = pageErrors.length;
  const resourceRequestsAfterWithdrawal = controlledResourceRequests;
  await triggerControlledFailures(page);
  await page.waitForTimeout(5500);
  const deniedPageErrors = pageErrors.slice(pageErrorsAfterWithdrawal);
  assert(deniedPageErrors.some((message) => message.includes(CONTROLLED_ERROR_SENTINEL)), "Denied-document runtime error was not raised");
  assert(deniedPageErrors.some((message) => message.includes(CONTROLLED_REJECTION_SENTINEL)), "Denied-document rejected promise was not raised");
  assert(controlledResourceRequests === resourceRequestsAfterWithdrawal + 1, "Denied-document resource failure was not triggered exactly once");
  assert(postRequests.length === postsAfterPagehideFlush, "Denied document exported telemetry after controlled failures");
  assert(scriptRequests.length === scriptsAfterWithdrawal, "Denied document loaded the observability SDK after controlled failures");
  assert(protocolViolations.length === 0, `OTLP protocol violation(s): ${JSON.stringify(protocolViolations)}`);

  assert(pageErrors.some((message) => message.includes(CONTROLLED_ERROR_SENTINEL)), "Controlled runtime error was not raised in the browser");

  console.log(JSON.stringify({
    ok: true,
    phases: ["pre-consent", "controlled-actions", "withdrawal"],
    actionNames: [...actionsByName.keys()].sort(),
    endpointInteractions: endpointInteractions.length,
    otlpPosts: postRequests.length,
    sessionId,
    traceIds: [...traceIds],
    spanIds: [...spanIds],
    version: expected.version,
    actionSentinelsExcluded: true,
    withdrawalState: decision.state,
  }, null, 2));
} finally {
  if (page && !page.isClosed()) {
    await page.close({ runBeforeUnload: false });
  }
  if (context) {
    await context.close();
  }
  await browser.close();
}
