import { execFileSync } from "node:child_process";

// Inspect the Git index: ignore rules alone do not protect already tracked files.
const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);
const privateDirectory = /(^|\/)(docs|content|prototypes|\.superpowers|\.agents|\.codex|\.claude)(\/|$)/;
const forbidden = files.filter((file) =>
  file === "src/data/editorial-calendar.json" ||
  (privateDirectory.test(file) && !file.startsWith("src/content/")),
);
if (forbidden.length) {
  console.error("Private project material must not be tracked in the public repository:");
  console.error(forbidden.map((file) => `- ${file}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log("Public repository boundary check passed.");
}
