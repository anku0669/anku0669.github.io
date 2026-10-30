# Security model and deployment boundaries

## Non-negotiable product principles

- **Passive first:** initial design uses mirrored traffic and approved exports. It does not sit inline or actively probe devices.
- **No control-plane actions:** no PLC writes, shutdown requests, setpoint changes, firmware updates or automatic containment.
- **Human review:** an exception signals missing or mismatched context, not proof of compromise.
- **Least privilege:** production roles must separate requester, approver, operator, auditor and administrator responsibilities.
- **Local data control:** on-premises processing is the target for sensitive site data unless a customer explicitly approves another model.

## Prototype controls and gaps

| Control | Status | Notes |
|---|---|---|
| Input schema validation | Basic implementation | Not a complete security boundary |
| Parameterized SQL | Used by prototype service | Still requires code review |
| SHA-256 audit chain | Basic implementation | Not immutable against privileged database rewrite |
| Authentication / MFA | Not implemented | Required before multi-user or network-exposed use |
| Authorization / tenant isolation | Not implemented | Required before customer data is stored |
| Signed external checkpoints | Not implemented | Required for stronger audit integrity |
| Encryption and key lifecycle | Not implemented | Production design and independent review required |
| Secure update process | Not implemented | Required before appliance deployment |

## Safe evaluation sequence

1. Use the synthetic browser demo and local API with documentation-only IP ranges.
2. Validate parsers against generated fixtures and approved log exports.
3. Test in a simulated plant network in an isolated lab.
4. Perform threat modeling, secure code review, dependency scanning and penetration testing.
5. Conduct a written safety and topology review with the asset owner and OT engineers.
6. Only then consider a passive customer-supervised pilot under an approved change plan.

## Data handling

Industrial logs may include device names, network addresses, usernames, vendor identifiers and operational metadata. A production release must define data minimization, configurable retention, access logging, encryption at rest and in transit, protected backups, export controls and secure deletion. Do not send credentials, private keys, process recipes or unnecessary payload contents into the research prototype.

No certification, regulatory approval, independent audit or production security guarantee is claimed.
