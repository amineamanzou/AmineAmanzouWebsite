# OpenTelemetry Core Security Override Design

## Context

`@hyperdx/browser@0.25.1` resolves a mixed OpenTelemetry dependency tree. Its direct packages use `@opentelemetry/core@2.9.0`, while the `0.218.0` exporter and browser instrumentations install nested copies of `@opentelemetry/core@2.7.1`. Those copies are affected by GHSA-8988-4f7v-96qf / CVE-2026-54285; the first patched stable release is `2.8.0`.

## Selected approach

Add a project-level npm override pinning every `@opentelemetry/core` resolution to `2.9.0`. This is the smallest reversible change and keeps the whole application on a version already present in HyperDX's direct dependency tree.

Add a dependency-policy check that reads the installed npm dependency tree and fails if any resolved `@opentelemetry/core` version is below `2.8.0`. Run that check in CI so a future HyperDX or lockfile update cannot silently reintroduce a vulnerable copy.

## Alternatives considered

- Upgrade the full OpenTelemetry stable and experimental package families. This removes version skew more completely but changes several experimental `0.x` packages and expands the compatibility surface.
- Maintain a fork of `hyperdx-js`. This gives full control but adds ongoing release and dependency maintenance.

The override is preferred because it isolates the security fix and can be validated against the existing browser observability contract.

## Validation contract

- The policy check fails on the current lockfile because `2.7.1` is installed.
- After the override and lockfile refresh, `npm ls @opentelemetry/core --all` contains no version below `2.8.0`.
- `npm audit --audit-level=moderate` reports zero vulnerabilities.
- Astro checks and static builds pass with browser observability both disabled and enabled.
- The real-browser observability smoke test confirms consent gating and exports the three privacy-safe OTLP action spans.

## Upstream handoff

If the application validation passes, open a HyperDX issue documenting the remaining nested vulnerable resolutions in the latest browser package, then open a linked pull request with the smallest dependency change that removes them. The upstream PR must include dependency-tree and test evidence and must not claim broader OpenTelemetry compatibility than was exercised.
