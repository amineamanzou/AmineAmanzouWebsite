---
title: "Observability audit: 35 checks before discussing tools"
locale: "en"
articleSlug: "observability-audit-maturity-checklist"
translationKey: "observability-audit-maturity-checklist"
publishedAt: "2026-09-17"
label: "Observability / Audit"
readTime: "12 min"
excerpt: "A useful maturity checklist does not count dashboards. It verifies whether teams detect impact, investigate, control telemetry pipelines and turn incidents into decisions."
heroImage: "/blog/audit-observabilite-checklist-maturite/hero-maturity-audit-loop.svg"
heroImageAlt: "An audit checklist connecting user experience, telemetry, pipelines, cost, operations and governance"
pillar: "observability"
intent: "commercial"
primaryQuery: "observability maturity assessment"
relatedOffer: "diagnostic"
seoTitle: "Observability maturity assessment: 35-point checklist"
seoDescription: "Assess observability maturity with 35 checks covering SLOs, instrumentation, pipelines, cost, on-call response and governance."
keywords: ["observability maturity assessment", "observability audit", "observability checklist", "SLO", "OpenTelemetry"]
proofLevel: "documentation"
---

A platform can have agents on every server, dashboards for every team and an APM contract large enough to deserve its own budget line.

During the incident, someone still copies one identifier from support into three search engines.

That is usually when the tool inventory stops being a credible measure of maturity.

The framework below assembles operational questions derived from public SRE principles and OpenTelemetry data models. It is neither a Google standard nor a CNCF certification. It is a checklist to verify in the field.

Each item needs evidence: a query, alert, trace, configuration, incident history, retention rule, owner or decision. “The product supports it” does not yet prove an operational capability.

## 1. Start from the experience being delivered

1. **Critical journeys are named.** The team knows which interactions must survive: login, payment, search, ingestion, deployment or batch processing.
2. **Each journey has a measurable outcome.** Success, latency, freshness, correctness, durability or coverage is defined from the user’s perspective.
3. **SLIs measure close enough to the user.** An internal metric does not hide requests that never reach the service.
4. **Objectives have an owner.** A person or team can trade reliability against cost and delivery speed.
5. **Business and technical data connect.** The team can relate degradation to a population, version or important operation without exposing unnecessary personal data.

A team that cannot describe the service outcome will mainly produce component metrics. Those metrics may be accurate while missing the impact that matters.

## 2. Preserve context during instrumentation

6. **Services have stable identity.** `service.name`, version, environment and other resource attributes remain consistent across teams.
7. **Context crosses boundaries.** HTTP, messaging, jobs and asynchronous calls propagate or link the required identifiers.
8. **Important logs are structured.** Fields used during investigations do not live only inside free text.
9. **Logs and traces correlate.** An application event can be attached to the operation that produced it.
10. **Business attributes are governed.** Their names, purpose, cardinality and sensitivity are known.

Automatic instrumentation can cover many libraries. It does not automatically know the business outcome, tenant identity or decision an application just made.

## 3. Operate the telemetry pipeline as a production service

11. **Telemetry paths are mapped.** Receivers, processors, queues, exporters and destinations are visible end to end.
12. **The pipeline exposes its own telemetry.** Refusals, retries, queues, memory, backpressure and export failures are monitored.
13. **Backend failure has been tested.** The team knows buffering duration, restart behavior and acceptable loss.
14. **Configuration uses controlled delivery.** Validation, canaries, rollback and history replace direct production edits.
15. **Capacity is connected to volume.** Log lines, spans, datapoints, average size and bursts support CPU, memory, network and storage estimates.

The observability pipeline is often treated as plumbing that watches other services. It remains a distributed system with its own queues, limits, dependencies and failure modes.

## 4. Know what is stored and what it costs

16. **Retention serves a use case.** Incident response, audit, trends or regulation justify the duration.
17. **Cardinality is measured before it becomes a bill.** High-cardinality fields are identified by signal and backend.
18. **Indexing is intentional.** Not every attribute is indexed as though it must answer in milliseconds.
19. **Cost is attributable.** The team can connect growth to a source, environment, pipeline or new duplication.
20. **Deletion is verifiable.** Personal or sensitive data has a policy, access controls and a tested removal path.

Cost is more than the ingestion price displayed by a vendor. It includes collection, transport, buffers, storage, queries, retention and the human effort required to maintain exceptions.

## 5. Detect with less noise and investigate better

21. **Pages require immediate action.** If the on-call engineer cannot do anything, the signal probably belongs in a ticket or dashboard.
22. **Alerts track a symptom or budget.** Internal thresholds do not wake someone without a clear link to impact or imminent failure.
23. **Duplicates are grouped.** One incident does not produce fifteen notifications describing the same cause.
24. **Alerts provide starting context.** Service, impact, runbook, time window, recent change and owner are available without a treasure hunt.
25. **Detection gaps are tracked.** Incidents found by support or users become input for improving SLIs and alerting.

Google SRE recommends actionable alerts and a high enough signal-to-noise ratio to protect on-call work. The target is not a magic alert count. It is enough cognitive capacity to handle the next serious page.

## 6. Make governance visible

26. **Every service and pipeline has an owner.** Ownership does not depend on whoever happens to remember the system.
27. **Access follows responsibility.** On-call engineers can investigate without excessive permanent privileges.
28. **Destinations are approved.** Adding an exporter or a copy of sensitive logs is recorded and reviewed.
29. **Secrets are separated from configuration.** Tokens, certificates and credentials have explicit rotation and scope.
30. **Changes are auditable.** The team can find who changed a rule, pipeline, retention policy or critical dashboard.

Governance becomes visible when an operational question finds an owner and evidence. A forgotten RACI document is not enough.

## 7. Turn incidents into improvement

31. **Significant incidents produce a timeline.** Facts, decisions, unknowns and effects are separated.
32. **Actions repair the system.** They do not merely ask people to be more careful.
33. **Actions have a due date and owner.** Closure requires evidence, not just a status change.
34. **Exercises replay failure modes.** Backend outage, queue saturation, expired certificates and broken context are tested before the next incident.
35. **Maturity is reassessed through real cases.** The score changes when investigation and decision capabilities change, not when new licenses arrive.

## Use the checklist without manufacturing a reassuring score

I classify each check using four states: absent, partial, operational or recently verified.

`Operational` means the process exists and a team can use it. `Recently verified` requires dated evidence: an exercise, incident, replayed query, restoration or load test.

I do not immediately average everything into a score out of 100. A gap in context propagation, data security or rollback capability can matter more than ten well-documented dashboards.

The assessment should show:

- user journeys with poor coverage;
- investigations that are impossible or too slow;
- pipeline and data risks;
- costs without owners;
- three to five improvements with exit evidence.

A useful assessment does not reward telemetry volume. It reveals where a team loses time, context or the ability to decide when production starts telling a different story than the dashboard.

## Sources

- [Google SRE — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
- [Google SRE Workbook — Implementing SLOs](https://sre.google/workbook/implementing-slos/)
- [Google SRE — Being On-Call](https://sre.google/sre-book/being-on-call/)
- [OpenTelemetry — Signals](https://opentelemetry.io/docs/concepts/signals/)
- [OpenTelemetry — Resource semantic conventions](https://opentelemetry.io/docs/specs/semconv/resource/)
