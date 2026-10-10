import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const severities = ["info", "low", "moderate", "high", "critical"];
const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

export function evaluateAudit({ report, policy, lock, context, now = new Date() }) {
  const accepted = [];
  const blockers = [];
  const invalid = (reason) => ({ ok: false, accepted, blockers: [reason] });
  if (!record(report) || report.error || report.auditReportVersion !== 2 || !record(report.vulnerabilities)
    || report.metadata?.vulnerabilities?.total !== Object.keys(report.vulnerabilities).length
    || !Number.isFinite(now.getTime())) return invalid("Invalid audit report or clock");
  for (const [name, finding] of Object.entries(report.vulnerabilities)) {
    if (!record(finding) || finding.name !== name || !severities.includes(finding.severity)
      || !Array.isArray(finding.via) || finding.via.length === 0 || !Array.isArray(finding.nodes) || finding.nodes.length === 0
      || finding.via.some((via) => typeof via !== "string" && (!record(via) || !severities.includes(via.severity) || typeof via.url !== "string"))) {
      return invalid(`Invalid audit finding: ${name}`);
    }
    if (severities.indexOf(finding.severity) < severities.indexOf("moderate")) continue;
    const installed = lock?.packages?.["node_modules/http-cache-semantics"];
    const scoped = name === policy.package && finding.severity === "high"
      && finding.nodes.length === 1 && finding.nodes[0] === "node_modules/http-cache-semantics"
      && finding.via.length === 1 && finding.via[0].name === policy.package
      && finding.via[0].severity === "high" && finding.via[0].url === policy.advisory
      && installed?.version === policy.version && installed.dev === true
      && now.getTime() < Date.parse(policy.expiresAt)
      && record(context) && ["config", "runtime", "remoteImages"].every((key) =>
        typeof policy.context?.[key] === "string" && policy.context[key].length > 0 && context[key] === policy.context[key]);
    if (scoped) accepted.push(`${name}@${policy.version}: ${policy.advisory}; expires ${policy.expiresAt}`);
    else blockers.push(`${name}: ${finding.severity} (not covered by the temporary exception)`);
  }
  return { ok: blockers.length === 0, accepted, blockers };
}

export function readAuditContext(root) {
  const hash = (text) => createHash("sha256").update(text).digest("hex");
  const dockerfile = readFileSync(resolve(root, "Dockerfile"), "utf8");
  const runtime = dockerfile.slice(dockerfile.lastIndexOf("\nFROM ") + 1);
  return {
    config: hash(readFileSync(resolve(root, "astro.config.mjs"))),
    runtime: hash(runtime + readFileSync(resolve(root, "ops/Caddyfile"), "utf8")),
    remoteImages: hash(readFileSync(resolve(root, "node_modules/astro/dist/assets/build/remote.js"))),
  };
}

function main() {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  try {
    const policy = JSON.parse(readFileSync(resolve(root, "scripts/checks/dependency-audit-policy.json"), "utf8"));
    const lock = JSON.parse(readFileSync(resolve(root, "package-lock.json"), "utf8"));
    const context = readAuditContext(root);
    const audit = spawnSync("npm", ["audit", "--include=dev", "--audit-level=moderate", "--json"],
      { cwd: root, encoding: "utf8", timeout: 90000, maxBuffer: 16 * 1024 * 1024 });
    if (audit.error || audit.signal || ![0, 1].includes(audit.status)) throw new Error("npm audit did not produce a successful advisory response");
    // Preserve every finding, including accepted and below-threshold findings, in the build log.
    console.log(audit.stdout);
    const result = evaluateAudit({ report: JSON.parse(audit.stdout), policy, lock, context });
    for (const item of result.accepted) console.warn(`::warning::Temporary build-only risk acceptance: ${item}`);
    for (const item of result.blockers) console.error(item);
    if (!result.ok) process.exitCode = 1;
    else console.log("Dependency audit gate passed; all moderate-or-higher findings are fixed or explicitly covered.");
  } catch (error) {
    console.error(`Dependency audit failed closed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
