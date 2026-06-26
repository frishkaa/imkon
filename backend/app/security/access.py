"""App-level access control (the RLS-equivalent the API actually enforces) +
sensitive-read access logging.

Rules (mirror the Postgres RLS policies documented in db/rls_policies.sql):
  * a profile row is fully readable only by its owner;
  * an employer/org may read a profile only if profile_public OR an application links them;
  * an org sees only verification_requests for its own org_id.
"""
from __future__ import annotations

import uuid

from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import AccessLog, Organization, UserProfile
from app.security import tokens


def _payload(authorization: str | None) -> dict | None:
    if not authorization:
        return None
    parts = authorization.split()
    raw = parts[1] if len(parts) == 2 and parts[0].lower() == "bearer" else authorization
    return tokens.verify(raw)


def current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> UserProfile:
    payload = _payload(authorization)
    if not payload or payload.get("kind") != "user":
        raise HTTPException(status_code=401, detail="Требуется авторизация")
    user = db.get(UserProfile, uuid.UUID(str(payload["sub"])))
    if not user:
        raise HTTPException(status_code=401, detail="Недействительный токен")
    return user


def optional_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> UserProfile | None:
    payload = _payload(authorization)
    if not payload or payload.get("kind") != "user":
        return None
    try:
        return db.get(UserProfile, uuid.UUID(str(payload["sub"])))
    except Exception:
        return None


def current_org(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Organization:
    payload = _payload(authorization)
    if not payload or payload.get("kind") != "org":
        raise HTTPException(status_code=401, detail="Требуется вход организации")
    org = db.get(Organization, uuid.UUID(str(payload["sub"])))
    if not org:
        raise HTTPException(status_code=401, detail="Недействительный токен организации")
    return org


def issue_user_token(user: UserProfile) -> str:
    return tokens.sign({"kind": "user", "sub": str(user.id)}, ttl_seconds=60 * 60 * 24 * 30)


def issue_org_token(org: Organization) -> str:
    return tokens.sign({"kind": "org", "sub": str(org.id)}, ttl_seconds=60 * 60 * 24 * 30)


def log_access(db: Session, *, actor: str | None, action: str,
               target_user_id: uuid.UUID | None = None, meta: dict | None = None) -> None:
    """Record a sensitive read/access. Best-effort; never breaks the request."""
    try:
        db.add(AccessLog(actor=actor, action=action,
                         target_user_id=target_user_id, meta=meta or {}))
        db.commit()
    except Exception:
        db.rollback()


def can_view_full_profile(viewer: UserProfile | Organization | None, target: UserProfile,
                          linked_via_application: bool = False) -> bool:
    if isinstance(viewer, UserProfile) and viewer.id == target.id:
        return True
    if target.profile_public:
        return True
    if isinstance(viewer, Organization) and linked_via_application:
        return True
    return False
