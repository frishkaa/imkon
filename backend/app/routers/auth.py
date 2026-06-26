"""Auth: user login + organization login. (Registration is POST /users.)"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Organization, UserProfile
from app.schemas import LoginBody, OrgLoginBody
from app.security.access import current_user, issue_org_token, issue_user_token
from app.security.hashing import verify_password
from app.security.ratelimit import limiter
from app.serializers import user_private

router = APIRouter(tags=["auth"])


@router.post("/auth/login", dependencies=[Depends(limiter(20, 60, "login"))])
def login(body: LoginBody, db: Session = Depends(get_db)):
    if not body.email and not body.phone:
        raise HTTPException(400, "Укажите email или телефон")
    q = db.query(UserProfile)
    user = None
    if body.email:
        user = q.filter(UserProfile.email == body.email).first()
    # phone is encrypted, so we can't query it directly; email is the login key in dev
    if not user or not verify_password(user.password_hash, body.password):
        raise HTTPException(401, "Неверные данные для входа")
    return {"token": issue_user_token(user), "user": user_private(user)}


@router.post("/auth/org-login", dependencies=[Depends(limiter(20, 60, "orglogin"))])
def org_login(body: OrgLoginBody, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.login_email == body.login_email).first()
    if not org or not verify_password(org.password_hash, body.password):
        raise HTTPException(401, "Неверные данные организации")
    return {"token": issue_org_token(org),
            "org": {"id": str(org.id), "name": org.name, "type": org.type, "verified": org.verified}}


@router.get("/auth/me")
def me(user: UserProfile = Depends(current_user), db: Session = Depends(get_db)):
    from app.models import Achievement
    achs = db.query(Achievement).filter(Achievement.user_id == user.id).all()
    return user_private(user, achs)
