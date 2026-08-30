---
title: "Monitoring vs. observability: why the distinction matters in production"
locale: "en"
articleSlug: "monitoring-vs-observability-production"
translationKey: "monitoring-vs-observability-production"
publishedAt: "2026-09-10"
label: "Observability / Production"
readTime: "9 min"
excerpt: "Monitoring detects and tracks conditions selected in advance. Observability becomes useful when the team must explain behavior nobody thought to put on a dashboard."
heroImage: "/blog/monitoring-vs-observabilite-production/hero-known-unknown-questions.svg"
heroImageAlt: "A monitoring screen showing a symptom beside an observability investigation following one request"
pillar: "observability"
intent: "comparative"
primaryQuery: "monitoring vs observability"
relatedOffer: "diagnostic"
seoTitle: "Monitoring vs observability in production"
seoDescription: "Metrics, logs and traces: understand what observability adds during an incident and how to assess the investigation capability of a system."
keywords: ["monitoring vs observability", "observability", "monitoring", "production", "OpenTelemetry"]
proofLevel: "documentation"
---

A review can show a complete dashboard inventory, several APM products and a full page of alerts.

Then I ask why one specific transaction became slower after the last deployment.

The answer becomes much less visible than the symptom.

Monitoring is not missing. It may even work well: CPU, memory, HTTP errors, pool saturation and endpoint availability are all covered. The team knows a symptom exists. It cannot yet reconstruct the path that produced it.

That is where the difference between monitoring and observability stops being a vocabulary contest.

## Monitoring answers prepared questions

A monitoring system collects, aggregates and displays information chosen in advance.

The team decides to track error rate, latency, request volume, saturation, queue depth or disk space. It then creates dashboards and thresholds to follow those values.

That preparation is valuable.

When a team already knows which conditions are dangerous, it should not wait for a person to explore traces before detecting them. A synthetic probe can check that the login journey responds. A metric can show that the error budget is burning too quickly. An alert can page the on-call engineer because immediate action is required.

Google’s *Monitoring Distributed Systems* chapter separates two questions: what is broken, and why? The first often describes a user-visible symptom. The second requires an investigation into intermediate causes.

Monitoring is especially effective at the first question when the team selected the right measurements.

## Observability starts when the question was not prepared

Production incidents rarely respect dashboard boundaries.

Latency may increase only for customers in one region, using one mobile version, behind one feature flag and one payment provider. The global error rate stays acceptable. CPU panels remain green. The database responds.

Support still has ten tickets describing the same failure.

To investigate, the team must start from a user outcome and cross the system layers: request, service, dependency, deployment, configuration, queue, database, network and business event. It needs dimensions that were not all known when the dashboard was built.

That is the capability I expect observability to provide: asking a new question about a system’s internal state from the signals it exposes.

OpenTelemetry currently describes traces, metrics, logs and baggage, with profiles also progressing through the ecosystem. None of these formats creates observability on its own.

A trace without useful attributes can remain silent. A log without service identity or a `trace_id` becomes isolated text. A metric with uncontrolled cardinality can become expensive without improving an investigation. Installing a Collector does not repair those choices automatically.

## A green dashboard can describe a failing system

Dashboards aggregate on purpose.

Aggregation makes trends readable, but it can erase a minority population. If two percent of transactions fail for an important segment, the global average may remain reassuring. If a request crosses five services, every team can display a green component while the complete journey exceeds its latency objective.

I treat a dashboard as the beginning of the investigation, not its verdict.

A service view should at least let the operator move:

- from a user symptom to representative requests;
- from a latency change to the affected versions and deployments;
- from an error to correlated logs and the dependency involved;
- from abnormal volume to the source, tenant or path producing it;
- from an SLO at risk to the events consuming its error budget.

If every transition requires another tool, a manually copied time window and three pasted identifiers, the company owns several monitoring products. It does not yet have a coherent investigation experience.

## Logs, metrics and traces do not replace one another

Product comparisons often try to select a winning signal.

In production, their roles complement one another.

Metrics quickly answer aggregate questions: how many, how fast, how is the value changing and how much budget is being consumed? They work well for alerting, trends and capacity.

Traces follow a unit of work through several components. They help show where time was spent, which dependency answered and which path the request actually followed.

Logs preserve events and details emitted by the application. They remain valuable for errors, business decisions, state changes and investigations that need text or a more flexible structure.

The quality comes from relationships between signals. An exemplar connects an aggregate measurement to a trace. A `trace_id` attaches a log to the operation that produced it. Consistent resource attributes let an operator compare the same service across two environments.

Without these relationships, the on-call engineer assembles the puzzle by hand.

## Test observability with questions

I am cautious about audits that start by counting installed agents.

I would rather test a few situations:

1. retrieve a transaction reported by support;
2. explain a latency increase following a deployment;
3. identify which populations are affected by an error;
4. distinguish a code, dependency or capacity problem;
5. find the service owner and the action expected from them;
6. estimate the cost of a new attribute, a second export or longer retention.

Only then do I look at the product inventory.

This method uncovers gaps that inventories hide: broken context propagation, inconsistent attributes, insufficient retention, unstructured logs, no user-side signal, permissions that block the on-call engineer, or a dashboard disconnected from any decision.

It also shows what already works. A team does not need to replace its entire stack when metrics detect symptoms correctly and a few correlation improvements would make investigations faster.

## Moving to observability is systems work

Buying a platform can accelerate collection, storage and exploration. It does not automatically make an organization observable.

The team still needs to decide:

- which user outcomes deserve an SLI;
- which context should be produced inside application code;
- which enrichment belongs in the Collector;
- which personal data must stay out of telemetry;
- how long to retain each signal;
- how to connect production changes to symptoms;
- who acts when a signal degrades.

In the SRE Workbook, Google recommends placing SLI metrics prominently on a service dashboard when an SLO-based alert fires. Those metrics show that the service is violating its objective. The rest of the telemetry then helps explain why.

That progression is more useful than an argument between two labels.

Monitoring keeps known conditions under surveillance. Observability reduces the cost of questions that were not anticipated. In distributed production systems, the two capabilities support different operational needs and work better when they share context and lead to decisions the team can actually make.

## Sources

- [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Google SRE Workbook — Monitoring](https://sre.google/workbook/monitoring/)
- [OpenTelemetry — Signals](https://opentelemetry.io/docs/concepts/signals/)
- [OpenTelemetry — Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
- [OpenTelemetry — Metrics Data Model](https://opentelemetry.io/docs/specs/otel/metrics/data-model/)
- [OpenTelemetry — Logs Data Model](https://opentelemetry.io/docs/specs/otel/logs/data-model/)
