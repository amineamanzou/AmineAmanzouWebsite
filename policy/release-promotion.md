# Release qualification

Production uses the exact image digest tested before publication. The candidate
is built on `refs/heads/codex/factory-promotion/<32 lowercase hex characters>`
with an explicit Paris publication date and production configuration. Its
original SLSA provenance records the candidate source, workflow, run and attempt.
The image serves its public build metadata at `/.well-known/release.json`.

A qualification is an Ed25519 envelope with schema version 1. The signature
covers the decoded payload bytes without reserialization. The pinned public
verification key is `promotion-qualification-public.pem`; private signing
material is never stored in this repository. Qualification tags contain only
`qualification.json`. Task and candidate IDs are exactly 32 lowercase hex
characters. Signed timestamps use valid UTC calendar dates in the canonical
second-precision form `YYYY-MM-DDTHH:MM:SSZ`; fractional seconds and alternate
offsets are rejected. They expire within two hours and cannot authorize a
release on another Paris calendar date.

The main publisher verifies the signature, test and performance budgets,
staging cleanup, original image provenance, current main and the exact merge
parents and tree. It signs the existing digest and adds a custom promotion
attestation using predicate type
`https://theunreliable.engineer/attestations/factory-promotion/v1` with
`qualification`, `releaseSha`, `releaseRunId` and `releaseAttempt`. This
attestation describes promotion; it does not claim the image was built on main.

Daily scheduled publication remains at 05:17 UTC. Scheduled runs, ordinary main
pushes and manual runs without `qualification_ref` produce a
`factory-promotion-request` artifact. Requests retain the requested analytics
and observability flags. Defaults are analytics enabled and observability
disabled. Only a valid qualification can publish the resulting release.

CI/CD artifact metadata fields are at the raw event's top level. Candidate events
include `variant`, `publicationDate`, `treeSha`, `configurationSha256`,
`configuration`, `releaseMetadata` and `buildAttempt`. Production events include
`factoryPromotion`; their top-level `runId` and `runAttempt` identify the main
publication, while `factoryPromotion.buildRunId` and
`factoryPromotion.buildAttempt` identify the
original candidate build. Consumers can wrap the entire raw event as their
normalized payload without introducing another nested payload layer.
