# P2 product analytics contract

Status: implemented dark on `codex/p2-product-analytics`; production collection is disabled by default and remains gated by P1 acceptance.

## Runtime contract

- PostHog Cloud EU only: `https://eu.i.posthog.com`.
- The SDK is dynamically imported only after explicit consent.
- GPC or DNT blocks opt-in. Refusal and withdrawal are persisted per origin.
- Autocapture, replay, heatmaps, Web Vitals, exceptions, feature flags, identify/alias and person profiles are disabled.
- `$pageview` and the closed `site.*` event set are manual. `business.*` is rejected from the browser bundle.
- CTA IDs, assets and outbound destinations are enums. A mail click remains intent and is never treated as a lead or meeting.
- URL query strings, hashes, full referrers, DOM text and emails are removed by the client allow-list.

The common properties are `schema_version`, `site_name`, `environment`, `release_sha`, `locale`, `page_type`, `page_path`, `placement` and an optional referrer hostname. UTM attribution accepts only the five standard `utm_*` keys, is bounded, and starts after consent.

## Activation and rollback

Production push builds always keep `PUBLIC_PRODUCT_ANALYTICS_ENABLED=false`. After the P1 gate is accepted, a manual production dispatch may enable the portfolio P2 canary only when `PUBLIC_POSTHOG_KEY` exists as a repository variable. Disable the workflow input and rebuild to kill collection; the site remains fully functional without the SDK.

## Verification

`npm run check:product-analytics -- --mode=off` proves the default bundle has no consent UI, PostHog host or project key. The enabled check verifies the hardened SDK configuration and absence of browser `business.*` events. `npm run review:product-analytics` proves no pre-consent request, a single CTA event, withdrawal cleanup and GPC blocking.

PostHog project: [Web Product Analytics](https://eu.posthog.com/project/221181/dashboard). Dashboard shells intentionally remain empty until real consented events arrive.
