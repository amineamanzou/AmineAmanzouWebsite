import { getCollection } from "astro:content";
import type { APIRoute } from "astro";
import { getArticlePath } from "../data/articles";

const staticPages = [
  { path: "/", priority: "1.0" },
  { path: "/dossier/", priority: "0.8" },
  { path: "/contact/", priority: "0.7" },
  { path: "/blog/", priority: "0.8" },
  { path: "/en/", priority: "0.9" },
  { path: "/en/dossier/", priority: "0.7" },
  { path: "/en/contact/", priority: "0.6" },
  { path: "/en/blog/", priority: "0.7" },
];

type SitemapUrl = {
  loc: string;
  priority: string;
  lastmod?: string;
};

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ?? new URL("https://amineamanzou.fr");
  const articles = await getCollection("articles");
  const urls: SitemapUrl[] = [
    ...staticPages.map((page) => ({
      loc: new URL(page.path, baseUrl).toString(),
      priority: page.priority,
    })),
    ...articles.map((article) => ({
      loc: new URL(getArticlePath(article), baseUrl).toString(),
      lastmod: article.data.publishedAt,
      priority: "0.6",
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ""}
    <priority>${url.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
