---
title: "ClickHouse for observability: why it scales and where it breaks"
locale: "en"
articleSlug: "clickhouse-observability-scale"
translationKey: "clickhouse-observability-scale"
publishedAt: "2026-08-13"
label: "Observability / Architecture"
readTime: "11 min"
excerpt: "ClickHouse fits observability data well: columns, compression, aggregations, and append-heavy events. Its performance still depends on ordering keys, insert batches, parts, merges, and sharding."
heroImage: "/blog/clickhouse-observabilite-scale/cover.webp"
heroImageAlt: "The Unreliable Engineer adds a shard while small ClickHouse data parts accumulate around the platform"
pillar: "observability"
intent: "comparative"
primaryQuery: "ClickHouse observability"
relatedOffer: "diagnostic"
seoTitle: "ClickHouse for observability: strengths and limits"
seoDescription: "Why ClickHouse scales for logs and traces: columnar storage, ORDER BY, inserts, parts, merges, sharding, and operational limits."
keywords: ["ClickHouse observability", "ClickHouse logs", "OpenTelemetry ClickHouse", "MergeTree", "ClickStack"]
proofLevel: "documentation"
---

When a ClickHouse demo goes well, the engine creates a slightly dangerous feeling.

A few billion rows are loaded, someone runs a `GROUP BY`, the answer returns before the sentence ends, and the room starts counting how many tools could be replaced before Friday.

The performance is real. The conclusion takes more work.

ClickHouse has an architecture that fits logs, traces, and [wide structured events](/en/blog/wide-events-observability/) remarkably well. That fit explains much of its adoption in observability platforms. It also comes with a specific operating model: queries must benefit from physical ordering, writes should arrive in batches, and parts must merge fast enough.

Understanding that mechanism is more useful than another “rows per second” chart.

## Why observability data fits the engine

Telemetry is mostly append-only.

Applications add logs and spans. They rarely update one event several days later. Retention removes time windows rather than individual rows selected one by one.

Events are also wide. An OpenTelemetry span can carry service identity, route, status, duration, resource attributes, events, and links. An investigation query usually touches only a small subset of those columns.

Columnar storage lets ClickHouse read only the requested columns. Repeated values inside a column also compress well: `service.name`, environment, region, and status codes occur over and over.

Finally, observability queries are analytical. On-call filters a time window, groups by service or build, calculates quantiles, and looks for an abnormal population. That workload suits a vectorized OLAP engine.

## Wide events do not cost like row-oriented documents

A row-oriented database stores the fields of an event together. Reading three fields can still require physical I/O for a much wider document.

ClickHouse stores each column in separate files. A hundred-attribute event does not force every query to read all hundred attributes.

This changes the economics of width. Adding contextual fields still affects volume and governance, but those fields do not penalize every query equally.

High cardinality benefits from another design choice. ClickHouse does not automatically create a full index for every value. Its main access path is a sparse primary index over granules. `trace_id` and `user_id` can remain stored without creating one time series per value.

The engine still needs a way to find the relevant granules. That is where `ORDER BY` becomes an architecture decision.

## `ORDER BY` designs the query path

In a MergeTree table, `ORDER BY` determines the physical order of rows on disk. The primary index keeps sparse marks, by default one mark per 8,192-row granule.

When a filter matches the beginning of that key, ClickHouse can skip large ranges. When it does not, far more granules are read.

The default OpenTelemetry schema created by the ClickHouse exporter demonstrates the trade-off. Logs are ordered around a time bucket, service, and timestamp. Time-range queries by service are natural. Looking up an arbitrary attribute or `trace_id` may need a skip index, projection, helper table, or more scanning.

```sql
SELECT
  ServiceName,
  SpanAttributes['deployment.version'] AS version,
  quantile(0.95)(Duration) AS p95
FROM otel_traces
WHERE Timestamp >= now() - INTERVAL 30 MINUTE
  AND SpanAttributes['feature.flag'] = 'new-checkout'
GROUP BY ServiceName, version
ORDER BY p95 DESC;
```

This query looks straightforward. Its performance depends on the time window, ordering key, selected columns, and distribution of attributes.

An observability schema should therefore start from frequent questions:

- time-range search by service;
- full trace retrieval;
- build comparison;
- aggregation by tenant or feature flag;
- text search in logs;
- recurring dashboard queries.

One physical layout cannot optimize every path. Projections, materialized views, and skipping indexes provide alternatives. They also add storage and write-time work.

## Small inserts create very tangible debt

Each insert into a MergeTree table creates a data part with metadata and indexes. Background tasks merge small parts into larger ones.

When hundreds of producers send tiny batches continuously, parts can appear faster than merges consolidate them. File counts rise, merge pressure grows, and ClickHouse may eventually slow down or reject writes with `TOO_MANY_PARTS`.

ClickHouse recommends batches of at least several thousand rows or controlled insert frequency. Asynchronous inserts let the server combine small writes before creating parts.

The ClickHouse exporter in OpenTelemetry Collector Contrib also moved batching into its `sending_queue`. Its documentation recommends this internal mechanism over relying only on a generic batch processor before the exporter.

```yaml
exporters:
  clickhouse:
    endpoint: tcp://clickhouse:9000
    async_insert: true
    sending_queue:
      num_consumers: 10
      batch:
        min_size: 5000
        flush_timeout: 5s
```

Those lines explain a meaningful part of production operations. The backend can ingest huge volumes when events do not arrive as individual parcels.

## Merges consume deferred work

ClickHouse moves some cost into the background.

Parts merge, TTL rules remove expired data, materialized views populate other tables, and replication maintains copies. CPU, memory, and I/O headroom must cover both visible queries and that deferred work.

Running `OPTIMIZE TABLE ... FINAL` regularly to make a table “clean” is often a symptom. It can consume substantial resources and merge parts the engine would otherwise process progressively.

Useful platform metrics therefore extend beyond ingestion throughput:

- active part count and size;
- merge backlog and duration;
- insert latency;
- rejects and retries;
- disk growth;
- granules and bytes read by critical queries;
- latency by query family.

A fast observability backend that cannot expose its own background work is preparing a fairly ironic on-call shift.

## More shards also mean more decisions

Sharding distributes capacity. It introduces topology.

A poor sharding key creates hotspots. Random distribution balances writes but may require more shards for each query. Distribution by tenant or region can reduce query fan-out while increasing imbalance risk.

Existing data also needs a rebalancing plan. Adding a shard does not move old parts automatically. Teams pre-provision, change weights for new writes, or organize a dual-write migration.

Replication and ClickHouse Keeper introduce other concerns: metadata availability, quorum, replica replacement, and behavior during network partitions.

The engine retains a recognizable shape as it grows. The architecture around it continues to evolve.

## LogHouse demonstrates both capacity and complexity

ClickHouse’s published numbers for its internal LogHouse platform provide a rare reference point.

In June 2026, the team reported 431 PiB of uncompressed data, 1.59 quadrillion rows, more than thirty regions, and peaks of 80 GiB/s and 190 million rows per second. The platform uses 36 ClickHouse cells across three cloud providers.

<figure>
  <img src="/blog/clickhouse-observabilite-scale/loghouse-scale.png" alt="ClickHouse article reporting 431 PiB and 1.59 quadrillion rows in LogHouse" loading="lazy" />
  <figcaption><a href="https://clickhouse.com/blog/a-quadrillion-rows-across-the-three-cloud-scaling-loghouse">ClickHouse, “A Quadrillion Rows across three Clouds: scaling LogHouse”</a>. These figures are reported by the team operating the platform.</figcaption>
</figure>

The design evolved through stages: one instance per region, geoshards, several cells in busy regions, isolated writes, asynchronous inserts, and a table hierarchy for global reads.

That history confirms ClickHouse’s capacity. It also documents the systems built to reach it. I read it as an architecture report, not a guarantee that every deployment will follow the same curve.

## The OpenTelemetry exporter has its own limits

The `clickhouseexporter` component accepts logs, traces, metrics, and profiles. Its stability matrix belongs in the architecture decision:

- logs and traces: beta;
- metrics: alpha;
- profiles: development.

The default schema speeds up a lab and early deployment. A long-lived platform may choose to own DDL, migrations, and views instead of allowing component upgrades to implicitly own the storage layer.

Benchmarks in the README are useful orders of magnitude. They do not replace testing with the company’s event width, retention, queries, codecs, and storage.

## When ClickHouse is a strong choice

The engine becomes especially attractive when several conditions meet:

- data volume makes per-GB pricing or pervasive indexing painful;
- events are structured and context-rich;
- teams need arbitrary aggregation and correlation;
- SQL is acceptable as a power interface;
- a team can own schema, SLOs, and migrations;
- long retention provides real value.

Smaller volumes, no distributed-database expertise, and a mostly text-search use case may favor a managed service with faster time to value.

An observability platform also contains an interface, alerts, access control, trace exploration, dashboards, schema management, and support. ClickStack and HyperDX cover part of that space. The database alone does not replace those workflows.

## What I would test before choosing

I would start from a representative sample rather than uniform generated rows.

The protocol would include:

1. real event width and cardinality;
2. query profiles taken from incidents;
3. ingestion peaks and quiet periods;
4. loss of a Collector or replica;
5. accumulation of small parts;
6. a schema change;
7. compressed storage and operating-cost estimates.

Versions, DDL, queries, parameters, and results should be retained. A fast `SELECT count()` over a billion rows makes a good demo. A platform decision needs to show what happens when the ordering key misses, one region produces twice the traffic, and merges are an hour behind.

ClickHouse scales because its architecture fits the problem. It breaks where that architecture is fed poorly, ordered poorly, or operated without headroom.

The last article turns this into a migration path: test the unified model while preserving an exit and keeping the current backend available during comparison.

## Sources

- [ClickHouse — The definitive guide to query optimization](https://clickhouse.com/resources/engineering/clickhouse-query-optimisation-definitive-guide)
- [ClickHouse — Best practices for inserts](https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy)
- [ClickHouse — A Quadrillion Rows across three Clouds: scaling LogHouse](https://clickhouse.com/blog/a-quadrillion-rows-across-the-three-cloud-scaling-loghouse)
- [OpenTelemetry Collector Contrib — ClickHouse Exporter](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/exporter/clickhouseexporter)
- [ClickHouse — ClickStack](https://clickhouse.com/blog/clickstack-a-high-performance-oss-observability-stack-on-clickhouse)
