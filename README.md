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
