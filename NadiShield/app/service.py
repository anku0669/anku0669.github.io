from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from .audit import append_audit_event
from .db import get_connection

SENSITIVE_EVENT_TYPES = {"session_start", "protocol_write", "file_change", "config_hash_change", "login"}


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def iso_utc(value: datetime) -> str:
    if value.tzinfo is None:
        raise ValueError("Timestamp must be timezone-aware")
    return value.astimezone(timezone.utc).isoformat()


def create_site(data: dict[str, Any]) -> dict[str, Any]:
    now = utc_now()
    with get_connection() as conn:
        cur = conn.execute(
            "INSERT INTO sites(name, timezone, created_at) VALUES (?, ?, ?)",
            (data["name"], data["timezone"], now),
        )
        site_id = cur.lastrowid
        conn.commit()
    append_audit_event(occurred_at=now, actor="system", action="site.created",
                       entity_type="site", entity_id=site_id, payload=data)
    return {"id": site_id, **data, "created_at": now}


def create_asset(data: dict[str, Any]) -> dict[str, Any]:
    now = utc_now()
    with get_connection() as conn:
        site = conn.execute("SELECT id FROM sites WHERE id = ?", (data["site_id"],)).fetchone()
        if not site:
            raise LookupError("Site not found")
        cur = conn.execute(
            """INSERT INTO assets(site_id, name, ip_address, asset_type, criticality, created_at)
            VALUES (?, ?, ?, ?, ?, ?)""",
            (data["site_id"], data["name"], data["ip_address"], data["asset_type"],
             data["criticality"], now),
        )
        asset_id = cur.lastrowid
        conn.commit()
    append_audit_event(occurred_at=now, actor="system", action="asset.created",
                       entity_type="asset", entity_id=asset_id, payload=data)
    return {"id": asset_id, **data, "created_at": now}


def create_change(data: dict[str, Any]) -> dict[str, Any]:
    now = utc_now()
    start = iso_utc(data["planned_start"])
    end = iso_utc(data["planned_end"])
    asset_ids = data["scope_asset_ids"]
    with get_connection() as conn:
        site = conn.execute("SELECT id FROM sites WHERE id = ?", (data["site_id"],)).fetchone()
        if not site:
            raise LookupError("Site not found")
        placeholders = ",".join("?" for _ in asset_ids)
        rows = conn.execute(
            f"SELECT id FROM assets WHERE site_id = ? AND id IN ({placeholders})",
            [data["site_id"], *asset_ids],
        ).fetchall()
        if len(rows) != len(set(asset_ids)):
            raise ValueError("Every scope asset must exist and belong to the selected site")
        cur = conn.execute(
            """INSERT INTO changes(site_id, title, reason, requester, vendor,
            scope_asset_ids_json, planned_start, planned_end, rollback_plan, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested', ?)""",
            (data["site_id"], data["title"], data["reason"], data["requester"], data.get("vendor"),
             json.dumps(asset_ids), start, end, data["rollback_plan"], now),
        )
        change_id = cur.lastrowid
        conn.commit()
    append_audit_event(occurred_at=now, actor=data["requester"], action="change.requested",
                       entity_type="change", entity_id=change_id,
                       payload={**data, "planned_start": start, "planned_end": end})
    return get_change(change_id)


def get_change(change_id: int) -> dict[str, Any] | None:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM changes WHERE id = ?", (change_id,)).fetchone()
        if not row:
            return None
        result = dict(row)
        result["scope_asset_ids"] = json.loads(result.pop("scope_asset_ids_json"))
        result["approvals"] = [dict(r) for r in conn.execute(
            "SELECT * FROM approvals WHERE change_id = ? ORDER BY id", (change_id,)
        ).fetchall()]
        return result


def approve_change(change_id: int, approver: str, decision: str, note: str | None) -> dict[str, Any] | None:
    now = utc_now()
    with get_connection() as conn:
        row = conn.execute("SELECT status FROM changes WHERE id = ?", (change_id,)).fetchone()
        if not row:
            return None
        if row["status"] not in {"requested", "approved"}:
            raise ValueError("Only requested or approved changes can receive an approval decision")
        conn.execute(
            "INSERT INTO approvals(change_id, approver, decision, note, decided_at) VALUES (?, ?, ?, ?, ?)",
            (change_id, approver, decision, note, now),
        )
        conn.execute("UPDATE changes SET status = ? WHERE id = ?", (decision, change_id))
        conn.commit()
    append_audit_event(occurred_at=now, actor=approver, action=f"change.{decision}",
                       entity_type="change", entity_id=change_id, payload={"note": note})
    return get_change(change_id)


def _active_approved_change(conn, site_id: int, asset_id: int, observed_at: str):
    rows = conn.execute(
        """SELECT * FROM changes WHERE site_id = ? AND status = 'approved'
        AND planned_start <= ? AND planned_end >= ? ORDER BY id DESC""",
        (site_id, observed_at, observed_at),
    ).fetchall()
    for row in rows:
        if asset_id in json.loads(row["scope_asset_ids_json"]):
            return row
    return None


def ingest_event(data: dict[str, Any]) -> dict[str, Any]:
    observed_at = iso_utc(data["observed_at"])
    now = utc_now()
    raw_json = json.dumps(data.get("raw") or {}, sort_keys=True)
    with get_connection() as conn:
        site = conn.execute("SELECT id FROM sites WHERE id = ?", (data["site_id"],)).fetchone()
        if not site:
            raise LookupError("Site not found")
        cur = conn.execute(
            """INSERT INTO network_events(site_id, observed_at, src_ip, dst_ip, protocol,
            event_type, sensor, raw_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (data["site_id"], observed_at, data["src_ip"], data["dst_ip"], data["protocol"],
             data["event_type"], data["sensor"], raw_json),
        )
        event_id = cur.lastrowid
        asset = conn.execute(
            "SELECT * FROM assets WHERE site_id = ? AND ip_address = ?",
            (data["site_id"], data["dst_ip"]),
        ).fetchone()
        alert = None
        if asset and data["event_type"] in SENSITIVE_EVENT_TYPES:
            approved_change = _active_approved_change(
                conn, data["site_id"], asset["id"], observed_at
            )
            if approved_change is None:
                message = (
                    f"Observed {data['event_type']} from {data['src_ip']} to "
                    f"{asset['name']} ({asset['ip_address']}) without a matching approved "
                    "maintenance window. This is an exception requiring human review, not proof of attack."
                )
                alert_cur = conn.execute(
                    """INSERT INTO alerts(site_id, event_id, severity, rule_id, message, created_at)
                    VALUES (?, ?, 'high', 'UNAPPROVED_SENSITIVE_ACTIVITY', ?, ?)""",
                    (data["site_id"], event_id, message, now),
                )
                alert = {"id": alert_cur.lastrowid, "severity": "high",
                         "rule_id": "UNAPPROVED_SENSITIVE_ACTIVITY", "message": message}
            else:
                alert = {"matched_change_id": approved_change["id"], "status": "matched"}
        conn.commit()

    append_audit_event(occurred_at=now, actor=data["sensor"], action="network_event.ingested",
                       entity_type="network_event", entity_id=event_id,
                       payload={"site_id": data["site_id"], "event_type": data["event_type"],
                                "src_ip": data["src_ip"], "dst_ip": data["dst_ip"],
                                "protocol": data["protocol"], "observed_at": observed_at})
    if alert and alert.get("status") == "matched":
        append_audit_event(occurred_at=now, actor="system", action="event.matched_to_change",
                           entity_type="network_event", entity_id=event_id,
                           payload={"change_id": alert["matched_change_id"]})
    return {"event_id": event_id, "observed_at": observed_at, "alert": alert}


def list_alerts(site_id: int | None = None) -> list[dict[str, Any]]:
    with get_connection() as conn:
        if site_id is None:
            rows = conn.execute("SELECT * FROM alerts ORDER BY id DESC").fetchall()
        else:
            rows = conn.execute("SELECT * FROM alerts WHERE site_id = ? ORDER BY id DESC", (site_id,)).fetchall()
        return [dict(row) for row in rows]


def update_alert(alert_id: int, status: str) -> dict[str, Any] | None:
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,)).fetchone()
        if not row:
            return None
        conn.execute("UPDATE alerts SET status = ? WHERE id = ?", (status, alert_id))
        conn.commit()
    append_audit_event(occurred_at=utc_now(), actor="operator", action="alert.status_changed",
                       entity_type="alert", entity_id=alert_id, payload={"status": status})
    with get_connection() as conn:
        updated = conn.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,)).fetchone()
        return dict(updated) if updated else None


def change_report(change_id: int) -> dict[str, Any] | None:
    change = get_change(change_id)
    if not change:
        return None
    asset_ids = change["scope_asset_ids"]
    placeholders = ",".join("?" for _ in asset_ids)
    with get_connection() as conn:
        events = conn.execute(
            f"""SELECT ne.* FROM network_events ne JOIN assets a
            ON ne.site_id = a.site_id AND (ne.src_ip = a.ip_address OR ne.dst_ip = a.ip_address)
            WHERE ne.site_id = ? AND a.id IN ({placeholders}) ORDER BY ne.observed_at""",
            [change["site_id"], *asset_ids],
        ).fetchall()
        alerts = conn.execute(
            """SELECT * FROM alerts WHERE event_id IN
            (SELECT id FROM network_events WHERE site_id = ?) ORDER BY id""",
            (change["site_id"],),
        ).fetchall()
    return {"change": change, "related_network_events": [dict(r) for r in events],
            "site_alerts": [dict(r) for r in alerts]}
