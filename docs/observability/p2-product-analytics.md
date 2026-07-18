# P2 product analytics contract

Status: active in production after explicit consent. Automatic push and scheduled builds keep the client enabled; a manual production dispatch with `product_analytics=false` publishes the kill-switch image.

## Runtime contract

- PostHog Cloud EU only: `https://eu.i.posthog.com`.
- The SDK is dynamically imported only after explicit consent.
- GPC or DNT blocks opt-in. Refusal and withdrawal are persisted per origin.
- Autocapture, replay, heatmaps, Web Vitals, exceptions, feature flags, identify/alias and person profiles are disabled.
- `$pageview` and the closed `site.*` event set are manual. `business.*` is rejected from the browser bundle.
- CTA IDs, assets and outbound destinations are enums. A mail click remains intent and is never treated as a lead or meeting.
- URL query strings, hashes, full referrers, DOM text and emails are removed by the client allow-list.

The common properties are `schema_version`, `site_name`, `environment`, `release_sha`, `locale`, `page_type`, `page_path`, `placement` and an optional referrer hostname. Service pageviews and service CTA events add the closed `service_id` enum: `diagnostic`, `otel_sprint` or `fractional_lead`. UTM attribution accepts only the five standard `utm_*` keys, is bounded, and starts after consent.

## Activation and rollback

Production push and scheduled builds set `PUBLIC_PRODUCT_ANALYTICS_ENABLED=true` and require `PUBLIC_POSTHOG_KEY` as a repository variable. A manual production dispatch with `product_analytics=false` rebuilds the site without the consent surface or SDK and remains the operational kill switch. The site remains fully functional in that mode.

## Verification

`npm run check:product-analytics -- --mode=off` proves a kill-switch bundle has no consent UI, PostHog host or project key. The enabled check verifies the hardened SDK configuration, all six service routes and the absence of browser `business.*` events. `npm run review:product-analytics` proves no pre-consent request, one event per CTA across the three offers, withdrawal cleanup and GPC blocking.

PostHog project: [Web Product Analytics](https://eu.posthog.com/project/221181/dashboard). Dashboard shells intentionally remain empty until real consented events arrive.
