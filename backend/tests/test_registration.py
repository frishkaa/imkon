"""Registration: consent, minor vs adult data minimization, validation, injection."""
from tests.conftest import auth, register


def test_consent_required(client):
    r = client.post("/users", json={"age": 20, "consent_given": False, "needs": [],
                                    "email": "x@y.tj"})
    assert r.status_code == 400


def test_minor_status_and_work_needs_stripped(client):
    data = register(client, age=15, status="working", needs=["study", "job", "freelance"])
    u = data["user"]
    assert u["is_adult"] is False
    assert u["status"] is None  # minors have no employment status
    assert all(n not in ("employment", "gig", "task") for n in u["needs"])
    assert "education" in u["needs"]


def test_adult_status_kept(client):
    u = register(client, age=21, status="neither", needs=["job"])["user"]
    assert u["status"] == "neither"
    assert "employment" in u["needs"]


def test_bad_age_rejected(client):
    r = client.post("/users", json={"age": 5, "consent_given": True, "needs": [], "email": "a@b.tj"})
    assert r.status_code == 422


def test_injection_string_stored_safely(client):
    payload = "Robert'); DROP TABLE user_profiles;--"
    data = register(client, full_name=payload, age=25)
    # round-trips intact via the API (no SQL execution, encrypted at rest)
    me = client.get("/auth/me", headers=auth(data["token"])).json()
    assert me["full_name"] == payload
    # table still exists / others can still register
    assert register(client, age=22)["user"]["id"]
