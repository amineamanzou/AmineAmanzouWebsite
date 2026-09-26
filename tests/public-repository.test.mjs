import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const checker = fileURLToPath(new URL("../scripts/checks/public-repository.mjs", import.meta.url));
function fixture(t, files) {
  const root = mkdtempSync(path.join(tmpdir(), "public-boundary-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  execFileSync("git", ["init", "--quiet", root]);
  for (const file of files) {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), "fixture\n");
  }
  writeFileSync(path.join(root, ".gitignore"), "docs/\n");
  execFileSync("git", ["add", "--force", "."], { cwd: root });
  return root;
}
test("rejects force-added private documents and planning outside docs", (t) => {
  const files = ["docs/superpowers/plans/plan.md", "content/batch.json", ".agents/session.md", "src/data/editorial-calendar.json"];
  const root = fixture(t, files);
  const result = spawnSync(process.execPath, [checker], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 1);
  for (const file of files) assert.ok(result.stderr.includes(file));
});
test("allows site articles and contributor rules after private files are untracked", (t) => {
  const root = fixture(t, ["AGENTS.md", "src/content/articles/example.md", "docs/private.md"]);
  execFileSync("git", ["rm", "--cached", "docs/private.md"], { cwd: root });
  const result = spawnSync(process.execPath, [checker], { cwd: root, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
});
