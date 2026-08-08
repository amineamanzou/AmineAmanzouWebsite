# OpenTelemetry Core Security Override Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove every vulnerable `@opentelemetry/core` resolution below `2.8.0` while preserving the existing HyperDX browser telemetry contract.

**Architecture:** A small Node check inspects npm's installed dependency tree and enforces the patched version floor. A root npm override pins `@opentelemetry/core` to `2.9.0`; the existing `npm run check` gate runs the policy after `npm ci` in both CI and production deployment.

**Tech Stack:** npm overrides and lockfile v3, Node.js ESM, GitHub Actions, Astro, HyperDX Browser SDK, Playwright.

## Global Constraints

- Pin every `@opentelemetry/core` resolution to exactly `2.9.0`.
- Reject every installed `@opentelemetry/core` version below `2.8.0`.
- Do not upgrade any other OpenTelemetry package in the website change.
- Preserve consent gating, disabled session replay and network capture, and the existing privacy-safe action export contract.

---

### Task 1: Add the dependency version policy

**Files:**
- Create: `scripts/checks/opentelemetry-core-version.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `npm ls @opentelemetry/core --all --json` output.
- Produces: `npm run check:otel-core`, exiting non-zero and listing offending paths when any version is below `2.8.0`.

- [ ] **Step 1: Write the failing dependency policy check**

Implement an ESM script that runs `npm ls @opentelemetry/core --all --json`, recursively visits dependency nodes, compares strict three-part semantic versions numerically, and throws when it finds a version below `2.8.0`. Add `"check:otel-core": "node scripts/checks/opentelemetry-core-version.mjs"` to `package.json`, and make the existing `check` script run it before `astro check`. Both CI and deployment already run `npm run check` after `npm ci`.

- [ ] **Step 2: Verify the policy fails on the vulnerable tree**

Run: `npm run check:otel-core`

Expected: exit 1 with one or more paths resolving `@opentelemetry/core@2.7.1`.

- [ ] **Step 3: Commit the red test**

Run:

```bash
git add scripts/checks/opentelemetry-core-version.mjs package.json
git commit -m "test: enforce patched OpenTelemetry core"
```

### Task 2: Apply the minimal dependency override

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: npm's root `overrides` map.
- Produces: a dependency tree in which all `@opentelemetry/core` nodes resolve to `2.9.0`.

- [ ] **Step 1: Add the override**

Add `"@opentelemetry/core": "2.9.0"` to the existing `overrides` object without changing the PostHog or protobuf overrides.

- [ ] **Step 2: Refresh the lockfile**

Run: `npm install`

Expected: npm removes the nested `2.7.1` package entries and retains `@hyperdx/browser@0.25.1`.

- [ ] **Step 3: Verify the policy and audit**

Run:

```bash
npm run check:otel-core
npm ls @opentelemetry/core --all
npm audit --audit-level=moderate
```

Expected: all three commands exit 0; every listed core version is `2.9.0`; audit reports zero vulnerabilities.

- [ ] **Step 4: Commit the override**

Run:

```bash
git add package.json package-lock.json
git commit -m "fix: override vulnerable OpenTelemetry core"
```

### Task 3: Prove browser compatibility

**Files:**
- Verify only; no production file changes expected.

**Interfaces:**
- Consumes: the existing Astro, static-contract and Playwright checks.
- Produces: evidence that the override preserves the browser telemetry behavior.

- [ ] **Step 1: Run static and disabled-observability checks**

Run:

```bash
npm run check
npm run check:content
npm run build
npm run check:browser-observability -- --mode=off
```

Expected: all commands exit 0.

- [ ] **Step 2: Build the enabled browser observability contract**

Run `npm run build` with the same `PUBLIC_BROWSER_OBSERVABILITY_*`, service, site, version and production environment variables defined in `.github/workflows/ci.yml`, then run `npm run check:browser-observability -- --mode=on`.

Expected: the HyperDX SDK remains a separate consent-gated chunk and the contract exits 0.

- [ ] **Step 3: Exercise real OTLP export**

Start `npm run preview -- --host 127.0.0.1 --port 4321`, then run `npm run review:observability` against the reserved `.test` endpoint using a 40-character test SHA.

Expected: the smoke test confirms no pre-consent traffic and receives exactly the three controlled privacy-safe action spans after consent.

- [ ] **Step 4: Inspect the final diff**

Run: `git diff origin/main...HEAD --check` and `git status -sb`.

Expected: no whitespace errors and only the planned files differ.

### Task 4: Publish and hand off upstream

**Files:**
- No additional website files expected.
- Upstream changes are prepared in a separate HyperDX fork branch.

**Interfaces:**
- Consumes: validation evidence from Tasks 2 and 3.
- Produces: a website pull request, a HyperDX issue, and a linked HyperDX pull request.

- [ ] **Step 1: Push the website branch and open a draft pull request**

Use branch `codex/otel-core-security-override`, target `main`, and include root cause, audit result, dependency-tree result, and browser smoke result.

- [ ] **Step 2: Open the HyperDX issue**

Document the affected `@hyperdx/browser@0.25.1` paths, advisory, patched floor, successful consumer override, and the limitation that experimental package alignment still needs upstream validation.

- [ ] **Step 3: Prepare the smallest upstream change**

Fork or reuse the authenticated fork of `hyperdxio/hyperdx-js`, create a `codex/` branch, update only the dependency declarations and lockfile entries necessary to eliminate `@opentelemetry/core@2.7.1`, and run the upstream package's relevant checks.

- [ ] **Step 4: Open the linked upstream draft pull request**

Reference the issue with `Fixes #<issue>`, report exact tests, and leave the PR in draft if any upstream check cannot be reproduced locally.
