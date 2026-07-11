import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const modeArg = process.argv.find((argument) => argument.startsWith("--mode="));
const mode = modeArg?.split("=", 2)[1] ?? "off";
if (!new Set(["off", "on"]).has(mode)) throw new Error(`Unsupported product analytics check mode: ${mode}`);

const root = process.cwd();
const dist = path.join(root, "dist");

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(fullPath) : [fullPath];
  }))).flat();
}

const files = await filesUnder(dist);
const textFiles = files.filter((file) => /\.(?:html|js|css)$/.test(file));
const rows = await Promise.all(textFiles.map(async (file) => ({
  file: path.relative(dist, file),
  content: await readFile(file, "utf8"),
})));
const html = rows.filter((row) => row.file.endsWith(".html"));
const js = rows.filter((row) => row.file.endsWith(".js"));
const all = rows.map((row) => row.content).join("\n");
const applicationJs = js.filter((row) => !row.file.includes("module.no-external")).map((row) => row.content).join("\n");
const privacySource = await readFile(path.join(root, "src/components/PrivacyPage.astro"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

if (mode === "off") {
  for (const marker of ["data-analytics-consent", "eu.i.posthog.com", "phc_"]) {
    assert(!all.includes(marker), `Product analytics marker present in off build: ${marker}`);
  }
} else {
  assert(html.some((row) => row.content.includes("data-analytics-consent")), "Consent UI is missing from enabled build");
  assert(html.some((row) => row.content.includes("data-page-type=\"article\"")), "Article page type is missing");
  assert(html.some((row) => row.content.includes("data-page-type=\"home\"")), "Home page type is missing");
  assert(html.every((row) => !row.content.includes("module.no-external")), "PostHog SDK chunk is statically referenced by HTML");
  assert(js.some((row) => row.file.includes("module.no-external")), "Dynamic PostHog SDK chunk was not emitted");
  for (const required of [
    "autocapture:!1",
    "capture_pageview:!1",
    "disable_session_recording:!0",
    "person_profiles:`never`",
    "advanced_disable_flags:!0",
  ]) {
    assert(applicationJs.includes(required), `Hardened PostHog option missing from application bundle: ${required}`);
  }
  for (const forbidden of [
    "business.lead_created",
    "business.lead_qualified",
    "business.opportunity_proposed",
    "business.opportunity_declined",
    "business.meeting_booked",
    "business.engagement_won",
  ]) {
    assert(!all.includes(forbidden), `Browser bundle contains forbidden business event: ${forbidden}`);
  }
  for (const required of [
    "Un clic sur un lien email n’est jamais compté comme un lead ou un rendez-vous.",
    "A click on an email link is never counted as a lead or a meeting.",
    "ils ne prouvent pas qu’une campagne a causé une conversion.",
    "they do not prove that a campaign caused a conversion.",
    "ce plafond n’est pas encore vérifié comme une règle techniquement appliquée",
    "this limit has not yet been verified as a technically enforced rule",
    "admin@itart.studio",
  ]) {
    assert(privacySource.includes(required), `Product analytics governance notice is missing: ${required}`);
  }
}

console.log(JSON.stringify({ ok: true, mode, files: textFiles.length }, null, 2));
