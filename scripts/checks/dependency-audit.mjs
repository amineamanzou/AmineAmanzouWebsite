import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const severities = ["info", "low", "moderate", "high", "critical"];
const record = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

export function evaluateAudit({ report }) {
  const blockers = [];
  const invalid = (reason) => ({ ok: false, blockers: [reason] });
  if (!record(report) || report.error || report.auditReportVersion !== 2 || !record(report.vulnerabilities)
    || report.metadata?.vulnerabilities?.total !== Object.keys(report.vulnerabilities).length) return invalid("Invalid audit report");
  for (const [name, finding] of Object.entries(report.vulnerabilities)) {
    if (!record(finding) || finding.name !== name || !severities.includes(finding.severity)
      || !Array.isArray(finding.via) || finding.via.length === 0 || !Array.isArray(finding.nodes) || finding.nodes.length === 0
      || finding.via.some((via) => typeof via !== "string" && (!record(via) || !severities.includes(via.severity) || typeof via.url !== "string"))) {
      return invalid(`Invalid audit finding: ${name}`);
    }
    if (severities.indexOf(finding.severity) < severities.indexOf("moderate")) continue;
    blockers.push(`${name}: ${finding.severity}`);
  }
  return { ok: blockers.length === 0, blockers };
}

function main() {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  try {
    const audit = spawnSync("npm", ["audit", "--include=dev", "--audit-level=moderate", "--json"],
      { cwd: root, encoding: "utf8", timeout: 90000, maxBuffer: 16 * 1024 * 1024 });
    if (audit.error || audit.signal || ![0, 1].includes(audit.status)) throw new Error("npm audit did not produce a successful advisory response");
    // Preserve every finding, including below-threshold findings, in the build log.
    console.log(audit.stdout);
    const result = evaluateAudit({ report: JSON.parse(audit.stdout) });
    for (const item of result.blockers) console.error(item);
    if (!result.ok) process.exitCode = 1;
    else console.log("Dependency audit gate passed; no moderate-or-higher findings reported.");
  } catch (error) {
    console.error(`Dependency audit failed closed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
