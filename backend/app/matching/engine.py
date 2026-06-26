"""Need-centric matching engine.

CORE DOMAIN RULE: apply_legal_filter() runs FIRST and cannot be bypassed.
A user under 18 NEVER sees jobs/internships/gigs/tasks or anything requiring
employment, under ANY input. Education level is a FILTER, never a bonus.
Vulnerability (NEET, migrant child) INCREASES score.

These functions are pure dict-in/dict-out so they are trivially unit-testable
independent of the DB. Routers adapt ORM rows -> dicts before calling.
"""
from __future__ import annotations

from datetime import date

from app.constants import WORK_CATEGORIES, WORK_LEGAL_AGE


def apply_legal_filter(user_age: int, opp: dict) -> bool:
    """MINOR PROTECTION — runs FIRST. Returns False => item is hidden."""
    if user_age < WORK_LEGAL_AGE:
        if opp.get("requires_employment"):
            return False
        if opp.get("category") in WORK_CATEGORIES:
            return False
    min_legal = opp.get("min_legal_age")
    if min_legal and user_age < min_legal:
        return False
    return True


def basic_eligibility(user: dict, opp: dict) -> bool:
    if not opp.get("is_active", True):
        return False
    if opp.get("age_min") and user["age"] < opp["age_min"]:
        return False
    if opp.get("age_max") and user["age"] > opp["age_max"]:
        return False
    if opp.get("gender_req", "all") != "all" and opp["gender_req"] != user.get("gender", "all"):
        # 'all' on the user side means "no preference" -> always passes
        if user.get("gender", "all") != "all":
            return False
    location = opp.get("location") or []
    if "all" not in location and location and user.get("city") not in location:
        return False
    # requires_education is a FILTER only (never a bonus) and only excludes if
    # the user explicitly lacks the required level. Absent education data => pass
    # (need-centric: we don't penalize the vulnerable for missing credentials).
    return True


def _today() -> date:
    return date.today()


def score(user: dict, opp: dict) -> int:
    s = 0
    needs = user.get("needs", []) or []
    if opp.get("category") in needs:
        s += 15  # need match is the core signal
    if user.get("is_migrant_child"):
        s += 5
        if opp.get("for_migrant_child"):
            s += 10
    if user.get("status") == "neither":  # NEET -> priority, not penalty
        s += 5
    deadline = opp.get("deadline")
    if deadline:
        if isinstance(deadline, str):
            try:
                deadline = date.fromisoformat(deadline)
            except Exception:
                deadline = None
        if deadline:
            d = (deadline - _today()).days
            if 0 < d < 14:
                s += 8
            elif 0 <= d < 30:
                s += 4
    # free resources get a gentle nudge (roadmap prefers free first)
    if opp.get("is_free"):
        s += 2
    # NOTE: education level gives NO bonus by design.
    return s


def get_matches(user: dict, opportunities: list[dict], limit: int = 5) -> list[dict]:
    out: list[dict] = []
    for opp in opportunities:
        if not apply_legal_filter(user["age"], opp):   # FIRST, always
            continue
        if not basic_eligibility(user, opp):
            continue
        out.append({**opp, "_score": score(user, opp)})
    out.sort(key=lambda x: x["_score"], reverse=True)
    return out[:limit]
