"""Earning section — 18+ ONLY: gigs, tasks, vacancies, applications, job alerts."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Application, Gig, JobAlert, MatchLog, Opportunity, Task, UserProfile
from app.schemas import ApplicationCreate, ApplicationStatusUpdate, GigCreate, JobAlertCreate, TaskCreate
from app.security.access import current_user
from app.security.ratelimit import limiter

router = APIRouter(tags=["earning"])


def _require_adult(user: UserProfile) -> None:
    if user.age < 18:
        raise HTTPException(403, "Раздел доступен только с 18 лет")


# ---- Gigs (freelance catalog) ----
@router.get("/gigs")
def list_gigs(db: Session = Depends(get_db)):
    gigs = db.query(Gig).filter(Gig.is_active.is_(True)).order_by(Gig.created_at.desc()).limit(100).all()
    return {"gigs": [{"id": str(g.id), "title": g.title, "category": g.category,
                      "price": float(g.price) if g.price is not None else None,
                      "delivery_days": g.delivery_days, "description": g.description,
                      "seller_id": str(g.seller_id)} for g in gigs]}


@router.post("/gigs")
def create_gig(body: GigCreate, db: Session = Depends(get_db),
               viewer: UserProfile = Depends(current_user)):
    _require_adult(viewer)
    g = Gig(seller_id=viewer.id, title=body.title, category=body.category, price=body.price,
            delivery_days=body.delivery_days, description=body.description)
    db.add(g)
    db.commit()
    db.refresh(g)
    return {"id": str(g.id), "title": g.title}


# ---- Tasks (micro-jobs) ----
@router.get("/tasks")
def list_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.status == "open").order_by(Task.created_at.desc()).limit(100).all()
    return {"tasks": [{"id": str(t.id), "title": t.title, "location": t.location,
                       "pay": float(t.pay) if t.pay is not None else None,
                       "duration_hours": float(t.duration_hours) if t.duration_hours is not None else None,
                       "category": t.category, "status": t.status} for t in tasks]}


@router.post("/tasks")
def create_task(body: TaskCreate, db: Session = Depends(get_db),
                viewer: UserProfile = Depends(current_user)):
    _require_adult(viewer)
    t = Task(poster_id=viewer.id, title=body.title, location=body.location, pay=body.pay,
             duration_hours=body.duration_hours, category=body.category)
    db.add(t)
    db.commit()
    db.refresh(t)
    return {"id": str(t.id), "title": t.title}


# ---- Vacancies (employment + internship). 18+ only. hh.ru-style filters. ----
@router.get("/vacancies")
def list_vacancies(
    db: Session = Depends(get_db), viewer: UserProfile = Depends(current_user),
    city: str | None = Query(None), sphere: str | None = Query(None),
    employment_format: str | None = Query(None), experience: str | None = Query(None),
    salary_min: int | None = Query(None), org_id: str | None = Query(None),
    q: str | None = Query(None), category: str | None = Query(None),
):
    _require_adult(viewer)
    query = db.query(Opportunity).filter(
        Opportunity.is_active.is_(True),
        Opportunity.category.in_(["employment", "internship"]),
    )
    if category in ("employment", "internship"):
        query = query.filter(Opportunity.category == category)
    if sphere:
        query = query.filter(Opportunity.sphere == sphere)
    if employment_format:
        query = query.filter(Opportunity.employment_format == employment_format)
    if experience:
        query = query.filter(Opportunity.experience == experience)
    if salary_min:
        query = query.filter(Opportunity.salary_max >= salary_min)
    if org_id:
        query = query.filter(Opportunity.org_id == uuid.UUID(org_id))
    rows = query.all()
    out = []
    for o in rows:
        if city and "all" not in (o.location or []) and city not in (o.location or []):
            continue
        if q:
            blob = f"{o.title} {o.organization} {' '.join(o.skills_tags or [])}".lower()
            if q.lower() not in blob:
                continue
        out.append({
            "id": str(o.id), "title": o.title, "organization": o.organization, "category": o.category,
            "location": o.location, "skills_tags": o.skills_tags, "description": o.description,
            "responsibilities": o.responsibilities, "sphere": o.sphere,
            "salary_min": o.salary_min, "salary_max": o.salary_max,
            "experience": o.experience, "employment_format": o.employment_format,
        })
    # sort: salary desc (nulls last), then title
    out.sort(key=lambda v: (-(v["salary_max"] or 0), v["title"]))
    spheres = sorted({o.sphere for o in rows if o.sphere})
    return {"vacancies": out, "count": len(out), "spheres": spheres}


# ---- Applications (transparent status) ----
@router.post("/applications", dependencies=[Depends(limiter(30, 60, "apply"))])
def create_application(body: ApplicationCreate, db: Session = Depends(get_db),
                       viewer: UserProfile = Depends(current_user)):
    targets = [t for t in (body.opportunity_id, body.gig_id, body.task_id) if t]
    if len(targets) != 1:
        raise HTTPException(400, "Укажите ровно одну цель отклика")
    # minor protection: block applying to work items
    if body.gig_id or body.task_id:
        _require_adult(viewer)
    if body.opportunity_id:
        opp = db.get(Opportunity, uuid.UUID(body.opportunity_id))
        if not opp:
            raise HTTPException(404, "Возможность не найдена")
        if opp.category in ("employment", "internship", "gig", "task") or opp.requires_employment:
            _require_adult(viewer)
    app = Application(
        user_id=viewer.id,
        opportunity_id=uuid.UUID(body.opportunity_id) if body.opportunity_id else None,
        gig_id=uuid.UUID(body.gig_id) if body.gig_id else None,
        task_id=uuid.UUID(body.task_id) if body.task_id else None,
        note=body.note, status="sent",
    )
    db.add(app)
    if body.opportunity_id:
        # mark match log as applied (anonymized analytics)
        db.query(MatchLog).filter(MatchLog.user_id == viewer.id,
                                  MatchLog.opportunity_id == uuid.UUID(body.opportunity_id)
                                  ).update({"applied": True})
    db.commit()
    db.refresh(app)
    return {"id": str(app.id), "status": app.status}


@router.get("/users/{user_id}/applications")
def my_applications(user_id: str, db: Session = Depends(get_db),
                    viewer: UserProfile = Depends(current_user)):
    if str(viewer.id) != user_id:
        raise HTTPException(403, "Нет доступа")
    apps = db.query(Application).filter(Application.user_id == viewer.id).order_by(
        Application.created_at.desc()).all()
    out = []
    for a in apps:
        title = None
        if a.opportunity_id:
            o = db.get(Opportunity, a.opportunity_id)
            title = o.title if o else None
        elif a.gig_id:
            g = db.get(Gig, a.gig_id)
            title = g.title if g else None
        elif a.task_id:
            t = db.get(Task, a.task_id)
            title = t.title if t else None
        out.append({"id": str(a.id), "title": title, "status": a.status,
                    "created_at": a.created_at.isoformat() if a.created_at else None})
    return {"applications": out}


@router.patch("/applications/{application_id}")
def update_application(application_id: str, body: ApplicationStatusUpdate,
                       db: Session = Depends(get_db), viewer: UserProfile = Depends(current_user)):
    app = db.get(Application, uuid.UUID(application_id))
    if not app:
        raise HTTPException(404, "Отклик не найден")
    allowed = {"sent", "viewed", "shortlisted", "accepted", "rejected"}
    if body.status not in allowed:
        raise HTTPException(400, "Недопустимый статус")
    # the applicant may withdraw; the gig/task owner may advance status
    is_owner = False
    if app.gig_id:
        g = db.get(Gig, app.gig_id)
        is_owner = g and g.seller_id == viewer.id
    elif app.task_id:
        t = db.get(Task, app.task_id)
        is_owner = t and t.poster_id == viewer.id
    if not (is_owner or app.user_id == viewer.id):
        raise HTTPException(403, "Нет доступа")
    app.status = body.status
    db.add(app)
    db.commit()
    return {"id": str(app.id), "status": app.status}


# ---- Job alerts ("work finds you") ----
@router.post("/job-alerts")
def create_job_alert(body: JobAlertCreate, db: Session = Depends(get_db),
                     viewer: UserProfile = Depends(current_user)):
    _require_adult(viewer)
    ja = JobAlert(user_id=viewer.id, criteria=body.criteria)
    db.add(ja)
    db.commit()
    db.refresh(ja)
    return {"id": str(ja.id), "active": ja.active}


@router.get("/users/{user_id}/job-alerts")
def list_job_alerts(user_id: str, db: Session = Depends(get_db),
                    viewer: UserProfile = Depends(current_user)):
    if str(viewer.id) != user_id:
        raise HTTPException(403, "Нет доступа")
    alerts = db.query(JobAlert).filter(JobAlert.user_id == viewer.id).all()
    return {"job_alerts": [{"id": str(a.id), "criteria": a.criteria, "active": a.active} for a in alerts]}
