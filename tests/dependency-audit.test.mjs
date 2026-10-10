import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateAudit } from "../scripts/checks/dependency-audit.mjs";

const advisory = "https://github.com/advisories/GHSA-ch52-4w7c-c8xp";
const policy = { package: "http-cache-semantics", version: "4.2.0", advisory,
  expiresAt: "2026-10-17T22:00:00.000Z", context: { config: "reviewed", runtime: "reviewed", remoteImages: "reviewed" } };
const context = structuredClone(policy.context);
const lock = { packages: { "node_modules/http-cache-semantics": { version: "4.2.0", dev: true } } };
const finding = { name: "http-cache-semantics", severity: "high", nodes: ["node_modules/http-cache-semantics"],
  via: [{ name: "http-cache-semantics", severity: "high", url: advisory }] };
function report(vulnerabilities = { "http-cache-semantics": structuredClone(finding) }) {
  return { auditReportVersion: 2, vulnerabilities, metadata: { vulnerabilities: { total: Object.keys(vulnerabilities).length } } };
}
const run = (audit = report(), overrides = {}) => evaluateAudit({ report: audit, policy, lock, context,
  now: new Date("2026-10-10T12:00:00Z"), ...overrides });

test("accepts only the reviewed build advisory through October 17 in Paris", () => {
  assert.equal(run(report(), { now: new Date("2026-10-17T21:59:59.999Z") }).ok, true);
  assert.equal(run().accepted.length, 1);
});
test("blocks at the expiration instant without automatic extension", () => {
  assert.equal(run(report(), { now: new Date(policy.expiresAt) }).ok, false);
});
test("continues normally after expiration when the advisory is absent", () => {
  assert.equal(run(report({}), { now: new Date("2026-10-18T00:00:00Z") }).ok, true);
});
test("blocks other moderate, high and critical advisories", () => {
  for (const severity of ["moderate", "high", "critical"]) {
    const other = { ...structuredClone(finding), severity, via: [{ name: finding.name, severity, url: "https://github.com/advisories/GHSA-other" }] };
    assert.equal(run(report({ "http-cache-semantics": other })).ok, false);
    assert.equal(run(report({ "http-cache-semantics": finding, other: { ...other, name: "other" } })).ok, false);
  }
});
test("does not exempt a second advisory on the same package", () => {
  const other = structuredClone(finding);
  other.via.push({ name: finding.name, severity: "high", url: "https://github.com/advisories/GHSA-other" });
  assert.equal(run(report({ "http-cache-semantics": other })).ok, false);
});
test("does not exempt an escalated critical finding", () => {
  const other = structuredClone(finding); other.severity = "critical";
  assert.equal(run(report({ "http-cache-semantics": other })).ok, false);
});
test("blocks production use, another version or another installed path", () => {
  for (const change of [{ version: "4.2.1", dev: true }, { version: "4.2.0" }]) {
    assert.equal(run(report(), { lock: { packages: { "node_modules/http-cache-semantics": change } } }).ok, false);
  }
  const other = structuredClone(finding); other.nodes.push("node_modules/other/node_modules/http-cache-semantics");
  assert.equal(run(report({ "http-cache-semantics": other })).ok, false);
});
test("blocks changed static configuration, runtime image or remote-image implementation", () => {
  for (const key of Object.keys(context)) assert.equal(run(report(), { context: { ...context, [key]: "changed" } }).ok, false);
});
test("fails closed on missing, erroneous or malformed audit data", () => {
  for (const audit of [{}, { error: { message: "registry unavailable" } }, { ...report(), vulnerabilities: null },
    { ...report(), metadata: { vulnerabilities: { total: 0 } } }, report({ broken: {} })]) {
    assert.equal(run(audit).ok, false);
  }
  assert.equal(run(report(), { now: new Date("invalid") }).ok, false);
});
test("reports low findings without blocking them", () => {
  const low = { name: "dompurify", severity: "low", nodes: ["node_modules/dompurify"], via: [{ severity: "low", url: "https://github.com/advisories/GHSA-low" }] };
  assert.equal(run(report({ "http-cache-semantics": finding, dompurify: low })).ok, true);
});
