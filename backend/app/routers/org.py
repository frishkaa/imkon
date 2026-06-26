"""Organization cabinet: pending verification queue + org notifications."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Organization, UserProfile, VerificationRequest
from app.security.access import current_org
from app.services import notifications

router = APIRouter(prefix="/org", tags=["org"])


@router.get("/{org_id}/verifications")
def org_verifications(org_id: str, status: str = Query("pending"),
                      db: Session = Depends(get_db),
                      org: Organization = Depends(current_org)):
    if str(org.id) != org_id:
        raise HTTPException(403, "Доступ только к своей организации")
    q = db.query(VerificationRequest).filter(VerificationRequest.org_id == org.id)
    if status and status != "all":
        q = q.filter(VerificationRequest.status == status)
    out = []
    for vr in q.order_by(VerificationRequest.requested_at.desc()).all():
        user = db.get(UserProfile, vr.user_id)
        out.append({
            "id": str(vr.id),
            "user_id": str(vr.user_id),
            # minimal identity for the org to recognize the claim — first name only
            "user_display": (user.full_name or "Пользователь").split(" ")[0] if user else "—",
            "claim_type": vr.claim_type,
            "claim_detail": vr.claim_detail,
            "status": vr.status,
            "requested_at": vr.requested_at.isoformat() if vr.requested_at else None,
        })
    return {"org": {"id": str(org.id), "name": org.name}, "count": len(out), "items": out}


@router.get("/{org_id}/notifications")
def org_notifications(org_id: str, org: Organization = Depends(current_org)):
    if str(org.id) != org_id:
        raise HTTPException(403, "Доступ только к своей организации")
    return {"items": notifications.get_org_notifications(org.id)}
