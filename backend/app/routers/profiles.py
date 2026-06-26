"""Shareable live profile: create/revoke link, public view (no auth), PDF export."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Achievement, Roadmap, ShareToken, UserProfile
from app.schemas import ShareCreate
from app.security.access import current_user, log_access
from app.serializers import roadmap_steps, user_public
from app.services import share as share_service
from app.services.pdf import resume_pdf

router = APIRouter(tags=["profiles"])


@router.post("/profiles/{user_id}/share")
def create_share(user_id: str, body: ShareCreate, db: Session = Depends(get_db),
                 viewer: UserProfile = Depends(current_user)):
    if str(viewer.id) != user_id:
        raise HTTPException(403, "Можно делиться только своим профилем")
    st, url = share_service.create_share(db, viewer, ttl_seconds=body.ttl_seconds,
                                         one_time=body.one_time)
    return {"token": st.token, "url": url, "one_time": st.one_time,
            "expires_at": st.expires_at.isoformat() if st.expires_at else None}


@router.delete("/profiles/{user_id}/share/{token}")
def revoke_share(user_id: str, token: str, db: Session = Depends(get_db),
                 viewer: UserProfile = Depends(current_user)):
    if str(viewer.id) != user_id:
        raise HTTPException(403, "Нет доступа")
    ok = share_service.revoke(db, viewer, token)
    if not ok:
        raise HTTPException(404, "Ссылка не найдена")
    return {"revoked": True}


def _public_payload(db: Session, user: UserProfile) -> dict:
    achs = db.query(Achievement).filter(Achievement.user_id == user.id).all()
    rms = db.query(Roadmap).filter(Roadmap.user_id == user.id).order_by(
        Roadmap.created_at.desc()).all()
    data = user_public(user, achs)
    data["roadmaps"] = [roadmap_steps(r) for r in rms]
    return data


@router.get("/p/{token}")
def public_profile(token: str, db: Session = Depends(get_db)):
    st = share_service.resolve_token(db, token)
    if not st:
        raise HTTPException(404, "Ссылка недействительна или отозвана")
    user = db.get(UserProfile, st.user_id)
    if not user:
        raise HTTPException(404, "Профиль не найден")
    log_access(db, actor="public", action="view_shared_profile", target_user_id=user.id,
               meta={"token": token})
    share_service.mark_used(db, st)
    return _public_payload(db, user)


@router.get("/p/{token}/resume.pdf")
def public_resume_pdf(token: str, db: Session = Depends(get_db)):
    st = share_service.resolve_token(db, token)
    if not st:
        raise HTTPException(404, "Ссылка недействительна")
    user = db.get(UserProfile, st.user_id)
    if not user:
        raise HTTPException(404, "Профиль не найден")
    achs = db.query(Achievement).filter(Achievement.user_id == user.id,
                                        Achievement.verified.is_(True)).all()
    from app.serializers import achievement_dict
    profile = user_public(user, achs)
    url = f"{settings.public_base_url.rstrip('/')}/p/{token}"
    pdf = resume_pdf(profile, [achievement_dict(a) for a in achs], public_url=url)
    share_service.mark_used(db, st)  # consume one-time links here too (no PDF-route bypass)
    return Response(content=pdf, media_type="application/pdf",
                    headers={"Content-Disposition": f'inline; filename="imkon_{token}.pdf"'})
