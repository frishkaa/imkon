"""Паспорти Эътимод verification flow. Source confirms, never the user.
request -> confirm -> achievement(verified) -> trust recompute -> roadmap step ✅
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import (
    Achievement,
    Organization,
    RoadmapNode,
    UserProfile,
    VerificationRequest,
)
from app.services import notifications
from app.services.roadmaps import mark_node_done
from app.services.trust import recompute_trust_score

_CLAIM_TO_ACH = {
    "course": "course",
    "employment": "job",
    "job": "job",
    "degree": "degree",
    "project": "project",
    "test": "test",
    "language": "test",
}


def create_request(db: Session, *, user_id: uuid.UUID, org_id: uuid.UUID,
                   claim_type: str, claim_detail: dict,
                   roadmap_node_id: uuid.UUID | None = None) -> VerificationRequest:
    vr = VerificationRequest(
        user_id=user_id, org_id=org_id, claim_type=claim_type,
        claim_detail=claim_detail or {}, roadmap_node_id=roadmap_node_id,
        status="pending",
    )
    db.add(vr)
    db.commit()
    db.refresh(vr)
    org = db.get(Organization, org_id)
    notifications.notify_org(
        db, org_id=org_id,
        text=f"Новый запрос на подтверждение: {claim_type} — {claim_detail}",
        meta={"verification_id": str(vr.id)},
    )
    return vr


def resolve(db: Session, vr: VerificationRequest, decision: str) -> dict:
    vr.status = "confirmed" if decision == "confirmed" else "rejected"
    vr.resolved_at = datetime.now(timezone.utc)
    db.add(vr)

    result: dict = {"verification_id": str(vr.id), "status": vr.status,
                    "achievement_id": None, "trust_score": None, "roadmap_step_done": False}

    if vr.status == "confirmed":
        org = db.get(Organization, vr.org_id)
        detail = vr.claim_detail or {}
        title = (
            detail.get("course") or detail.get("title")
            or detail.get("position") or detail.get("degree") or vr.claim_type
        )
        ach = Achievement(
            user_id=vr.user_id,
            org_id=vr.org_id,
            type=_CLAIM_TO_ACH.get(vr.claim_type, "course"),
            title=str(title),
            detail=detail,
            verified=True,
            verified_by=org.name if org else None,
            verified_at=datetime.now(timezone.utc),
            proof_url=detail.get("proof_url"),
        )
        db.add(ach)
        db.flush()
        result["achievement_id"] = str(ach.id)

        user = db.get(UserProfile, vr.user_id)
        result["trust_score"] = recompute_trust_score(db, user)

        if vr.roadmap_node_id:
            node = db.get(RoadmapNode, vr.roadmap_node_id)
            if node:
                mark_node_done(db, node)
                result["roadmap_step_done"] = True
        notifications.notify_user(
            db, user_id=vr.user_id,
            text=f"✅ Подтверждено: {title}. Trust Score: {result['trust_score']}.",
        )
    db.commit()
    return result
