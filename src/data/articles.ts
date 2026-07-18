import type { CollectionEntry } from "astro:content";
import type { Locale } from "./site";
import { isPublished } from "./publication";

export type ArticleCard = {
  slug: string;
  label: string;
  title: string;
  publishedAt: string;
  date: string;
  readTime: string;
  excerpt: string;
  href: string;
  heroImage?: string;
  heroImageAlt: string;
  pillar: CollectionEntry<"articles">["data"]["pillar"];
  intent: CollectionEntry<"articles">["data"]["intent"];
};

export const formatArticleDate = (isoDate: string, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${isoDate}T00:00:00`));

export const getArticlePath = (article: CollectionEntry<"articles">) =>
  article.data.locale === "fr"
    ? `/blog/${article.data.articleSlug}/`
    : `/en/blog/${article.data.articleSlug}/`;

export const getArticleCards = (
  articles: CollectionEntry<"articles">[],
  locale: Locale,
): ArticleCard[] =>
  articles
    .filter((article) => article.data.locale === locale && isPublished(article))
    .sort((a, b) => b.data.publishedAt.localeCompare(a.data.publishedAt))
    .map((article) => ({
      slug: article.data.articleSlug,
      label: article.data.label,
      title: article.data.title,
      publishedAt: article.data.publishedAt,
      date: formatArticleDate(article.data.publishedAt, locale),
      readTime: article.data.readTime,
      excerpt: article.data.excerpt,
      href: getArticlePath(article),
      heroImage: article.data.heroImage,
      heroImageAlt: article.data.heroImageAlt,
      pillar: article.data.pillar,
      intent: article.data.intent,
    }));
