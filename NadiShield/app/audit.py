from __future__ import annotations

import hashlib
import json
from typing import Any

from .db import get_connection

GENESIS_HASH = "0" * 64


def canonical_json(value: Any) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def append_audit_event(
    *, occurred_at: str, actor: str, action: str,
    entity_type: str, entity_id: str, payload: dict[str, Any]
) -> dict[str, Any]:
    """Append a hash-chained record. This is tamper-evident, not immutable.

    A privileged attacker able to rewrite the full database can recompute this
    chain. Production needs independently protected signed checkpoints.
    """
    payload_json = canonical_json(payload)
    with get_connection() as conn:
        latest = conn.execute(
            "SELECT record_hash FROM audit_events ORDER BY id DESC LIMIT 1"
        ).fetchone()
        previous_hash = latest["record_hash"] if latest else GENESIS_HASH
        body = {
            "occurred_at": occurred_at, "actor": actor, "action": action,
            "entity_type": entity_type, "entity_id": str(entity_id),
            "payload_json": payload_json, "previous_hash": previous_hash,
        }
        record_hash = hashlib.sha256(
            (previous_hash + canonical_json(body)).encode("utf-8")
        ).hexdigest()
        cur = conn.execute(
            """INSERT INTO audit_events
            (occurred_at, actor, action, entity_type, entity_id, payload_json, previous_hash, record_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (occurred_at, actor, action, entity_type, str(entity_id), payload_json,
             previous_hash, record_hash),
        )
        conn.commit()
        return {"id": cur.lastrowid, **body, "record_hash": record_hash}


def verify_audit_chain() -> dict[str, Any]:
    with get_connection() as conn:
        rows = conn.execute("SELECT * FROM audit_events ORDER BY id ASC").fetchall()
    expected_previous = GENESIS_HASH
    for row in rows:
        body = {
            "occurred_at": row["occurred_at"], "actor": row["actor"],
            "action": row["action"], "entity_type": row["entity_type"],
            "entity_id": row["entity_id"], "payload_json": row["payload_json"],
            "previous_hash": row["previous_hash"],
        }
        calculated = hashlib.sha256(
            (expected_previous + canonical_json(body)).encode("utf-8")
        ).hexdigest()
        if row["previous_hash"] != expected_previous or row["record_hash"] != calculated:
            return {"valid": False, "checked_records": row["id"],
                    "failed_record_id": row["id"], "reason": "Hash-chain mismatch"}
        expected_previous = row["record_hash"]
    return {"valid": True, "checked_records": len(rows), "failed_record_id": None}
