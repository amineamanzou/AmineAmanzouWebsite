import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const siteData = readFileSync(join(root, "src/data/site.ts"), "utf8");
const dossierPage = readFileSync(join(root, "src/components/DossierPage.astro"), "utf8");
const experiencesFr = siteData.slice(siteData.indexOf("export const experiences:"), siteData.indexOf("export const experiencesEn:"));
const experiencesEn = siteData.slice(siteData.indexOf("export const experiencesEn:"), siteData.indexOf("export const education:"));

execFileSync("npm", ["run", "build"], { cwd: root, stdio: "inherit" });

const renderedHomeFr = readFileSync(join(root, "dist/index.html"), "utf8");
const renderedHomeEn = readFileSync(join(root, "dist/en/index.html"), "utf8");
const renderedDossierFr = readFileSync(join(root, "dist/dossier/index.html"), "utf8");
const renderedDossierEn = readFileSync(join(root, "dist/en/dossier/index.html"), "utf8");

for (const pdf of [
  "public/downloads/AmineAmanzouCVFR092026.pdf",
  "public/downloads/AmineAmanzouCVEN092026.pdf",
]) {
  assert(existsSync(join(root, pdf)), `Missing current CV: ${pdf}`);
}

for (const expected of [
  "Consultant Observabilité & Agentic SRE",
  "Observability & Agentic SRE Consultant",
  'company: "KeyIA"',
  "une banque de financement et d’investissement",
  "a corporate and investment bank",
  "routage des logs via Kafka, gestion des traces et des métriques",
  "routed logs through Kafka and managed traces and metrics",
  "appel d’offres de 15 M€",
  "€15M tender",
  "Log as a Service",
  "Fluent Bit",
  "Data Prepper",
  "matrice de maturité",
  "observability maturity matrix",
  "LangChain",
  "Deep Agents",
  "HyperShift",
  "OTCA - OpenTelemetry Certified Associate Course",
  "De la télémétrie au diagnostic.",
  "From telemetry to diagnosis.",
  "Architecture de pipelines OpenTelemetry et développement d’un agent SRE",
  "OpenTelemetry pipeline architecture and SRE investigation agent development",
  "Évaluation et choix de plateforme",
  "Platform evaluation and selection",
  "Instrumentation et pipelines",
  "Instrumentation and pipelines",
  "Agentic SRE et investigation",
  "Agentic SRE and investigation",
]) {
  assert(siteData.includes(expected), `Site data missing current CV content: ${expected}`);
}

assert(!siteData.includes('company: "Ylio"'), "Ylio must not appear in current CV experience data");
assert(experiencesFr.includes('company: "KeyIA",\n    location: "Paris, France"'), "French KeyIA experience must use Paris, France");
assert(experiencesEn.includes('company: "KeyIA",\n    location: "Paris, France"'), "English KeyIA experience must use Paris, France");
assert(renderedHomeFr.includes("Mai 2026 - Aujourd&#39;hui · Paris, France"), "French home must render the KeyIA location");
assert(renderedDossierFr.includes("Mai 2026 - Aujourd&#39;hui · Paris, France"), "French dossier must render the KeyIA location");
assert(renderedHomeEn.includes("May 2026 - Present · Paris, France"), "English home must render the KeyIA location");
assert(renderedDossierEn.includes("May 2026 - Present · Paris, France"), "English dossier must render the KeyIA location");
assert(dossierPage.includes("experience.environment"), "Dossier must display technical environments");
assert(dossierPage.includes("pageSkills"), "Dossier must display the localized CV skills");
assert(dossierPage.includes("pageLanguages"), "Dossier must display the localized CV languages");
assert(dossierPage.includes("copy.dossier.domains.map"), "Dossier must display the three localized intervention domains");
assert(dossierPage.indexOf('id="domains-title"') < dossierPage.indexOf('id="experience-title"'), "Intervention domains must precede experience");
const homePage = readFileSync(join(root, "src/components/HomePage.astro"), "utf8");
assert(homePage.includes("Investigation d’incidents par agents SRE"), "Home must lead with incident investigation");
assert(homePage.includes("Incident investigation with SRE agents"), "English home must use the same positioning");
assert(!homePage.includes("Réduire le temps de résolution du support sans rendre l’agent invisible"), "Remove the old support-first agentic positioning");

console.log("CV and capability statement are synchronized.");
