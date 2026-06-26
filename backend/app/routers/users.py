"""User profile create/update + need-centric matches (legal filter FIRST)."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.constants import NEED_BY_ID, WORK_CATEGORIES, needs_to_categories
from app.database import get_db
from app.matching.engine import get_matches
from app.models import Achievement, MatchLog, Opportunity, UserProfile
from app.schemas import UserCreate, UserUpdate
from app.security.access import current_user, issue_user_token, log_access
from app.security.hashing import hash_password
from app.security.ratelimit import limiter
from app.serializers import age_bucket, opportunity_match_dict, user_private

router = APIRouter(tags=["users"])


def _build_needs(age: int, raw_needs: list[str]) -> list[str]:
    """Accept need-ids (study/job/...) or canonical categories; expand + dedupe.
    Enforce minor protection: strip work categories for age < 18."""
    cats: list[str] = []
    for n in raw_needs or []:
        if n in NEED_BY_ID:
            for c in NEED_BY_ID[n]["categories"]:
                if c not in cats:
                    cats.append(c)
        elif n not in cats:
            cats.append(n)
    if age < 18:
        cats = [c for c in cats if c not in WORK_CATEGORIES]
    return cats


@router.post("/users", dependencies=[Depends(limiter(15, 60, "register"))])
def create_user(body: UserCreate, db: Session = Depends(get_db)):
    if not body.consent_given:
        raise HTTPException(400, "Требуется согласие на обработку данных")
    needs = _build_needs(body.age, body.needs)
    status = body.status if body.age >= 18 else None  # no employment status for minors
    user = UserProfile(
        full_name=body.full_name, phone=body.phone, email=body.email,
        password_hash=hash_password(body.password) if body.password else None,
        age=body.age, gender=body.gender, city=body.city, region=body.region,
        status=status, is_migrant_child=body.is_migrant_child, needs=needs,
        interests=body.interests or [], domains=body.domains or [],
        education=body.education, bio=body.bio,
        languages=body.languages or [], skills=body.skills or [],
        language_pref=body.language_pref, consent_given=body.consent_given,
        telegram_id=body.telegram_id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"token": issue_user_token(user), "user": user_private(user)}


@router.get("/users/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db),
             viewer: UserProfile = Depends(current_user)):
    target = db.get(UserProfile, uuid.UUID(user_id))
    if not target:
        raise HTTPException(404, "Профиль не найден")
    if viewer.id != target.id:
        raise HTTPException(403, "Нет доступа к этому профилю")
    log_access(db, actor=str(viewer.id), action="read_profile", target_user_id=target.id)
    achs = db.query(Achievement).filter(Achievement.user_id == target.id).all()
    return user_private(target, achs)


@router.patch("/users/{user_id}")
def update_user(user_id: str, body: UserUpdate, db: Session = Depends(get_db),
                viewer: UserProfile = Depends(current_user)):
    if str(viewer.id) != user_id:
        raise HTTPException(403, "Нельзя менять чужой профиль")
    data = body.model_dump(exclude_unset=True)
    if "needs" in data and data["needs"] is not None:
        data["needs"] = _build_needs(viewer.age, data["needs"])
    if viewer.age < 18:
        data.pop("status", None)
    for k, v in data.items():
        setattr(viewer, k, v)
    db.add(viewer)
    db.commit()
    db.refresh(viewer)
    achs = db.query(Achievement).filter(Achievement.user_id == viewer.id).all()
    return user_private(viewer, achs)


@router.get("/users/{user_id}/matches")
def user_matches(user_id: str, limit: int = Query(5, ge=1, le=50),
                 db: Session = Depends(get_db), viewer: UserProfile = Depends(current_user)):
    if str(viewer.id) != user_id:
        raise HTTPException(403, "Нет доступа")
    user_dict = {
        "age": viewer.age, "gender": viewer.gender, "city": viewer.city,
        "needs": viewer.needs or [], "is_migrant_child": viewer.is_migrant_child,
        "status": viewer.status,
    }
    opps = db.query(Opportunity).filter(Opportunity.is_active.is_(True)).all()
    matched = get_matches(user_dict, [opportunity_match_dict(o) for o in opps], limit=limit)
    # log anonymized aggregate dims
    for m in matched:
        db.add(MatchLog(user_id=viewer.id, opportunity_id=uuid.UUID(m["id"]), score=m["_score"],
                        city=viewer.city, category=m.get("category"), age_bucket=age_bucket(viewer.age)))
    db.commit()
    # serialize deadline back to iso for response
    out = []
    for m in matched:
        m = dict(m)
        if m.get("deadline") is not None and hasattr(m["deadline"], "isoformat"):
            m["deadline"] = m["deadline"].isoformat()
        out.append(m)
    return {"count": len(out), "matches": out, "is_adult": viewer.age >= 18}
