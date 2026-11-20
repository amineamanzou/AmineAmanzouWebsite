---
title: "ClickHouse for observability: questions to take into the field"
locale: "en"
articleSlug: "clickhouse-observabilite-conference-2026"
translationKey: "clickhouse-observabilite-conference-2026"
publishedAt: "2026-11-19"
label: "Observability / Engineering"
readTime: "3 min"
excerpt: "Before choosing ClickHouse for observability, separate the database, the product and the work the team still owns."
heroImageAlt: "Illustration of observability diagnosis and engineering decisions"
pillar: "observability"
intent: "informational"
primaryQuery: "clickhouse observabilite conference 2026"
relatedOffer: "diagnostic"
seoTitle: "ClickHouse for observability: questions to take into the field"
seoDescription: "Before choosing ClickHouse for observability, separate the database, the product and the work the team still owns."
keywords: ["observability", "OpenTelemetry", "clickhouse observabilite conference 2026"]
proofLevel: "documentation"
---

On November 9, 2026, ClickHouse announced a managed observability offering in public beta, built on ClickHouse Cloud and ClickStack. That raises a useful question: which parts does a team want to operate itself? [ClickHouse announcement](https://clickhouse.com/blog/announcing-clickhouse-observability).

I am preparing this article around the November 17 conference. This version was written before the event. The questions below are things I want to examine there, rather than a report of demonstrations I have already watched.

## The database is only part of an on-call engineer’s day

A team may need to retain detailed events and query them with SQL. It may also need to open a trace, find related logs and understand why a user is waiting. Those needs overlap, but building the path to each of them involves different work.

For a database, I would examine schemas, ingestion and changing query patterns. For an observability platform, I would also examine the investigation itself. How much work separates an alert from a testable explanation? Who maintains the views, links and access policies?

The documentation describes collecting telemetry through the OpenTelemetry Collector. That provides a starting point for moving signals, while attribute quality and consistent service identities remain things the team needs to verify. [OpenTelemetry integration](https://clickhouse.com/docs/observability/integrating-opentelemetry).

## The demonstration I would like to see

I would start with an ordinary application failure: a request fails after calling a third-party service. I would look for the deployed version, the affected region and other requests with the same problem. Then I would change the time window and scope to check whether the explanation still holds.

That investigation would expose the remaining responsibilities. Is missing data caused by instrumentation, filtering, transport or the query? When the team notices a gap, can it locate the stage where the data disappeared?

For cost, I would ask for a reproducible scenario using our volume and investigation habits. A vendor’s advertised price cannot predict our bill on its own. Useful evidence would include collection assumptions, retention and the queries actually run.

After the conference I want to keep those evidence levels separate. An announcement remains an announcement, and a demonstration remains a demonstration. Choosing the stack will still require a representative investigation performed under our own constraints.
