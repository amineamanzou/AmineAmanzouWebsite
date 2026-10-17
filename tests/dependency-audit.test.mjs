import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { evaluateAudit } from "../scripts/checks/dependency-audit.mjs";

const finding = {
  name: "http-cache-semantics", severity: "high", nodes: ["node_modules/http-cache-semantics"],
  via: [{ name: "http-cache-semantics", severity: "high", url: "https://github.com/advisories/GHSA-ch52-4w7c-c8xp" }],
};
function report(vulnerabilities = {}) {
  return { auditReportVersion: 2, vulnerabilities, metadata: { vulnerabilities: { total: Object.keys(vulnerabilities).length } } };
}

test("passes reports without vulnerabilities", () => {
  assert.equal(evaluateAudit({ report: report() }).ok, true);
});

test("blocks every moderate, high and critical finding, including the former cache advisory", () => {
  for (const name of ["http-cache-semantics", "another-package"]) {
    for (const severity of ["moderate", "high", "critical"]) {
      const entry = { ...finding, name, severity, via: [{ ...finding.via[0], name, severity }] };
      const result = evaluateAudit({ report: report({ [name]: entry }) });
      assert.equal(result.ok, false, `${name}: ${severity}`);
      assert.equal(result.blockers.length, 1);
    }
  }
});

test("allows info and low findings without raising the moderate threshold", () => {
  for (const severity of ["info", "low"]) {
    const entry = { ...finding, severity, via: [{ ...finding.via[0], severity }] };
    assert.equal(evaluateAudit({ report: report({ [entry.name]: entry }) }).ok, true);
  }
});

test("blocks transitive findings reported through another package", () => {
  const entry = { ...finding, via: ["another-package"] };
  assert.equal(evaluateAudit({ report: report({ [entry.name]: entry }) }).ok, false);
});

test("fails closed on missing, erroneous or malformed audit reports", () => {
  for (const audit of [undefined, null, [], {}, { error: { message: "registry unavailable" } },
    { ...report(), error: { message: "registry unavailable" } },
    { ...report(), auditReportVersion: 1 }, { ...report(), vulnerabilities: null },
    { ...report(), metadata: { vulnerabilities: { total: 1 } } }]) {
    assert.equal(evaluateAudit({ report: audit }).ok, false);
  }
});

test("fails closed on malformed findings even below the blocking threshold", () => {
  for (const entry of [{}, { ...finding, name: "mismatched" }, { ...finding, severity: "unknown" },
    { ...finding, via: [] }, { ...finding, nodes: [] }, { ...finding, via: [null] },
    { ...finding, severity: "low", via: [{ severity: "low" }] }]) {
    assert.equal(evaluateAudit({ report: report({ [finding.name]: entry }) }).ok, false);
  }
});

function runGate(t, { stdout, status = 0, signal = false, missingNpm = false }) {
  const root = realpathSync(mkdtempSync(join(tmpdir(), "dependency-audit-test-")));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const scripts = join(root, "scripts", "checks");
  const bin = join(root, "bin");
  mkdirSync(scripts, { recursive: true });
  mkdirSync(bin);
  const script = join(scripts, "dependency-audit.mjs");
  copyFileSync(new URL("../scripts/checks/dependency-audit.mjs", import.meta.url), script);
  if (!missingNpm) {
    writeFileSync(join(bin, "npm"), `#!${process.execPath}
const { writeFileSync } = require("node:fs");
writeFileSync(process.env.AUDIT_TEST_ARGS, JSON.stringify(process.argv.slice(2)));
process.stdout.write(process.env.AUDIT_TEST_STDOUT);
if (process.env.AUDIT_TEST_SIGNAL === "true") process.kill(process.pid, "SIGTERM");
else process.exitCode = Number(process.env.AUDIT_TEST_STATUS);
`, { mode: 0o755 });
  }
  const argsFile = join(root, "args.json");
  const result = spawnSync(process.execPath, [script], {
    cwd: root, encoding: "utf8", timeout: 10000,
    env: { ...process.env, PATH: bin, NODE_ENV: "production", AUDIT_TEST_ARGS: argsFile,
      AUDIT_TEST_STDOUT: stdout, AUDIT_TEST_STATUS: String(status), AUDIT_TEST_SIGNAL: String(signal) },
  });
  assert.equal(result.error, undefined);
  assert.equal(result.signal, null);
  if (!missingNpm) {
    assert.deepEqual(JSON.parse(readFileSync(argsFile, "utf8")), ["audit", "--include=dev", "--audit-level=moderate", "--json"]);
  }
  return result;
}

test("CLI audits development dependencies and preserves the full below-threshold report", (t) => {
  const low = { ...finding, severity: "low", via: [{ ...finding.via[0], severity: "low" }] };
  const stdout = JSON.stringify(report({ [low.name]: low }));
  const result = runGate(t, { stdout });
  assert.equal(result.status, 0, result.stderr);
  assert.ok(result.stdout.includes(stdout));
});

test("CLI blocks a high finding even if npm exits successfully", (t) => {
  const stdout = JSON.stringify(report({ [finding.name]: finding }));
  for (const status of [0, 1]) {
    const result = runGate(t, { stdout, status });
    assert.equal(result.status, 1);
    assert.ok(result.stdout.includes(stdout));
    assert.ok(result.stderr.includes(finding.name));
  }
});

test("CLI fails closed on invalid JSON, registry errors and process failures", (t) => {
  for (const fixture of [
    { stdout: "not json" },
    { stdout: JSON.stringify({ error: { message: "registry unavailable" } }), status: 1 },
    { stdout: JSON.stringify(report()), status: 2 },
    { stdout: JSON.stringify(report()), signal: true },
    { stdout: "", missingNpm: true },
  ]) {
    const result = runGate(t, fixture);
    assert.equal(result.status, 1);
    assert.notEqual(result.stderr.trim(), "");
  }
});
