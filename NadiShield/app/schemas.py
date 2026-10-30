from __future__ import annotations

from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field, model_validator

class SiteCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    timezone: str = Field(default="Asia/Kolkata", max_length=80)

class AssetCreate(BaseModel):
    site_id: int = Field(gt=0)
    name: str = Field(min_length=1, max_length=120)
    ip_address: str = Field(min_length=3, max_length=45)
    asset_type: str = Field(default="unknown", max_length=60)
    criticality: Literal["low", "medium", "high", "critical"] = "medium"

class ChangeCreate(BaseModel):
    site_id: int = Field(gt=0)
    title: str = Field(min_length=3, max_length=180)
    reason: str = Field(min_length=3, max_length=1000)
    requester: str = Field(min_length=2, max_length=120)
    vendor: str | None = Field(default=None, max_length=120)
    scope_asset_ids: list[int] = Field(min_length=1)
    planned_start: datetime
    planned_end: datetime
    rollback_plan: str = Field(min_length=3, max_length=2000)

    @model_validator(mode="after")
    def validate_window(self):
        if self.planned_end <= self.planned_start:
            raise ValueError("planned_end must be after planned_start")
        if self.planned_start.tzinfo is None or self.planned_end.tzinfo is None:
            raise ValueError("planned timestamps must include a timezone")
        if len(set(self.scope_asset_ids)) != len(self.scope_asset_ids):
            raise ValueError("scope_asset_ids must not contain duplicates")
        return self

class ApprovalCreate(BaseModel):
    approver: str = Field(min_length=2, max_length=120)
    decision: Literal["approved", "rejected"]
    note: str | None = Field(default=None, max_length=1000)

class NetworkEventCreate(BaseModel):
    site_id: int = Field(gt=0)
    observed_at: datetime
    src_ip: str = Field(min_length=3, max_length=45)
    dst_ip: str = Field(min_length=3, max_length=45)
    protocol: str = Field(min_length=1, max_length=40)
    event_type: Literal["connection", "session_start", "session_end", "protocol_write", "file_change", "config_hash_change", "login", "alert"] = "connection"
    sensor: str = Field(default="manual", max_length=80)
    raw: dict = Field(default_factory=dict)

class ZeekConnEvent(BaseModel):
    """A small Zeek conn.log subset; metadata ingestion only."""
    ts: float
    id_orig_h: str
    id_resp_h: str
    proto: str
    service: str | None = None
    uid: str | None = None

class AlertStatusUpdate(BaseModel):
    status: Literal["open", "investigating", "resolved"]
