"""Run a harmless local demo against the API with simulated events only."""
from datetime import datetime, timedelta, timezone
import json
import urllib.error
import urllib.request

BASE = "http://127.0.0.1:8000"


def post(path: str, payload: dict):
    req = urllib.request.Request(
        BASE + path, data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"}, method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as exc:
        raise RuntimeError(f"API error {exc.code}: {exc.read().decode()}") from exc


now = datetime.now(timezone.utc)
site = post("/api/sites", {"name": "Demo Micro Hydro", "timezone": "Asia/Kolkata"})
asset = post("/api/assets", {
    "site_id": site["id"], "name": "PLC-SIM-01", "ip_address": "192.0.2.10",
    "asset_type": "PLC simulator", "criticality": "high"
})
change = post("/api/changes", {
    "site_id": site["id"], "title": "Scheduled engineering workstation maintenance",
    "reason": "Demonstration of approved maintenance correlation",
    "requester": "Demo Engineer", "vendor": "Example Automation Services",
    "scope_asset_ids": [asset["id"]],
    "planned_start": (now - timedelta(minutes=5)).isoformat(),
    "planned_end": (now + timedelta(minutes=20)).isoformat(),
    "rollback_plan": "Restore the lab snapshot if the simulator becomes unhealthy."
})
post(f"/api/changes/{change['id']}/approvals", {
    "approver": "Demo Plant Manager", "decision": "approved",
    "note": "Approved for isolated lab demo."
})
matched = post("/api/events", {
    "site_id": site["id"], "observed_at": now.isoformat(),
    "src_ip": "192.0.2.20", "dst_ip": "192.0.2.10",
    "protocol": "modbus-tcp", "event_type": "protocol_write",
    "sensor": "simulator",
    "raw": {"function_code": 16, "note": "Synthetic only; no controller contacted."}
})
unapproved = post("/api/events", {
    "site_id": site["id"], "observed_at": (now + timedelta(hours=2)).isoformat(),
    "src_ip": "192.0.2.99", "dst_ip": "192.0.2.10",
    "protocol": "modbus-tcp", "event_type": "protocol_write",
    "sensor": "simulator", "raw": {"function_code": 6, "note": "Synthetic out-of-window event."}
})
print("Site:", site)
print("Asset:", asset)
print("Approved change:", change["id"])
print("Matched event:", matched)
print("Out-of-window event:", unapproved)
print("Open alerts:", urllib.request.urlopen(BASE + "/api/alerts", timeout=5).read().decode())
print("Audit verification:", urllib.request.urlopen(BASE + "/api/audit/verify", timeout=5).read().decode())
