"""Large synthetic-data generator for realistic stress testing.
Synthetic only — no real people. Many minors on purpose so the legal filter is
exercised hard."""
from __future__ import annotations

import random

from faker import Faker
from sqlalchemy.orm import Session

from app.constants import CITIES, INTERESTS, needs_to_categories
from app.models import Application, Gig, Opportunity, Task, UserProfile
from app.security.crypto import encrypt

fake = Faker("ru_RU")

_ADULT_NEEDS = ["education", "vocational", "legal", "health", "grant", "volunteer",
                "employment", "gig", "task"]
_MINOR_NEEDS = ["education", "vocational", "legal", "health", "grant", "volunteer"]
_INTEREST_IDS = [i["id"] for i in INTERESTS]


def _make_user(seed_idx: int) -> UserProfile:
    # weighted age: ~35% minors so the legal filter is well tested
    r = random.random()
    if r < 0.35:
        age = random.randint(14, 17)
    elif r < 0.7:
        age = random.randint(18, 22)
    elif r < 0.9:
        age = random.randint(23, 27)
    else:
        age = random.randint(28, 35)

    is_adult = age >= 18
    needs_pool = _ADULT_NEEDS if is_adult else _MINOR_NEEDS
    needs = random.sample(needs_pool, k=random.randint(1, 3))
    status = random.choice(["studying", "working", "both", "neither"]) if is_adult else None
    gender = random.choice(["male", "female"])

    u = UserProfile(
        full_name=fake.name(),                       # encrypted via EncryptedString
        phone=f"+992{random.randint(900000000, 999999999)}",
        email=f"user{seed_idx}@example.tj",
        age=age,
        gender=gender,
        city=random.choice(CITIES),
        status=status,
        is_migrant_child=(not is_adult and random.random() < 0.25),
        needs=needs,
        interests=random.sample(_INTEREST_IDS, k=random.randint(0, 3)) if not is_adult else [],
        languages=[{"lang": "tajik", "level": "native"},
                   {"lang": "russian", "level": random.choice(["A2", "B1", "B2"])}],
        skills=[{"name": s, "verified": False, "proof_url": None}
                for s in random.sample(["Python", "Excel", "English", "Design", "Sales"], k=random.randint(0, 2))],
        language_pref=random.choice(["tajik", "russian", "both"]),
        consent_given=True,
        trust_score=0,
    )
    return u


def generate_synthetic(db: Session, *, users: int = 500, gigs: int = 60,
                       tasks: int = 60, applications: int = 200) -> dict:
    created_users: list[UserProfile] = []
    batch = []
    for i in range(users):
        batch.append(_make_user(i))
        if len(batch) >= 200:
            db.add_all(batch)
            db.flush()
            created_users.extend(batch)
            batch = []
    if batch:
        db.add_all(batch)
        db.flush()
        created_users.extend(batch)
    db.commit()

    adults = [u for u in created_users if u.age >= 18]

    # gigs + tasks only from adults (18+ rule)
    made_gigs, made_tasks = [], []
    for _ in range(min(gigs, max(1, len(adults)))):
        seller = random.choice(adults) if adults else None
        if not seller:
            break
        g = Gig(seller_id=seller.id, title=fake.catch_phrase()[:60],
                category=random.choice(["design", "writing", "it", "translation"]),
                price=random.choice([50, 100, 150, 200, 300]),
                delivery_days=random.randint(1, 7), description=fake.text(120))
        db.add(g)
        made_gigs.append(g)
    for _ in range(min(tasks, max(1, len(adults)))):
        poster = random.choice(adults) if adults else None
        if not poster:
            break
        t = Task(poster_id=poster.id, title=fake.bs()[:60],
                 location=random.choice(CITIES), pay=random.choice([30, 50, 80, 120]),
                 duration_hours=random.choice([2, 4, 8]),
                 category=random.choice(["delivery", "cleaning", "tutoring", "event"]))
        db.add(t)
        made_tasks.append(t)
    db.flush()

    # applications to seeded opportunities (respecting nothing — just data volume)
    opp_ids = [o.id for o in db.query(Opportunity.id).limit(200).all()]
    opp_ids = [row[0] if isinstance(row, tuple) else row for row in opp_ids]
    made_apps = 0
    if opp_ids:
        for _ in range(applications):
            u = random.choice(created_users)
            db.add(Application(user_id=u.id, opportunity_id=random.choice(opp_ids),
                               status=random.choice(["sent", "viewed", "shortlisted", "accepted", "rejected"])))
            made_apps += 1
    db.commit()

    return {
        "users": len(created_users),
        "minors": sum(1 for u in created_users if u.age < 18),
        "adults": len(adults),
        "gigs": len(made_gigs),
        "tasks": len(made_tasks),
        "applications": made_apps,
    }
