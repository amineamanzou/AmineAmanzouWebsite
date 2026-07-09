import type { CollectionEntry } from "astro:content";

export const siteUrl = "https://amineamanzou.fr";

export type JsonLd = Record<string, unknown> | Array<Record<string, unknown>>;

export function absoluteUrl(path: string, site?: URL): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return new URL(path, site ?? siteUrl).toString();
}

export function canonical(path: string): string {
  return absoluteUrl(path);
}

export function articleJsonLd({
  article,
  path,
  image,
  site,
}: {
  article: CollectionEntry<"articles">;
  path: string;
  image?: string;
  site?: URL;
}): JsonLd {
  const author = {
    "@type": "Person",
    "@id": `${absoluteUrl("/", site)}#person`,
    name: "Amine Amanzou",
    url: absoluteUrl("/", site),
    sameAs: [
      "https://www.linkedin.com/in/amineamanzou/",
      "https://github.com/amineamanzou",
      "https://twitter.com/amineamanzou",
    ],
  };

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${absoluteUrl(path, site)}#blogposting`,
    headline: article.data.title,
    description: article.data.excerpt,
    datePublished: article.data.publishedAt,
    dateModified: article.data.modifiedAt ?? article.data.publishedAt,
    author,
    publisher: author,
    image: [absoluteUrl(image ?? "/images/amine-amanzou-profile.jpeg", site)],
    inLanguage: article.data.locale,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(path, site),
    },
    ...(article.data.sourceUrl ? { discussionUrl: article.data.sourceUrl } : {}),
  };
}
