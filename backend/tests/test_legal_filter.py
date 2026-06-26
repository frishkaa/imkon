"""MINOR PROTECTION — the most important guarantee in the system.
A user < 18 must NEVER see jobs/gigs/tasks/internships or employment-required
items, under ANY input. Tested as a unit, on the 4 spec profiles, and as a
property across hundreds of synthetic minors with every possible need set."""
import itertools
import random

from app.constants import WORK_CATEGORIES, CATEGORIES, CITIES
from app.matching.engine import apply_legal_filter, basic_eligibility, get_matches, score


def _opp(**kw):
    base = {"is_active": True, "category": "education", "location": ["all"],
            "min_legal_age": 14, "requires_employment": False, "gender_req": "all"}
    base.update(kw)
    return base


# ---- unit: apply_legal_filter ----
def test_minor_blocked_from_each_work_category():
    for cat in WORK_CATEGORIES:
        assert apply_legal_filter(15, _opp(category=cat)) is False


def test_minor_blocked_from_requires_employment():
    assert apply_legal_filter(16, _opp(category="education", requires_employment=True)) is False


def test_minor_allowed_non_work():
    for cat in ("education", "vocational", "legal", "health", "grant", "volunteer"):
        assert apply_legal_filter(15, _opp(category=cat)) is True


def test_min_legal_age_enforced():
    assert apply_legal_filter(15, _opp(category="education", min_legal_age=16)) is False
    assert apply_legal_filter(16, _opp(category="education", min_legal_age=16)) is True


def test_adult_sees_work():
    for cat in WORK_CATEGORIES:
        assert apply_legal_filter(18, _opp(category=cat, min_legal_age=18)) is True


# ---- the 4 spec profiles, over the full seeded catalog ----
def _matches_for(profile, opps, limit=200):
    return get_matches(profile, opps, limit=limit)


def test_four_profiles(seeded_opportunities):
    opps = seeded_opportunities
    p15 = {"age": 15, "gender": "female", "city": "Dushanbe",
           "needs": list(CATEGORIES), "is_migrant_child": True, "status": None}
    p19_neet = {"age": 19, "gender": "female", "city": "Dushanbe",
                "needs": list(CATEGORIES), "is_migrant_child": False, "status": "neither"}
    p19_student = {"age": 19, "gender": "male", "city": "Khujand",
                   "needs": ["education", "vocational"], "status": "studying"}
    p22_worker = {"age": 22, "gender": "male", "city": "Bokhtar",
                  "needs": ["employment", "task"], "status": "working"}

    m15 = _matches_for(p15, opps)
    assert all(m["category"] not in WORK_CATEGORIES for m in m15), "minor saw work!"
    assert all(not m.get("requires_employment") for m in m15)
    assert len(m15) > 0

    m19 = _matches_for(p19_neet, opps)
    assert any(m["category"] in WORK_CATEGORIES for m in m19), "adult NEET should see work"

    assert len(_matches_for(p19_student, opps)) > 0
    assert any(m["category"] in WORK_CATEGORIES for m in _matches_for(p22_worker, opps))


# ---- property test: hundreds of synthetic minors, every need combo ----
def test_property_minors_never_see_work(seeded_opportunities):
    opps = seeded_opportunities
    rng = random.Random(42)
    leaks = 0
    checked = 0
    # exhaustive-ish: many random minors with random (incl. work) need sets
    for _ in range(800):
        age = rng.randint(14, 17)
        needs = rng.sample(CATEGORIES, k=rng.randint(1, len(CATEGORIES)))
        profile = {"age": age, "gender": rng.choice(["male", "female", "all"]),
                   "city": rng.choice(CITIES), "needs": needs,
                   "is_migrant_child": rng.random() < 0.3,
                   "status": rng.choice([None, "neither", "studying"])}
        matches = get_matches(profile, opps, limit=500)
        for m in matches:
            checked += 1
            if m["category"] in WORK_CATEGORIES or m.get("requires_employment"):
                leaks += 1
    assert leaks == 0, f"{leaks} work items leaked to minors across {checked} matches"


# ---- scoring rules ----
def test_need_match_scores_15():
    u = {"age": 20, "needs": ["grant"], "is_migrant_child": False, "status": None}
    assert score(u, _opp(category="grant")) >= 15


def test_migrant_child_bonus():
    u = {"age": 16, "needs": [], "is_migrant_child": True, "status": None}
    s = score(u, _opp(category="education", for_migrant_child=True))
    assert s >= 15  # +5 migrant +10 for_migrant_child


def test_neet_priority():
    u = {"age": 19, "needs": [], "is_migrant_child": False, "status": "neither"}
    assert score(u, _opp(category="education")) >= 5


def test_education_level_no_bonus():
    # requires_education present must NOT raise the score
    u = {"age": 20, "needs": ["education"], "is_migrant_child": False, "status": None}
    s_plain = score(u, _opp(category="education"))
    s_req = score(u, _opp(category="education", requires_education="university"))
    assert s_plain == s_req
