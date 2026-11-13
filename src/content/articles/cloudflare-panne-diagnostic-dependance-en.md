---
title: "Cloudflare is down: how do we know whether the problem is ours?"
locale: "en"
articleSlug: "cloudflare-panne-diagnostic-dependance"
translationKey: "cloudflare-panne-diagnostic-dependance"
publishedAt: "2026-11-26"
label: "Observability / Engineering"
readTime: "3 min"
excerpt: "Use Cloudflare’s November 18, 2025 outage to separate application health, dependency failures and the user’s experience."
heroImageAlt: "Illustration of observability diagnosis and engineering decisions"
pillar: "reliability"
intent: "case-study"
primaryQuery: "cloudflare panne diagnostic dependance"
relatedOffer: "diagnostic"
seoTitle: "Cloudflare is down: how do we know whether the problem is ours?"
seoDescription: "Use Cloudflare’s November 18, 2025 outage to separate application health, dependency failures and the user’s experience."
keywords: ["reliability", "OpenTelemetry", "cloudflare panne diagnostic dependance"]
proofLevel: "documentation"
---

On November 18, 2025, Cloudflare experienced a major outage. Its public report describes a database permission change, an oversized configuration file and a failure in the software consuming that file. [Cloudflare’s incident report](https://blog.cloudflare.com/18-november-2025-outage/).

I am interested in the customer team’s position. It cannot inspect Cloudflare’s internal consoles, but it still needs to decide whether to change anything in its own system. What follows is my analysis, rather than a claim that I handled this particular outage.

## A quiet server can sit behind an unavailable website

Consider a scenario where internal origin checks succeed while users see failures on the public path. Restarting application instances may keep everyone busy without changing that path.

I would want three timestamped observations: an external user journey, the requests actually reaching the origin and an internal origin check. If the public journey fails and traffic stops arriving, clean application logs do not prove that the service is available.

A direct origin test can help when a secure diagnostic path already exists. I would not expose the origin to the Internet during the incident just to create that test. Its access controls and comparison method need to exist beforehand.

## Find the boundary where the request disappears

Times, regions and request identifiers become useful when they connect observations. A global chart can hide a problem affecting one route or user group. A missing trace may simply mean that the request never reached the instrumented service.

I would also check the provider’s status page while keeping the timestamps of our own observations. A public announcement can support a hypothesis; the absence of one does not eliminate a dependency. Recovery needs the same care. A restored component does not yet prove that our user journey works again.

## Make a decision without moving the failure

Switching providers during an outage involves more than changing a DNS record. TLS, security rules, caches and sessions may all be affected. Those paths need rehearsal and a way back.

In an update to users, I would separate observed impact, the current hypothesis and the next check. Saying that a provider has an incident does not explain which functions people can still use.

The exercise I would prepare is straightforward: interrupt a dependency in an isolated environment and check whether the signals locate the broken step. If everyone starts hunting for an application deployment that never happened, there is still diagnostic work to do.
