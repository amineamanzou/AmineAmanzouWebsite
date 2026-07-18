import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const dist = join(root, "dist");

const requiredFiles = [
  "index.html",
  "dossier/index.html",
  "cv/index.html",
  "contact/index.html",
  "privacy/index.html",
  "audit-observabilite/index.html",
  "consultant-opentelemetry/index.html",
  "fractional-observability-lead/index.html",
  "en/index.html",
  "en/dossier/index.html",
  "en/contact/index.html",
  "en/privacy/index.html",
  "en/observability-audit/index.html",
  "en/opentelemetry-consulting/index.html",
  "en/fractional-observability-lead/index.html",
  "blog/index.html",
  "blog/opamp-fleet-management-governance/index.html",
  "blog/opamp-fleet-management-agents/index.html",
  "blog/opamp-fleet-management-control-plane/index.html",
  "en/blog/index.html",
  "en/blog/opamp-fleet-management-governance/index.html",
  "en/blog/opamp-fleet-management-control-plane/index.html",
  "articles/index.html",
  "robots.txt",
  "sitemap.xml",
  "downloads/amine-amanzou-dossier-competence-fr.pdf",
  "downloads/amine-amanzou-resume-en.pdf",
  "images/amine-amanzou-profile.jpeg",
];

const requiredHomeText = [
  "Consultant Observabilité",
  "Enedis",
  "Odigo",
  "Ylio",
  "Orange",
  "Réserver un échange de cadrage",
  "OpenTelemetry &amp; Reliability Sprint",
  "Agentic SRE",
  "Télécharger le dossier de compétence",
];

const requiredDossierText = [
  "Dossier de compétence freelance",
  "Missions et expériences",
  "Expert Observabilité",
  "Lead SRE Data",
  "Formation et certifications",
];

const requiredContactText = [
  "amineamanzou@gmail.com",
  "LinkedIn",
  "GitHub",
  "Adresse email cliquable",
];

const requiredEnglishText = [
  "Observability Consultant",
  "Download the capability statement",
  "Missions and experience",
  "Clickable email address",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function html(path) {
  return readFileSync(join(dist, path), "utf8");
}

function articleSourceCount(locale) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const cutoff = process.env.PUBLICATION_DATE?.trim() || `${values.year}-${values.month}-${values.day}`;
  return readdirSync(join(root, "src/content/articles"))
    .filter((file) => file.endsWith(".md"))
    .filter((file) => {
      const source = readFileSync(join(root, "src/content/articles", file), "utf8");
      const date = source.match(/^publishedAt:\s*["'](\d{4}-\d{2}-\d{2})["']\s*$/m)?.[1];
      return source.includes(`locale: "${locale}"`) && date && date <= cutoff;
    })
    .length;
}

function articleCardCount(page) {
  return (page.match(/class="article-card"/g) ?? []).length;
}

for (const file of requiredFiles) {
  assert(existsSync(join(dist, file)), `Missing dist artifact: ${file}`);
}

const home = html("index.html");
const dossier = html("dossier/index.html");
const legacyCv = html("cv/index.html");
const contact = html("contact/index.html");
const homeEn = html("en/index.html");
const dossierEn = html("en/dossier/index.html");
const contactEn = html("en/contact/index.html");
const privacy = html("privacy/index.html");
const privacyEn = html("en/privacy/index.html");
const blog = html("blog/index.html");
const blogArticle = html("blog/opamp-fleet-management-governance/index.html");
const controlPlaneArticle = html("blog/opamp-fleet-management-control-plane/index.html");
const controlPlaneArticleEn = html("en/blog/opamp-fleet-management-control-plane/index.html");
const blogEn = html("en/blog/index.html");
const articles = html("articles/index.html");
const robots = html("robots.txt");
const sitemap = html("sitemap.xml");
const diagnostic = html("audit-observabilite/index.html");
const otelSprint = html("consultant-opentelemetry/index.html");
const fractionalLead = html("fractional-observability-lead/index.html");

for (const text of requiredHomeText) {
  assert(home.includes(text), `Home missing expected text: ${text}`);
}

for (const text of requiredDossierText) {
  assert(dossier.includes(text), `Dossier missing expected text: ${text}`);
}

for (const text of requiredContactText) {
  assert(contact.includes(text), `Contact missing expected text: ${text}`);
}

for (const text of requiredEnglishText) {
  assert(
    homeEn.includes(text) || dossierEn.includes(text) || contactEn.includes(text),
    `English pages missing expected text: ${text}`,
  );
}

assert(legacyCv.includes("url=/dossier/"), "Legacy CV route missing dossier redirect");
assert(blog.includes("Observabilité, SRE et Fleet Management"), "Blog index missing heading");
assert(blog.includes("Qui utilise vraiment OpAMP"), "Blog index missing imported articles");
assert(blogArticle.includes("Quand un client dit"), "Blog article route missing rendered article");
assert(controlPlaneArticle.includes("Le control plane OpenTelemetry"), "French control-plane article is missing");
assert(controlPlaneArticleEn.includes("The OpenTelemetry control plane"), "English control-plane article is missing");
assert(controlPlaneArticle.includes("amine-amanzou-bnmee"), "French control-plane LinkedIn source is missing");
assert(controlPlaneArticleEn.includes("amine-amanzou-axfce"), "English control-plane LinkedIn source is missing");
assert(blogEn.includes("Observability, SRE and Fleet Management"), "English blog index missing heading");
assert(articles.includes("url=/blog/"), "Legacy articles route missing blog redirect");
assert(privacy.includes("Confidentialité et mesure de performance"), "French privacy notice missing");
assert(privacy.includes("__rum_sid"), "French privacy notice missing RUM cookie disclosure");
assert(privacyEn.includes("Privacy and performance measurement"), "English privacy notice missing");
assert(home.includes('rel="canonical" href="https://amineamanzou.fr/"'), "Home missing canonical URL");
assert(home.includes('hreflang="fr" href="https://amineamanzou.fr/"'), "Home missing FR hreflang");
assert(home.includes('hreflang="en" href="https://amineamanzou.fr/en/"'), "Home missing EN hreflang");
assert(home.includes('hreflang="x-default" href="https://amineamanzou.fr/"'), "Home missing x-default hreflang");
assert(home.includes("theme-toggle"), "Home missing theme toggle");
assert(!home.includes("topbar-cta"), "Home should not render the legacy topbar CTA");
assert(
  articleCardCount(home) === Math.min(3, articleSourceCount("fr")),
  "Home should render three French pillar article cards",
);
assert(
  articleCardCount(homeEn) === Math.min(3, articleSourceCount("en")),
  "English home should render three English pillar article cards",
);
assert(diagnostic.includes("À partir de 4 500 € HT"), "Diagnostic page missing public price");
assert(diagnostic.includes('"@type":"Offer","price":"4500"'), "Diagnostic page missing structured Offer");
assert(diagnostic.includes('"@type":"FAQPage"'), "Diagnostic page missing FAQ structured data");
assert(otelSprint.includes("Faire passer OpenTelemetry du POC au chemin critique"), "OTel sprint page missing H1");
assert(fractionalLead.includes("2 à 8 jours / mois"), "Fractional page missing cadence");
for (const [name, page] of [["diagnostic", diagnostic], ["otel sprint", otelSprint], ["fractional lead", fractionalLead]]) {
  assert(page.includes("https://calendar.google.com/calendar/appointments/schedules/"), `${name} page missing public booking destination`);
}
assert(blogArticle.includes('property="og:type" content="article"'), "Article missing OG article type");
assert(blogArticle.includes('property="article:published_time"'), "Article missing published time metadata");
assert(robots.includes("Sitemap: https://amineamanzou.fr/sitemap.xml"), "Robots missing sitemap");
assert(sitemap.includes("<loc>https://amineamanzou.fr/</loc>"), "Sitemap missing home URL");
assert(
  sitemap.includes("<loc>https://amineamanzou.fr/blog/opamp-fleet-management-governance/</loc>"),
  "Sitemap missing article URL",
);

console.log("Static site review passed");
