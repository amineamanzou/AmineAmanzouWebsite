# SEO Redirect Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Serve permanent HTTP redirects for the legacy CV routes, the obsolete French PDF, and the retired OpenTelemetry demo host.

**Architecture:** Caddy returns the redirects before the static file server. A Node integration smoke test exercises a running container without following redirects, and CI loads and starts the built image so the runtime contract is protected.

**Tech Stack:** Caddy 2.11, Node.js 22 ESM, Docker, GitHub Actions, Astro 7.

## Global Constraints

- Redirects must return exactly `301` and an absolute apex-domain `Location`.
- Keep the existing Astro legacy CV pages as non-indexable static fallbacks.
- Keep `otel.amineamanzou.fr` DNS in place during the redirect transition.
- Do not redirect generic WordPress scanner paths.
- Do not change sitemap membership, content, or Search Console state.

---

## File structure

- `scripts/qa/caddy-redirects-smoke.mjs`: real HTTP contract test for a running Caddy image.
- `package.json`: exposes the smoke test as `npm run review:redirects`.
- `ops/Caddyfile`: owns production redirect routing before `file_server`.
- `.github/workflows/ci.yml`: loads, starts, exercises, and stops the CI image.

### Task 1: Add the failing runtime redirect contract

**Files:**
- Create: `scripts/qa/caddy-redirects-smoke.mjs`
- Modify: `package.json`
- Test: `scripts/qa/caddy-redirects-smoke.mjs`

**Interfaces:**
- Consumes: CLI option `--url=http://127.0.0.1:<port>` pointing at a running website container.
- Produces: exit code `0` only when every status and `Location` matches; non-zero assertion failure otherwise.

- [ ] **Step 1: Write the failing smoke test**

Create `scripts/qa/caddy-redirects-smoke.mjs`:

```js
import assert from "node:assert/strict";
import { request } from "node:http";

const args = process.argv.slice(2);
const urlIndex = args.indexOf("--url");
if (urlIndex === -1 || !args[urlIndex + 1]) {
  throw new Error("Usage: node scripts/qa/caddy-redirects-smoke.mjs --url=http://127.0.0.1:8080");
}

const baseUrl = new URL(args[urlIndex + 1]);
if (baseUrl.protocol !== "http:") {
  throw new Error("The redirect smoke test requires an http:// base URL");
}

const fetchResponse = ({ path, host = "amineamanzou.fr" }) =>
  new Promise((resolve, reject) => {
    const req = request(
      {
        hostname: baseUrl.hostname,
        port: baseUrl.port,
        method: "GET",
        path,
        headers: { Host: host },
      },
      (response) => {
        response.resume();
        response.on("end", () => {
          resolve({
            location: response.headers.location,
            status: response.statusCode,
          });
        });
      },
    );
    req.on("error", reject);
    req.end();
  });

const redirects = [
  ["/cv", "amineamanzou.fr", "https://amineamanzou.fr/dossier/"],
  ["/cv/", "amineamanzou.fr", "https://amineamanzou.fr/dossier/"],
  ["/en/cv", "amineamanzou.fr", "https://amineamanzou.fr/en/dossier/"],
  ["/en/cv/", "amineamanzou.fr", "https://amineamanzou.fr/en/dossier/"],
  [
    "/wp-content/uploads/2026/01/AmineAmanzouFR-ExpertObservabilite.pdf",
    "amineamanzou.fr",
    "https://amineamanzou.fr/downloads/amine-amanzou-dossier-competence-fr.pdf",
  ],
  ["/", "otel.amineamanzou.fr", "https://amineamanzou.fr/consultant-opentelemetry/"],
  ["/old-demo/path", "otel.amineamanzou.fr", "https://amineamanzou.fr/consultant-opentelemetry/"],
];

for (const [path, host, location] of redirects) {
  const response = await fetchResponse({ path, host });
  assert.equal(response.status, 301, `${host}${path} must return 301`);
  assert.equal(response.location, location, `${host}${path} must redirect to ${location}`);
}

const homepage = await fetchResponse({ path: "/" });
assert.equal(homepage.status, 200, "The main homepage must remain available");
assert.equal(homepage.location, undefined, "The main homepage must not redirect");

console.log("Caddy redirect smoke test passed");
```

Add the package script:

```json
"review:redirects": "node scripts/qa/caddy-redirects-smoke.mjs"
```

- [ ] **Step 2: Build and start the current image**

Run:

```bash
docker build -t amineamanzou-website:redirect-red .
docker run --detach --rm --name amineamanzou-redirect-red --publish 127.0.0.1:18080:8080 amineamanzou-website:redirect-red
```

Wait until this succeeds:

```bash
curl --fail --silent http://127.0.0.1:18080/healthz
```

- [ ] **Step 3: Run the test and verify RED**

Run:

```bash
npm run review:redirects -- --url=http://127.0.0.1:18080
```

Expected: FAIL because `/cv` returns `404` and `/cv/` returns `200`, not `301`.

Stop the RED container:

```bash
docker stop amineamanzou-redirect-red
```

- [ ] **Step 4: Commit the failing contract**

```bash
git add package.json scripts/qa/caddy-redirects-smoke.mjs
git commit -m "test: define Caddy redirect contract"
```

### Task 2: Implement the Caddy redirects

**Files:**
- Modify: `ops/Caddyfile`
- Test: `scripts/qa/caddy-redirects-smoke.mjs`

**Interfaces:**
- Consumes: the request host and exact request path.
- Produces: the status and `Location` contract defined in Task 1.

- [ ] **Step 1: Add the minimal redirect rules before `file_server`**

Insert after `encode zstd gzip`:

```caddyfile
  @retiredOtelDemo host otel.amineamanzou.fr
  redir @retiredOtelDemo https://amineamanzou.fr/consultant-opentelemetry/ 301

  redir /cv https://amineamanzou.fr/dossier/ 301
  redir /cv/ https://amineamanzou.fr/dossier/ 301
  redir /en/cv https://amineamanzou.fr/en/dossier/ 301
  redir /en/cv/ https://amineamanzou.fr/en/dossier/ 301
  redir /wp-content/uploads/2026/01/AmineAmanzouFR-ExpertObservabilite.pdf https://amineamanzou.fr/downloads/amine-amanzou-dossier-competence-fr.pdf 301
```

- [ ] **Step 2: Build and start the GREEN image**

```bash
docker build -t amineamanzou-website:redirect-green .
docker run --detach --rm --name amineamanzou-redirect-green --publish 127.0.0.1:18080:8080 amineamanzou-website:redirect-green
```

- [ ] **Step 3: Run the test and verify GREEN**

```bash
npm run review:redirects -- --url=http://127.0.0.1:18080
```

Expected: PASS with `Caddy redirect smoke test passed`.

Stop the container:

```bash
docker stop amineamanzou-redirect-green
```

- [ ] **Step 4: Commit the production behavior**

```bash
git add ops/Caddyfile
git commit -m "fix: consolidate legacy SEO routes"
```

### Task 3: Protect the redirect contract in CI

**Files:**
- Modify: `.github/workflows/ci.yml`
- Test: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: the `amineamanzou-website:ci` image built by `docker/build-push-action`.
- Produces: a CI failure when the runtime redirect contract regresses.

- [ ] **Step 1: Load the CI image**

In the existing `Build image` step, change:

```yaml
load: false
```

to:

```yaml
load: true
```

- [ ] **Step 2: Run the smoke test against the image**

Add immediately after `Build image`:

```yaml
      - name: Exercise Caddy redirect contract
        run: |
          set -euo pipefail
          docker run --detach --rm \
            --name amineamanzou-redirect-smoke \
            --publish 127.0.0.1:18080:8080 \
            amineamanzou-website:ci
          trap 'docker stop amineamanzou-redirect-smoke >/dev/null 2>&1 || true' EXIT
          for attempt in {1..30}; do
            if curl --fail --silent http://127.0.0.1:18080/healthz >/dev/null; then
              break
            fi
            if [ "$attempt" -eq 30 ]; then
              docker logs amineamanzou-redirect-smoke
              exit 1
            fi
            sleep 1
          done
          npm run review:redirects -- --url=http://127.0.0.1:18080
```

- [ ] **Step 3: Validate workflow YAML and run local checks**

```bash
ruby -e 'require "yaml"; Dir[".github/workflows/*.yml"].each { |path| YAML.load_stream(File.read(path)); puts "ok #{path}" }'
npm run check
npm run check:content
npm run build
npm run review:site
```

Expected: every command exits `0`.

- [ ] **Step 4: Commit CI protection**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: verify Caddy redirect behavior"
```

### Task 4: Final verification and review

**Files:**
- Review: `ops/Caddyfile`
- Review: `scripts/qa/caddy-redirects-smoke.mjs`
- Review: `.github/workflows/ci.yml`
- Review: `package.json`

**Interfaces:**
- Consumes: the complete implementation from Tasks 1–3.
- Produces: fresh evidence that the redirect behavior and existing site checks pass together.

- [ ] **Step 1: Run the complete verification suite**

```bash
npm run check
npm run check:content
npm run build
npm run check:seo
npm run review:site
docker build -t amineamanzou-website:redirect-final .
docker run --detach --rm --name amineamanzou-redirect-final --publish 127.0.0.1:18080:8080 amineamanzou-website:redirect-final
for attempt in {1..30}; do
  curl --fail --silent http://127.0.0.1:18080/healthz >/dev/null && break
  test "$attempt" -lt 30
  sleep 1
done
npm run review:redirects -- --url=http://127.0.0.1:18080
docker stop amineamanzou-redirect-final
```

Expected: all commands exit `0`; the redirect test prints `Caddy redirect smoke test passed`.

- [ ] **Step 2: Review repository state**

```bash
git diff --check
git status --short
git log --oneline -4
```

Expected: no whitespace errors; only intentionally uncommitted plan documentation may remain.

- [ ] **Step 3: Record the implementation plan**

```bash
git add docs/superpowers/plans/2026-08-08-seo-redirect-cleanup.md
git commit -m "docs: add SEO redirect implementation plan"
```
