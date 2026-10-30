from app.audit import append_audit_event, verify_audit_chain
from app.db import init_db


def test_audit_chain_is_valid(tmp_path, monkeypatch):
    from app import db
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.sqlite3")
    init_db()
    append_audit_event(
        occurred_at="2026-10-31T00:00:00+00:00", actor="test", action="created",
        entity_type="site", entity_id="1", payload={"name": "test"}
    )
    append_audit_event(
        occurred_at="2026-10-31T00:01:00+00:00", actor="test", action="updated",
        entity_type="site", entity_id="1", payload={"name": "test-2"}
    )
    assert verify_audit_chain()["valid"] is True
