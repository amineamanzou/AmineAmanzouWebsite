import assert from "node:assert/strict";
import { request } from "node:http";

const args = process.argv.slice(2);
const inlineUrl = args.find((arg) => arg.startsWith("--url="))?.slice("--url=".length);
const urlIndex = args.indexOf("--url");
const baseUrlArgument = inlineUrl ?? (urlIndex === -1 ? undefined : args[urlIndex + 1]);
if (!baseUrlArgument) {
  throw new Error("Usage: node scripts/qa/caddy-redirects-smoke.mjs --url=http://127.0.0.1:8080");
}

const baseUrl = new URL(baseUrlArgument);
if (baseUrl.protocol !== "http:") {
  throw new Error("The redirect smoke test requires an http:// base URL");
}

const fetchResponse = ({ path, host = "amineamanzou.fr" }) =>
  new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: baseUrl.hostname,
        port: baseUrl.port,
        method: "GET",
        path,
        headers: { Host: host },
      },
      (response) => {
        response.resume();
        response.on("end", () => {
          resolve({
            location: response.headers.location,
            status: response.statusCode,
          });
        });
      },
    );
    req.setTimeout(5000, () => req.destroy(new Error(`Request timed out: ${host}${path}`)));
    req.on("error", reject);
    req.end();
  });

const redirects = [
  ["/cv", "amineamanzou.fr", "https://amineamanzou.fr/dossier/"],
  ["/cv/", "amineamanzou.fr", "https://amineamanzou.fr/dossier/"],
  ["/en/cv", "amineamanzou.fr", "https://amineamanzou.fr/en/dossier/"],
  ["/en/cv/", "amineamanzou.fr", "https://amineamanzou.fr/en/dossier/"],
  [
    "/wp-content/uploads/2026/01/AmineAmanzouFR-ExpertObservabilite.pdf",
    "amineamanzou.fr",
    "https://amineamanzou.fr/downloads/amine-amanzou-dossier-competence-fr.pdf",
  ],
  ["/", "otel.amineamanzou.fr", "https://amineamanzou.fr/consultant-opentelemetry/"],
  ["/old-demo/path", "otel.amineamanzou.fr", "https://amineamanzou.fr/consultant-opentelemetry/"],
  ["/cv", "otel.amineamanzou.fr", "https://amineamanzou.fr/consultant-opentelemetry/"],
  ["/en/cv/", "otel.amineamanzou.fr", "https://amineamanzou.fr/consultant-opentelemetry/"],
  ["/articles", "otel.amineamanzou.fr", "https://amineamanzou.fr/consultant-opentelemetry/"],
  ["/articles/", "otel.amineamanzou.fr", "https://amineamanzou.fr/consultant-opentelemetry/"],
  ["/cv/", "www.amineamanzou.fr", "https://amineamanzou.fr/dossier/"],
];

for (const [path, host, location] of redirects) {
  const response = await fetchResponse({ path, host });
  assert.equal(response.status, 301, `${host}${path} must return 301`);
  assert.equal(response.location, location, `${host}${path} must redirect to ${location}`);
}

const homepage = await fetchResponse({ path: "/" });
assert.equal(homepage.status, 200, "The main homepage must remain available");
assert.equal(homepage.location, undefined, "The main homepage must not redirect");

for (const path of ["/articles", "/articles/"]) {
  const response = await fetchResponse({ path });
  assert.equal(response.status, 302, `${path} must retain its temporary redirect`);
  assert.equal(response.location, "/", `${path} must retain its homepage destination`);
}

console.log("Caddy redirect smoke test passed");
