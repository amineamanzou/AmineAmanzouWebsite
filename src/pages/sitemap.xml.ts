import { getCollection, type CollectionEntry } from "astro:content";
import type { APIRoute } from "astro";
import { getArticlePath } from "../data/articles";
import { absoluteUrl } from "../data/seo";
import type { Locale } from "../data/site";

export const prerender = true;

type SitemapAlternate = {
  locale: Locale | "x-default";
  href: string;
};

type SitemapEntry = {
  path: string;
  priority: string;
  lastmod?: string;
  alternates: SitemapAlternate[];
};

const staticPagePairs = [
  { fr: "/", en: "/en/", priorityFr: "1.0", priorityEn: "0.9" },
  { fr: "/dossier/", en: "/en/dossier/", priorityFr: "0.8", priorityEn: "0.7" },
  { fr: "/contact/", en: "/en/contact/", priorityFr: "0.7", priorityEn: "0.6" },
  { fr: "/blog/", en: "/en/blog/", priorityFr: "0.8", priorityEn: "0.7" },
];

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const translatedArticleGroups = (articles: CollectionEntry<"articles">[]) => {
  const groups = new Map<string, Partial<Record<Locale, CollectionEntry<"articles">>>>();

  for (const article of articles) {
    const group = groups.get(article.data.translationKey) ?? {};
    group[article.data.locale] = article;
    groups.set(article.data.translationKey, group);
  }

  return groups;
};

const alternatesForPaths = (fr: string, en: string, site?: URL): SitemapAlternate[] => [
  { locale: "fr", href: absoluteUrl(fr, site) },
  { locale: "en", href: absoluteUrl(en, site) },
  { locale: "x-default", href: absoluteUrl(fr, site) },
];

export const GET: APIRoute = async ({ site }) => {
  const articles = await getCollection("articles");
  const articleGroups = translatedArticleGroups(articles);
  const entries: SitemapEntry[] = staticPagePairs.flatMap((pair) => {
    const alternates = alternatesForPaths(pair.fr, pair.en, site);

    return [
      { path: pair.fr, priority: pair.priorityFr, alternates },
      { path: pair.en, priority: pair.priorityEn, alternates },
    ];
  });

  for (const article of articles.sort((a, b) => getArticlePath(a).localeCompare(getArticlePath(b)))) {
    const translations = articleGroups.get(article.data.translationKey);
    const frPath = translations?.fr ? getArticlePath(translations.fr) : undefined;
    const enPath = translations?.en ? getArticlePath(translations.en) : undefined;
    const articleAlternates: SitemapAlternate[] =
      frPath && enPath
        ? alternatesForPaths(frPath, enPath, site)
        : [
            { locale: article.data.locale, href: absoluteUrl(getArticlePath(article), site) },
            { locale: "x-default", href: absoluteUrl(getArticlePath(article), site) },
          ];

    entries.push({
      path: getArticlePath(article),
      lastmod: article.data.modifiedAt ?? article.data.publishedAt,
      priority: "0.6",
      alternates: articleAlternates,
    });
  }

  const urls = entries
    .map((entry) => {
      const alternates = entry.alternates
        .map(
          (alternate) =>
            `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.locale)}" href="${escapeXml(alternate.href)}" />`,
        )
        .join("\n");

      return [
        "  <url>",
        `    <loc>${escapeXml(absoluteUrl(entry.path, site))}</loc>`,
        entry.lastmod ? `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : undefined,
        alternates,
        `    <priority>${entry.priority}</priority>`,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return new Response(
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
      urls,
      "</urlset>",
    ].join("\n"),
    {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    },
  );
};
