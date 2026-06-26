"""Verification requests (create + resolve). Org queue lives in org.py."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Organization, UserProfile, VerificationRequest
from app.schemas import VerificationCreate, VerificationResolve
from app.security.access import current_org, current_user
from app.services import verification as verif_service

router = APIRouter(tags=["verifications"])


@router.post("/verifications")
def create_verification(body: VerificationCreate, db: Session = Depends(get_db),
                        viewer: UserProfile = Depends(current_user)):
    if str(viewer.id) != body.user_id:
        raise HTTPException(403, "Можно запрашивать подтверждение только для себя")
    if not db.get(Organization, uuid.UUID(body.org_id)):
        raise HTTPException(404, "Организация не найдена")
    vr = verif_service.create_request(
        db, user_id=viewer.id, org_id=uuid.UUID(body.org_id),
        claim_type=body.claim_type, claim_detail=body.claim_detail,
        roadmap_node_id=uuid.UUID(body.roadmap_node_id) if body.roadmap_node_id else None,
    )
    return {"id": str(vr.id), "status": vr.status}


@router.post("/verifications/{verification_id}/resolve")
def resolve_verification(verification_id: str, body: VerificationResolve,
                         db: Session = Depends(get_db),
                         org: Organization = Depends(current_org)):
    vr = db.get(VerificationRequest, uuid.UUID(verification_id))
    if not vr:
        raise HTTPException(404, "Запрос не найден")
    if vr.org_id != org.id:
        raise HTTPException(403, "Эта заявка не для вашей организации")
    if body.decision not in ("confirmed", "rejected"):
        raise HTTPException(400, "decision must be confirmed|rejected")
    if vr.status != "pending":
        raise HTTPException(400, "Заявка уже обработана")
    return verif_service.resolve(db, vr, body.decision)
