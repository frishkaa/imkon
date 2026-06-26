"""Revocable share links (TTL / one-time) for the public live profile."""
from __future__ import annotations

import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.config import settings
from app.models import ShareToken, UserProfile


def create_share(db: Session, user: UserProfile, *, ttl_seconds: int | None = None,
                 one_time: bool = False) -> tuple[ShareToken, str]:
    token = secrets.token_urlsafe(12)
    expires = (
        datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds) if ttl_seconds else None
    )
    st = ShareToken(user_id=user.id, token=token, one_time=one_time, expires_at=expires)
    # sharing implies making the profile viewable
    user.profile_public = True
    db.add_all([st, user])
    db.commit()
    db.refresh(st)
    url = f"{settings.public_base_url.rstrip('/')}/p/{token}"
    return st, url


def resolve_token(db: Session, token: str) -> ShareToken | None:
    st = db.query(ShareToken).filter(ShareToken.token == token).first()
    if not st or st.revoked:
        return None
    if st.expires_at and st.expires_at < datetime.now(timezone.utc):
        return None
    if st.one_time and st.used:
        return None
    return st


def mark_used(db: Session, st: ShareToken) -> None:
    if st.one_time and not st.used:
        st.used = True
        db.add(st)
        db.commit()


def revoke(db: Session, user: UserProfile, token: str) -> bool:
    st = (
        db.query(ShareToken)
        .filter(ShareToken.token == token, ShareToken.user_id == user.id)
        .first()
    )
    if not st:
        return False
    st.revoked = True
    db.add(st)
    db.commit()
    return True
