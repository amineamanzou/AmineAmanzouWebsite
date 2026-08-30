---
title: "Define SLOs before building dashboards"
locale: "en"
articleSlug: "define-slos-before-dashboards"
translationKey: "define-slos-before-dashboards"
publishedAt: "2026-09-24"
label: "SRE / SLO"
readTime: "9 min"
excerpt: "A dashboard without an objective organizes measurements. An SLO starts from a user outcome, defines what counts as good, and gives the dashboard a decision to support."
heroImage: "/blog/slo-avant-dashboards/hero-slo-before-dashboard.svg"
heroImageAlt: "A user reliability objective organizing the indicators and dashboards of a service"
pillar: "reliability"
intent: "informational"
primaryQuery: "SLO implementation"
relatedOffer: "diagnostic"
seoTitle: "Define SLOs before dashboards"
seoDescription: "A practical method for defining user-centered SLIs and SLOs before building dashboards, alerts and error budgets."
keywords: ["SLO implementation", "SLO", "SLI", "error budget", "observability dashboard"]
proofLevel: "documentation"
---

Some dashboards assign a threshold to every component.

CPU at 80%. Memory at 85%. Latency turns yellow above 500 ms. The queue turns red at 10,000 messages.

The hardest question remained unanswered: when does the delivered service become insufficient for its users?

Thresholds had been selected component by component. The dashboard looked clean, but no product or operational decision connected the panels.

That is why I prefer defining SLOs before drawing the screens.

## Start from an outcome, not an available metric

An SLO sets a target level of reliability for a service. Its SLI measures the observed outcome.

The starting point can fit in one sentence:

> An order confirmation is counted as successful when a customer receives a valid response in under two seconds.

That sentence forces the team to define the unit of work, expected outcome and acceptable boundary.

The SLI can then follow the ratio style recommended by the SRE Workbook: good events divided by total eligible events.

```text
Availability SLI = successfully confirmed orders / eligible orders
```

The SLO adds a target and time window, such as 99.9% over 28 days.

The dashboard comes afterwards. It displays the ratio, remaining budget, consumption rate and dimensions required for investigation.

## The SLI source changes what you measure

Two metrics carrying the same name may describe different experiences.

An application counter sees requests that reach the process. It may miss failures occurring before it: DNS, CDN, load balancer, network or client startup.

A load balancer measurement covers more traffic but knows less about the business outcome. Browser instrumentation measures closer to the user while introducing sampling, consent and data-quality constraints.

I therefore separate the SLI specification from its implementation.

- **Specification:** what the service should deliver to the user.
- **Implementation:** the signal and calculation used to estimate it.

This prevents an already available metric from becoming an objective merely because it is convenient.

## A 100% SLO removes the decision space

A perfect target looks reassuring. It also turns every failure into a violation.

The SRE Workbook notes that a 100% SLO leaves a team permanently reactive. Real distributed systems do not achieve absolute perfection, and users do not require identical reliability from every journey.

A target below 100% creates an error budget.

With a 99.9% objective over 30 days, the team accepts at most 0.1% bad events within the measured population. That budget supports trade-offs: continue releases, slow a rollout, invest in reliability or repair a dangerous dependency.

The budget is not permission to break production. It makes explicit the risk the organization already accepts, often without measuring it.

## Ownership matters as much as the target

A perfectly calculated SLO can produce no effect.

They appear on a monthly dashboard. They turn red. The platform team discusses them. Product delivery continues unchanged. Nobody owns the trade-off.

Google recommends that useful SLOs be approved by stakeholders and paired with an error budget policy. The responsible people must also agree that the objective is achievable under normal conditions.

A simple policy can specify:

- who is notified when budget consumption accelerates;
- when an issue becomes a priority;
- when releases are restricted;
- which exceptions require an explicit decision;
- how the objective is revised when it no longer represents experience.

Without that policy, the SLO joins the collection of KPIs reviewed in meetings without changing the work.

## Build the dashboard around decisions

Once the SLO is selected, organizing the first screen becomes easier.

I want to see:

1. current SLI and target;
2. remaining error budget over the window;
3. budget consumption over a short and long window;
4. recent changes;
5. leading dimensions behind bad events;
6. representative traces or logs;
7. owner and policy.

Burn rate prevents the team from waiting until the end of the period to discover the budget is gone. Very fast consumption can trigger a page. Slow degradation can become a ticket and planned work.

The same screen does not have to explain everything. It should lead from the finding to the right investigation tools.

## Cause dashboards come next

The SLO shows that a user outcome is degrading. It does not automatically explain why.

Service dashboards therefore remain useful: latency by dependency, errors by version, saturation, queues, retries, connection pools, garbage collection and configuration changes.

The reading order changes.

The investigation starts from the symptom threatening an outcome, then moves toward plausible causes. An internal metric becomes important because it explains observed impact, not merely because it crossed a historic threshold.

This hierarchy also reduces fragile alerting. High CPU can be normal during a batch. User latency burning the budget quickly deserves attention even when CPU panels remain green.

## Start with a small number of objectives

A first implementation does not need to cover fifty journeys.

I select one service and two or three outcomes: availability, latency and perhaps freshness or correctness depending on the product. I calculate the SLIs from existing data, then compare their movement with known incidents, support tickets and user feedback.

The mismatches are useful.

If an important incident affects no SLI, coverage is insufficient. If the SLO drops without perceptible impact, the measurement or target should be revised. Google presents that improvement as a normal loop, not a failure of the initial definition.

The dashboard then becomes the visible result of a more important agreement: what the service promises, how the team measures it and which decision follows when that promise begins to drift.

## Sources

- [Google SRE Workbook — Implementing SLOs](https://sre.google/workbook/implementing-slos/)
- [Google SRE Workbook — Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)
- [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
