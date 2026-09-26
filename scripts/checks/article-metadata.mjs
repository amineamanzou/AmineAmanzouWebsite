import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const decode = (value) => value.replace(/&(?:amp|lt|gt|quot|apos|#39|#x27);/g, (entity) => ({
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&apos;": "'", "&#39;": "'", "&#x27;": "'",
})[entity]);
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "gi"))].map((match) =>
  Object.fromEntries([...match[1].matchAll(/([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
    .map((attribute) => [attribute[1], decode(attribute[2] ?? attribute[3])])),
);
const text = (html) => {
  let previous;
  do {
    previous = html;
    html = html.replace(/<[^>]*>/g, "");
  } while (html !== previous);
  return decode(html).trim();
};
const flatten = (node) => Array.isArray(node) ? node.flatMap(flatten) : node?.["@graph"] ? node["@graph"].flatMap(flatten) : [node];
const dist = path.resolve("dist");
const articles = (await readdir(dist, { recursive: true })).filter((file) => /^(?:en\/)?blog\/[^/]+\/index\.html$/.test(file));
const titles = new Set();
const descriptions = new Set();
assert.ok(articles.length, "The SEO check must exercise generated articles");
for (const file of articles) {
  const html = await readFile(path.join(dist, file), "utf8");
  const check = (condition, message) => assert.ok(condition, `${file}: ${message}`);
  const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)];
  check(headings.length === 1, "exactly one H1 is required");
  const title = text(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  check(title && !titles.has(title), "page title must be nonempty and unique");
  titles.add(title);
  const metas = tags(html, "meta");
  const description = metas.find((tag) => tag.name === "description")?.content;
  check(description?.trim() && !descriptions.has(description), "meta description must be nonempty and unique");
  descriptions.add(description);
  const nodes = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap((match) => flatten(JSON.parse(match[1])));
  const postings = nodes.filter((node) => node?.["@type"] === "BlogPosting");
  check(postings.length === 1, "exactly one BlogPosting is required");
  const posting = postings[0];
  const canonical = tags(html, "link").find((tag) => tag.rel === "canonical")?.href;
  check(posting.headline === text(headings[0][1]), "structured headline must match the visible H1");
  check(posting.description === description, "structured description must match the meta description");
  check(posting.inLanguage === tags(html, "html")[0]?.lang, "structured language must match the page language");
  const author = Array.isArray(posting.author) ? posting.author[0] : posting.author;
  check(author?.name === "Amine Amanzou" && /^https:\/\//.test(author.url ?? ""), "author must have a name and absolute profile URL");
  check(/<a\b[^>]*\brel=["']author["'][^>]*>\s*Amine Amanzou\s*<\/a>/.test(html), "a visible linked author byline is required");
  const times = tags(html, "time").map((tag) => tag.datetime);
  check(times.includes(posting.datePublished), "publication date must appear in a visible time element");
  check(times.includes(posting.dateModified), "modified date must appear in a visible time element");
  const pageId = typeof posting.mainEntityOfPage === "string" ? posting.mainEntityOfPage : posting.mainEntityOfPage?.["@id"];
  check(pageId?.split("#")[0] === canonical, "structured article must identify its canonical page");
  check(Array.isArray(posting.image) && posting.image.length > 0 && posting.image.every((image) => /^https:\/\//.test(image)), "structured images must use absolute URLs");
  check(metas.find((tag) => tag.property === "og:image:alt")?.content?.trim(), "social image alternative text is required");
}
console.log(`Article metadata check passed for ${articles.length} pages.`);
