---
title: "Observability 2.0: does ClickHouse really change the rules?"
locale: "en"
articleSlug: "observability-2-clickhouse"
translationKey: "observability-2-clickhouse"
publishedAt: "2026-07-30"
label: "Observability / Analysis"
readTime: "10 min"
excerpt: "Mat Duggan and Charity Majors revived the debate around ClickHouse, wide events, and unified storage. The shift is real, but it also moves part of the complexity somewhere else."
heroImage: "/blog/observabilite-2-clickhouse/cover.webp"
heroImageAlt: "The Unreliable Engineer compares two articles as three telemetry silos converge into columnar storage"
pillar: "observability"
intent: "informational"
primaryQuery: "observability 2.0"
relatedOffer: "fractional_lead"
seoTitle: "Observability 2.0: what ClickHouse really changes"
seoDescription: "A technical response to Mat Duggan and Charity Majors on ClickHouse, wide events, cardinality, and unified observability storage."
keywords: ["observability 2.0", "ClickHouse", "wide events", "unified storage", "OpenTelemetry"]
proofLevel: "documentation"
---

I opened Mat Duggan’s post with the usual SRE reflex triggered by a headline about a tool winning a war: find the paragraph where the architecture turns into a military campaign.

The article is far more useful than its headline.

Mat describes ten years spent operating logging platforms. A handful of services becomes a few hundred, volume keeps growing, and the same data must serve developers, on-call engineers, support teams, and executives. His conclusion is direct: at large scale, ClickHouse retained a more stable shape than the other stacks he had operated.

A few days later, Charity Majors used the post to defend a broader idea. A columnar engine matters, but the deeper shift is methodological: keep rich, structured telemetry with its context, store it as a connected source of truth, and derive views when people query it.

Both posts travelled widely. They identify a real change. They also combine field experience, public numbers, product positioning, and a theory of observability. I wanted to separate those layers before deciding what to keep.

<figure>
  <img src="/blog/observabilite-2-clickhouse/mat-duggan-article.png" alt="Header of Mat Duggan’s ClickHouse is winning the Observability Wars article" loading="lazy" />
  <figcaption><a href="https://matduggan.com/clickhouse-is-winning-the-observability-wars/">Mat Duggan, “ClickHouse is winning the Observability Wars”</a>, published July 1, 2026.</figcaption>
</figure>

## What Mat Duggan actually observed

Mat’s post is an operations account. He compares how several stack families evolve as ingestion moves from roughly 1 TB per day to 5 and then 10 TB per day.

At the first tier, most modern options work. Elasticsearch offers strong text search. LGTM provides specialized components. Datadog removes much of the backend operations burden. ClickHouse already requires care around schema and ordering keys.

The paths diverge as volume rises.

Elasticsearch accumulates decisions around shards, storage tiers, and lifecycle management. LGTM distributes several systems with their own replication, compaction, and caching mechanisms. Datadog stays easy to run from the customer side, while cost can push a team to build a pipeline whose job is to avoid sending data to the service it pays for.

In his experience, ClickHouse mainly required more capacity and more shards. The query language, engine, and mental model moved less.

That account is valuable because it comes with scar tissue. The exact monthly costs and volume thresholds remain estimates for specific designs. They are not a reproducible benchmark across managed offers, negotiated contracts, and self-hosted deployments.

I therefore keep two statements separate:

- Mat operated several of these architectures and saw different scaling trajectories;
- his exact numbers should not be copied into another company’s business case.

That distinction preserves the experience without turning it into a universal law.

## Charity Majors moves the argument up one level

A faster columnar database does not help enough when an organization still treats logs, metrics, and traces as three products with no shared fabric. A company can put every signal in ClickHouse and recreate the same silos with better compression.

Charity defines Observability 2.0 around a single source of truth made of wide structured events. Each unit of work retains enough context to be broken down later by build, customer, region, feature flag, route, result, or deployment ID.

The methodological change appears in the timing of decisions.

In a heavily aggregated design, teams decide at write time which dimensions will survive. They choose metric labels, log levels, sampled traces, and indexes. A question forgotten that day may remain impossible during the incident.

Rich events and an analytical backend move more of those decisions to read time. The detail survives, and engineers build the aggregation needed for the question in front of them.

<figure>
  <img src="/blog/observabilite-2-clickhouse/charity-majors-article.png" alt="Header of Charity Majors’ article on ClickHouse and Observability 2.0" loading="lazy" />
  <figcaption><a href="https://charity.wtf/p/have-you-heard-clickhouse-is-winning">Charity Majors, “Have you heard? ClickHouse is winning the observability wars!”</a>, published in July 2026.</figcaption>
</figure>

## Why ClickHouse fits this model

Observability data has a shape that suits a columnar analytical engine.

Events arrive continuously, rarely receive row-level updates, and contain many repeated values: service, environment, region, status, route, and error strings. A query often touches only a few columns in an event that may carry dozens or hundreds.

ClickHouse stores those columns separately. A query reading `service.name`, `http.response.status_code`, and duration does not need to physically read every other attribute. Data ordering and a sparse primary index can skip entire blocks when filters match the ordering key.

That architecture makes high cardinality less threatening. Keeping a `trace_id`, pseudonymized `user_id`, `build_id`, or a set of feature flags does not automatically carry the same cost as building a full inverted index or a time series for every value.

Engineers can then aggregate, group, and correlate the dimensions they need with SQL.

## “Just add shards” hides real work

The phrase works well in an essay. Production still collects its tax.

The `ORDER BY` key determines the physical layout of MergeTree data. A poor key forces the engine to read far more granules. Fixing it after a few petabytes have accumulated looks more like a migration project than a configuration edit.

Small inserts create parts. When they arrive faster than background merges can consolidate them, storage pressure and merge debt rise. ClickHouse recommends batching or asynchronous inserts for exactly that reason.

Sharding introduces further decisions:

- how writes are distributed;
- how blast radius is contained;
- how existing data is rebalanced;
- which queries touch one cell, one region, or the full fleet;
- how the system behaves during Keeper, network, or object-storage failures.

ClickHouse documents these constraints in the evolution of its own LogHouse platform. The team moved from 19 PiB to more than 100 PB and then 431 PiB of uncompressed data. It built geoshards, isolated cells, asynchronous inserts, and a hierarchy of tables. That is strong evidence of capability. It is also evidence that a system at this scale does not grow through a `+ shard` button.

## OpenTelemetry does not choose the database

Some of the debate blames OpenTelemetry for failing to solve the cost of observability.

That expectation assigns it a job it was never meant to own.

OpenTelemetry defines APIs, SDKs, a protocol, semantic conventions, and a collection pipeline. It helps teams produce and transport portable telemetry. It does not choose the storage price, ordering key, retention, or exploration interface.

Excellent OpenTelemetry data can land in a backend that destroys its context. Very poor events can also be inserted into ClickHouse at impressive speed.

The useful result needs both:

1. instrumentation that retains decision-making context;
2. a backend that explores it without punishing each new dimension.

LogHouse adds an important nuance. ClickHouse retained OpenTelemetry for some signals and built SysEx to extract its system tables directly at extreme scale. That specialization documents a limit of a general pipeline for one demanding workload. It does not make the standard irrelevant everywhere else.

## What actually changes in the method

The movement behind Observability 2.0 matters more than its version number.

Platform discussions often started with signal types and tools: a database for logs, a TSDB for metrics, and a backend for traces. The unified model starts with the unit of work and the questions a team must answer.

A request arrives. Which build handled it? Which tenant was affected? Which product rule ran? Which feature flag was active? Which dependency slowed down? What did the user receive?

This model brings observability closer to software delivery. Teams can validate a release, compare a canary, explain a regression for one segment, or connect an engineering decision to a business outcome.

It also raises the governance burden. More context requires PII rules, access controls, coherent retention, and query-cost management. Cardinality stops being only a vendor limit and becomes an architecture input.

## My conclusion after reading both posts

Mat is right about the operational point: observability platforms do not all age in the same way when volume grows by an order of magnitude.

Charity is right to widen the frame: replacing Elasticsearch with ClickHouse while preserving the same fragmented data model leaves much of the value unused.

ClickHouse is a strong foundation for wide events, arbitrary aggregations, and large volumes. A foundation is not the full observability product. Instrumentation, conventions, query experience, pipeline SLOs, governance, and the engineer who gets paged when parts accumulate are still there.

The meaningful shift is the order of decisions: retain context, standardize what can be standardized, and derive the required views. Tools enable that method. They do not substitute for it.

The rest of this series goes one level deeper: what a useful wide event looks like, why ClickHouse can query it efficiently, and how to test the model without throwing the current stack into a ravine.

## Sources

- [Mat Duggan — ClickHouse is winning the Observability Wars](https://matduggan.com/clickhouse-is-winning-the-observability-wars/)
- [Charity Majors — Have you heard? ClickHouse is winning the observability wars!](https://charity.wtf/p/have-you-heard-clickhouse-is-winning)
- [Honeycomb — Observability 2.0 vs. Observability 1.0](https://www.honeycomb.io/blog/one-key-difference-observability1dot0-2dot0)
- [ClickHouse — Scaling our observability platform beyond 100 petabytes](https://clickhouse.com/blog/scaling-observability-beyond-100pb-wide-events-replacing-otel)
- [ClickHouse — A Quadrillion Rows across three Clouds: scaling LogHouse](https://clickhouse.com/blog/a-quadrillion-rows-across-the-three-cloud-scaling-loghouse)
- [OpenTelemetry specification overview](https://opentelemetry.io/docs/specs/otel/overview/)
