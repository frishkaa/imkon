"""End-to-end API flows: verification, share/pdf, earning (18+), applications,
job alerts, market navigator, catalog. AI is monkeypatched off for determinism."""
import uuid

import pytest

import app.ai.llm_client as llm
from app.database import SessionLocal
from app.models import Organization
from tests.conftest import auth, register


@pytest.fixture(autouse=True)
def _no_network(monkeypatch):
    # roadmap uses fallback; keeps these flow tests offline & fast
    monkeypatch.setattr(llm, "chat", lambda *a, **k: (_ for _ in ()).throw(RuntimeError("offline")))


def _ilmhona_id():
    db = SessionLocal()
    try:
        return str(db.query(Organization).filter(Organization.name == "Ilmhona").first().id)
    finally:
        db.close()


def test_verification_confirm_lights_step_and_trust(client):
    u = register(client, age=20, status="neither")
    tok, uid = u["token"], u["user"]["id"]
    rm = client.post("/ai/roadmap", json={"user_id": uid, "goal_text": "веб разработчик"},
                     headers=auth(tok)).json()
    node = rm["steps"][0]
    org_id = _ilmhona_id()
    vr = client.post("/verifications", json={"user_id": uid, "org_id": org_id,
                     "claim_type": "course", "claim_detail": {"course": "Web", "project_score": 9},
                     "roadmap_node_id": node["id"]}, headers=auth(tok)).json()
    olog = client.post("/auth/org-login", json={"login_email": "org@ilmhona.tj",
                       "password": "ilmhona123"}).json()
    otok = olog["token"]
    q = client.get(f"/org/{org_id}/verifications?status=pending", headers=auth(otok)).json()
    assert q["count"] >= 1
    res = client.post(f"/verifications/{vr['id']}/resolve", json={"decision": "confirmed"},
                      headers=auth(otok)).json()
    assert res["status"] == "confirmed"
    assert res["trust_score"] >= 10
    assert res["roadmap_step_done"] is True
    steps = client.get(f"/roadmaps/{rm['id']}/steps", headers=auth(tok)).json()
    assert steps["steps"][0]["status"] == "done"


def test_user_cannot_resolve_own_verification(client):
    u = register(client, age=20)
    org_id = _ilmhona_id()
    vr = client.post("/verifications", json={"user_id": u["user"]["id"], "org_id": org_id,
                     "claim_type": "course", "claim_detail": {}}, headers=auth(u["token"])).json()
    # user token is not an org token -> resolve forbidden (401)
    r = client.post(f"/verifications/{vr['id']}/resolve", json={"decision": "confirmed"},
                    headers=auth(u["token"]))
    assert r.status_code == 401


def test_reject_path(client):
    u = register(client, age=20)
    org_id = _ilmhona_id()
    vr = client.post("/verifications", json={"user_id": u["user"]["id"], "org_id": org_id,
                     "claim_type": "course", "claim_detail": {}}, headers=auth(u["token"])).json()
    otok = client.post("/auth/org-login", json={"login_email": "org@ilmhona.tj",
                       "password": "ilmhona123"}).json()["token"]
    res = client.post(f"/verifications/{vr['id']}/resolve", json={"decision": "rejected"},
                      headers=auth(otok)).json()
    assert res["status"] == "rejected"
    assert res["achievement_id"] is None


def test_share_revoke_and_public(client):
    u = register(client, age=22, full_name="Шер Профиль")
    tok, uid = u["token"], u["user"]["id"]
    sh = client.post(f"/profiles/{uid}/share", json={}, headers=auth(tok)).json()
    token = sh["token"]
    assert client.get(f"/p/{token}").status_code == 200
    pdf = client.get(f"/p/{token}/resume.pdf")
    assert pdf.status_code == 200 and pdf.content[:4] == b"%PDF"
    assert client.delete(f"/profiles/{uid}/share/{token}", headers=auth(tok)).status_code == 200
    assert client.get(f"/p/{token}").status_code == 404  # revoked


def test_one_time_share(client):
    u = register(client, age=22)
    sh = client.post(f"/profiles/{u['user']['id']}/share", json={"one_time": True},
                     headers=auth(u["token"])).json()
    t = sh["token"]
    assert client.get(f"/p/{t}").status_code == 200
    assert client.get(f"/p/{t}").status_code == 404  # used once


def test_minor_blocked_from_earning(client):
    minor = register(client, age=16)
    mtok = minor["token"]
    assert client.get("/vacancies", headers=auth(mtok)).status_code == 403
    assert client.post("/gigs", json={"title": "x"}, headers=auth(mtok)).status_code == 403
    assert client.post("/tasks", json={"title": "x"}, headers=auth(mtok)).status_code == 403
    assert client.post("/job-alerts", json={"criteria": {}}, headers=auth(mtok)).status_code == 403


def test_adult_earning_and_applications(client):
    a = register(client, age=24, status="working")
    tok, uid = a["token"], a["user"]["id"]
    g = client.post("/gigs", json={"title": "Логотип", "price": 100}, headers=auth(tok))
    assert g.status_code == 200
    assert client.get("/gigs").json()["gigs"]
    vac = client.get("/vacancies", headers=auth(tok)).json()["vacancies"]
    assert vac
    app_ = client.post("/applications", json={"opportunity_id": vac[0]["id"]},
                       headers=auth(tok)).json()
    assert app_["status"] == "sent"
    mine = client.get(f"/users/{uid}/applications", headers=auth(tok)).json()
    assert any(x["id"] == app_["id"] for x in mine["applications"])
    upd = client.patch(f"/applications/{app_['id']}", json={"status": "viewed"},
                       headers=auth(tok)).json()
    assert upd["status"] == "viewed"


def test_job_alert_and_market_navigator(client):
    a = register(client, age=25, status="neither")
    client.post("/job-alerts", json={"criteria": {"goal": "frontend", "city": "Dushanbe"}},
                headers=auth(a["token"]))
    r = client.post("/dev/market-navigator")
    assert r.status_code == 200
    assert "notifications_sent" in r.json()


def test_catalog_endpoints(client):
    assert client.get("/opportunities").json()["count"] > 50
    assert len(client.get("/universities").json()["universities"]) >= 10
    meta = client.get("/meta?age=15").json()
    # need options for a 15yo must NOT include work needs
    ids = [n["id"] for n in meta["needs"]]
    assert "job" not in ids and "freelance" not in ids
    meta18 = client.get("/meta?age=20").json()
    assert "job" in [n["id"] for n in meta18["needs"]]
