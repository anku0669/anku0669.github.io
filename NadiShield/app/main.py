from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from .audit import verify_audit_chain
from .db import init_db
from .schemas import AlertStatusUpdate, ApprovalCreate, AssetCreate, ChangeCreate, NetworkEventCreate, SiteCreate, ZeekConnEvent
from .service import approve_change, change_report, create_asset, create_change, create_site, get_change, ingest_event, list_alerts, update_alert

@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_db()
    yield

app = FastAPI(lifespan=lifespan, title="NadiShield Sentinel API", version="0.1.0",
    description="Local prototype for maintenance-change evidence and passive event correlation. Use simulated/exported events only. Not for production OT deployment.")

@app.get("/health")
def health():
    return {"status": "ok", "product": "NadiShield Sentinel", "version": "0.1.0"}

@app.post("/api/sites", status_code=201)
def api_create_site(payload: SiteCreate):
    return create_site(payload.model_dump())

@app.post("/api/assets", status_code=201)
def api_create_asset(payload: AssetCreate):
    try:
        return create_asset(payload.model_dump())
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        if "UNIQUE constraint failed" in str(exc):
            raise HTTPException(status_code=409, detail="Asset IP already exists at this site") from exc
        raise

@app.post("/api/changes", status_code=201)
def api_create_change(payload: ChangeCreate):
    try:
        return create_change(payload.model_dump())
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

@app.get("/api/changes/{change_id}")
def api_get_change(change_id: int):
    result = get_change(change_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Change request not found")
    return result

@app.post("/api/changes/{change_id}/approvals")
def api_approve_change(change_id: int, payload: ApprovalCreate):
    try:
        result = approve_change(change_id, payload.approver, payload.decision, payload.note)
    except ValueError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    if result is None:
        raise HTTPException(status_code=404, detail="Change request not found")
    return result

@app.post("/api/events", status_code=201)
def api_ingest_event(payload: NetworkEventCreate):
    try:
        return ingest_event(payload.model_dump())
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

@app.post("/api/ingest/zeek-conn", status_code=201)
def api_ingest_zeek_conn(site_id: int, payload: ZeekConnEvent):
    observed_at = datetime.fromtimestamp(payload.ts, tz=timezone.utc)
    event = NetworkEventCreate(site_id=site_id, observed_at=observed_at, src_ip=payload.id_orig_h,
        dst_ip=payload.id_resp_h, protocol=payload.proto, event_type="connection", sensor="zeek", raw=payload.model_dump())
    try:
        return ingest_event(event.model_dump())
    except LookupError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

@app.get("/api/alerts")
def api_list_alerts(site_id: int | None = None):
    return list_alerts(site_id)

@app.patch("/api/alerts/{alert_id}")
def api_update_alert(alert_id: int, payload: AlertStatusUpdate):
    result = update_alert(alert_id, payload.status)
    if result is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return result

@app.get("/api/changes/{change_id}/report")
def api_change_report(change_id: int):
    result = change_report(change_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Change request not found")
    return result

@app.get("/api/audit/verify")
def api_verify_audit():
    return verify_audit_chain()
