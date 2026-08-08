import { spawnSync } from "node:child_process";

const packageName = "@opentelemetry/core";
const minimumVersion = [2, 8, 0];

function parseStableVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version ?? "");
  if (!match) return null;
  return match.slice(1).map(Number);
}

function isBelowMinimum(version) {
  const parsed = parseStableVersion(version);
  if (!parsed) return true;

  for (let index = 0; index < minimumVersion.length; index += 1) {
    if (parsed[index] !== minimumVersion[index]) {
      return parsed[index] < minimumVersion[index];
    }
  }
  return false;
}

const result = spawnSync(
  process.platform === "win32" ? "npm.cmd" : "npm",
  ["ls", packageName, "--all", "--json"],
  { encoding: "utf8" },
);

if (result.error) throw result.error;
if (!result.stdout.trim()) {
  throw new Error(`npm ls returned no dependency tree: ${result.stderr.trim()}`);
}

let tree;
try {
  tree = JSON.parse(result.stdout);
} catch (error) {
  throw new Error(`npm ls returned invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
}

const resolvedVersions = [];

function visitDependencies(node, path = []) {
  for (const [name, dependency] of Object.entries(node?.dependencies ?? {})) {
    const dependencyPath = [...path, `${name}@${dependency.version ?? "unknown"}`];
    if (name === packageName) {
      resolvedVersions.push({ version: dependency.version, path: dependencyPath.join(" > ") });
    }
    visitDependencies(dependency, dependencyPath);
  }
}

visitDependencies(tree, [`${tree.name ?? "root"}@${tree.version ?? "unknown"}`]);

if (resolvedVersions.length === 0) {
  throw new Error(`${packageName} is not installed`);
}

const vulnerable = resolvedVersions.filter(({ version }) => isBelowMinimum(version));
if (vulnerable.length > 0) {
  const details = vulnerable.map(({ version, path }) => `- ${version ?? "unknown"}: ${path}`).join("\n");
  throw new Error(
    `${packageName} must resolve to stable versions >= ${minimumVersion.join(".")}; found ${vulnerable.length} vulnerable or unsupported resolution(s):\n${details}`,
  );
}

const versions = [...new Set(resolvedVersions.map(({ version }) => version))].sort();
console.log(`${packageName} version policy passed: ${versions.join(", ")}`);
