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

The lockfile overrides `protobufjs` to the patched `7.6.5` release because the
disabled replay dependency otherwise resolves a vulnerable `7.5.x` version.
CI and production reject high or critical production dependency advisories.

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
