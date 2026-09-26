# SEO Redirect Cleanup Design

## Goal

Replace legacy `200`/`noindex` and `404` responses with permanent HTTP redirects that consolidate search signals on the current public pages, while preserving the existing static fallbacks.

## Scope

- Redirect `/cv` and `/cv/` to `https://amineamanzou.fr/dossier/` with status `301`.
- Redirect `/en/cv` and `/en/cv/` to `https://amineamanzou.fr/en/dossier/` with status `301`.
- Redirect `/wp-content/uploads/2026/01/AmineAmanzouFR-ExpertObservabilite.pdf` to `https://amineamanzou.fr/downloads/amine-amanzou-dossier-competence-fr.pdf` with status `301`.
- Retire the former OpenTelemetry demo host by redirecting every request whose host is `otel.amineamanzou.fr` to `https://amineamanzou.fr/consultant-opentelemetry/` with status `301`.
- Keep the DNS record for `otel.amineamanzou.fr` during the redirect transition. DNS removal is a later infrastructure action after Google and external callers have had time to observe the redirect.

The four pages reported as “Discovered, currently not indexed” are not changed in this slice. They already exist in the sitemap and require a separate indexing/content-discovery follow-up after deployment.

## Architecture

The production image already serves the static Astro build through Caddy. Redirects belong in `ops/Caddyfile` before `file_server`, because Caddy can return an actual `301` without rendering the legacy Astro documents.

Path redirects use absolute apex-domain destinations so requests received on `www.amineamanzou.fr` also converge on the canonical host. The host redirect is evaluated before the path redirects so every path on the retired `otel` host has one deterministic destination.

All redirects, including the existing `/articles` rules, share one `route` block. This preserves literal ordering instead of allowing Caddy to sort path redirects ahead of the retired-host rule. Runtime tests cover these overlapping paths as well as the unchanged article redirects on the main host.

The Astro `/cv/` and `/en/cv/` pages remain in the static build with their existing `noindex`, canonical URL and HTML refresh. They are a fallback for non-Caddy previews or alternative static hosting and remain excluded from the sitemap.

## Runtime behavior

| Request | Status | Location |
| --- | ---: | --- |
| `GET /cv` | `301` | `https://amineamanzou.fr/dossier/` |
| `GET /cv/` | `301` | `https://amineamanzou.fr/dossier/` |
| `GET /en/cv` | `301` | `https://amineamanzou.fr/en/dossier/` |
| `GET /en/cv/` | `301` | `https://amineamanzou.fr/en/dossier/` |
| `GET /wp-content/uploads/2026/01/AmineAmanzouFR-ExpertObservabilite.pdf` | `301` | `https://amineamanzou.fr/downloads/amine-amanzou-dossier-competence-fr.pdf` |
| Any path with `Host: otel.amineamanzou.fr` | `301` | `https://amineamanzou.fr/consultant-opentelemetry/` |

All other paths retain their current Caddy behavior.

## Verification strategy

Add a Node smoke test that exercises a running HTTP server without following redirects. It must assert the exact status and `Location` header for every mapping above, including an arbitrary path on the retired host, and verify a normal page still returns `200`.

The CI Docker build will load the image, start it on an ephemeral local port, wait for `/healthz`, run the redirect smoke test, and stop the container. The test is written and observed failing against the current Caddy behavior before the redirect rules are added.

Final verification includes Astro checks, content inventory, static build, existing site review, the redirect runtime smoke test, and a clean diff review.

## Non-goals

- No Search Console validation or index-request submission.
- No immediate DNS deletion for `otel.amineamanzou.fr`.
- No redirect for WordPress scanner patterns such as `/wp-admin/*` or `/wp-content/*` generally.
- No change to sitemap membership or article content.
- No deployment or production infrastructure mutation in this repository task.
