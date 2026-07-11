import type { BeforeSendFn, CaptureResult, PostHogInterface } from "posthog-js/dist/module.no-external";
import {
  ANALYTICS_SCHEMA_VERSION,
  analyticsAssetIds,
  analyticsBlogCommands,
  analyticsCtaIds,
  analyticsOutboundDestinations,
  eventPropertyAllowlist,
  isAnalyticsEventName,
  isAnalyticsPlacement,
  normalizeArticleId,
  normalizePagePath,
  type AnalyticsEventName,
  type AnalyticsEventPayloads,
  type AnalyticsPageType,
  type AnalyticsPlacement,
} from "./events";

export type ProductAnalyticsConfig = {
  apiKey: string;
  host: string;
  environment: string;
  site: string;
  version: string;
  locale: "fr" | "en";
  pageType: AnalyticsPageType;
  consentStorageName: string;
};

type CommonProperties = {
  schema_version: typeof ANALYTICS_SCHEMA_VERSION;
  site_name: string;
  environment: string;
  release_sha: string;
  locale: "fr" | "en";
  page_type: AnalyticsPageType;
  page_path: string;
  placement: AnalyticsPlacement;
  referrer_domain?: string;
} & Record<string, string | number | boolean | undefined>;

const POSTHOG_EU_HOST = "https://eu.i.posthog.com";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const COMMON_PROPERTY_KEYS = [
  "schema_version",
  "site_name",
  "environment",
  "release_sha",
  "locale",
  "page_type",
  "page_path",
  "placement",
  "referrer_domain",
] as const;
const POSTHOG_REQUIRED_KEYS = [
  "token",
  "$token",
  "$device_id",
  "$session_id",
  "$window_id",
  "$lib",
  "$lib_version",
  "$time",
  "$sent_at",
  "$process_person_profile",
  "distinct_id",
] as const;

let client: PostHogInterface | null = null;
let activeConfig: ProductAnalyticsConfig | null = null;
let commonProperties: CommonProperties | null = null;
let listenersBound = false;

function isOneOf(value: string, values: readonly string[]): boolean {
  return values.includes(value);
}

function normalizeCampaignValue(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  return /^[a-z0-9][a-z0-9._-]{0,63}$/.test(normalized) ? normalized : null;
}

function safeReferrerDomain(): string | undefined {
  if (!document.referrer) return undefined;
  try {
    const hostname = new URL(document.referrer).hostname.toLowerCase();
    return /^[a-z0-9.-]{1,253}$/.test(hostname) ? hostname : undefined;
  } catch {
    return undefined;
  }
}

function readAttribution(config: ProductAnalyticsConfig): Record<string, string> {
  const storageKey = `${config.site}-product-analytics-attribution-v1`;
  const current = Object.fromEntries(
    UTM_KEYS.flatMap((key) => {
      const value = normalizeCampaignValue(new URLSearchParams(window.location.search).get(key));
      return value ? [[key, value]] : [];
    }),
  );
  const landingPath = normalizePagePath(window.location.pathname);
  const hasCurrentTouch = Object.keys(current).length > 0;

  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) ?? "null") as {
      first?: Record<string, string>;
      last?: Record<string, string>;
    } | null;
    const first = stored?.first ?? (hasCurrentTouch ? { ...current, landing_path: landingPath } : undefined);
    const last = hasCurrentTouch ? { ...current, landing_path: landingPath } : stored?.last;
    if (first || last) localStorage.setItem(storageKey, JSON.stringify({ first, last }));

    return Object.fromEntries(
      [
        ...Object.entries(first ?? {}).map(([key, value]) => [`first_${key}`, value]),
        ...Object.entries(last ?? {}).map(([key, value]) => [`last_${key}`, value]),
      ].filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    );
  } catch {
    return {};
  }
}

const sanitizeCapture: BeforeSendFn = (result): CaptureResult | null => {
  if (!result) return null;
  if (!isAnalyticsEventName(result.event)) return null;
  const allowed = new Set<string>([
    ...POSTHOG_REQUIRED_KEYS,
    ...COMMON_PROPERTY_KEYS,
    ...eventPropertyAllowlist[result.event],
    ...UTM_KEYS.flatMap((key) => [`first_${key}`, `last_${key}`]),
    "first_landing_path",
    "last_landing_path",
  ]);
  const properties = Object.fromEntries(
    Object.entries(result.properties ?? {}).filter(([key, value]) => allowed.has(key) && value !== undefined),
  );
  return { ...result, properties };
};

function validateConfig(config: ProductAnalyticsConfig): void {
  if (!/^phc_[A-Za-z0-9]{20,}$/.test(config.apiKey)) throw new Error("Invalid PostHog project key");
  if (config.host !== POSTHOG_EU_HOST) throw new Error("Product analytics must use PostHog Cloud EU");
  if (!/^[0-9a-f]{40}$/i.test(config.version)) throw new Error("Product analytics release must be a Git SHA");
  if (!/^[a-z0-9.-]{3,80}$/.test(config.site)) throw new Error("Invalid analytics site name");
  if (!/^[a-z0-9_-]{2,40}$/.test(config.environment)) throw new Error("Invalid analytics environment");
}

function baseProperties(placement: AnalyticsPlacement): CommonProperties {
  if (!activeConfig || !commonProperties) throw new Error("Product analytics is not initialized");
  return { ...commonProperties, placement };
}

function capture<Name extends AnalyticsEventName>(
  name: Name,
  payload: AnalyticsEventPayloads[Name],
  placement: AnalyticsPlacement,
): void {
  if (!client) return;
  client.capture(name, { ...baseProperties(placement), ...payload }, { send_instantly: true });
}

function captureFromElement(element: HTMLElement): void {
  const name = element.dataset.analyticsEvent ?? "";
  const placement = element.dataset.analyticsPlacement ?? "";
  if (!isAnalyticsEventName(name) || !isAnalyticsPlacement(placement)) return;

  if (name === "site.cta_click") {
    const value = element.dataset.analyticsCtaId ?? "";
    if (isOneOf(value, analyticsCtaIds)) capture(name, { cta_id: value as AnalyticsEventPayloads[typeof name]["cta_id"] }, placement);
  } else if (name === "site.asset_download") {
    const value = element.dataset.analyticsAssetId ?? "";
    if (isOneOf(value, analyticsAssetIds)) capture(name, { asset_id: value as AnalyticsEventPayloads[typeof name]["asset_id"] }, placement);
  } else if (name === "site.outbound_click") {
    const value = element.dataset.analyticsDestination ?? "";
    if (isOneOf(value, analyticsOutboundDestinations)) capture(name, { destination: value as AnalyticsEventPayloads[typeof name]["destination"] }, placement);
  } else if (name === "site.locale_change") {
    const value = element.dataset.analyticsTargetLocale;
    if (value === "fr" || value === "en") capture(name, { target_locale: value }, placement);
  } else if (name === "site.article_open") {
    const articleId = normalizeArticleId(element.dataset.analyticsArticleId ?? "");
    if (articleId) capture(name, { article_id: articleId }, placement);
  }
}

function bindListeners(): void {
  if (listenersBound) return;
  listenersBound = true;
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-analytics-event]") : null;
    if (target) captureFromElement(target);
  }, true);
  document.addEventListener("product-analytics:capture", (event) => {
    if (!(event instanceof CustomEvent) || typeof event.detail !== "object" || event.detail === null) return;
    const { name, properties, placement } = event.detail as { name?: string; properties?: Record<string, unknown>; placement?: string };
    if (name !== "site.blog_search" || !isAnalyticsPlacement(placement ?? "")) return;
    const command = typeof properties?.command === "string" ? properties.command : "";
    const lengthBucket = properties?.length_bucket;
    const resultCount = properties?.result_count;
    if (
      !isOneOf(command, analyticsBlogCommands)
      || !["0", "1-8", "9-24", "25-64", "65+"].includes(String(lengthBucket))
      || typeof resultCount !== "number"
      || !Number.isInteger(resultCount)
      || resultCount < 0
      || resultCount > 10_000
    ) return;
    capture("site.blog_search", {
      command: command as AnalyticsEventPayloads["site.blog_search"]["command"],
      length_bucket: lengthBucket as AnalyticsEventPayloads["site.blog_search"]["length_bucket"],
      result_count: resultCount,
    }, placement as AnalyticsPlacement);
  });
}

function startArticleDepthTracking(): void {
  if (!activeConfig || activeConfig.pageType !== "article") return;
  const articleId = normalizeArticleId(normalizePagePath(window.location.pathname).split("/").filter(Boolean).at(-1) ?? "");
  if (!articleId) return;

  const check = () => {
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const depth = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
    for (const threshold of [50, 90] as const) {
      if (depth < threshold) continue;
      const key = `product-analytics-depth:${activeConfig?.site}:${articleId}:${threshold}`;
      try {
        if (sessionStorage.getItem(key) === "1") continue;
        sessionStorage.setItem(key, "1");
      } catch {
        // The in-memory listener remains fail-closed when session storage is unavailable.
        window.removeEventListener("scroll", check);
        return;
      }
      capture("site.article_read_depth", { article_id: articleId, depth_percent: threshold }, "article_body");
    }
  };
  window.addEventListener("scroll", check, { passive: true });
  check();
}

export async function initProductAnalytics(config: ProductAnalyticsConfig): Promise<void> {
  if (client) return;
  validateConfig(config);
  activeConfig = config;
  commonProperties = {
    schema_version: ANALYTICS_SCHEMA_VERSION,
    site_name: config.site,
    environment: config.environment,
    release_sha: config.version,
    locale: config.locale,
    page_type: config.pageType,
    page_path: normalizePagePath(window.location.pathname),
    placement: "page",
    referrer_domain: safeReferrerDomain(),
    ...readAttribution(config),
  };

  const { default: posthog } = await import("posthog-js/dist/module.no-external");
  posthog.init(config.apiKey, {
    api_host: config.host,
    autocapture: false,
    rageclick: false,
    capture_pageview: false,
    capture_pageleave: false,
    capture_dead_clicks: false,
    capture_exceptions: false,
    capture_heatmaps: false,
    capture_performance: false,
    disable_session_recording: true,
    disable_surveys: true,
    disable_surveys_automatic_display: true,
    disable_product_tours: true,
    disable_web_experiments: true,
    disable_external_dependency_loading: true,
    advanced_disable_flags: true,
    advanced_disable_feature_flags: true,
    advanced_disable_feature_flags_on_first_load: true,
    cross_subdomain_cookie: false,
    secure_cookie: true,
    persistence: "localStorage",
    person_profiles: "never",
    request_batching: false,
    respect_dnt: true,
    opt_out_capturing_by_default: true,
    opt_out_persistence_by_default: true,
    consent_persistence_name: config.consentStorageName,
    property_denylist: ["$current_url", "$referrer", "$referring_domain", "$host", "$pathname", "$search_engine"],
    before_send: sanitizeCapture,
    loaded: (loadedClient) => {
      client = loadedClient;
      // The synthetic $opt_in event is rejected by the closed event allow-list.
      loadedClient.opt_in_capturing();
    },
  });
  if (!client) throw new Error("PostHog did not initialize");

  bindListeners();
  capture("$pageview", {}, "page");
  if (config.pageType === "article") {
    const articleId = normalizeArticleId(normalizePagePath(window.location.pathname).split("/").filter(Boolean).at(-1) ?? "");
    if (articleId) capture("site.article_open", { article_id: articleId }, "article_body");
  }
  startArticleDepthTracking();
}

export function shutdownProductAnalytics(): void {
  client?.opt_out_capturing();
  client?.reset();
  client = null;
  listenersBound = false;
  if (!activeConfig) return;
  try {
    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const key = localStorage.key(index);
      if (key?.includes(activeConfig.apiKey)) localStorage.removeItem(key);
    }
  } catch {
    // The caller reloads after persisting denial, keeping the SDK stopped.
  }
  activeConfig = null;
  commonProperties = null;
}
