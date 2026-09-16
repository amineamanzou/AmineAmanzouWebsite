# Observability audit — 35 checks

For each check, record one of `absent`, `partial`, `operational` or `verified`, then link the evidence and name an owner.

| # | Check | Status | Evidence | Owner | Next verification |
|---:|---|---|---|---|---|
| 1 | Critical user journeys are named |  |  |  |  |
| 2 | Each journey has a measurable outcome |  |  |  |  |
| 3 | SLIs measure close enough to the user |  |  |  |  |
| 4 | Reliability objectives have an owner |  |  |  |  |
| 5 | Business and technical context connect safely |  |  |  |  |
| 6 | Services use stable resource identity |  |  |  |  |
| 7 | Context crosses synchronous and asynchronous boundaries |  |  |  |  |
| 8 | Important logs are structured |  |  |  |  |
| 9 | Logs and traces correlate |  |  |  |  |
| 10 | Business attributes have governed names, purpose, cardinality and sensitivity |  |  |  |  |
| 11 | Telemetry paths are mapped end to end |  |  |  |  |
| 12 | Pipelines expose refusals, retries, queues and export failures |  |  |  |  |
| 13 | Backend failure and buffering behavior have been tested |  |  |  |  |
| 14 | Configuration uses validation, canary and rollback |  |  |  |  |
| 15 | Capacity is linked to telemetry volume |  |  |  |  |
| 16 | Retention serves an explicit use case |  |  |  |  |
| 17 | Cardinality is measured by signal and backend |  |  |  |  |
| 18 | Indexing choices are intentional |  |  |  |  |
| 19 | Cost can be attributed to a source or pipeline |  |  |  |  |
| 20 | Sensitive-data deletion is verifiable |  |  |  |  |
| 21 | Every page requires immediate human action |  |  |  |  |
| 22 | Alerts track symptoms, SLOs or imminent hard limits |  |  |  |  |
| 23 | Duplicate notifications are grouped or inhibited |  |  |  |  |
| 24 | Alerts provide owner, impact, runbook and recent-change context |  |  |  |  |
| 25 | Incidents discovered outside alerting are reviewed |  |  |  |  |
| 26 | Every service and telemetry pipeline has an owner |  |  |  |  |
| 27 | Investigation access follows operational responsibility |  |  |  |  |
| 28 | New exporters and destinations are recorded and reviewed |  |  |  |  |
| 29 | Secrets are separated from configuration and rotated |  |  |  |  |
| 30 | Changes to rules, pipelines and retention are auditable |  |  |  |  |
| 31 | Significant incidents produce a factual timeline |  |  |  |  |
| 32 | Follow-up actions repair systems rather than blame people |  |  |  |  |
| 33 | Actions have owners, due dates and closure evidence |  |  |  |  |
| 34 | Exercises replay important failure modes |  |  |  |  |
| 35 | Maturity is reassessed using recent cases |  |  |  |  |

Do not average the rows before identifying blocking gaps. Missing rollback, data protection or context propagation can matter more than several verified dashboards.
