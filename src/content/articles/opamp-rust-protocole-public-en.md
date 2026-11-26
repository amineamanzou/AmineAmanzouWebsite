---
title: "Why I reimplemented the OpAMP protocol in Rust"
locale: "en"
articleSlug: "opamp-rust-protocole-public"
translationKey: "opamp-rust-protocole-public"
publishedAt: "2026-12-10"
label: "Observability / Engineering"
readTime: "4 min"
excerpt: "I reimplemented OpAMP in Rust for fleets of 100,000 assets: why, how agents wrote almost all of the code, and why the protocol is not the part I keep to myself."
heroImage: "/blog/opamp-rust-protocole-public/cover.webp"
heroImageAlt: "The Unreliable Engineer holding a checklist in front of a fleet of 100,000 assets, the MUST and SHOULD counts from the specification and a loop between two configurations"
pillar: "fleet-management"
intent: "informational"
primaryQuery: "opamp rust protocole public"
relatedOffer: "diagnostic"
seoTitle: "Why I reimplemented the OpAMP protocol in Rust"
seoDescription: "I reimplemented OpAMP in Rust for fleets of 100,000 assets: why, how agents wrote almost all of the code, and why the protocol is not the part I keep to myself."
keywords: ["fleet-management", "OpenTelemetry", "opamp rust protocole public"]
proofLevel: "experience"
---

I have clients who want to manage a fleet of 100,000 assets across their IT estate. At that scale, every collection agent you install costs memory, CPU and network, a hundred thousand times over. At current RAM prices, shrinking that footprint is a direct saving.

So I needed to measure the performance of the whole chain, and to keep control over it. If it takes rewriting the supervisor deployed on every machine to make it lighter, I want to be able to do that. That is why I reimplemented the OpAMP protocol in Rust. It was a choice of necessity.

## Where OpAMP stands

[OpAMP](https://opentelemetry.io/docs/specs/opamp/) is OpenTelemetry’s protocol for remotely managing a fleet of collection agents. Each agent reports its state to a server, which sends it its configuration. Its specification is currently in beta. The [official supervisor](https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/cmd/opampsupervisor/README.md), the program that drives a Collector on each machine, is still alpha.

The reference implementation, [opamp-go](https://github.com/open-telemetry/opamp-go), is maturing. There is more and more interest, and companies are using it. It is not yet a project shipped as production-ready.

## Almost everything was written by agents

I mean development agents here, AIs, not to be confused with collection agents. The repository has 196 commits, 182 of them in four days, from June 22 to June 25.

My job was to review, and to make sure we stick to the specification. Otherwise we no longer comply with the standard. So I had every MUST and every SHOULD extracted from the text: 103 MUSTs and 116 SHOULDs in the specification, not counting those in the schema comments. Each one was classified as client side, server side or both, and the server ones became a checklist.

I also watched the opamp-go issues and pull requests, to avoid drifting and to stay feature complete. In November, I realigned the server with version 0.20.0 of the protocol, and I test interoperability against opamp-go 0.25.0.

## What the official supervisor shows

To check that my server really speaks the protocol, I plug it into the official supervisor and a Collector, both unmodified. One of those tests shows clearly where the protocol stops.

I send an invalid configuration. The supervisor does the right thing: the Collector fails to start, and it returns to the previous configuration on its own. Except my server still wanted the invalid version. It offered it again, the supervisor rejected it again, and it started over roughly every five seconds.

<figure>
  <img src="/blog/opamp-rust-protocole-public/rollback-loop-en.svg" alt="Diagram of the rollback loop: the OpAMP server offers an invalid configuration, the Collector fails to start, the supervisor returns to the previous version and reports it, then the server offers the invalid configuration again, roughly every five seconds" loading="lazy" />
  <figcaption>The loop observed with the official supervisor and an unmodified Collector.</figcaption>
</figure>

Each side was following the protocol. Nobody had decided who cancels the intent. That is the job of the product around it.

## The protocol is the part I want to open

I’m up for open-sourcing opamp-rust. Anyone can rewrite this protocol in Rust with agents: the defensible advantage is not there. For a client, it is in the interface around the protocol, as I already wrote in [Seeing an agent in a UI does not mean you operate it](/en/blog/opamp-fleet-management-visibility-operation/).

That is why I keep the product to myself. And also out of perfectionism: I’m not satisfied with it yet. Opening the interface remains possible. But selling an open source product and its support has become risky: you expose your code, and from a security standpoint that is no longer trivial.

The repository is not public yet.

## Rust or Go

For the startup or the small business down the road, whether it is Rust or Go changes nothing. That Rust brings an edge in memory and consumption is something I don’t need to demonstrate. Go has nothing to be ashamed of next to other languages, though, and it remains my second choice.

What I still have to do is measure at scale. My current numbers come from synthetic loads. They are no substitute for a hundred thousand real supervisors running.
