---
title: "The OpenTelemetry control plane I would build"
locale: "en"
articleSlug: "opamp-fleet-management-control-plane"
translationKey: "opamp-fleet-management-control-plane"
publishedAt: "2026-07-15"
label: "OpAMP / Control plane"
readTime: "6 min"
excerpt: "After five articles and a complete lab, this is the OpenTelemetry control plane I would build: pipeline-first, stable identity, safe rollouts, observability, and an exit path from day one."
sourceUrl: "https://www.linkedin.com/pulse/opentelemetry-control-plane-i-would-build-amine-amanzou-axfce"
heroImage: "/blog/opamp-fleet-management-control-plane/article-05-cover-control-plane.en.png"
heroImageAlt: "Blueprint for a pipeline-first OpenTelemetry control plane"
---

I have been circling around this topic for a year and a half.

Companies have asked me to test their solutions. I have seen clean inventories, well-organized configuration forms, and collectors reporting green. I also had a consulting call with VCs looking at the observability market before investing.

The same question kept coming back: if you had to build the product, what would you put in it?

After this lab, I would start with a fairly unglamorous screen.

I want to see a pipeline end to end: which agent collects what, which transformations are applied, where the data goes, which team owns it, how much that path costs, and what could break if I change it.

Until the product can answer that, adding another form mostly gives us a better-organized version of the plumbing.

## Start with the pipeline, not the agent table

Most interfaces start with inventory. That makes sense: one row per agent, a status, a version, a few labels. You can build something presentable fairly quickly.

The real work begins when a team asks why its logs stopped arriving, why volume doubled, or who added an exporter to a sensitive destination.

At that point, the green row does not help much.

I want to follow the complete path: receiver, processor, exporter, destination. I want to see volumes, errors, sampling rules, transformations, sensitive data, and the owner of every step.

![The topology the product needs to make readable](/blog/opamp-fleet-management-control-plane/article-05-pipeline-topology.en.png)

If a configuration adds a second output for the same logs, the volume impact should be visible before rollout. If a processor removes an attribute used by the SIEM, the product should show the dependency. If nobody owns a critical pipeline, that gap should be visible too.

That is when a control plane becomes useful beyond the team that already knows OpenTelemetry YAML by heart.

## Give agents an identity that survives restarts

The lab left me with enough stale rows to stop treating identity as a detail.

I would build a stable, renewable, and revocable agent identity. It would be tied to operational attributes: environment, site, team, criticality, operating system, service, and rollout ring.

A `hostname` helps you find a machine. It is not enough to decide where a configuration should go.

Permissions also need to be separated. Reading inventory, modifying a configuration, approving a rollout, triggering a rollback, and administering secrets are different actions.

The invalid-token test reminded me of a simple rule: until the server refuses something, the secret protects nothing.

I therefore want scoped credentials, overlapping rotation, testable revocation, and usable history. Not only a `Regenerate` button that nobody wants to touch in production.

## Treat configuration as a production change

Sending YAML remotely is the easy part to demonstrate.

The product first needs to explain what that YAML will change.

I would run every version through syntax and semantic validation, then estimate its impact: destinations affected, likely volume increase, sensitive data, components missing from some agents, and teams concerned by the change.

Only then does rollout begin.

A small `canary` cohort receives the configuration first. A few agents are enough to verify that the configuration starts, converges, and does not damage either volume or the data path. If a threshold moves beyond what was accepted, the control plane stops distribution and prepares the rollback.

![A rollout needs a stopping point before Friday evening](/blog/opamp-fleet-management-control-plane/article-05-safe-rollout.en.png)

The rings are simply groups exposed to the change one after another.

The `canary` is deliberately small. The `pilot` is larger and, more importantly, representative of the real estate: several operating systems, sites, or criticality levels. `Broad` is the general deployment once the first signals have been checked. The `holdback` keeps part of the estate on the previous version, either to compare behavior or preserve a fallback path.

This progression avoids treating 100,000 agents as a flat list and discovering the same mistake everywhere at once.

I am keeping the lab limit visible: I did not test 100,000 agents. That scale is a design constraint. It forces us to think about cohorts, fan-out, reconnect storms, per-agent state, and convergence time before claiming to build for the enterprise.

## Observe the control plane itself

A tool responsible for operating telemetry cannot become the black box of the system.

I want to know how many connections are active, which agents were rejected, the age of the last effective configuration, convergence latency, errors per cohort, reconnects, stale entries, and volume handled by each pipeline.

More importantly, I want to connect those signals to an action.

A reconnect spike after deployment should point to the version involved. A volume increase should show the source and the destination that will charge for it. A blocked cohort should explain whether the problem comes from a missing component, an expired secret, or a rejected configuration.

Otherwise we end up with another dashboard and a terminal open next to it to understand what the dashboard is trying to say.

## Use AI where it actually removes friction

Yes, I would put a conversational interface and an MCP server in the product.

I would not let a model push a configuration to production on its own.

I would use it to translate the plumbing: explain a configuration to an application team, find pipelines probably sending the same data twice, summarize why a cohort is not converging, propose a filter, or prepare a rollback plan.

A question such as "what is sending these logs, where are they going, and how much does it cost?" crosses inventory, configuration, topology, and metrics. That is a good use case for a tool-using agent.

The production decision remains attached to deterministic controls: policy, validation, approval, thresholds, and audit.

AI reduces the distance between intent and configuration. It does not replace guardrails.

## Build the exit while everything still works

In labs and migrations, exit always arrives too late in the discussion.

I would put it in the product from the beginning.

A team needs to find every agent still dependent on the control plane, export configurations, identify secrets that need replacing, change destinations, and retain the history required for audit.

![Exit is part of the product](/blog/opamp-fleet-management-control-plane/article-05-exit-path.en.png)

I would even provide an exit dry run: this is what remains coupled, this is what can be exported, this is what has to be rebuilt, and these are the agents that have not yet converged on the new path.

Lock-in rarely lives in a single API. It settles into secrets, conventions, dashboards, procedures, and team habits.

A product that makes those dependencies visible earns more trust than a portability promise on a marketing page.

## The product behind the protocol

OpAMP would remain the management loop. OpenTelemetry would remain the collection and configuration surface.

The product would live around them: identity, permissions, secrets, topology, validation, rollout, rollback, cost, audit, observability, and exit.

I would not try to rebuild a vendor agent in a different color. I would give teams a shared view of what they collect and the consequences of a change.

That is also why the market is converging on this layer. Dynatrace's acquisition of Bindplane, Fleet Management at Grafana, and Fleet at Elastic all show value moving toward fleet and pipeline control.

The lab mostly taught me that this value does not come from an OpAMP server completing a handshake.

It appears when a team can change telemetry without moving blindly, understand the impact before deployment, stop a rollout, and leave the product without reinstalling the whole estate.

That is the control plane I would build.

If you have read all five articles, thank you for following this rather niche exploration all the way through.

I would now like your feedback on the series. Does this view of fleet management match what you see in the field? What is still missing from the product or the benchmark?

Sources:

- Dynatrace to Acquire Bindplane: https://www.dynatrace.com/news/press-release/dynatrace-to-acquire-bindplane/
- Grafana Fleet Management docs: https://grafana.com/docs/grafana-cloud/send-data/fleet-management/
- Grafana Fleet Management architecture: https://grafana.com/docs/grafana-cloud/send-data/fleet-management/introduction/architecture/
- OpAMP specification: https://opentelemetry.io/docs/specs/opamp/
- Public lab repository and evidence: https://github.com/amineamanzou/opamp-enterprise-lab
- Product blueprint and 100k reference architecture: https://github.com/amineamanzou/opamp-enterprise-lab/blob/main/docs/study/blueprints.md
- Claim ledger: https://github.com/amineamanzou/opamp-enterprise-lab/blob/main/docs/articles/opamp-enterprise-adoption/claim-ledger.md
