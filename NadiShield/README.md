# NadiShield Sentinel

**Change provenance and security evidence for industrial operations.**

[Open the NadiShield website](https://anku0669.github.io/NadiShield/) · [Browse the project source](https://github.com/anku0669/anku0669.github.io/tree/main/NadiShield)

> **Research preview 0.1.** NadiShield is a product concept and local development prototype. It is not a production OT security appliance, has not been independently assessed, and must not be connected to live plant networks or used for operational decisions.

## Product thesis

NadiShield aims to answer one operational question:

> Does the industrial activity we can observe match the work the operator authorized?

The concept links maintenance requests, asset scope, approval decisions, passive network observations or approved exports, human review and incident evidence. It is intended to work alongside existing OT security systems rather than replace them.

## Repository contents

- `index.html` — public company and product website with synthetic interactive demonstration.
- `app/` — FastAPI / SQLite research prototype.
- `examples/demo.py` — harmless local API demonstration using synthetic events and documentation-only IP ranges.
- `tests/` — API workflow and audit-chain tests.
- `docs/` — product requirements, architecture, threat model, security model, company profile, go-to-market hypothesis, customer discovery guide, roadmap and decision log.
- `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` — project governance and disclosure guidance.

The browser demo is entirely client-side and synthetic. It does not call the API, capture packets, access a plant or detect real attacks.

## Run the API locally

Requires Python 3.10+.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
```

Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for the interactive API documentation.

In another terminal, activate the environment and run:

```bash
python examples/demo.py
```

The demonstration creates synthetic site, asset, maintenance, approval and event records. It does not contact a controller or real network device.

## API outline

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Local health check |
| POST | `/api/sites` | Create a demo site |
| POST | `/api/assets` | Register a simulated asset |
| POST | `/api/changes` | Submit a maintenance change |
| POST | `/api/changes/{id}/approvals` | Record approval or rejection |
| GET | `/api/changes/{id}` | Read change and approval history |
| POST | `/api/events` | Ingest synthetic / exported event metadata |
| POST | `/api/ingest/zeek-conn?site_id={id}` | Ingest a limited Zeek connection record |
| GET | `/api/alerts` | List generated exceptions |
| PATCH | `/api/alerts/{id}` | Update exception status |
| GET | `/api/changes/{id}/report` | Build a simple change evidence report |
| GET | `/api/audit/verify` | Verify local SHA-256 linked audit history |

## Known limitations

- No authentication, authorization, MFA, tenant isolation or production access controls.
- No production deployment configuration, database migration framework, encrypted backups or operational monitoring.
- No production Zeek / Suricata connector; Zeek ingestion is a limited metadata subset.
- The local SHA-256 chain detects some edits but is not immutable against a privileged attacker who can rewrite the database.
- Correlation is deliberately simple and may generate false positives or miss events.
- No certification, regulatory approval, independent audit, production readiness or security guarantee is claimed.

## Development checks

```bash
python -m compileall -q app examples tests
pytest -q
```

## Documentation

- [Product requirements](docs/PRODUCT_REQUIREMENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Threat model](docs/THREAT_MODEL.md)
- [Security model](docs/SECURITY_MODEL.md)
- [Company profile](docs/COMPANY_PROFILE.md)
- [Go-to-market hypothesis](docs/GO_TO_MARKET.md)
- [Customer discovery guide](docs/DISCOVERY_GUIDE.md)
- [Roadmap](docs/ROADMAP.md)
- [Decision log](docs/DECISION_LOG.md)

## Safety and legal status

Use synthetic data, approved exports or an isolated simulator only. Any evaluation involving a real facility requires written authorization, OT engineering review, a site-specific safety plan, a formal change record and a rollback procedure. No live deployment is currently offered.

NadiShield is a working name and has not been trademark-cleared. This project does not imply that a legal entity has been incorporated. See `LICENSE.txt` for the rights notice.
