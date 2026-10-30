# NadiShield Sentinel — Architecture

## Logical workflow

```text
Work order + asset inventory + approval decision
                      |
                      v
             Change context store
                      |
                      |            Passive mirror / approved exports
                      |                           |
                      |                           v
                      |                 Event adapters / normalizers
                      |                           |
                      +-------------+-------------+
                                    |
                                    v
                         Correlation and evidence
                                    |
                         +----------+----------+
                         |                     |
                         v                     v
                   Review queue           Audit history
                         |                     |
                         +----------+----------+
                                    |
                                    v
                         Operator report/export
```

## Previous local prototype components

- FastAPI routes for site, asset, maintenance change, approval, event, alert and report workflows.
- Pydantic models for request validation and timezone-aware maintenance windows.
- SQLite for local development persistence.
- Python correlation logic matching sensitive event metadata against approved asset/time scope.
- SHA-256 linked audit records with local verification.
- Synthetic demo workflow and automated tests.

## Current limitations

The prototype has no authentication, authorization, tenant isolation, database migrations, rate limiting, production-grade secret management, TLS termination, external audit anchoring or hardened deployment profile. Zeek support is a limited connection metadata endpoint, not a complete connector. The public browser console is synthetic and independent of the API.

## Target production architecture

1. Authenticated API gateway with tenant-aware authorization.
2. Event adapters with canonical schemas and source provenance.
3. Local durable event queue with deduplication and replay handling.
4. Change-management and identity connectors with scoped service credentials.
5. Explainable correlation engine and operator-configurable rules.
6. Audit service with signed checkpoints anchored outside the main database.
7. Evidence export with redaction, retention controls and access logging.
8. Signed appliance updates, controlled release and rollback validation.

These target components are proposed work, not current capabilities.

## Deployment boundary

Initial evaluation should use synthetic data, exported log files or a mirrored packet feed in an isolated lab. No inline placement, active probing, controller writes, automatic blocking or plant configuration changes are in scope.
