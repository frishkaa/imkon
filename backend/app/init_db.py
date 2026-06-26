"""Create all tables and seed reference data. Run:  python -m app.init_db"""
from __future__ import annotations

from app.database import Base, SessionLocal, engine
from app.models import Opportunity  # noqa: F401  ensure metadata is populated
from app.services.seed import seed_all


def main(reset: bool = False) -> None:
    if reset:
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("seed:", seed_all(db, reset=reset))
    finally:
        db.close()


if __name__ == "__main__":
    import sys

    main(reset="--reset" in sys.argv)
