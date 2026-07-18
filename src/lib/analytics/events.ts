export const ANALYTICS_SCHEMA_VERSION = "1.1.0" as const;

export const analyticsEventNames = [
  "$pageview",
  "site.cta_click",
  "site.asset_download",
  "site.outbound_click",
  "site.locale_change",
  "site.blog_search",
  "site.article_open",
  "site.article_read_depth",
] as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[number];

export const analyticsPageTypes = [
  "home",
  "dossier",
  "contact",
  "blog_index",
  "article",
  "service",
  "privacy",
  "other",
] as const;

export type AnalyticsPageType = (typeof analyticsPageTypes)[number];

export const analyticsPlacements = [
  "page",
  "hero",
  "topbar",
  "footer",
  "work_preview",
  "download_band",
  "blog_preview",
  "blog_index",
  "article_body",
  "article_footer",
  "service_hero",
  "service_proof",
  "service_footer",
  "article_offer_cta",
  "contact_panel",
  "dossier_page",
  "terminal",
] as const;

export type AnalyticsPlacement = (typeof analyticsPlacements)[number];

export const analyticsCtaIds = [
  "open_dossier",
  "contact_mission",
  "view_full_dossier",
  "read_blog",
  "open_contact",
  "clarification_call",
  "source_article",
  "start_observability_diagnostic",
  "discuss_otel_sprint",
  "discuss_fractional_lead",
] as const;

export type AnalyticsCtaId = (typeof analyticsCtaIds)[number];

export const analyticsAssetIds = ["dossier_fr_pdf", "dossier_en_pdf"] as const;
export type AnalyticsAssetId = (typeof analyticsAssetIds)[number];

export const analyticsOutboundDestinations = [
  "linkedin",
  "github",
  "youtube",
  "source_article",
  "education_reference",
] as const;

export type AnalyticsOutboundDestination = (typeof analyticsOutboundDestinations)[number];

export const analyticsBlogCommands = ["ls", "help", "search", "fzf", "open", "read", "cat"] as const;
export type AnalyticsBlogCommand = (typeof analyticsBlogCommands)[number];

export type AnalyticsLengthBucket = "0" | "1-8" | "9-24" | "25-64" | "65+";

export type AnalyticsEventPayloads = {
  "$pageview": Record<string, never>;
  "site.cta_click": { cta_id: AnalyticsCtaId; article_id?: string };
  "site.asset_download": { asset_id: AnalyticsAssetId };
  "site.outbound_click": { destination: AnalyticsOutboundDestination };
  "site.locale_change": { target_locale: "fr" | "en" };
  "site.blog_search": {
    command: AnalyticsBlogCommand;
    length_bucket: AnalyticsLengthBucket;
    result_count: number;
  };
  "site.article_open": { article_id: string };
  "site.article_read_depth": { article_id: string; depth_percent: 50 | 90 };
};

export const eventPropertyAllowlist: Record<AnalyticsEventName, readonly string[]> = {
  "$pageview": [],
  "site.cta_click": ["cta_id", "article_id"],
  "site.asset_download": ["asset_id"],
  "site.outbound_click": ["destination"],
  "site.locale_change": ["target_locale"],
  "site.blog_search": ["command", "length_bucket", "result_count"],
  "site.article_open": ["article_id"],
  "site.article_read_depth": ["article_id", "depth_percent"],
};

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return (analyticsEventNames as readonly string[]).includes(value);
}

export function isAnalyticsPlacement(value: string): value is AnalyticsPlacement {
  return (analyticsPlacements as readonly string[]).includes(value);
}

export function normalizePagePath(value: string): string {
  const path = value.split(/[?#]/, 1)[0] || "/";
  const normalized = path.replace(/\/{2,}/g, "/").slice(0, 180);
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export function normalizeArticleId(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,79}$/.test(normalized) ? normalized : null;
}

export function toLengthBucket(length: number): AnalyticsLengthBucket {
  if (length <= 0) return "0";
  if (length <= 8) return "1-8";
  if (length <= 24) return "9-24";
  if (length <= 64) return "25-64";
  return "65+";
}
