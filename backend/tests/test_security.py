"""Security: field encryption at rest, password hashing, auth enforcement."""
import uuid

from sqlalchemy import text

from app.database import SessionLocal
from app.security.hashing import hash_password, verify_password
from app.security.tokens import sign, verify
from tests.conftest import auth, register


def test_phone_and_name_encrypted_at_rest(client):
    data = register(client, full_name="Секрет Имя", phone="+992900111222", age=24,
                    password="pw12345")
    uid = data["user"]["id"]
    db = SessionLocal()
    try:
        row = db.execute(
            text("select phone, full_name from user_profiles where id = :id"),
            {"id": uuid.UUID(uid)},
        ).first()
    finally:
        db.close()
    raw_phone, raw_name = row[0], row[1]
    # stored ciphertext must NOT equal plaintext
    assert raw_phone != "+992900111222"
    assert raw_name != "Секрет Имя"
    # but the API decrypts correctly
    me = client.get("/auth/me", headers=auth(data["token"])).json()
    assert me["phone"] == "+992900111222"
    assert me["full_name"] == "Секрет Имя"


def test_password_hashing():
    h = hash_password("hunter2")
    assert h != "hunter2"
    assert verify_password(h, "hunter2") is True
    assert verify_password(h, "wrong") is False


def test_login_flow(client):
    email = register(client, age=26, password="goodpass")["user"]["email"]
    ok = client.post("/auth/login", json={"email": email, "password": "goodpass"})
    assert ok.status_code == 200 and ok.json()["token"]
    bad = client.post("/auth/login", json={"email": email, "password": "nope"})
    assert bad.status_code == 401


def test_auth_required(client):
    data = register(client, age=20)
    uid = data["user"]["id"]
    assert client.get(f"/users/{uid}").status_code == 401  # no token
    # cannot read someone else's profile
    other = register(client, age=20)
    assert client.get(f"/users/{uid}", headers=auth(other["token"])).status_code == 403


def test_token_tamper_rejected():
    tok = sign({"kind": "user", "sub": "abc"})
    assert verify(tok) is not None
    assert verify(tok[:-3] + "xyz") is None


def test_rate_limiter_blocks_after_limit():
    """The limiter itself works (bypassed at HTTP layer only in test env)."""
    from app.security.ratelimit import allow
    key = "unit-test-scope"
    allowed = sum(1 for _ in range(20) if allow(key, limit=15, window=60))
    assert allowed == 15  # 16th+ within the window are rejected
