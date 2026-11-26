---
title: "ClickHouse for observability: what I saw in Paris, and what is still missing"
locale: "en"
articleSlug: "clickhouse-observabilite-conference-2026"
translationKey: "clickhouse-observabilite-conference-2026"
publishedAt: "2026-11-26"
label: "Observability / Engineering"
readTime: "5 min"
excerpt: "I spent the morning of November 17 at ClickHouse’s observability conference in Paris. What Qonto and Ringover shared, my take on the product and what it still lacks."
heroImage: "/blog/clickhouse-observabilite-conference-2026/cover.webp"
heroImageAlt: "The Unreliable Engineer holding a camera in front of three comic panels showing the ClickHouse, Qonto and Ringover talks"
pillar: "observability"
intent: "informational"
primaryQuery: "clickhouse observabilite conference 2026"
relatedOffer: "diagnostic"
seoTitle: "ClickHouse for observability: what I saw in Paris, and what is still missing"
seoDescription: "I spent the morning of November 17 at ClickHouse’s observability conference in Paris. What Qonto and Ringover shared, my take on the product and what it still lacks."
keywords: ["observability", "OpenTelemetry", "clickhouse observabilite conference 2026"]
proofLevel: "experience"
---

On November 17, I spent the morning at a ClickHouse conference on observability, in one of those spaces near Opéra in Paris where startups come to work. For once, this wasn’t an after-work meetup where everyone shows up tired from their day. It was a full morning set aside for the topic, and you could feel it in the room. ClickHouse is moving fast. I recommend it today to some organizations, as long as they know where the gaps still are.

Eight days earlier, ClickHouse had [opened its managed observability offering in public beta](https://clickhouse.com/blog/announcing-clickhouse-observability). The idea: you send your OpenTelemetry data to an endpoint and they run the rest, billed per gigabyte ingested. So the timing was good. [The agenda](https://clickhouse.com/fr/company/events/202611-EMEA-France-Paris-Matinee-de-lObservabilite) had an introduction to ClickHouse and ClickStack by Oussama Chakri, two production stories from French companies, Qonto and Ringover, then a workshop where everyone opened their laptop.

## What they showed on the product side

Oussama Chakri opened by treating the subject as a data problem. Volume, cardinality, retention: to him, these are engine problems first. On the interface side, they showed AI Notebooks and the Service Map in HyperDX, the ClickStack UI. You can tell they are catching up with what exists elsewhere, with anomaly detection, drift visualization and log grouping by pattern.

<figure>
  <img src="/blog/clickhouse-observabilite-conference-2026/oussama-chakri-clickhouse.jpg" alt="Oussama Chakri presenting a slide that reads “Observability is a data problem” in French at ClickHouse’s observability morning in Paris" loading="lazy" />
  <figcaption>Oussama Chakri (ClickHouse) opening the morning. Photo taken on site, November 17.</figcaption>
</figure>

We saw it during the workshop, led by Vincent Jolivet. You pick a time range, and the tool sorts out what keeps repeating in the logs. That day it surfaced seven anomalies, including a payment error we could tie to the others. Honestly, it is well done. Creating your teams, plugging in your OpenTelemetry endpoint and starting to send data all happens right away, and that experience is heading in the right direction.

## Qonto: traces decide whether a deployment continues

I had already seen Qonto in February, at a ClickHouse meetup, with a talk leaning heavily on agent-driven investigation. This time it was more down to earth. Valentin Levier, SRE at Qonto, explained that they store only their traces in ClickHouse Cloud: 60 days of retention, around 600 TB before compression, 22 TB after.

<figure>
  <img src="/blog/clickhouse-observabilite-conference-2026/valentin-levier-qonto.jpg" alt="Valentin Levier in front of the slide “Observability at Qonto with ClickHouse”" loading="lazy" />
  <figcaption>Valentin Levier, SRE at Qonto, during his talk.</figcaption>
</figure>

Almost all of their services are instrumented, and they thought it was a waste to open that database only during incidents. So they wired automation into it. The example I’m keeping is the canary deployment. While their progressive delivery tool shifts traffic to the new version, an internal service queries the traces in ClickHouse to check the health of the service. Its answer settles it: the version goes to production, or it is rolled back. Valentin put it this way: “It’s the check that decides whether the deployment is good or not.”

## Ringover: ClickHouse on their own servers

I also liked the talk from Martial Salgues, who has been in charge of observability at Ringover for four years. Ringover is a telecom operator for businesses, and they run everything on-premise: their own servers, in four data centers in France and three in the United States. So ClickHouse runs on their hardware, in its open source version, operated by the team. Vendor pricing models, based on node or vCPU counts, did not fit their size.

The numbers give the scale. More than 500 physical nodes, 13 TB written per day before compression, close to 10 billion rows a day of which 80% are logs, and compression of at least 16x. The cluster fits on three machines with 112 cores and 1 TB of RAM each, at around €10,000 apiece.

<figure>
  <img src="/blog/clickhouse-observabilite-conference-2026/martial-salgues-ringover.jpg" alt="Martial Salgues in front of a slide of figures: 500+ physical nodes, 13.1 TiB written per day, 9.84 billion rows per day, ×16 compression" loading="lazy" />
  <figcaption>Martial Salgues (Ringover) and the numbers behind their self-hosted platform.</figcaption>
</figure>

What I appreciated is that he didn’t hide the hard parts. In early October, a developer ran a query over six months of data, for a service that had been in production for a few days. ClickHouse went through every index on the S3 storage, and the query took more than 439 seconds just to be planned. It never executed, but it saturated the cluster. His conclusion: when you host it yourself, you also have to teach developers how to write their queries.

He also told the story of a recent incident on their US infrastructure. After an update, customers stopped receiving their calls for a few minutes. It took him five to ten minutes to figure out how to parse the telephony logs, which are raw text, then one SQL query to rebuild around 7,000 missed calls: who had tried to reach whom, how many times, and which number to call back. The file went to the customer success team, who could let the affected customers know.

## Where it still falls short

My view is that ClickHouse still has room to grow on integrations, and it is better to know that before committing.

Performance testing comes first. Most observability platforms now ship their own built-in solution for it. ClickHouse doesn’t. For load tests and synthetic monitoring, you have to bring in k6 from Grafana, or another tool.

User session tracking exists, but it will need to improve over time.

And above all, there is access management. In a large organization, you want to plug in your own identity management and decide precisely who sees what, application by application: alerts, sessions, logs. Today I find it still too limited. I hope it gets there.

## On AI, I don’t believe dashboards are going away

Every vendor is moving fast on AI, and ClickStack is too. Its MCP server is a good fit for those uses and, apparently, the results are very good. Qonto already uses it to query its traces in French or in English.

Still, I’m not convinced that our SREs and our dashboard-addicted managers will give up the interface in favor of AI. Especially in organizations running 80,000 or 100,000 machines. At that size, you would rather have the data in front of you, and call on the agent when you need it: to build something, to diagnose, to investigate.

## Is it worth it?

Absolutely. I had invited a few friends, they asked me to keep them posted, and I made [a video about it](https://www.youtube.com/watch?v=DxLE-Ls4huE) (in French).

If the subject interests you, there is plenty to practice on. [The workshop from that morning](https://github.com/Ochakri-CHDB/clickhouse-observability-workshop) is open source on GitHub. A new ClickHouse Cloud account comes with [$300 of credits for 30 days](https://clickhouse.com/pricing). And ClickHouse offers an [observability training path](https://clickhouse.com/learn/observability) in three levels, with free live sessions for the first two.

It is a skill that will be in growing demand. The engine itself is already proven: other observability products sold on the market run on it.
