---
title: "Migrate to unified observability without replacing your entire stack"
locale: "en"
articleSlug: "unified-observability-migration"
translationKey: "unified-observability-migration"
publishedAt: "2026-08-20"
label: "OpenTelemetry / Migration"
readTime: "11 min"
excerpt: "A move toward wide events and unified storage can start with a bounded use case, temporary dual export, and compared queries. The exit path should exist before cutover."
heroImage: "/blog/migration-observabilite-unifiee/cover.webp"
heroImageAlt: "The Unreliable Engineer secures a migration bridge from three telemetry silos to unified storage"
pillar: "opentelemetry"
intent: "informational"
primaryQuery: "unified observability migration"
relatedOffer: "otel_sprint"
seoTitle: "Migrate to unified observability with OpenTelemetry"
seoDescription: "A progressive migration plan for wide events and ClickHouse: pilot, OpenTelemetry dual export, validation, cutover, and rollback."
keywords: ["observability migration", "unified storage", "OpenTelemetry Collector", "dual export", "ClickHouse"]
proofLevel: "documentation"
---

Observability migrations often begin with a very clean diagram.

The old stack sits on the left. The new stack sits on the right. One arrow connects them. On cutover day the arrow becomes green and everyone goes home.

Production has other plans. The old stack carries alerts, dashboards, on-call habits, compliance exports, and three undocumented queries that have “always been there.” The new stack replaces nothing until it can support those decisions.

A move toward [wide events](/en/blog/wide-events-observability/) and [unified storage](/en/blog/observability-2-clickhouse/) should begin as a controlled experiment. OpenTelemetry can duplicate a bounded stream temporarily. The candidate is then evaluated through real investigations, costs, and failure scenarios.

## Start from decisions, not tools

Before deploying another exporter, I would inventory the decisions made with the current stack.

During incidents:

- which alert opens the investigation;
- which dashboard confirms impact;
- which query isolates a service or build;
- how engineers find an affected trace or user;
- which data feeds the postmortem.

During releases:

- how canary and stable populations are compared;
- how a regression is tied to a build or feature flag;
- which signal triggers rollback.

For the platform:

- which retention periods are contractual;
- which data contains PII;
- which exports feed support, security, or finance;
- which teams own schemas and costs.

That inventory becomes the migration protocol. A candidate may ingest every event and remain useless if it reproduces none of these decisions.

## Pick a bounded first scope

I would rarely begin with every signal and every service.

Logs from one expensive domain can provide the first pilot. Traces from one critical journey can test correlation and high-cardinality queries. One environment or cluster keeps blast radius small.

The choice should match current pain:

- excessive logging cost;
- retention that is too short;
- slow `trace_id` lookup;
- inability to group by tenant or build;
- laborious log-to-trace correlation.

The pilot needs a measurable question. “Install ClickHouse” describes activity. “Find errors from the new checkout by build and tenant across thirty days in under thirty seconds” describes an outcome.

## Keep collection portable

OpenTelemetry provides a useful boundary.

Applications emit through OpenTelemetry APIs and conventions. Collectors receive OTLP, enrich, filter, and export to several destinations. The current backend and the candidate can inspect the same stream without re-instrumenting each service for another vendor.

Portability is not automatic. Custom attributes, OTTL transformations, UI dependencies, and SQL schemas still need documentation. An open exporter reduces transport lock-in; it does not remove the cost of exporting historical data and rebuilding workflows.

## Use temporary dual export

A Collector pipeline can reference several exporters. Each exporter should have its own queue and retries so a slow backend does not immediately consume all Collector memory.

The following example duplicates logs and traces to an existing OTLP backend and ClickHouse. It is intentionally incomplete: endpoints, certificates, secrets, and limits must match the deployment.

```yaml
extensions:
  file_storage:
    directory: /var/lib/otelcol/storage

receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317

exporters:
  otlp/current:
    endpoint: current-backend.internal:4317
    sending_queue:
      storage: file_storage
      batch: {}

  clickhouse:
    endpoint: tcp://clickhouse.internal:9000?secure=true
    database: observability
    async_insert: true
    sending_queue:
      storage: file_storage
      num_consumers: 10
      batch:
        min_size: 5000
        flush_timeout: 5s

service:
  extensions: [file_storage]
  pipelines:
    logs/migration:
      receivers: [otlp]
      exporters: [otlp/current, clickhouse]
    traces/migration:
      receivers: [otlp]
      exporters: [otlp/current, clickhouse]
```

Persistent queues reduce loss across Collector restarts. They do not create a distributed transaction between backends. One destination may accept a batch while another rejects it.

The comparison therefore monitors:

- accepted and rejected events by exporter;
- queue depth and age;
- retries and permanent failures;
- count differences;
- delay between emission and availability.

Dual export temporarily increases network, CPU, and storage. It needs an end date.

## Check the maturity of the chosen path

Collector Contrib currently reports different stability levels for the ClickHouse exporter: beta for logs and traces, alpha for metrics, and development for profiles.

<figure>
  <img src="/blog/migration-observabilite-unifiee/otel-clickhouse-exporter-github.png" alt="GitHub README for the ClickHouse exporter showing OpenTelemetry signal stability levels" loading="lazy" />
  <figcaption><a href="https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter">Documented status of the ClickHouse exporter in OpenTelemetry Collector Contrib</a>. Maturity differs by signal.</figcaption>
</figure>

That status affects scope. A logs-and-traces pilot follows a more mature path than a simultaneous migration of metrics and profiles.

I would pin Collector, exporter, and server versions during the test. Generated DDL should be retained, and schema changes reviewed before every upgrade.

A distribution such as ClickStack provides a more opinionated integration with an interface and tailored schemas. It deserves the same inventory: versions, components, upgrade path, and operating responsibilities.

## Compare answers, not only volume

Two backends can receive the same number of spans and return different answers.

Schema transformations, timestamp handling, numeric types, sampling, and attribute mapping can alter aggregations. A credible migration replays field queries:

1. error rate by service and build;
2. p95 by route over a precise window;
3. traces for an affected tenant;
4. errors associated with a feature flag;
5. log-trace correlation;
6. event counts during a network failure.

For each query, retain:

- expected result;
- cold and warm latency;
- rows and bytes read;
- semantic differences;
- the path an on-call engineer follows to obtain the answer.

The last item matters. A powerful SQL query still fails operationally when only two people can write it at 3 a.m.

## Break the candidate before cutover

Dual run creates a rare window: the existing backend stays available while the candidate is being broken.

At minimum, I would test:

- unavailable ClickHouse;
- full Collector queue;
- restart with persisted data;
- unexpected schema input;
- too many small parts;
- lost replica;
- expensive global query during peak ingestion;
- TTL expiry.

Each scenario should produce a timeline of what was lost, delayed, duplicated, or recovered.

At-least-once delivery permits duplicates. Schemas and queries must tolerate or identify them. A persistent queue needs monitored disk capacity. Retries need limits so a dead backend does not turn the Collector into permanent storage.

## Move workflows in waves

Once the data path is validated, workflows can move in a controlled order.

Ad hoc exploration and investigations usually benefit first from rich events. Non-critical dashboards can follow. Alerts and SLOs move later, after windowing and aggregation have been compared.

Compliance exports and targeted deletion deserve separate work. An append-heavy engine and TTL retention do not automatically satisfy individual deletion requests.

Each wave needs:

- an owner;
- validation queries;
- an observation period;
- rollback criteria;
- a shutdown date in the old backend.

Without that date, dual run becomes permanent architecture. The company pays for two platforms and a comparison pipeline that nobody dares to remove.

## Design the exit before entry

The migration should document how to leave the candidate backend.

Keep:

- vendor-independent instrumentation and conventions;
- versioned Collector configurations;
- DDL and schema migrations;
- critical queries as tests;
- data export formats;
- backfill duration and cost;
- a procedure for re-enabling the old path during transition.

The OpenTelemetry Collector makes it easier to reroute new events. Historical data remains a separate problem. Moving several petabytes requires time, network capacity, and a destination format.

Exit cost belongs in the initial decision while everyone is still enthusiastic.

## A four-phase plan

I would summarize the migration this way.

### 1. Observe

Inventory decisions, queries, volume, retention, PII, and owners.

### 2. Duplicate

Send a bounded scope to both backends with independent queues, pipeline metrics, and pinned versions.

### 3. Compare

Replay investigations, measure differences, break the candidate, and fix instrumentation or schema.

### 4. Cut over

Move workflows in waves, keep temporary rollback, and actually shut down the old path.

This progression is less dramatic than a before-and-after diagram. It provides a precise stopping point when data, queries, or operations are not ready.

## What this series changed in my reading

The Observability 2.0 discussion describes a credible evolution: retain more context, unify the source of truth, and derive views at read time.

ClickHouse makes that model accessible at volumes that previously pushed many teams toward early aggregation or deletion. OpenTelemetry makes the collection path more portable.

Success then depends on quieter work: naming attributes, protecting data, selecting ordering keys, monitoring queues, testing failures, and removing the old stack.

That is where the theory becomes a platform.

## Sources

- [OpenTelemetry — Collector configuration](https://opentelemetry.io/docs/collector/configuration/)
- [OpenTelemetry Collector Contrib — ClickHouse Exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)
- [ClickHouse — Integrating OpenTelemetry](https://clickhouse.com/docs/use-cases/observability/integrating-opentelemetry)
- [ClickHouse — ClickStack](https://github.com/ClickHouse/ClickStack)
- [OpenTelemetry — File Storage Extension](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/storage/filestorage)
