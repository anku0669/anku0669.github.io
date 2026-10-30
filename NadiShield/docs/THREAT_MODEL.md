# NadiShield Sentinel — Initial Threat Model

**Version:** 0.1 · **Status:** Preliminary · **Scope:** Product hypothesis and local API prototype.

This is a working threat model, not a completed security assessment. Review it with application security and OT safety specialists before any pilot.

## Assets to protect

Site and asset inventory; maintenance requests and approval records; vendor identities; network event metadata and raw exports; alerts and analyst notes; incident evidence; audit history; application configuration, database files and future signing keys.

## Trust boundaries

1. Browser or API client to service API.
2. Export files and sensor metadata to ingestion endpoints.
3. Application process to local database.
4. Requester and approver identities to workflow decisions.
5. Future appliance to customer OT monitoring network.
6. Evidence export to customer-controlled recipients.

## Threat scenarios and required controls

| Threat | Potential impact | Required controls |
|---|---|---|
| Unauthenticated API access | Unauthorized changes or data exposure | Authentication, authorization, MFA and network restrictions |
| Cross-site data access | Tenant data disclosure or tampering | Enforced tenant/site authorization and negative tests |
| Forged event metadata | False alerts or missed activity | Source authentication, provenance and parser validation |
| Clock drift or timezone mismatch | Incorrect change-window correlation | Clock-quality metadata, skew bounds and deterministic normalization |
| Audit database rewrite | Evidence integrity loss | External signed checkpoints, separated keys and protected backups |
| Compromised approver | Unauthorized work appears approved | Role separation, MFA and dual approval for critical scope |
| Sensitive log disclosure | Operational information leakage | Encryption, minimization, retention and access controls |
| Parser denial of service | Service availability loss | Size limits, rate limits, queue isolation and fuzz testing |
| Unsafe deployment placement | Operational disruption | OT review, passive TAP/SPAN validation and no inline mode |
| Supply-chain compromise | Malicious software update | Pinned dependencies, SBOM and signed build artifacts |

## Abuse cases to test

- Unknown site IDs, spoofed sensor identities and malformed payloads.
- Out-of-order events, repeated events and extreme timestamp skew.
- Approval attempts by identities lacking authority.
- Audit row modification and deletion.
- Cross-site reads or updates once tenant controls exist.
- Oversized raw payloads and parser edge cases.
- Replay of an old maintenance event into a new maintenance window.
- Overlapping changes with conflicting scope or approval state.

## Safety constraints

No active probing of real industrial assets. No inline routing or automatic blocking. No PLC/HMI writes or operational commands. No tests on customer assets without written authorization and a site-specific OT safety plan.

## Residual risk

The current prototype is unsuitable for production, multi-user use, public exposure or operational decision-making. Identities are not authenticated, event sources are not independently verified, and the audit chain can be rebuilt by a privileged database attacker.
