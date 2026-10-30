# NadiShield product roadmap

Roadmap items are hypotheses and planned work, not delivery commitments.

## Stage 0 — Prototype and discovery

- [x] Local FastAPI prototype for sites, assets, changes and approvals.
- [x] Synthetic event ingestion and basic approved-window correlation.
- [x] Limited Zeek connection metadata endpoint.
- [x] SHA-256 linked audit log and verification endpoint.
- [x] Company website and synthetic browser demo.
- [ ] Interview small hydro operators, OT engineers and SCADA integrators.
- [ ] Validate a budget owner and procurement path.

## Stage 1 — Secure engineering foundation

- [ ] Authentication and MFA.
- [ ] Role-based access and requester/approver separation.
- [ ] Tenant/site isolation with negative authorization tests.
- [ ] Database migrations and backup/restore tests.
- [ ] Structured logs, error handling, API versioning and rate limits.
- [ ] Secrets management and hardened deployment guide.
- [ ] Threat model review and secure code review.

## Stage 2 — Reliable event evidence

- [ ] Canonical event schema and per-source provenance.
- [ ] Zeek normalization beyond the prototype subset.
- [ ] Suricata alert adapter.
- [ ] Deduplication, replay protection and clock-drift handling.
- [ ] Signed audit checkpoints stored outside the primary database.
- [ ] Evidence export with redaction and access logging.
- [ ] Parser fixtures, fuzz tests and false-positive benchmarks.

## Stage 3 — Lab validation

- [ ] Simulated plant network with safe PLC/SCADA emulation.
- [ ] Repeatable approved/unapproved maintenance scenarios.
- [ ] Passive TAP/SPAN deployment procedure.
- [ ] OT safety review and installation checklist.
- [ ] Independent penetration test and remediation report.
- [ ] Design-partner feedback and measured workflow outcomes.

## Stage 4 — Controlled pilot decision

A pilot proceeds only if the operator, site owner, OT engineer and security stakeholder approve the scope, data handling, topology, change plan, rollback procedure, acceptance criteria and incident contact path. No roadmap milestone alone authorizes a live deployment.
