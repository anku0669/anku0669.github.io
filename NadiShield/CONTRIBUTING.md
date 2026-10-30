# Contributing

Thank you for helping improve NadiShield Sentinel. This repository is an early research preview; contributions should improve correctness, safety, documentation and testability before adding operational capabilities.

## Before opening a change

- Read README.md, docs/THREAT_MODEL.md and docs/SECURITY_MODEL.md.
- Keep the passive-only boundary intact. Do not add controller writes, active scans, inline blocking or automated plant actions.
- Do not include customer data, facility diagrams, credentials, private keys or operational logs in issues, commits or tests.
- Prefer small changes with tests and clear rationale.

## Development setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
python -m pytest -q
```

## Pull request expectations

- Explain the user problem and threat-model impact.
- Include tests for new behavior and failure paths.
- Update product maturity and documentation when a capability changes.
- State whether a claim is implemented, planned or still a hypothesis.
- Do not claim an exception is a confirmed attack without independent evidence.

## Reporting vulnerabilities

Do not use public issues for sensitive vulnerability details. Follow SECURITY.md and avoid testing against any real industrial environment.
