import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const articles = defineCollection({
  loader: glob({ base: "./src/content/articles", pattern: "**/*.md" }),
  schema: z.object({
    title: z.string(),
    locale: z.enum(["fr", "en"]),
    articleSlug: z.string(),
    translationKey: z.string(),
    publishedAt: z.string(),
    label: z.string(),
    readTime: z.string(),
    excerpt: z.string(),
    sourceUrl: z.url().optional(),
    heroImage: z.string().optional(),
  }),
});

export const collections = { articles };
