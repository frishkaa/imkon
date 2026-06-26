"""Large synthetic-data stress test: generate hundreds of users in the real DB
and prove the legal filter holds for every minor over the full catalog."""
from app.constants import WORK_CATEGORIES
from app.database import SessionLocal
from app.matching.engine import get_matches
from app.models import Gig, Opportunity, Task, UserProfile
from app.serializers import opportunity_match_dict
from app.services.synthetic import generate_synthetic


def test_generate_and_filter_at_scale():
    db = SessionLocal()
    try:
        summary = generate_synthetic(db, users=300, gigs=40, tasks=40, applications=100)
        assert summary["users"] == 300
        assert summary["minors"] > 0 and summary["adults"] > 0

        opps = [opportunity_match_dict(o)
                for o in db.query(Opportunity).filter(Opportunity.is_active.is_(True)).all()]

        minors = db.query(UserProfile).filter(UserProfile.age < 18).limit(400).all()
        assert minors
        leaks = 0
        for u in minors:
            ud = {"age": u.age, "gender": u.gender, "city": u.city, "needs": u.needs or [],
                  "is_migrant_child": u.is_migrant_child, "status": u.status}
            for m in get_matches(ud, opps, limit=500):
                if m["category"] in WORK_CATEGORIES or m.get("requires_employment"):
                    leaks += 1
        assert leaks == 0, f"work leaked to minors at scale: {leaks}"

        # gigs & tasks were created only by adults (18+ earning rule)
        adult_ids = {u.id for u in db.query(UserProfile).filter(UserProfile.age >= 18).all()}
        for g in db.query(Gig).all():
            assert g.seller_id in adult_ids
        for t in db.query(Task).all():
            assert t.poster_id in adult_ids
    finally:
        db.close()
