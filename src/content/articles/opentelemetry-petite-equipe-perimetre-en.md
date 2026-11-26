---
title: "OpenTelemetry in a small team: where I start"
locale: "en"
articleSlug: "opentelemetry-petite-equipe-perimetre"
translationKey: "opentelemetry-petite-equipe-perimetre"
publishedAt: "2026-12-31"
label: "Observability / Engineering"
readTime: "5 min"
excerpt: "The order in which I set up OpenTelemetry in a small team, what gets built too early, the mistake I made with metrics and the minimal stack to start with."
heroImage: "/blog/opentelemetry-petite-equipe-perimetre/cover.webp"
heroImageAlt: "The Unreliable Engineer pointing at three numbered panels: logs with a health signal, a trace waterfall, then a browser window"
pillar: "opentelemetry"
intent: "informational"
primaryQuery: "opentelemetry petite equipe perimetre"
relatedOffer: "diagnostic"
seoTitle: "OpenTelemetry in a small team: where I start"
seoDescription: "The order in which I set up OpenTelemetry in a small team, what gets built too early, the mistake I made with metrics and the minimal stack to start with."
keywords: ["opentelemetry", "OpenTelemetry", "opentelemetry petite equipe perimetre"]
proofLevel: "experience"
---

I worked as a cloud engineer with a Portuguese startup that does e-commerce in fresh food. The job was to deploy their SaaS on GCP, a three-tier architecture, containerize it and put it on machines to put their solution to the test. With their lead developer, I set up an OpenTelemetry foundation for observability.

The other small team I know well is me, on my own infrastructure. In both cases, I go about it in the same order.

## The order I follow

You have to start with the basics. Deploy OpenTelemetry, turn on health monitoring for the collectors, then configure the shipping of logs and of metrics.

Tracing comes next. You add auto-instrumentation, then you identify the business areas where an incident hurts, and you make sure tracing is done well at that precise spot.

Take an online store like theirs. It has to watch the state of the carts, the number of abandoned carts and the latency of the payment service, because that is an external provider like Stripe. You started with auto-instrumentation, fine. But on those segments, you absolutely need to add manual instrumentation to get something that fits what matters to the client.

Last comes what happens on the user side: RUM, visit statistics, the behavior of someone who just hit a bug. That comes in a second phase.

<figure>
  <img src="/blog/opentelemetry-petite-equipe-perimetre/setup-order-en.svg" alt="Three-step diagram: the basics with logs and metrics, then tracing with manual instrumentation on business journeys, then the user side; dashboards do not come first" loading="lazy" />
  <figcaption>The three steps, in order.</figcaption>
</figure>

## What gets built too early

Dashboards. Every team starts there, and I have already written that it is better to [define your SLOs first](/en/blog/define-slos-before-dashboards/).

Today, in the age of agents, you no longer necessarily need a fixed dashboard that narrows your view. You can create a dashboard on demand by asking the AI, and keep only the ones that came back several times.

A small team has better things to do: actionable alerts, a controlled budget and [less noise](/en/blog/reduce-alert-fatigue/). The fewer people you are, the more the noise weighs on each of you.

## The mistake I made with metrics

What I overbuilt is metrics. You want to do things properly, you want to keep everything, and you end up collecting millions of metrics without looking at their cardinality. Often, the RED indicators are enough to know the health of a service: rate, errors and duration.

It happened to me on my personal infrastructure. I went through several cleanup cycles. I asked an agent to reread my latest incident investigations and spot the metrics that were only noise, the ones that brought no answer to an investigation or to an action. Then we pruned.

## The minimal stack

If I were starting today, I would take a simple Prometheus with Grafana for metrics. It is the simplest and fastest way.

The day I have clients in production and need to follow more closely what is going on, I migrate to an all-in-one solution that covers every signal, such as [Dash0 or ClickHouse](/en/blog/clickhouse-dash0-tsuga-conseil/).

## OpenTelemetry is not too complicated

It is not a top-tier agent where everything is handled without configuring anything, I agree. But the project is mature, and the documentation is plentiful.

A small team can even go further than most small businesses and tech companies, by building its own distribution of the [Collector](https://opentelemetry.io/docs/collector/) with the receivers and exporters it needs. With AI, a few people now have the productivity to do it.

Taking care of OpenTelemetry is not the hardest part. The hardest part is what lands in the backend: controlling the budget of what you observe against what it brings you, or what it protects you from.

We make observability complicated by constantly talking about new signals. In a startup, that is not what you tackle at the beginning. The mantra is “keep it simple, stupid”. When you follow it, OpenTelemetry configurations stay very basic, and you don’t need ultra-complex transformations to get where you want.
