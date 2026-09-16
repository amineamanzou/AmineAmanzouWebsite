# Service level objective template

## 1. Service and journey

- Service:
- User or consumer:
- Critical journey:
- Owner empowered to trade reliability against delivery speed:

## 2. SLI specification

Describe the outcome independently from the available metrics.

> An eligible event is good when...

- Eligible event:
- Good event:
- Exclusions and why they exist:

```text
SLI = good events / eligible events
```

## 3. SLI implementation

- Measurement point: client, synthetic probe, load balancer, application, pipeline or backend
- Query or recording rule:
- Known blind spots:
- Data freshness and completeness:

## 4. Objective

- Target percentage:
- Rolling or calendar window:
- Error budget:
- Reason this target matches user expectations:
- Date for reassessment:

## 5. Error-budget policy

- Fast burn that triggers a page:
- Slow burn that creates a priority ticket:
- Release or rollout restrictions:
- Exception authority:
- Exit evidence required after exhaustion:

## 6. Dashboard and investigation

- SLI and target panel:
- Remaining budget:
- Short- and long-window burn rate:
- Recent changes:
- Dimensions that explain bad events:
- Links to representative traces and logs:

## 7. Validation

- Known incident replayed:
- Incident missed by the SLI:
- SLI movement without user impact:
- Last review date and participants:
