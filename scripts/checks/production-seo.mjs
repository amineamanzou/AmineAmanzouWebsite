import { spawnSync } from "node:child_process";
import process from "node:process";

const npmCli = process.env.npm_execpath;
const command = npmCli
  ? process.execPath
  : process.platform === "win32"
    ? "npm.cmd"
    : "npm";

function runNpmScript(script, env = process.env) {
  const args = npmCli ? [npmCli, "run", script] : ["run", script];
  const result = spawnSync(command, args, { env, stdio: "inherit" });

  if (result.error) {
    throw result.error;
  }

  if (result.signal) {
    console.error(`npm run ${script} terminated by signal ${result.signal}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

runNpmScript("build", {
  ...process.env,
  SITE_URL: "https://amineamanzou.fr",
  BASE_PATH: "/",
});
runNpmScript("check:seo");
