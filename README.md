# AmineAmanzouWebsite

Static Astro portfolio for `amineamanzou.fr`.

This public repository contains the complete public website surface:

- Astro source code and typed portfolio content
- public profile images and PDF capability statement downloads
- Caddy static runtime packaged as a Docker image
- GitHub Actions workflows that check, scan, sign and publish the image

The site replaces the legacy WordPress runtime. It does not contain WordPress
state, SQL dumps, runtime secrets, private infrastructure topology or historical
mutable uploads.

## Local Development

Install dependencies:

```bash
npm ci
```

Run checks:

```bash
npm run check
npm run build
npm run review:site
```

Start a local dev server:

```bash
npm run dev
```

Build the release image:

```bash
docker build -t ghcr.io/amineamanzou/amineamanzou-website:local .
```

## Browser observability canary

Browser RUM is disabled in ordinary local, CI and production builds. An explicit
manual production workflow input can enable the canary when the public receiver
URL is configured. The exact public build contract is documented in
`.env.example`; `PUBLIC_BROWSER_OBSERVABILITY_API_KEY=browser-public` is a
non-authenticating browser marker and must never be replaced with a ClickStack
server key.

The HyperDX SDK is loaded only after versioned, explicit visitor consent. Session
replay, console capture, network instrumentation, DOM text and input capture are
disabled. Consent can be withdrawn from the persistent privacy control, which
removes the `__rum_sid` cookie and reloads the page.

HyperDX `0.26.0` now resolves patched OpenTelemetry and `protobufjs` releases
without project-wide overrides. A recorder-scoped override keeps `fflate` on
the patched `0.7.5` release until HyperDX lifts its exact `0.7.4` dependency.
CI and production reject high or critical production dependency advisories.

## Product analytics

Production push and scheduled builds enable the consent-gated PostHog client.
It records only the closed `site.*` contract after opt-in. Service pageviews and
CTA clicks carry one of three bounded service IDs: `diagnostic`, `otel_sprint`
or `fractional_lead`. A manual production dispatch with
`product_analytics=false` publishes a kill-switch image without the consent UI
or SDK.

## Production Flow

GitHub Actions builds and publishes a signed image:

```text
ghcr.io/amineamanzou/amineamanzou-website:main
```

Runtime promotion, routing and host-level deployment are managed by private
infrastructure outside this repository.

The production and security workflows also publish neutral JSON CI/CD event
artifacts (`cicd-event-production` and `cicd-event-security`). These artifacts
describe the public delivery contract, such as commit, workflow run, image
digest and check conclusions, without embedding private runtime topology.

## Staging validation

The staging workflow validates pull requests to `dev`. Pushes and manual runs on
`dev` publish a separately tagged image, gated on the same critical vulnerability
policy, digest signature and source-bound provenance as production. Its
`cicd-event-staging` artifact identifies the exact commit, run, attempt and digest.
Staging publication never updates production tags. Analytics and browser RUM are
disabled in staging builds; canonical public URLs remain unchanged.

Run the HTTP and browser smoke locally with a reserved staging session. Supply
`STAGING_BASE_URL`, `STAGING_SESSION_ID` (32 hexadecimal characters),
`STAGING_SOURCE_SHA` (40 hexadecimal characters), `STAGING_RELEASE_DIGEST` (64
hexadecimal characters, without the `sha256:` prefix), and an absolute
`STAGING_TEST_REPORT` output path. Set `CHROME_PATH` if Playwright's browser is
not installed, then run:

```bash
npm run review:staging
```

The runner uses fresh browser contexts, blocks service workers and external or
mutating requests, and authenticates every positive HTTP request with
`X-Staging-Session`. It checks session identity before and after the bilingual
routes, assets, JavaScript, responsive layout and locale navigation. Missing and
stale session headers must receive HTTP 409. The JSON report records every
required check with no skipped passes and exits nonzero on any failure. It does
not submit contact forms, follow external links, or exercise production. Store
session reports outside the repository.

After `npm run build`, run `npm run test:staging:fixture` to validate the runner
against a local synthetic session gate and the generated site. This smoke is
functional evidence; it does not qualify performance or production promotion.
