"""Notification queue + Market Navigator.

In-memory queue for the demo (swap for Redis in prod). If TELEGRAM_BOT_TOKEN is
set and a user/org has a telegram_id, a real Telegram push is attempted;
otherwise the message is just queued and visible via the Notifications screen.
"""
from __future__ import annotations

import logging
import uuid

import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.models import JobAlert, Opportunity, UserProfile

log = logging.getLogger("imkon.notify")

# in-memory queues keyed by recipient id (string)
_user_queue: dict[str, list[dict]] = {}
_org_queue: dict[str, list[dict]] = {}


def _telegram_send(chat_id: str, text: str) -> None:
    if not settings.telegram_bot_token or not chat_id:
        return
    try:
        httpx.post(
            f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage",
            json={"chat_id": chat_id, "text": text},
            timeout=10,
        )
    except Exception as exc:
        log.warning("telegram send failed: %s", exc)


def notify_user(db: Session, *, user_id: uuid.UUID, text: str, meta: dict | None = None) -> None:
    item = {"text": text, "meta": meta or {}, "read": False}
    _user_queue.setdefault(str(user_id), []).insert(0, item)
    user = db.get(UserProfile, user_id)
    if user and user.telegram_id:
        _telegram_send(user.telegram_id, text)


def notify_org(db: Session, *, org_id: uuid.UUID, text: str, meta: dict | None = None) -> None:
    _org_queue.setdefault(str(org_id), []).insert(0, {"text": text, "meta": meta or {}, "read": False})


def get_user_notifications(user_id: uuid.UUID) -> list[dict]:
    return _user_queue.get(str(user_id), [])


def get_org_notifications(org_id: uuid.UUID) -> list[dict]:
    return _org_queue.get(str(org_id), [])


def mark_all_read(user_id: uuid.UUID) -> None:
    for n in _user_queue.get(str(user_id), []):
        n["read"] = True


def run_market_navigator(db: Session) -> int:
    """For each active job alert, push a message if a fresh matching vacancy
    exists. Returns count of notifications sent. (Demo: matches by city/keyword.)"""
    sent = 0
    alerts = db.query(JobAlert).filter(JobAlert.active.is_(True)).all()
    for alert in alerts:
        crit = alert.criteria or {}
        q = db.query(Opportunity).filter(
            Opportunity.is_active.is_(True),
            Opportunity.category.in_(["employment", "internship"]),
        )
        goal = (crit.get("goal") or "").lower()
        match = None
        for o in q.limit(100).all():
            blob = f"{o.title} {o.description or ''}".lower()
            if not goal or any(w in blob for w in goal.split() if len(w) > 3):
                if not crit.get("city") or crit["city"] in (o.location or []) or "all" in (o.location or []):
                    match = o
                    break
        if match:
            notify_user(
                db, user_id=alert.user_id,
                text=f"💼 Появилась вакансия под твой путь: {match.title} ({match.organization}).",
                meta={"opportunity_id": str(match.id)},
            )
            sent += 1
    return sent
