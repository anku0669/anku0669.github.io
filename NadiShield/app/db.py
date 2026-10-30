from __future__ import annotations

import os
import sqlite3
from pathlib import Path

DB_PATH = Path(os.environ.get("NADISHIELD_DB", "./data/nadishield.sqlite3"))

SCHEMA = """
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS sites (
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL,
 timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata', created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS assets (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
 name TEXT NOT NULL, ip_address TEXT NOT NULL,
 asset_type TEXT NOT NULL DEFAULT 'unknown', criticality TEXT NOT NULL DEFAULT 'medium',
 created_at TEXT NOT NULL, UNIQUE(site_id, ip_address)
);
CREATE TABLE IF NOT EXISTS changes (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
 title TEXT NOT NULL, reason TEXT NOT NULL, requester TEXT NOT NULL, vendor TEXT,
 scope_asset_ids_json TEXT NOT NULL, planned_start TEXT NOT NULL, planned_end TEXT NOT NULL,
 rollback_plan TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'requested', created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS approvals (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 change_id INTEGER NOT NULL REFERENCES changes(id) ON DELETE CASCADE,
 approver TEXT NOT NULL, decision TEXT NOT NULL, note TEXT, decided_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS network_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
 observed_at TEXT NOT NULL, src_ip TEXT NOT NULL, dst_ip TEXT NOT NULL,
 protocol TEXT NOT NULL, event_type TEXT NOT NULL, sensor TEXT NOT NULL DEFAULT 'manual',
 raw_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS alerts (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 site_id INTEGER NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
 event_id INTEGER REFERENCES network_events(id) ON DELETE SET NULL,
 severity TEXT NOT NULL, rule_id TEXT NOT NULL, message TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'open', created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_events (
 id INTEGER PRIMARY KEY AUTOINCREMENT, occurred_at TEXT NOT NULL, actor TEXT NOT NULL,
 action TEXT NOT NULL, entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
 payload_json TEXT NOT NULL, previous_hash TEXT NOT NULL, record_hash TEXT NOT NULL
);
"""


def get_connection() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(SCHEMA)
        conn.commit()
