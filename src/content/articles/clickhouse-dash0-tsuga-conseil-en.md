---
title: "ClickHouse, Dash0, Tsuga: what I recommend, and to whom"
locale: "en"
articleSlug: "clickhouse-dash0-tsuga-conseil"
translationKey: "clickhouse-dash0-tsuga-conseil"
publishedAt: "2026-12-17"
label: "Observability / Engineering"
readTime: "5 min"
excerpt: "Three observability solutions I follow closely: what I have seen of them, their strength, their blocker, and the one I recommend depending on the client."
heroImage: "/blog/clickhouse-dash0-tsuga-conseil/cover.webp"
heroImageAlt: "The Unreliable Engineer weighing two options in front of the ClickHouse, Dash0 and Tsuga logos"
pillar: "observability"
intent: "comparative"
primaryQuery: "clickhouse dash0 tsuga conseil"
relatedOffer: "diagnostic"
seoTitle: "ClickHouse, Dash0, Tsuga: what I recommend, and to whom"
seoDescription: "Three observability solutions I follow closely: what I have seen of them, their strength, their blocker, and the one I recommend depending on the client."
keywords: ["observability", "OpenTelemetry", "clickhouse dash0 tsuga conseil"]
proofLevel: "experience"
---

At Enedis, I compared seven observability platforms for a €15 million tender. Three things weighed in the decision: OpenTelemetry integration, compliance with the list of requirements written with all the IT system owners, and the budget. In a tender, the budget makes up at least 60% of the decision. A solution that positions itself as the most expensive on the market has very little chance of fitting into the spreadsheets.

That is the grid I have in mind when I look at three solutions today: ClickHouse, Dash0 and Tsuga. Here is what I have seen of them, and what I recommend to whom.

## Why not Datadog, Elastic or Grafana

Datadog, first of all because of the price.

Elastic has just moved toward columnar storage, with [a columnar mode](https://www.elastic.co/search-labs/blog/elasticsearch-columnar-storage) announced in July 2026. The idea has been discussed for years, and only now do we see them testing something. Amazon made [a comparable move for OpenSearch](https://aws.amazon.com/blogs/big-data/run-log-analytics-for-a-fraction-of-the-cost-with-the-new-engine-for-amazon-opensearch-service/) around the same time.

Grafana are champions. They are open source, very well known, and they keep contributing and moving forward. I attended their conference: they added fleet management, and honestly there are good ideas in it. But I have been using it for so long that I can no longer define their competitive advantage. Their interface is starting to show its age, and it lacks the performance angle, the “this is how I stand out” angle. It feels like Grafana is everyone’s interface without being everyone’s database.

## ClickHouse: the one I run in production

I have adopted ClickHouse in production, and I am working on it at a client right now. On performance, it is seriously impressive: it absorbs a staggering number of queries. There is a lot of engineering and talent behind it.

I also like the ecosystem. They are moving on data, on analytics, on managed Postgres, and on agent observability since [the Langfuse acquisition](https://clickhouse.com/blog/clickhouse-raises-400-million-series-d-acquires-langfuse-launches-postgres). On the observability side, the OpenTelemetry integration is there, and the ClickStack MCP lets you investigate incidents. I wrote about it at more length after [their morning in Paris](/en/blog/clickhouse-observabilite-conference-2026/).

The blocker: they need to invest more in the HyperDX interface, in access management and in integrations such as synthetic monitoring.

It is a challenger, and for an observability specialist, that is a good place to stand.

## Dash0: the founder who writes to you himself

I have known Dash0 since late 2024. What surprised me is that [Mirko Novakovic](https://techcrunch.com/2024/11/04/datadog-challenger-dash0-aims-to-dash-observability-bill-shock) reached out to me himself on LinkedIn to ask me to test the product. He founded Instana, which he sold to IBM, and he now runs Dash0. He also invests in other startups. Seeing a CEO at that level do a salesperson’s job to stay close to his users stuck with me.

They have done a great job on marketing and on user experience. To me, they are among the very best today when it comes to correlating observability signals. Their strength is the all-in-one SaaS offering and an excellent interface.

The blocker: they offer nothing to companies that want to stay on-premise. We would have liked a managed offering to install on our own infrastructure.

## Tsuga: former Datadog people starting from scratch

Julien Teyssier gave me a demo of Tsuga in a café in Paris earlier this year. The team brings together former Datadog people and people from other vendors. At those vendors they ran into frustrations, they could not innovate the way they wanted, and they built their own solution to do what they could not do there. I like the story, and I like the approach. [Their platform](https://www.tsuga.com/product/overview) runs in the customer’s cloud account, so the data never leaves it.

They seem to be getting serious results. According to them, [the newspaper Le Monde used it](https://thenextweb.com/news/tsuga-35-million-series-a-observability) during the French municipal elections. It is a young, innovative team building something to stand apart from the market, and they seem to be pulling it off.

The weak point is marketing: it would be good if they were a bit better known. But that is part of their strategy. They do little of it and go after very large accounts.

## What I recommend

I lean toward open source, so toward ClickHouse, from small businesses to large accounts. Its cloud offering also suits startups and small businesses.

If it is a startup that wants the best of the best, with every integration in one place and a built-in AI assistant, I recommend Dash0.

Tsuga plays in another category, that of very large accounts.
