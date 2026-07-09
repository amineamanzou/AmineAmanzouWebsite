import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import inventoryConfig from "../../src/data/indexable-routes.json" with { type: "json" };

const distDir = path.resolve(process.cwd(), "dist");
const siteUrl = "https://amineamanzou.fr";
const allowedHreflangs = new Set(["fr", "en", "x-default"]);
const allowedPageLanguages = new Set(["fr", "en"]);
const expectedStaticCount = inventoryConfig.expectedTotalCount - inventoryConfig.expectedArticleCount;
const expectedStaticUrls = new Set(
  inventoryConfig.staticPagePairs.flatMap(({ fr, en }) => [
    new URL(fr, siteUrl).href,
    new URL(en, siteUrl).href,
  ]),
);
const articleUrlPattern = /^https:\/\/amineamanzou\.fr\/(?:en\/)?blog\/[^/]+\/$/;
const verificationPath = "googlecd92c6ca003ea477.html";
const verificationContent = "google-site-verification: googlecd92c6ca003ea477.html\n";
const nonPageHtmlFiles = new Set([verificationPath]);
const failures = [];

function fail(message) {
  failures.push(message);
}

async function readDistFile(relativePath, missingMessage = `${relativePath} is missing`) {
  const filePath = path.join(distDir, relativePath);
  if (!existsSync(filePath)) {
    fail(missingMessage);
    return null;
  }

  return readFile(filePath, "utf8");
}

function decodeEntities(value) {
  const named = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

  return value.replace(
    /&(?:#(\d+)|#x([\da-f]+)|(amp|lt|gt|quot|apos));/gi,
    (entity, decimal, hexadecimal, name) => {
      if (decimal) return String.fromCodePoint(Number(decimal));
      if (hexadecimal) return String.fromCodePoint(Number.parseInt(hexadecimal, 16));
      return named[name.toLowerCase()] ?? entity;
    },
  );
}

function parseAttributes(source) {
  const attributes = {};
  const pattern = /([^\s=/>]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

  for (const match of source.matchAll(pattern)) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? "");
  }

  return attributes;
}

function parseXmlDocument(xml) {
  const document = { name: "#document", attributes: {}, children: [], text: "" };
  const stack = [document];
  const tokens = /<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<![^>]*>|<\/?[^>]+>/g;
  let cursor = 0;

  for (const match of xml.matchAll(tokens)) {
    stack.at(-1).text += decodeEntities(xml.slice(cursor, match.index));
    cursor = match.index + match[0].length;
    const token = match[0];

    if (token.startsWith("<?") || token.startsWith("<!")) continue;

    if (token.startsWith("</")) {
      const name = token.slice(2, -1).trim();
      const current = stack.at(-1);
      if (current === document || current.name !== name) {
        throw new Error(`unexpected closing tag </${name}>`);
      }
      stack.pop();
      continue;
    }

    const selfClosing = /\/\s*>$/.test(token);
    const body = token.slice(1, selfClosing ? token.lastIndexOf("/") : -1).trim();
    const nameMatch = body.match(/^([^\s/>]+)/);
    if (!nameMatch) throw new Error(`invalid tag ${token}`);

    const node = {
      name: nameMatch[1],
      attributes: parseAttributes(body.slice(nameMatch[0].length)),
      children: [],
      text: "",
    };
    stack.at(-1).children.push(node);
    if (!selfClosing) stack.push(node);
  }

  stack.at(-1).text += decodeEntities(xml.slice(cursor));
  if (stack.length !== 1) throw new Error(`unclosed tag <${stack.at(-1).name}>`);
  return document;
}

const localName = (name) => name.includes(":") ? name.slice(name.lastIndexOf(":") + 1) : name;
const getChild = (node, name) => node.children.find((child) => localName(child.name) === name);
const getChildren = (node, name) => node.children.filter((child) => localName(child.name) === name);

function parseSitemapEntries(xml) {
  if (xml === null) return [];

  let document;
  try {
    document = parseXmlDocument(xml);
  } catch (error) {
    fail(`sitemap.xml must be valid XML: ${error.message}`);
    return [];
  }

  const urlset = getChild(document, "urlset");
  if (!urlset) {
    fail("sitemap.xml must contain a urlset root element");
    return [];
  }

  return getChildren(urlset, "url").flatMap((urlNode, index) => {
    const loc = getChild(urlNode, "loc")?.text.trim();
    if (!loc) {
      fail(`sitemap.xml url entry ${index + 1} must contain loc`);
      return [];
    }

    return [{
      loc,
      lastmod: getChild(urlNode, "lastmod")?.text.trim(),
      alternates: getChildren(urlNode, "link")
        .filter((link) => link.attributes.rel?.toLowerCase() === "alternate")
        .map((link) => ({
          hreflang: link.attributes.hreflang,
          href: link.attributes.href,
        })),
    }];
  });
}

function getTagAttributes(html, tagName) {
  if (html === null) return [];

  const tags = [];
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>`, "gi");
  for (const match of html.matchAll(pattern)) tags.push(parseAttributes(match[1]));
  return tags;
}

function hasNoindex(html) {
  return getTagAttributes(html, "meta").some((attributes) =>
    attributes.name?.toLowerCase() === "robots" &&
    (attributes.content ?? "").toLowerCase().split(/[\s,]+/).includes("noindex"),
  );
}

function getCanonicalLinks(html) {
  return getTagAttributes(html, "link")
    .filter((attributes) => attributes.rel?.toLowerCase() === "canonical")
    .map((attributes) => attributes.href)
    .filter(Boolean);
}

function getAlternateLinks(html) {
  return getTagAttributes(html, "link")
    .filter((attributes) => attributes.rel?.toLowerCase() === "alternate")
    .map((attributes) => ({
      hreflang: attributes.hreflang,
      href: attributes.href,
    }));
}

function getHtmlLang(html, relativePath) {
  const htmlTags = getTagAttributes(html, "html");
  if (htmlTags.length !== 1) {
    fail(`${relativePath} must contain exactly one html element; found ${htmlTags.length}`);
    return null;
  }

  const language = htmlTags[0].lang?.toLowerCase();
  if (!language || !allowedPageLanguages.has(language)) {
    fail(`${relativePath} html lang must be one of fr or en; found ${JSON.stringify(htmlTags[0].lang)}`);
    return null;
  }

  return language;
}

function getMetaContent(html, attributeName, attributeValue) {
  const match = getTagAttributes(html, "meta").find(
    (attributes) => attributes[attributeName]?.toLowerCase() === attributeValue.toLowerCase(),
  );
  return match?.content;
}

function getJsonLdProperty(html, relativePath, expectedType, property) {
  const values = [];
  const visit = (value) => {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }

    const types = Array.isArray(value["@type"]) ? value["@type"] : [value["@type"]];
    if (types.includes(expectedType) && property in value) values.push(value[property]);
    if (Array.isArray(value["@graph"])) value["@graph"].forEach(visit);
  };

  for (const script of html.matchAll(
    /<script\s+[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      visit(JSON.parse(script[1].trim()));
    } catch (error) {
      fail(`${relativePath} has invalid application/ld+json: ${error.message}`);
    }
  }

  if (values.length !== 1) {
    fail(`${relativePath} must contain exactly one ${expectedType}.${property}; found ${values.length}`);
    return null;
  }

  return values[0];
}

function isStrictIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function assertStrictIsoDate(value, label) {
  if (!isStrictIsoDate(value)) {
    fail(`${label} must use a valid ISO YYYY-MM-DD date; found ${JSON.stringify(value)}`);
    return false;
  }

  return true;
}

function parseUrl(value, label) {
  try {
    return new URL(value);
  } catch {
    fail(`${label} must be an absolute URL; found ${JSON.stringify(value)}`);
    return null;
  }
}

function distPathForUrl(url, label) {
  if (url.origin !== siteUrl) {
    fail(`${label} must use ${siteUrl}; found ${url.origin}`);
    return null;
  }
  if (url.search || url.hash) {
    fail(`${label} must not contain a query string or fragment`);
    return null;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    fail(`${label} has an invalid encoded pathname: ${url.pathname}`);
    return null;
  }

  const relativePath = pathname.replace(/^\/+/, "");
  if (relativePath.split("/").includes("..")) {
    fail(`${label} must not traverse outside dist: ${url.pathname}`);
    return null;
  }

  if (pathname.endsWith("/")) return path.posix.join(relativePath, "index.html");
  return path.posix.extname(relativePath) ? relativePath : `${relativePath}.html`;
}

function normalizeAlternates(alternates, label) {
  const normalized = new Map();
  for (const alternate of alternates) {
    if (!alternate.hreflang || !alternate.href) {
      fail(`${label} alternate links must contain hreflang and href`);
      continue;
    }

    const language = alternate.hreflang.toLowerCase();
    if (!allowedHreflangs.has(language)) {
      fail(`${label} hreflang must be one of fr, en, x-default; found ${alternate.hreflang}`);
    }
    if (normalized.has(language)) fail(`${label} declares hreflang ${language} more than once`);
    normalized.set(language, alternate.href);
  }
  return normalized;
}

function assertMatchingAlternates(actual, expected, label) {
  const actualMap = normalizeAlternates(actual, label);
  const expectedMap = normalizeAlternates(expected, `${label} sitemap entry`);

  for (const [language, href] of expectedMap) {
    if (actualMap.get(language) !== href) fail(`${label} hreflang ${language} must link to ${href}`);
  }
  for (const [language, href] of actualMap) {
    if (!expectedMap.has(language)) fail(`${label} has unexpected hreflang ${language} linking to ${href}`);
  }
}

function assertRobotsDirective(content, userAgent, directive, value) {
  if (content === null) return;

  const groups = [];
  let group = null;
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.replace(/\s*#.*$/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const name = line.slice(0, separator).trim().toLowerCase();
    const entryValue = line.slice(separator + 1).trim();
    if (name === "user-agent") {
      if (group === null || group.directives.length > 0) {
        group = { userAgents: [], directives: [] };
        groups.push(group);
      }
      group.userAgents.push(entryValue.toLowerCase());
    } else if (group !== null) {
      group.directives.push({ name, value: entryValue });
    }
  }

  const present = groups
    .filter((candidate) => candidate.userAgents.includes(userAgent.toLowerCase()))
    .some((candidate) => candidate.directives.some(
      (entry) => entry.name === directive.toLowerCase() && entry.value === value,
    ));
  if (!present) fail(`robots.txt must set ${directive}: ${value} for ${userAgent}`);
}

async function listHtmlFiles(directory = distDir, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relativePath = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listHtmlFiles(path.join(directory, entry.name), relativePath)));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(relativePath);
    }
  }
  return files;
}

function urlForDistHtml(relativePath) {
  const pathname = relativePath === "index.html"
    ? "/"
    : relativePath.endsWith("/index.html")
      ? `/${relativePath.slice(0, -"index.html".length)}`
      : `/${relativePath}`;
  return new URL(pathname, siteUrl).href;
}

function assertStandardMeta(html, relativePath, pageUrl) {
  for (const name of ["description", "twitter:card", "twitter:title", "twitter:description", "twitter:image"]) {
    if (!getMetaContent(html, "name", name)) fail(`${relativePath} must contain meta ${name}`);
  }
  for (const property of ["og:title", "og:description", "og:url", "og:image"]) {
    if (!getMetaContent(html, "property", property)) fail(`${relativePath} must contain meta ${property}`);
  }
  if (getMetaContent(html, "property", "og:url") !== pageUrl) {
    fail(`${relativePath} og:url must match ${pageUrl}`);
  }
}

const [sitemap, robots, verification, layoutSource] = await Promise.all([
  readDistFile("sitemap.xml"),
  readDistFile("robots.txt"),
  readDistFile(verificationPath),
  readFile(path.resolve(process.cwd(), "src/layouts/BaseLayout.astro"), "utf8"),
]);

if (verification !== null && verification !== verificationContent) {
  fail(`${verificationPath} must contain the exact Search Console verification token plus newline`);
}
if (layoutSource.includes("navigator.language") || layoutSource.includes("navigator.languages")) {
  fail("BaseLayout must not redirect from navigator.language or navigator.languages");
}

if (robots !== null && !robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
  fail("robots.txt must contain the canonical sitemap directive");
}
for (const userAgent of [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Googlebot",
  "Google-Extended",
  "*",
]) {
  assertRobotsDirective(robots, userAgent, "Allow", "/");
}
for (const userAgent of ["GPTBot", "ClaudeBot"]) {
  assertRobotsDirective(robots, userAgent, "Disallow", "/");
}

const entries = parseSitemapEntries(sitemap);
const inventory = new Map();
const pageDetails = new Map();

for (const entry of entries) {
  const url = parseUrl(entry.loc, "sitemap.xml loc");
  if (!url) continue;
  const relativePath = distPathForUrl(url, `sitemap.xml loc ${entry.loc}`);
  if (!relativePath) continue;
  if (inventory.has(url.href)) {
    fail(`sitemap.xml must list ${url.href} only once`);
    continue;
  }
  inventory.set(url.href, entry);

  const html = await readDistFile(relativePath, `sitemap URL ${url.href} has no HTML at ${relativePath}`);
  if (html === null) continue;
  if (hasNoindex(html)) fail(`${relativePath} is noindex but appears in sitemap.xml`);

  const canonicals = getCanonicalLinks(html);
  if (canonicals.length !== 1) {
    fail(`${relativePath} must contain exactly one canonical; found ${canonicals.length}`);
  } else if (canonicals[0] !== url.href) {
    fail(`${relativePath} must self-canonicalize to ${url.href}; found ${canonicals[0]}`);
  }

  assertStandardMeta(html, relativePath, url.href);
  assertMatchingAlternates(getAlternateLinks(html), entry.alternates, relativePath);
  pageDetails.set(url.href, { relativePath, htmlLang: getHtmlLang(html, relativePath) });

  if (/\/(?:en\/)?blog\/[^/]+\/$/.test(url.pathname)) {
    const metaPublished = getMetaContent(html, "property", "article:published_time");
    const metaModified = getMetaContent(html, "property", "article:modified_time");
    const jsonLdPublished = getJsonLdProperty(html, relativePath, "BlogPosting", "datePublished");
    const jsonLdModified = getJsonLdProperty(html, relativePath, "BlogPosting", "dateModified");
    const publishedIsValid = assertStrictIsoDate(
      metaPublished,
      `${relativePath} article:published_time`,
    );
    const modifiedIsValid = assertStrictIsoDate(
      metaModified,
      `${relativePath} article:modified_time`,
    );
    assertStrictIsoDate(jsonLdPublished, `${relativePath} BlogPosting.datePublished`);
    assertStrictIsoDate(jsonLdModified, `${relativePath} BlogPosting.dateModified`);
    const lastmodIsValid = assertStrictIsoDate(entry.lastmod, `sitemap.xml article ${url.href} lastmod`);

    if (metaPublished !== jsonLdPublished) {
      fail(`${relativePath} article:published_time must match BlogPosting.datePublished`);
    }
    if (lastmodIsValid) {
      if (metaModified !== entry.lastmod) {
        fail(`${relativePath} article:modified_time must match sitemap lastmod ${entry.lastmod}`);
      }
      if (jsonLdModified !== entry.lastmod) {
        fail(`${relativePath} BlogPosting.dateModified must match sitemap lastmod ${entry.lastmod}`);
      }
    }
    if (publishedIsValid && modifiedIsValid && metaModified < metaPublished) {
      fail(`${relativePath} modified date ${metaModified} must not precede published date ${metaPublished}`);
    }
  }
}

const inventoryUrls = [...inventory.keys()];
const actualStaticUrls = inventoryUrls.filter((url) => expectedStaticUrls.has(url));
const actualArticleUrls = inventoryUrls.filter((url) => articleUrlPattern.test(url));
const missingStaticUrls = [...expectedStaticUrls].filter((url) => !inventory.has(url));
const unexpectedUrls = inventoryUrls.filter(
  (url) => !expectedStaticUrls.has(url) && !articleUrlPattern.test(url),
);

if (expectedStaticUrls.size !== expectedStaticCount) {
  fail(
    `SEO inventory configuration is inconsistent: expected ${expectedStaticCount} static URLs but staticPagePairs defines ${expectedStaticUrls.size}`,
  );
}
if (
  inventory.size !== inventoryConfig.expectedTotalCount ||
  actualStaticUrls.length !== expectedStaticCount ||
  actualArticleUrls.length !== inventoryConfig.expectedArticleCount ||
  missingStaticUrls.length > 0 ||
  unexpectedUrls.length > 0
) {
  fail(
    `SEO inventory mismatch: expected ${inventoryConfig.expectedTotalCount} URLs (${expectedStaticCount} static + ${inventoryConfig.expectedArticleCount} articles), found ${inventory.size} (${actualStaticUrls.length} static + ${actualArticleUrls.length} articles${unexpectedUrls.length > 0 ? ` + ${unexpectedUrls.length} unexpected` : ""})`,
  );
  if (missingStaticUrls.length > 0) fail(`Missing static sitemap URLs: ${missingStaticUrls.join(", ")}`);
  if (unexpectedUrls.length > 0) fail(`Unexpected sitemap URLs: ${unexpectedUrls.join(", ")}`);
}

for (const [sourceUrl, entry] of inventory) {
  const alternates = normalizeAlternates(entry.alternates, `sitemap.xml entry ${sourceUrl}`);
  const page = pageDetails.get(sourceUrl);

  for (const requiredLanguage of allowedHreflangs) {
    if (!alternates.has(requiredLanguage)) {
      fail(`sitemap.xml entry ${sourceUrl} must declare hreflang ${requiredLanguage}`);
    }
  }
  if (alternates.get("x-default") !== alternates.get("fr")) {
    fail(`sitemap.xml entry ${sourceUrl} x-default must target its French URL ${alternates.get("fr")}`);
  }
  if (page?.htmlLang && alternates.get(page.htmlLang) !== sourceUrl) {
    fail(
      `sitemap.xml entry ${sourceUrl} must self-reference with hreflang ${page.htmlLang}; found ${alternates.get(page.htmlLang)}`,
    );
  }

  for (const [language, targetUrl] of alternates) {
    if (language === "x-default") continue;
    const target = inventory.get(targetUrl);
    if (!target) {
      fail(`sitemap.xml hreflang ${language} for ${sourceUrl} targets unlisted URL ${targetUrl}`);
      continue;
    }
    const targetPage = pageDetails.get(targetUrl);
    if (targetPage?.htmlLang !== language) {
      fail(
        `sitemap.xml hreflang ${language} for ${sourceUrl} targets ${targetUrl} with html lang ${JSON.stringify(targetPage?.htmlLang)}`,
      );
    }
    const reciprocal = normalizeAlternates(target.alternates, `sitemap.xml entry ${targetUrl}`);
    if (![...reciprocal.values()].includes(sourceUrl)) {
      fail(`sitemap.xml hreflang between ${sourceUrl} and ${targetUrl} is not reciprocal`);
    }
  }
}

for (const relativePath of await listHtmlFiles()) {
  if (nonPageHtmlFiles.has(relativePath)) continue;
  const html = await readFile(path.join(distDir, relativePath), "utf8");
  const outputUrl = urlForDistHtml(relativePath);
  if (hasNoindex(html) && inventory.has(outputUrl)) {
    fail(`noindex output ${relativePath} must not appear in sitemap.xml`);
  } else if (!hasNoindex(html) && !inventory.has(outputUrl)) {
    fail(`indexable output ${relativePath} must appear in sitemap.xml as ${outputUrl}`);
  }
}

if (failures.length > 0) {
  console.error(`SEO output check failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(
  `SEO output check passed for ${inventory.size} indexable URLs (${actualStaticUrls.length} static + ${actualArticleUrls.length} articles).`,
);
