"""Roadmap step-path (gamified frontend) + user's roadmaps list."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Roadmap, UserProfile
from app.security.access import current_user
from app.serializers import roadmap_steps

router = APIRouter(tags=["roadmaps"])


@router.get("/roadmaps/{roadmap_id}/steps")
def get_steps(roadmap_id: str, db: Session = Depends(get_db)):
    rm = db.get(Roadmap, uuid.UUID(roadmap_id))
    if not rm:
        raise HTTPException(404, "Маршрут не найден")
    return roadmap_steps(rm)


@router.get("/users/{user_id}/roadmaps")
def list_user_roadmaps(user_id: str, db: Session = Depends(get_db),
                       viewer: UserProfile = Depends(current_user)):
    if str(viewer.id) != user_id:
        raise HTTPException(403, "Нет доступа")
    rms = (
        db.query(Roadmap)
        .filter(Roadmap.user_id == viewer.id)
        .order_by(Roadmap.created_at.desc())
        .all()
    )
    return {"roadmaps": [roadmap_steps(r) for r in rms]}
