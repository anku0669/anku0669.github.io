# NadiShield Sentinel — Product Requirements

**Version:** 0.1 · **Status:** Discovery / research preview

## Problem statement

Work orders, access records, asset inventories and network observations are often spread across separate systems. During a review, an operator may be unable to establish whether an engineering session or configuration event was expected, authorized and scoped to the correct asset and time window.

NadiShield aims to provide a change-provenance layer that connects these records into a human-reviewable timeline.

## User and buyer hypotheses

- **Primary user:** OT engineer, instrumentation engineer, maintenance supervisor or security analyst.
- **Economic buyer:** small-generation operator, plant owner, operations head or service provider.
- **Design partner:** OT/SCADA integrator willing to validate event models and deployment constraints.
- **Initial segment hypothesis:** small hydropower operators in Himachal Pradesh and nearby markets.

## Jobs to be done

1. Before maintenance: define who is expected to work, which assets are in scope and when.
2. During maintenance: compare observed metadata with approved context.
3. After maintenance: review discrepancies, capture operator disposition and export evidence.
4. During an incident: assemble a timeline linking approvals, access observations and related events.

## Version 0.1 prototype scope

- Register sites and assets.
- Create maintenance change requests with timezone-aware windows and explicit asset scope.
- Record approval or rejection decisions.
- Accept synthetic or exported event metadata through a JSON API.
- Accept a limited Zeek `conn` record shape as connection metadata.
- Correlate selected sensitive event types with approved change windows.
- Create exceptions for human review when no matching approved change is found.
- Generate a basic change evidence report.
- Verify a local SHA-256 linked audit sequence.

## Explicitly out of scope

Active scanning, exploitation, inline packet forwarding, traffic blocking, PLC/HMI commands, setpoint changes, firmware updates, automatic containment, production remote-access brokering, certification and claims that an exception proves compromise.

## Production requirements still outstanding

- Tenant isolation and authenticated site-scoped authorization.
- MFA and least-privilege roles with requester/approver separation.
- Schema migrations, encrypted storage, backups and secret management.
- Event normalization, deduplication, replay protection and clock-drift handling.
- Externally signed audit checkpoints and protected signing keys.
- Rate limits, size limits, durable queues and monitored error handling.
- Signed updates, SBOM, vulnerability management and independent security review.
- OT safety review and documented passive deployment procedure.

## Pilot measures

Measure timeline reconstruction time, evidence completeness, correlation precision, false-positive burden, ingestion latency, deployment effort, operator trust and willingness to pay. Do not publish performance numbers until measured in controlled tests and reviewed.

## Discovery questions

Which work-order, vendor-access and monitoring systems are in use? Which events are hardest to explain later? What data may not leave the site? Who approves maintenance and who owns budget? What existing products already solve parts of the workflow? What evidence would justify a paid pilot?
