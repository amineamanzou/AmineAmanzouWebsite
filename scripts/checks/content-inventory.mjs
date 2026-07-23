import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const articlesDirectory = path.resolve(process.cwd(), "src/content/articles");
const calendarPath = path.resolve(process.cwd(), "src/data/editorial-calendar.json");
const files = (await readdir(articlesDirectory, { recursive: true })).filter((file) => file.endsWith(".md"));
const knownOffers = new Set(["diagnostic", "otel_sprint", "fractional_lead"]);
const failures = [];
const calendar = JSON.parse(await readFile(calendarPath, "utf8"));

function field(frontmatter, name) {
  const match = frontmatter.match(new RegExp(`^${name}:\\s*(?:"([^"\\n]*)"|'([^'\\n]*)'|([^\\n#]+))\\s*$`, "m"));
  return (match?.[1] ?? match?.[2] ?? match?.[3])?.trim();
}

const articles = [];
for (const file of files) {
  const source = await readFile(path.join(articlesDirectory, file), "utf8");
  const frontmatter = source.match(/^---\n([\s\S]*?)\n---/)?.[1];
  if (!frontmatter) {
    failures.push(`${file}: frontmatter missing`);
    continue;
  }
  const article = {
    file,
    locale: field(frontmatter, "locale"),
    slug: field(frontmatter, "articleSlug"),
    translationKey: field(frontmatter, "translationKey"),
    heroImage: field(frontmatter, "heroImage"),
    heroImageAlt: field(frontmatter, "heroImageAlt"),
    relatedOffer: field(frontmatter, "relatedOffer"),
  };
  if (article.heroImage && !article.heroImageAlt) failures.push(`${file}: heroImage requires heroImageAlt`);
  if (!knownOffers.has(article.relatedOffer)) failures.push(`${file}: unknown relatedOffer ${JSON.stringify(article.relatedOffer)}`);
  articles.push(article);
}

const routeKeys = new Map();
for (const article of articles) {
  const key = `${article.locale}:${article.slug}`;
  if (routeKeys.has(key)) failures.push(`${article.file}: duplicate article route with ${routeKeys.get(key)}`);
  else routeKeys.set(key, article.file);
}

const translations = Map.groupBy(articles, (article) => article.translationKey);
for (const [key, entries] of translations) {
  const locales = entries.map((entry) => entry.locale).sort().join(",");
  if (entries.length !== 2 || locales !== "en,fr") failures.push(`translationKey ${key} must have one fr and one en article; found ${locales || "none"}`);
}

if (calendar.topics.length !== 30) failures.push(`editorial calendar must contain 30 topics; found ${calendar.topics.length}`);
for (const [index, topic] of calendar.topics.entries()) {
  if (topic.id !== index + 1) failures.push(`editorial calendar topic at index ${index} must have id ${index + 1}`);
  if (new Date(`${topic.frDate}T00:00:00Z`).getUTCDay() !== 2) failures.push(`topic ${topic.id}: frDate must be a Tuesday`);
  if (new Date(`${topic.enDate}T00:00:00Z`).getUTCDay() !== 4) failures.push(`topic ${topic.id}: enDate must be a Thursday`);
  if (!knownOffers.has(topic.relatedOffer)) failures.push(`topic ${topic.id}: unknown relatedOffer ${topic.relatedOffer}`);
  if (!topic.artifact?.trim()) failures.push(`topic ${topic.id}: artifact is required`);
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, articles: articles.length, translationPairs: translations.size, calendarTopics: calendar.topics.length }, null, 2));
}
