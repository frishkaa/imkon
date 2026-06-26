"""Trust Score = growth, not origin. Sum of weights of VERIFIED achievements.
No prestige bonus. Effort and verified progress only."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.constants import TRUST_WEIGHTS
from app.models import Achievement, UserProfile


def achievement_weight(a: Achievement) -> int:
    if a.type == "project":
        sc = (a.detail or {}).get("score") or (a.detail or {}).get("project_score")
        if isinstance(sc, (int, float)):
            return 5 + int(max(0, min(10, sc)))  # +5..+15
        return 10
    return TRUST_WEIGHTS.get(a.type, 5)


def recompute_trust_score(db: Session, user: UserProfile) -> int:
    achs = (
        db.query(Achievement)
        .filter(Achievement.user_id == user.id, Achievement.verified.is_(True))
        .all()
    )
    total = sum(achievement_weight(a) for a in achs)
    user.trust_score = total
    db.add(user)
    db.commit()
    db.refresh(user)
    return total
