import type { CollectionEntry } from "astro:content";

const isoDatePattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

function parisCalendarDate(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function publicationDate(now = new Date()): string {
  const override = typeof process !== "undefined" ? process.env.PUBLICATION_DATE?.trim() : undefined;
  if (override) {
    if (!isoDatePattern.test(override)) {
      throw new Error(`PUBLICATION_DATE must use YYYY-MM-DD; received ${JSON.stringify(override)}`);
    }
    return override;
  }
  return parisCalendarDate(now);
}

export function isPublished(article: CollectionEntry<"articles">, cutoff = publicationDate()): boolean {
  return article.data.publishedAt <= cutoff;
}

export function publishedArticles(
  articles: CollectionEntry<"articles">[],
  cutoff = publicationDate(),
): CollectionEntry<"articles">[] {
  return articles.filter((article) => isPublished(article, cutoff));
}
