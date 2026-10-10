# Dependency audit policy

CI, production image publication and Docker builds use `npm run audit:dependencies`.
The full npm audit report remains visible. Every moderate, high or critical finding
blocks the build unless it satisfies the exact temporary exception below. Registry
errors, malformed reports and missing review context fail closed.

## Temporary build-only acceptance

- Advisory: https://github.com/advisories/GHSA-ch52-4w7c-c8xp (CVE-2026-93748).
- Package: `http-cache-semantics`, exactly `4.2.0`, at
  `node_modules/http-cache-semantics`, marked as a development dependency.
- Accepted severity: high; no other advisory on this package is exempted.
- Reviewed use: Astro 7.3.5 remote-image cache during static site generation.
  The production image runs Caddy and copies only the generated site from the
  Node build stage. It does not run this package or expose its HTTP cache to visitors.
- The static Astro configuration, final Docker stage/Caddy configuration and
  installed Astro remote-image implementation are fingerprinted. Changes invalidate
  the exception and require a new exposure review; production dependency use is rejected.
- Residual risk: the dependency remains flagged during builds. This is a temporary
  risk acceptance, not a claim that the upstream vulnerability is fixed.
- Expires at **2026-10-18 00:00 Europe/Paris** (`2026-10-17T22:00:00Z`), after
  the October 17 review day. If the advisory remains, the gate then fails automatically.
  No automatic renewal is permitted. If the finding is fixed or withdrawn, the normal
  gate can pass without using the exception.

The exception is recorded in `scripts/checks/dependency-audit-policy.json` and
regression-tested for expiration, scope changes and unrelated vulnerabilities.
October 17 is a review date, not an announced upstream release date.

Image workflows disable caching for the Node build stage so a cached audit cannot
outlive its acceptance. Local image verification must also use `docker build --no-cache`.
