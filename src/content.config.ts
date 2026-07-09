import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, "Date must use the ISO YYYY-MM-DD format")
  .refine(
    (value) => {
      const parsed = new Date(`${value}T00:00:00Z`);
      return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
    },
    "Date must be a valid calendar date",
  );

const articleSchema = z
  .object({
    title: z.string(),
    locale: z.enum(["fr", "en"]),
    articleSlug: z.string(),
    translationKey: z.string(),
    publishedAt: isoDate,
    modifiedAt: isoDate.optional(),
    label: z.string(),
    readTime: z.string(),
    excerpt: z.string(),
    sourceUrl: z.url().optional(),
    heroImage: z.string().optional(),
  })
  .superRefine((article, context) => {
    if (article.modifiedAt && article.modifiedAt < article.publishedAt) {
      context.addIssue({
        code: "custom",
        path: ["modifiedAt"],
        message: "modifiedAt must be greater than or equal to publishedAt",
      });
    }
  });

const articles = defineCollection({
  loader: glob({ base: "./src/content/articles", pattern: "**/*.md" }),
  schema: articleSchema,
});

export const collections = { articles };
