# Monitoring / observability decision matrix

Use this matrix on one production question at a time. A product name is not an answer: attach a query, a dashboard, a trace, a log or a tested procedure to every `yes`.

| Operational question | Monitoring capability | Observability capability | Evidence to collect |
|---|---|---|---|
| Is a critical journey currently failing? | User-facing SLI, synthetic check or symptom alert | Representative failed requests available for investigation | SLI query, alert rule, sample trace |
| Is the service consuming its reliability margin too quickly? | SLO and error-budget burn rate | Bad events can be segmented by version, region, tenant or dependency | SLO definition, burn-rate query, high-cardinality fields |
| What changed before the symptom appeared? | Deployment and configuration events on the timeline | Change identifiers correlate with affected requests and logs | Release marker, config version, trace attributes |
| Which dependency explains the delay? | Dependency latency and error metrics | Request path and correlated logs show where time was spent | Service map, traces, dependency logs |
| Can support retrieve one reported transaction? | Stable incident and support identifiers | Search crosses logs, traces and business events without manual timestamp copying | Tested support query and access path |
| Can the team estimate the cost of new telemetry? | Volume and retention metrics | Source, attributes, duplication and query cost are attributable | EPS, average size, cardinality and price assumptions |

## Rating

- `Absent`: no evidence exists.
- `Partial`: the signal exists, but the operator must reconstruct context manually.
- `Operational`: the workflow is documented and usable.
- `Verified`: the workflow was replayed during a recent incident or exercise.
