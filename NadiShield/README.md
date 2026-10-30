# NadiShield Sentinel

**Change provenance and security evidence for industrial operations.**

NadiShield is an early product concept for relating sensitive OT engineering activity to approved maintenance work. The initial hypothesis is that smaller and distributed industrial operators need a low-friction way to connect work orders, asset scope, access records and passive event metadata without replacing their existing OT security stack.

> **Status: research preview 0.1.** This public page explains the product direction and includes a synthetic browser demonstration. It is not a production OT security appliance, has not been independently assessed, and must not be connected to live plant networks or used for operational decisions.

## Product thesis

NadiShield Sentinel aims to answer one operational question:

> Does the industrial activity we can observe match the work the operator authorized?

The product concept connects four evidence sources:

1. Maintenance request, asset scope and time window.
2. Approval decision and responsible parties.
3. Passive network observations or approved exported metadata.
4. Operator review, disposition and incident evidence.

## What is available today

- Public product website and interactive synthetic event queue at [NadiShield](https://anku0669.github.io/NadiShield/).
- Previous local FastAPI / SQLite research prototype, available as a downloadable development package in the conversation where this project was prepared.
- Preliminary product requirements, architecture, threat model, and staged roadmap in the documentation folder.

The browser demo runs entirely in the browser using fictional events. It does not connect to the API, capture packets, access a plant or detect real attacks.

## Current product boundaries

- No authentication, authorization, tenant isolation, MFA or production access controls in the earlier API prototype.
- No active scanning, inline packet forwarding, traffic blocking, controller commands or automated containment.
- No production Zeek or Suricata connectors; the earlier prototype accepted a limited Zeek connection metadata schema.
- The prototype's SHA-256 audit chain is not immutable against a privileged actor who can rewrite the full database.
- No certification, regulatory approval, independent audit, production readiness or security guarantee is claimed.

## Initial customer hypothesis

Begin discovery with small and distributed hydropower operators and OT/SCADA integrators in Himachal Pradesh and nearby markets. This is a bounded market hypothesis, not validated demand or a claim of market size.

## Documentation

- [Product requirements](docs/PRODUCT_REQUIREMENTS.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Threat model](docs/THREAT_MODEL.md)
- [Security model](docs/SECURITY_MODEL.md)
- [Go-to-market hypothesis](docs/GO_TO_MARKET.md)
- [Customer discovery guide](docs/DISCOVERY_GUIDE.md)
- [Roadmap](docs/ROADMAP.md)
- [Company profile](docs/COMPANY_PROFILE.md)

## Safety

Start with synthetic data, approved exports or an isolated simulator. Any evaluation involving a real facility requires written authorization, OT engineering review, a site-specific safety plan, a formal change record and a rollback procedure. No live deployment is currently offered.

## Naming and legal status

NadiShield is a working name and has not been trademark-cleared. This project page does not imply that a legal entity has been incorporated. See `LICENSE.txt` for the rights notice.
