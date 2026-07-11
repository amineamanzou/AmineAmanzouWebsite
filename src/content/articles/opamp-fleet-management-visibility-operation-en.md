---
title: "Seeing an agent in a UI does not mean you operate it"
locale: "en"
articleSlug: "opamp-fleet-management-visibility-operation"
translationKey: "opamp-fleet-management-visibility-operation"
publishedAt: "2026-07-11"
label: "OpAMP / Fleet operations"
readTime: "8 min"
excerpt: "An agent visible in a UI is not necessarily operated by it. The lab shows where visibility, lifecycle, security, and trust in the inventory actually stop."
heroImage: "/blog/opamp-fleet-management-visibility-operation/cover-en.png"
heroImageAlt: "Boundary between seeing an agent in a UI and operating it in production"
---

In the previous article, I described the benchmark lab: the five approaches, the infrastructure, the simulated load, and the labels I used to avoid mixing public documentation with reproduced evidence.

This time, I am moving to the results and the evidence kept during the runs.

I stopped services, replaced a token with an invalid value, reconnected collectors, and left rows from previous tests in the inventory.

That is when the interfaces started telling a less polished story.

A green row can confirm that an agent is responding. It does not necessarily tell you who installed it, who validates its configuration, who restarts it, or what happens when a rollout goes wrong.

In a small lab, I could still track those responsibilities through my scripts. At a customer with several teams and a few thousand machines, that ambiguity ends up in the on-call shift.

## The green line stops somewhere

The Elastic Fleet OTel-only path let me display an upstream `otelcol-contrib` collector in Fleet without installing Elastic Agent.

I could see inventory, status, component health, and effective configuration. Documents also reached Elastic. If you are trying to find a forgotten collector on a VM, that visibility is already useful.

But whenever I needed to act, I went back to the terminal.

Restart went through systemd. Deployment and cleanup went through Ansible or my lab scripts. Configuration validation, rollback, and part of the credential lifecycle remained outside Fleet.

![The boundary between visibility and operation](/blog/opamp-fleet-management-visibility-operation/article-04-visibility-boundary.en.png)

The lab therefore supports a precise statement: Fleet could see my OpenTelemetry Collector and its effective configuration. In this scenario, it did not own the collector's full lifecycle.

That limitation is not a defect uncovered by the lab. It matches the documented product boundary for this path.

Elastic documents Fleet as a centralized monitoring surface for OpenTelemetry Collectors. Fleet receives their health, configuration, and status through OpAMP, but it does not deploy them. Their policies are managed and cannot be edited. Central management for EDOT and upstream collectors is still marked as `Planned` in the current capability table.

To get management capabilities such as Fleet-driven upgrades, detailed upgrade tracking, rolling upgrades, or restarting a stalled upgrade, you need to use Fleet-managed Elastic Agent. That is the model where Elastic currently carries this lifecycle.

The distinction matters because customers pay for both sides. They pay for the console, then they still pay for the automation, runbooks, and people who take over when the console reaches the end of its responsibility.

I have seen that boundary outside the lab as well.

An engineer I had recommended joined a customer that had built its own fleet manager. The teams were fairly proud of it. The intention made sense: standardize collection without depending on a vendor and keep control internally.

In daily operations, though, teams still modified their configurations through Ansible after deployment.

The console showed agents, but it did little to explain the pipeline, version changes, expose ownership, or make rollback practical. It had not removed the plumbing. It had added another screen above it.

This is not an exotic failure. It is what happens when inventory is built first because it is the most visible part of the product, while lifecycle is postponed.

## Product comfort comes with operational trade-offs

Bindplane gave me an experience closer to what I expect from an operating product.

The installation command was generated for me. The BDOT agent connected with its enrollment secret. The interface exposed type, version, operating system, labels, remote address, and configuration. The builder also made sources and destinations easier to understand than YAML opened in a terminal.

That comfort matters on day two. When you need to understand why a file is not reaching the right destination, seeing the pipeline saves more time than adding another agent table.

The coupling becomes visible when you leave the expected path.

I built an OCB distribution with the upstream OpAMP extension and tried the documented endpoint. The server returned `403 Forbidden`. Public documentation reserves the non-BDOT path for Enterprise/BYOC capabilities and explains that the standard OpAMP extension remains limited for remote configuration.

That does not make Bindplane a bad product. It makes the contract more concrete.

The product absorbs part of the complexity, but you still need to test what you get back when you change models: configurations, secrets, destinations, conventions, history, and operating procedures. Changing the OpAMP server URL does not carry all of that with it.

## On the open path, the backlog belongs to me

With the custom server built on `opamp-go`, I controlled the protocol, the inventory, and the scenarios. I could simulate agents, trigger a control-plane outage, and instrument exactly what I wanted.

For understanding OpAMP, it was the most useful path in the lab.

For running it in production, it opened a much less entertaining backlog: persistence, authentication, IAM, audit, configuration validation, progressive rollout, rollback, stale-entry cleanup, metrics, a stable API, runbooks, and support.

The token test summarizes the problem well.

I replaced `OPAMP_AUTH_TOKEN` with an invalid value. In the implementation I tested, the agent could still connect and refresh its inventory.

At that point, the token was not a security boundary. It was an environment variable with a reassuring name.

To turn it into real access control, the server has to validate it, revoke it, support overlapping rotation, scope it, and keep an audit trail of rejected connections. The protocol provides the management loop. Securing that loop remains product work.

## Old agents do not disappear on their own

After several runs, Fleet still displayed three offline `otelcol-contrib` rows. Bindplane kept the old BDOT agent as `Disconnected`. The custom server inventory still contained 10,022 agents from previous tests.

![Stale rows eventually break trust in the inventory](/blog/opamp-fleet-management-visibility-operation/article-04-stale-inventory.en.png)

In a screenshot, that looks like housekeeping.

In a real estate, I need to know whether a row represents a live machine, a reinstall, a duplicated identity, a load test, or an agent that disappeared three weeks ago. Otherwise rollouts target the wrong population, alerts accumulate, and audits begin with a discussion about whether the inventory can be trusted.

A team can remove three rows by hand. It cannot safely reconcile 10,022 ambiguous identities before every deployment.

TTL, reconciliation, and deletion rules therefore belong in the control plane. They are not UI polish.

## The useful outage in the lab

I then stopped the custom OpAMP server while the collector already had a valid local configuration.

The collector kept exporting to Elastic. During the outage window, the backend received 1,898 host and supervisor events.

![The data path continues during the OpAMP server outage](/blog/opamp-fleet-management-visibility-operation/article-04-outage-continuity.en.png)

That is an architectural property I want to preserve: the control plane can be unavailable without automatically taking down an already configured data path.

The number does not prove that the whole platform is resilient.

It tells us nothing about server high availability, secure enrollment, 100,000 agents reconnecting after an outage, convergence of a new configuration, or possible data loss before the backend. It only shows that, in this scenario, the collector did not need the OpAMP server to keep exporting its local configuration.

That limit matters as much as the result.

## What I learned before building anything

The benchmark did not give me a winner.

It showed me where each approach puts responsibility back on the platform team.

Fleet OTel-only gave me visibility while lifecycle remained in my tools. Bindplane removed more product friction, with a model that needs to be accepted and tested all the way through exit. The custom path gave me control, then handed the entire product backlog back to me.

OpenLit added another very practical reminder. Fleet Hub listed collectors and the API exposed effective configuration. In the self-hosted version I tested, the configuration panels still remained stuck on `Loading...`: Monaco was loaded from a CDN while the CSP only allowed locally served scripts.

On a connected laptop, you fix it and move on. In an air-gapped environment or one mediated through Artifactory, that detail decides whether the interface can actually be operated.

That is the filter I would keep when evaluating a control plane: where does the team reopen the terminal, which risk remains with them, and what evidence do they keep after a change?

Seeing the agent in a UI is only the beginning of the answer.

The final article starts from there. I will describe the product I would build around OpAMP after spending this much time looking at what is still missing between the protocol, the interfaces, and the real work teams have to do.

Sources:

- Public lab repository and evidence: https://github.com/amineamanzou/opamp-enterprise-lab
- Claim ledger: https://github.com/amineamanzou/opamp-enterprise-lab/blob/main/docs/articles/opamp-enterprise-adoption/claim-ledger.md
- Fleet-management path comparison: https://github.com/amineamanzou/opamp-enterprise-lab/blob/main/docs/study/fleet-management-comparison.md
- Lab methodology: https://github.com/amineamanzou/opamp-enterprise-lab/blob/main/docs/study/lab-methodology.md
- Final exit-drill results: https://github.com/amineamanzou/opamp-enterprise-lab/tree/main/docs/evidence/runs/20260619T223502Z-exit-drill-secrets-outage
- OpenLit runbook: https://github.com/amineamanzou/opamp-enterprise-lab/blob/main/docs/runbooks/openlit-opamp.md
- Elastic, Monitor OpenTelemetry Collectors in Fleet: https://www.elastic.co/docs/reference/fleet/monitor-otel-collectors
- Elastic Agent as an OpenTelemetry Collector: https://www.elastic.co/docs/reference/fleet/elastic-agent-as-otel-collector
- Elastic, Upgrade Fleet-managed Elastic Agents: https://www.elastic.co/docs/reference/fleet/upgrade-elastic-agent
