"""Opportunities catalog, universities, notifications, and reference metadata."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.constants import (
    AGE_BUCKETS,
    CATEGORIES,
    CITIES,
    EDUCATION_LEVELS,
    INTERESTS,
    LANG_LEVELS,
    NEED_ICONS,
    NEED_OPTIONS,
    SKILL_DOMAINS,
    SPOKEN_LANGUAGES,
    STATUS_OPTIONS,
    need_options_for_age,
)
from app.database import get_db
from app.models import Opportunity, Organization, University, UserProfile
from app.security.access import current_user
from app.serializers import opportunity_dict
from app.services import notifications

router = APIRouter(tags=["catalog"])


@router.get("/opportunities")
def list_opportunities(category: str | None = Query(None), city: str | None = Query(None),
                       limit: int = Query(100, ge=1, le=300), db: Session = Depends(get_db)):
    q = db.query(Opportunity).filter(Opportunity.is_active.is_(True))
    if category:
        q = q.filter(Opportunity.category == category)
    rows = q.limit(limit).all()
    out = [opportunity_dict(o) for o in rows]
    if city:
        out = [o for o in out if city in (o["location"] or []) or "all" in (o["location"] or [])]
    return {"count": len(out), "opportunities": out}


@router.get("/opportunities/{opp_id}")
def get_opportunity(opp_id: str, db: Session = Depends(get_db)):
    o = db.get(Opportunity, uuid.UUID(opp_id))
    if not o:
        from fastapi import HTTPException
        raise HTTPException(404, "Не найдено")
    return opportunity_dict(o)


@router.get("/organizations")
def list_organizations(db: Session = Depends(get_db)):
    """Public list of verified orgs (for the verification request picker)."""
    rows = db.query(Organization).filter(Organization.verified.is_(True)).all()
    return {"organizations": [{"id": str(o.id), "name": o.name, "type": o.type} for o in rows]}


@router.get("/universities")
def list_universities(city: str | None = Query(None), db: Session = Depends(get_db)):
    q = db.query(University)
    if city:
        q = q.filter(University.city == city)
    rows = q.all()
    return {"universities": [{"id": str(u.id), "name": u.name, "city": u.city,
                              "programs": u.programs, "requirements": u.requirements} for u in rows]}


@router.get("/notifications")
def my_notifications(viewer: UserProfile = Depends(current_user)):
    return {"items": notifications.get_user_notifications(viewer.id)}


@router.post("/notifications/read")
def mark_notifications_read(viewer: UserProfile = Depends(current_user)):
    notifications.mark_all_read(viewer.id)
    return {"ok": True}


@router.get("/meta")
def meta(age: int | None = Query(None)):
    """Reference vocab for the frontend (need options gated by age, cities, etc.)."""
    needs = need_options_for_age(age) if age is not None else NEED_OPTIONS
    needs = [{**n, "icon_id": NEED_ICONS.get(n["id"], "spark")} for n in needs]
    return {
        "cities": CITIES,
        "categories": CATEGORIES,
        "age_buckets": AGE_BUCKETS,
        "interests": INTERESTS,
        "needs": needs,
        "statuses": STATUS_OPTIONS,
        "education_levels": EDUCATION_LEVELS,
        "skill_domains": SKILL_DOMAINS,
        "spoken_languages": SPOKEN_LANGUAGES,
        "lang_levels": LANG_LEVELS,
    }


@router.get("/companies")
def list_companies(db: Session = Depends(get_db)):
    """Employer organizations with their open vacancies (for Work + logos)."""
    orgs = db.query(Organization).filter(Organization.type == "employer").all()
    out = []
    for o in orgs:
        vac = db.query(Opportunity).filter(
            Opportunity.org_id == o.id,
            Opportunity.is_active.is_(True),
            Opportunity.category.in_(["employment", "internship"]),
        ).all()
        out.append({
            "id": str(o.id), "name": o.name, "sphere": o.sphere,
            "brand_color": o.brand_color, "logo_text": o.logo_text,
            "verified": o.verified,
            "vacancies": [{"id": str(v.id), "title": v.title, "category": v.category,
                           "location": v.location, "skills_tags": v.skills_tags, "is_free": v.is_free,
                           "salary_min": v.salary_min, "salary_max": v.salary_max,
                           "experience": v.experience, "employment_format": v.employment_format,
                           "sphere": v.sphere} for v in vac],
        })
    # companies with vacancies first
    out.sort(key=lambda c: -len(c["vacancies"]))
    return {"companies": out}
