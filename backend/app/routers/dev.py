"""Dev/demo utilities (disabled in production): seed, synthetic data, reset,
and a manual Market Navigator run. SYNTHETIC DATA ONLY."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine, get_db
from app.services import notifications
from app.services.seed import seed_all
from app.services.synthetic import generate_synthetic

router = APIRouter(prefix="/dev", tags=["dev"])


def _guard() -> None:
    if settings.is_production:
        raise HTTPException(403, "Dev endpoints disabled in production")


@router.post("/seed")
def seed(reset: bool = Query(False), db: Session = Depends(get_db)):
    _guard()
    return seed_all(db, reset=reset)


@router.post("/synthetic")
def synthetic(users: int = Query(500, ge=1, le=5000), db: Session = Depends(get_db)):
    _guard()
    return generate_synthetic(db, users=users)


@router.post("/reset")
def reset(db: Session = Depends(get_db)):
    _guard()
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    return {"reset": True}


@router.post("/market-navigator")
def market_navigator(db: Session = Depends(get_db)):
    _guard()
    sent = notifications.run_market_navigator(db)
    return {"notifications_sent": sent}
