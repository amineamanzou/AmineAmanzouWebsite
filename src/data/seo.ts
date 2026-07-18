import type { CollectionEntry } from "astro:content";
import type { ServiceDefinition } from "./services";
import type { Locale } from "./site";

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

  const pageUrl = absoluteUrl(path, site);
  const blogPath = article.data.locale === "fr" ? "/blog/" : "/en/blog/";
  const homePath = article.data.locale === "fr" ? "/" : "/en/";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${pageUrl}#blogposting`,
        headline: article.data.title,
        description: article.data.seoDescription ?? article.data.excerpt,
        datePublished: article.data.publishedAt,
        dateModified: article.data.modifiedAt ?? article.data.publishedAt,
        author,
        publisher: author,
        image: [absoluteUrl(image ?? "/images/amine-amanzou-profile.jpeg", site)],
        inLanguage: article.data.locale,
        mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
        ...(article.data.sourceUrl ? { discussionUrl: article.data.sourceUrl } : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: article.data.locale === "fr" ? "Accueil" : "Home", item: absoluteUrl(homePath, site) },
          { "@type": "ListItem", position: 2, name: "Blog", item: absoluteUrl(blogPath, site) },
          { "@type": "ListItem", position: 3, name: article.data.title, item: pageUrl },
        ],
      },
    ],
  };
}

export function serviceJsonLd({
  service,
  locale,
  site,
}: {
  service: ServiceDefinition;
  locale: Locale;
  site?: URL;
}): JsonLd {
  const copy = service.copy[locale];
  const pageUrl = absoluteUrl(copy.path, site);
  const homePath = locale === "fr" ? "/" : "/en/";
  const provider = {
    "@type": "Person",
    "@id": `${absoluteUrl(homePath, site)}#person`,
    name: "Amine Amanzou",
    url: absoluteUrl(homePath, site),
  };
  const serviceNode: Record<string, unknown> = {
    "@type": "Service",
    "@id": `${pageUrl}#service`,
    name: copy.eyebrow,
    description: copy.description,
    url: pageUrl,
    serviceType: copy.eyebrow,
    areaServed: "Worldwide",
    availableLanguage: ["fr", "en"],
    provider,
  };

  if (service.id === "diagnostic") {
    serviceNode.offers = {
      "@type": "Offer",
      price: "4500",
      priceCurrency: "EUR",
      url: pageUrl,
      availability: "https://schema.org/InStock",
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      serviceNode,
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: locale === "fr" ? "Accueil" : "Home", item: absoluteUrl(homePath, site) },
          { "@type": "ListItem", position: 2, name: copy.eyebrow, item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: copy.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };
}
