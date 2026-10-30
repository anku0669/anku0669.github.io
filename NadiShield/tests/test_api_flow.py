from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app import db
from app.main import app


def test_approved_and_unapproved_events_are_distinguished(tmp_path, monkeypatch):
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "flow.sqlite3")
    now = datetime.now(timezone.utc)
    with TestClient(app) as client:
        site_response = client.post("/api/sites", json={"name": "Test Hydro"})
        assert site_response.status_code == 201
        site_id = site_response.json()["id"]
        asset_response = client.post("/api/assets", json={
            "site_id": site_id, "name": "PLC Simulator", "ip_address": "192.0.2.10",
            "asset_type": "simulator", "criticality": "high",
        })
        assert asset_response.status_code == 201
        asset_id = asset_response.json()["id"]
        change_response = client.post("/api/changes", json={
            "site_id": site_id, "title": "Planned maintenance", "reason": "Test approved work window",
            "requester": "Engineer", "scope_asset_ids": [asset_id],
            "planned_start": (now - timedelta(minutes=1)).isoformat(),
            "planned_end": (now + timedelta(minutes=5)).isoformat(),
            "rollback_plan": "Restore simulator snapshot",
        })
        assert change_response.status_code == 201
        change_id = change_response.json()["id"]
        approval_response = client.post(f"/api/changes/{change_id}/approvals", json={
            "approver": "Plant Manager", "decision": "approved"
        })
        assert approval_response.status_code == 200
        event_base = {
            "site_id": site_id, "src_ip": "192.0.2.20", "dst_ip": "192.0.2.10",
            "protocol": "modbus-tcp", "event_type": "protocol_write",
            "sensor": "test-simulator", "raw": {"synthetic": True},
        }
        matched = client.post("/api/events", json={**event_base, "observed_at": now.isoformat()})
        assert matched.status_code == 201
        assert matched.json()["alert"]["status"] == "matched"
        out_of_window = client.post("/api/events", json={
            **event_base, "observed_at": (now + timedelta(hours=2)).isoformat(),
            "src_ip": "192.0.2.99",
        })
        assert out_of_window.status_code == 201
        assert out_of_window.json()["alert"]["rule_id"] == "UNAPPROVED_SENSITIVE_ACTIVITY"
        assert client.get("/api/audit/verify").json()["valid"] is True
