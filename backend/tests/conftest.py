import sys
import uuid

import pytest

sys.path.insert(0, ".")

from fastapi.testclient import TestClient  # noqa: E402

from app.database import SessionLocal  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Opportunity  # noqa: E402


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


def _uniq() -> str:
    return uuid.uuid4().hex[:8]


def register(client, **over) -> dict:
    body = {
        "full_name": "Тест Пользователь",
        "age": 20,
        "gender": "male",
        "city": "Dushanbe",
        "needs": ["study"],
        "consent_given": True,
        "language_pref": "russian",
        "email": f"u_{_uniq()}@example.tj",
    }
    body.update(over)
    r = client.post("/users", json=body)
    assert r.status_code == 200, r.text
    return r.json()


def auth(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="session")
def seeded_opportunities():
    db = SessionLocal()
    try:
        rows = db.query(Opportunity).filter(Opportunity.is_active.is_(True)).all()
        from app.serializers import opportunity_match_dict
        return [opportunity_match_dict(o) for o in rows]
    finally:
        db.close()
