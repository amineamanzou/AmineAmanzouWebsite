---
title: "How I benchmarked 5 OpenTelemetry fleet management approaches"
locale: "en"
articleSlug: "opamp-fleet-management-benchmark"
translationKey: "opamp-fleet-management-benchmark"
publishedAt: "2026-07-07"
label: "OpAMP / Benchmark"
readTime: "7 min"
excerpt: "To separate marketing from reality, I compared five OpenTelemetry fleet management paths in a logs-only lab: open OpAMP, Elastic Fleet OTel-only, Bindplane BDOT, opamp-server-py, and OpenLit Fleet Hub."
sourceUrl: "https://www.linkedin.com/pulse/how-i-benchmarked-5-opentelemetry-fleet-management-amine-amanzou-qytke/"
heroImage: "/blog/opamp-fleet-management-benchmark/cover-en.png"
---

After the first two articles, I could easily have stayed at the market level.

Vendors are converging toward control plane offers. Customers talk about governance, even when they use the words "fleet management". OpAMP gives an interesting open source base.

But at that point, it is still just a reading of the market.

And on a subject like this, reading is not enough. You need to see what the products actually take over once you put them in a lab: enrollment, identity, remote configuration, lifecycle, secrets, inventory, exit path, control plane failure.

For that, a lab is still the simplest way to separate marketing from reality.

## The scope

I deliberately worked logs-only.

Metrics and traces matter too, obviously. But logs already surface a lot of operational problems: local files, parsers, labels, volumes, secrets, destinations, restarts, bad configuration, ingestion cost.

If a control plane already gets blurry on that scope, adding traces, metrics, profiles, SIEM constraints and regulatory pressure will not make the situation easier to read.

The shared backend in the benchmark mostly served as a fixed point.

That choice says nothing about a target architecture. I mainly needed a backend I could bring up quickly, with dashboards, data views, queries and screenshots I could keep as evidence.

The important part was to separate two paths that quickly get mixed together in discussions.

The data path is the path followed by the data. In this lab, it answers a simple question: do the synthetic logs actually reach the backend?

The control path is the path used to operate the agent. Here, the question becomes: who enrolls the agent, who gives it an identity, who pushes configuration, who sees its state, who restarts it, who audits it, who cleans it up?

Both can look like they work at the same time. That is the trap. A pipeline can send logs correctly while the product that is supposed to govern the fleet still leaves lifecycle, secrets or validation in the hands of the platform team.

## The benchmark branches

I compared five families.

![Benchmark branches](/blog/opamp-fleet-management-benchmark/benchmark-branches-map-en.png)

The first branch was the open OpAMP path with `opamp-go`: a custom OpAMP server, an OpenTelemetry Collector built with OCB or `otelcol-contrib`, and a supervisor on the host side. This is the most instructive path when you want to understand what the protocol gives you once you have to build the product around it.

The second branch was Elastic Fleet in OTel-only mode. I wanted to see what an OpenTelemetry Collector looks like in Fleet without installing Elastic Agent. In the lab, the contrib distribution of the OpenTelemetry Collector appeared in Fleet through OpAMP, with status, health, effective configuration and ingestion toward the shared backend.

The third branch was Bindplane with BDOT. There, the subject shifts a bit: onboarding, inventory, Connected or Disconnected states, configuration builder, sources, destinations, and the friction of leaving toward a more open OpAMP path.

The fourth branch was `opamp-server-py`. It mainly helped me measure the work needed to move from a usable OpAMP base to a UI that operators can actually use: inventory, state, configuration, readable errors and a productization path.

OpenLit Fleet Hub deserves its own paragraph.

It was not just a documentation line to quote. In the lab, Fleet Hub did list OpenTelemetry Collectors through OpAMP, with status and health. The API also exposed effective configuration. But self-hosting surfaced a very concrete friction: the configuration panels stayed stuck on `Loading...` because Monaco was loaded from a CDN while the deployment CSP only allowed self-hosted scripts.

For a lab connected to the Internet, it looks like a UI detail. For an enterprise platform, airgapped or mediated through Artifactory, it becomes a real packaging question.

Nothing is perfect in a benchmark or in a lab. The important part is to be honest about it.

Elastic Fleet OTel-only, Bindplane BDOT, OpenLit Fleet Hub and the `opamp-go` path do not have the same evidence level. Bindplane OnPrem, for example, was not tested. Some lines were reproduced in the lab, others are only public documentation, blocked, or out of scope.

A doc page, a demo and preserved evidence do not tell the same story.

## The lab infrastructure

The base was simple: Hetzner Cloud, Terraform, Ansible, Taskfile, and evidence collection scripts.

Terraform created the terrain in `lab/infra/hcloud`: Linux VMs, firewall rules explicit by usage, non-secret outputs, then an Ansible inventory.

The design planned one `opamp` VM for the OpAMP server and evidence APIs, one `agent` VM for the host collector and synthetic load, two Kubernetes VMs for cluster scenarios, and an optional `load` VM to isolate load generation.

![OpAMP fleet management architecture](/blog/opamp-fleet-management-benchmark/fleet-management-diagram-en.png)

Ansible then took over.

The playbooks made runs reproducible: host bootstrap, custom OpAMP server, host collector, supervisor, synthetic log generation, Kubernetes scenarios.

Each branch kept its own path: `scenario/elastic-fleet-otel-only-experience`, `scenario/bindplane-otel-experience`, `scenario/openlit-opamp-analysis`, `scenario/opamp-server-py-experience`, plus the drill and exit branches.

The lab was still far from an industrial benchmark platform, but it kept more than a test launched by hand from a laptop, with three screenshots nobody can connect afterwards.

And above all, it stayed frugal. I like to enjoy myself with labs, but cloud costs money and FinOps always ends up asking who pays the bill.

![Benchmark evidence pipeline](/blog/opamp-fleet-management-benchmark/lab-topology-benchmark-en.png)

Every run had to leave a trace: versions, commands, configs, observations, failures, limits, what stayed outside the product, and what had not been tested.

That separation changes a lot.

If I restart a collector with systemd, I cannot later write that the fleet manager owns the lifecycle. I can only write that the product observed the state change while the restart remained external.

The nuance looks small, but I have done enough demos and benchmark platforms to know that this is exactly what makes the difference with customers.

## The criteria I looked at

Contrary to what people often assume, this was not mainly a RAM and throughput question.

I wanted to know what the control plane really takes responsibility for: how the agent joins the fleet, how its identity stays stable, how inventory handles offline or duplicated lines, who pushes remote configuration, who restarts or cleans up, who carries secrets, how a bad configuration is blocked or detected, what happens when the control plane goes down, and what can be proven afterwards.

That is less spectacular than a graph watching RAM, but this feature inventory is what comes back in real discussions.

A buyer wants to know more than one thing: who keeps responsibility when the fleet grows, when a config breaks, when a token leaks, when a team wants to leave the product, or when somebody needs to explain afterwards what changed.

## The simulated load

Precision matters here.

The goal was not to replay the full production of a large enterprise. I wanted to know whether this kind of fleet management can support a company with more than 100k agents to deploy, without turning a small test into an enterprise promise.

The lab used two kinds of load.

First, log volume. I ran a warm-up on the host-agent side at 1k, 5k and 10k logs/s to check that the pipeline kept a coherent shape before talking about management. Here, 10k means 10k logs per second, not 10k agents.

Then, control plane load. For that, I built `opamp-agent-swarm`: lightweight mock agents based on a real `opamp-go` WebSocket client. They report description, health, heartbeat, remote config status and effective config.

The objective was to put pressure on inventory and connections without mixing that signal with collector CPU or ingestion throughput.

The most interesting preserved run goes up to 5,000 mock agents on the `opamp-go` server, with steps at 100, 250, 500, 1,000, 2,000 and 5,000.

The methodology can target 10K agents through `OPAMP_AGENT_SCALE_COUNTS`. But I will not write that every branch is proven at 10K agents. That would be false.

At this stage, 5K mock agents is preserved evidence for the `opamp-go` path. 10K agents remains a target to rerun cleanly, branch by branch, before publishing a comparative result.

![Control plane load with 5,000 simulated OpAMP agents](/blog/opamp-fleet-management-benchmark/opamp-agent-scale-connected-en.png)

A real 100K target would require another level of work: measured steps, server CPU and memory, convergence latency, reconnection storms, state size per agent, persistence, HA, network, security and operational cost.

That is why I put labels in place: `lab-proven`, `source-only`, `not-tested`, `blocked`.

![Evidence label methodology](/blog/opamp-fleet-management-benchmark/proof-labels-methodology-en.png)

It is less marketable. It is also what prevents a benchmark from becoming misleading.

## What the lab actually produced

The final run left useful numbers.

Over a 24h window, I kept 433,515 `app.synthetic.otel` documents, 40,052 `opamp.inventory` documents, 106 `opamp.events` documents, 196 `fleet_server.agent_status` documents, and 1,898 events received during the shutdown window of the custom OpAMP server.

Those numbers prove one limited but important thing: the lab produced observable activity, and some correlations between control plane and data path can be documented.

They are not enough to prove maximum throughput, realistic production behavior or 100k capacity.

They allow a narrower claim: this is what happened in this scenario, with this configuration, at that moment.

For me, that is the right level of evidence before publishing an opinion on a subject as niche as fleet management.

## About the results

Without that discipline, you can tell almost any story.

A green line in a UI quickly becomes lifecycle managed. A visible effective configuration becomes complete remote config. A collector that keeps sending logs becomes a resilience proof. An open protocol gets sold as an enterprise solution. A managed product gets summarized too quickly as total lock-in.

All of these sentences can be true or false depending on the scenario.

The benchmark exists to cut them apart.

In the next article, I will go through the results.

And the first lesson is simple enough: seeing an agent in a UI does not mean you control it.

Sources:

- OpAMP specification: https://github.com/open-telemetry/opentelemetry-specification/tree/main/specification/opamp
- OpAMP Go implementation: https://github.com/open-telemetry/opamp-go
- OpenTelemetry Collector contrib OpAMP extension: https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/extension/opampextension
- Bindplane OTel Collector: https://github.com/observIQ/bindplane-otel-collector
- Bindplane OTel contrib distribution: https://github.com/observIQ/bindplane-otel-contrib
- opamp-server-py: https://github.com/agardnerIT/opamp-server-py
- OpenLit Fleet Hub / OpAMP deployment: https://github.com/openlit/openlit/blob/main/OPAMP_DEPLOYMENT.md
- OpenLit source: https://github.com/openlit/openlit
