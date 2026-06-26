"""Lightweight RAG: retrieve real Tajik course/vacancy/university text from the
DB so the small model rephrases verified facts instead of inventing orgs."""
from __future__ import annotations

import re

from sqlalchemy.orm import Session

from app.models import Opportunity, University

_STOP = {"хочу", "стать", "быть", "want", "become", "the", "и", "в", "на"}


def _terms(goal: str) -> list[str]:
    return [t for t in re.split(r"\W+", (goal or "").lower()) if len(t) > 3 and t not in _STOP]


def retrieve_context(db: Session, goal: str, city: str | None = None, limit: int = 8) -> str:
    terms = _terms(goal)
    opps = db.query(Opportunity).filter(Opportunity.is_active.is_(True)).limit(300).all()
    scored: list[tuple[int, Opportunity]] = []
    for o in opps:
        blob = f"{o.title} {o.description or ''} {' '.join(o.skills_tags or [])} {o.category}".lower()
        s = sum(blob.count(t) for t in terms)
        if city and city.lower() in " ".join(o.location or []).lower():
            s += 1
        if s > 0:
            scored.append((s, o))
    scored.sort(key=lambda x: -x[0])
    lines = [
        f"- {o.title} ({o.organization or '—'}, {o.category}, "
        f"{'бесплатно' if o.is_free else 'платно'})"
        for _, o in scored[:limit]
    ]
    # add a couple of universities if relevant
    for u in db.query(University).limit(20).all():
        progs = " ".join(p.get("name", "") for p in (u.programs or []) if isinstance(p, dict)).lower()
        if any(t in progs for t in terms):
            lines.append(f"- ВУЗ: {u.name} ({u.city})")
    return "\n".join(lines[: limit + 2])
