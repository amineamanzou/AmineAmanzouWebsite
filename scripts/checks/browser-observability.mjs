import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const mode = process.argv.find((argument) => argument.startsWith("--mode="))?.split("=")[1];
if (mode !== "off" && mode !== "on") {
  throw new Error("Usage: npm run check:browser-observability -- --mode=off|on");
}

const root = process.cwd();
const dist = join(root, "dist");
const sourcePath = join(root, "src/scripts/browser-observability.ts");
const componentPath = join(root, "src/components/BrowserObservability.astro");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const source = readFileSync(sourcePath, "utf8");
const component = readFileSync(componentPath, "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(packageJson.dependencies?.["@hyperdx/browser"] === "0.24.0", "@hyperdx/browser must be pinned exactly to 0.24.0");
assert(packageJson.overrides?.protobufjs === "7.6.5", "Patched protobufjs override must stay pinned to 7.6.5");
assert(source.includes('await import("@hyperdx/browser")'), "HyperDX must stay behind a dynamic import");
assert(source.indexOf("validateConfig(config)") < source.indexOf('await import("@hyperdx/browser")'), "Configuration must be validated before loading the SDK chunk");
assert(source.includes("disableReplay: true"), "Session replay must be disabled");
assert(source.includes("disableIntercom: true"), "Intercom integration must be disabled");
assert(source.includes("consoleCapture: false"), "Console capture must be disabled");
assert(source.includes("advancedNetworkCapture: false"), "Advanced network capture must be disabled");
assert(source.includes("tracePropagationTargets: []"), "Trace propagation targets must remain empty");
assert(source.includes('"service.namespace": "web-frontend"'), "Browser resources must use the web-frontend namespace");
assert(source.includes('"deployment.environment": config.environment'), "Browser resources must carry the deployment environment");
assert(source.includes('return "/blog/:slug/"'), "Browser routes must use a closed route vocabulary");
assert(source.includes('return "/other/"'), "Unknown browser routes must collapse to one value");
for (const instrumentation of ["connectivity", "console", "errors", "fetch", "interactions", "postload", "socketio", "visibility", "websocket", "xhr"]) {
  assert(source.includes(`${instrumentation}: false`), `${instrumentation} instrumentation must be disabled`);
}
for (const instrumentation of ["document", "longtask", "webvitals"]) {
  assert(source.includes(`${instrumentation}: true`), `${instrumentation} instrumentation must be enabled`);
}
for (const action of ["browser.error", "browser.unhandledrejection", "browser.resource.error"]) {
  assert(source.includes(`addAction("${action}"`), `Missing privacy-safe action: ${action}`);
}
for (const forbidden of ["event.message", "event.filename", "window.location.href", "window.location.search", "window.location.hash", "recordException(", "userEmail", "userName"]) {
  assert(!source.includes(forbidden), `Forbidden high-risk browser field or API found: ${forbidden}`);
}
assert(component.includes("Ce n’est pas une clé serveur ClickStack"), "French notice must distinguish the public browser key from a ClickStack server key");
assert(component.includes("It is not a ClickStack server key"), "English notice must distinguish the public browser key from a ClickStack server key");
for (const noticeGate of ["__rum_sid", "15 minutes", "4 hours", "30 days", "Performance and reliability", "Privacy"]) {
  assert(component.includes(noticeGate), `Consent notice is missing activation gate: ${noticeGate}`);
}
assert(component.includes("deleteRumCookie"), "Consent withdrawal must delete the RUM session cookie");
assert(component.includes("window.location.reload()"), "Consent withdrawal must reload the page after deleting the session cookie");
assert(component.includes("decidedAt: new Date().toISOString()"), "Consent must persist an auditable decision timestamp");
assert(component.includes("JSON.stringify(decision)"), "Consent must persist a versioned JSON decision object");
assert(component.includes('if (!writeConsent("granted"))'), "SDK loading must stop when consent persistence fails");
assert(component.includes('const optOutCookie = "__rum_optout"'), "Withdrawal must have a fail-closed opt-out fallback");
assert(component.includes('readCookie(optOutCookie) === consentVersion'), "The opt-out fallback must be verified before reload");
assert(component.includes('if (persisted)'), "Withdrawal must reload only after denial persistence succeeds");
assert(component.includes("transitoirement une URL complète"), "French notice must disclose transient pre-collector URL context");
assert(component.includes("transiently include a complete URL"), "English notice must disclose transient pre-collector URL context");

assert(existsSync(join(dist, "index.html")), "Build output is missing; run npm run build first");
const home = readFileSync(join(dist, "index.html"), "utf8");

if (mode === "off") {
  assert(!home.includes("data-rum-consent"), "Ordinary builds must not render the browser observability consent surface");
  assert(!home.includes("BrowserObservability.astro"), "Ordinary builds must not load the browser observability client entry");
} else {
  for (const expected of [
    "data-rum-consent",
    "amineamanzou-frontend",
    "amineamanzou.fr",
    "browser-public",
  ]) {
    assert(home.includes(expected), `Enabled build is missing browser observability contract value: ${expected}`);
  }
  const redirect = readFileSync(join(dist, "cv/index.html"), "utf8");
  assert(!redirect.includes("data-rum-consent"), "Immediate compatibility redirects must not create parasite RUM sessions");

  const assetsDir = join(dist, "_astro");
  const jsAssets = existsSync(assetsDir)
    ? readdirSync(assetsDir).filter((file) => file.endsWith(".js"))
    : [];
  const sdkAssets = jsAssets.filter((file) => {
    const contents = readFileSync(join(assetsDir, file), "utf8");
    return contents.includes("OpenTelemetry Session Recorder");
  });
  assert(sdkAssets.length > 0, "Enabled build must emit a separate HyperDX SDK chunk");
  for (const asset of sdkAssets) {
    assert(!home.includes(`src=\"/_astro/${asset}`), `SDK chunk ${asset} must not be loaded before consent`);
    assert(!home.includes(`href=\"/_astro/${asset}`), `SDK chunk ${asset} must not be preloaded before consent`);
  }
}

console.log(`Browser observability ${mode} contract passed`);
