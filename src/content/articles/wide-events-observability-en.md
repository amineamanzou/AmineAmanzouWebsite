---
title: "Wide events: instrument a request without destroying its context"
locale: "en"
articleSlug: "wide-events-observability"
translationKey: "wide-events-observability"
publishedAt: "2026-08-06"
label: "OpenTelemetry / Instrumentation"
readTime: "10 min"
excerpt: "A wide event retains the context of a unit of work so engineers can answer questions they did not predict. OpenTelemetry already provides most of the required building blocks."
heroImage: "/blog/wide-events-observabilite/cover.webp"
heroImageAlt: "The Unreliable Engineer gathers request context into one wide structured event"
pillar: "opentelemetry"
intent: "informational"
primaryQuery: "wide events observability"
relatedOffer: "otel_sprint"
seoTitle: "Wide events with OpenTelemetry: instrumentation guide"
seoDescription: "How to build wide events with OpenTelemetry resources, spans, correlated logs, high-cardinality context, and business attributes."
keywords: ["wide events", "OpenTelemetry", "structured events", "high cardinality", "instrumentation"]
proofLevel: "documentation"
---

During an incident, I often end up looking for a dimension that does not exist.

The dashboard shows a latency increase. A trace confirms that a database call became slower. Then someone asks whether the issue affects only the new mobile build, European customers behind one feature flag, or requests routed through the canary.

The answer depends on a decision made weeks earlier: did that context survive instrumentation and storage?

Wide events make this situation less random. They describe a unit of work with enough structured context to answer questions that were not all known while the code was being written.

The term may sound new. OpenTelemetry already contains most of the building blocks. [The first article in this series](/en/blog/observability-2-clickhouse/) sets out the methodological shift; this one moves into instrumentation.

<figure>
  <img src="/blog/wide-events-observabilite/wide-event-anatomy-en.svg" alt="A request crosses three services and gathers resource, span, log, and business context into a wide event" loading="lazy" />
  <figcaption>A wide event retains useful dimensions during execution, before the context gets scattered.</figcaption>
</figure>

## A wide event describes a unit of work

Consider a payment request.

It reaches a specific service build in one region and environment. It belongs to a tenant, carries a cart, crosses a fraud rule, calls a provider, evaluates feature flags, and produces an outcome.

A useful event may retain:

- service and deployment identity;
- route and method;
- tenant or pseudonymized user identifier;
- client version;
- evaluated feature flags;
- payment business outcome;
- total and dependency durations;
- trace identifier;
- canary or rollback status.

Width does not mean that every field becomes a metric label. It means the backend can recover the context when a question requires it.

An aggregate metric quickly answers “how many payments are failing?” The rich event can then answer “which builds, tenants, and fraud rules are overrepresented in those failures?”

## OpenTelemetry already has several context layers

OpenTelemetry does not store one unstructured giant JSON document. Its model separates responsibilities.

### Resources describe the telemetry source

A resource identifies the observed entity: service, build, environment, pod, container, cluster, or region.

Its attributes remain stable for the lifetime of that resource. `service.name`, `service.version`, and `deployment.environment.name` naturally belong here.

Placing `user.id` or `order.id` in the resource would be a mistake. Their value changes per request and would create a huge number of resources.

### Spans describe operations with duration

A span represents an operation: an HTTP request, database call, message publication, or job execution.

Span attributes carry the context relevant to that operation. HTTP semantic conventions describe route, method, status, and selected network details. Application attributes can add tenant, client build, or business outcome when they genuinely support investigation.

A span also carries status, point-in-time events, and links to other spans. It is already close to a wide event: structured, correlated, and attached to a unit of work.

### Logs describe point-in-time events

The OpenTelemetry logs data model includes timestamp, body, severity, attributes, resource, and optionally `trace_id` and `span_id`.

That correlation matters. A business event or detailed error can remain a standalone log and still join the request that produced it.

A log with no trace ID, no resource, and a fully free-form body demands much more reconstruction downstream. The database may ingest it quickly. On-call will still be playing a jigsaw puzzle.

## A simplified event

The following example records the end of a checkout request. Application attributes without a stable semantic convention use an organization-owned namespace.

```json
{
  "timestamp": "2026-08-04T09:42:18.231Z",
  "trace_id": "7af0…9c21",
  "span_id": "18bc…42d0",
  "service.name": "checkout-api",
  "service.version": "2026.08.04-3",
  "deployment.environment.name": "production",
  "http.request.method": "POST",
  "http.route": "/checkout",
  "http.response.status_code": 502,
  "enduser.pseudo_id": "usr_8f1…",
  "acme.tenant.id": "tenant_42",
  "acme.client.version": "ios-9.14.0",
  "acme.feature_flags": ["new-fraud-score", "async-receipt"],
  "acme.payment.provider": "provider-b",
  "acme.payment.outcome": "upstream_timeout",
  "duration_ms": 842
}
```

The `acme` prefix is intentionally fictional. It shows where an organization must document its attributes while no stable convention exists.

The event does not include a full name, email address, card number, or cart contents. Retaining context is not permission to copy every piece of personal data into telemetry.

## Cardinality becomes useful when it unlocks a decision

`service.name` has few values. `trace_id` has almost as many as there are traces. `user.id`, `session.id`, `order.id`, and `build.id` also grow quickly.

Adding those dimensions to every metric series can become unmanageable. In columnar event storage, they remain queryable columns or attributes.

That capability does not make every field free.

High cardinality increases volume, affects compression, changes query paths, and can expose sensitive information. It deserves an explicit review:

- which investigation the field enables;
- how long it must remain;
- whether it can be hashed or pseudonymized;
- who may query it;
- whether the backend indexes, orders, or only scans it on demand.

I keep a simple rule: a dimension survives because it supports a decision, diagnosis, or proof. “The object already had the field” is not enough.

## Wide events do not remove metrics

Observability 2.0 discussions sometimes make metrics sound obsolete.

Counters and histograms remain excellent for alerting, trends, capacity, and SLOs. Their bounded structure enables predictable calculations.

Their role changes. A metric can signal an anomaly without carrying all the context required to explain it. Rich events take over when engineers need to slice the affected population.

OpenTelemetry explicitly allows relationships between these models. Metrics may be derived from streams of spans or logs. Exemplars connect an aggregate point to a trace. A backend can build time-series views from retained events.

The same signal no longer has to be both a compact alarm and a complete investigation file.

## One event per request is not always enough

A distributed request crosses multiple services. Each hop can produce its own rich span, and the trace joins those units.

A long-running job may need progress events or pulses before its final event arrives. Queues often connect producers and consumers that live in separate traces; span links preserve causality without inventing a fake parent.

The model should follow execution reality. One enormous final event carrying the entire distributed system becomes as difficult to produce as it is to govern.

## Traps I would flag in review

The first is copying all business data into telemetry. Useful instrumentation selects context; it does not mirror the production database.

The second is inventing attributes without a registry. `customer`, `customer_id`, `tenant`, `account.id`, and `user.company` end up describing the same entity across five teams. The unified query becomes a synonym hunt.

The third is enriching only in the Collector. A Collector can add environment, cluster, and Kubernetes metadata. It rarely knows the business decision that application code just made.

The fourth is waiting for an incident to validate attributes. Instrumentation deserves tests for resource presence, names, PII, trace-log correlation, and volume stability.

## A practical starting loop

I would begin with one important unit of work: checkout, account creation, or deployment.

List the questions that recur during incidents and release reviews. Classify the required context as resource, span attribute, span event, correlated log, or metric.

Then test five actions on real data:

1. find one exact request;
2. group failures by build and feature flag;
3. move from an alert to representative traces;
4. remove or mask sensitive identifiers;
5. measure added volume and query cost.

That loop produces a usable wide event. Adding three hundred fields before writing one query mostly produces a very wide document nobody opens.

The next article moves from the event to the engine: why ClickHouse can read this shape efficiently, and where parts, merges, and ordering keys begin asking for an experienced platform team.

## Sources

- [OpenTelemetry — Logs Data Model](https://opentelemetry.io/docs/specs/otel/logs/data-model/)
- [OpenTelemetry — Resource Data Model](https://opentelemetry.io/docs/specs/otel/resource/data-model/)
- [OpenTelemetry — Traces](https://opentelemetry.io/docs/concepts/signals/traces/)
- [OpenTelemetry — Metrics Data Model](https://opentelemetry.io/docs/specs/otel/metrics/data-model/)
- [Honeycomb — Observability 2.0 vs. Observability 1.0](https://www.honeycomb.io/blog/one-key-difference-observability1dot0-2dot0)
