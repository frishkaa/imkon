"""ORM -> JSON-safe dict serialization. Centralizes UUID/datetime/encrypted
handling and the public-vs-private profile distinction (data minimization)."""
from __future__ import annotations

from typing import Any

from app.models import Achievement, Opportunity, Roadmap, RoadmapNode, UserProfile


def _s(v: Any) -> Any:
    if v is None:
        return None
    if hasattr(v, "isoformat"):
        return v.isoformat()
    return str(v) if not isinstance(v, (str, int, float, bool, list, dict)) else v


def opportunity_dict(o: Opportunity) -> dict:
    return {
        "id": str(o.id),
        "title": o.title,
        "organization": o.organization,
        "org_id": str(o.org_id) if o.org_id else None,
        "category": o.category,
        "description": o.description,
        "age_min": o.age_min,
        "age_max": o.age_max,
        "gender_req": o.gender_req,
        "location": o.location or [],
        "for_migrant_child": o.for_migrant_child,
        "min_legal_age": o.min_legal_age,
        "requires_employment": o.requires_employment,
        "requires_education": o.requires_education,
        "is_free": o.is_free,
        "salary_min": o.salary_min,
        "salary_max": o.salary_max,
        "experience": o.experience,
        "employment_format": o.employment_format,
        "sphere": o.sphere,
        "responsibilities": o.responsibilities,
        "deadline": _s(o.deadline),
        "contact_info": o.contact_info,
        "source_url": o.source_url,
        "skills_tags": o.skills_tags or [],
        "is_active": o.is_active,
    }


def opportunity_match_dict(o: Opportunity) -> dict:
    """Shape the matching engine consumes (deadline as date object)."""
    d = opportunity_dict(o)
    d["deadline"] = o.deadline  # keep as date for scoring
    return d


def achievement_dict(a: Achievement) -> dict:
    return {
        "id": str(a.id),
        "type": a.type,
        "title": a.title,
        "detail": a.detail or {},
        "verified": a.verified,
        "verified_by": a.verified_by,
        "verified_at": _s(a.verified_at),
        "proof_url": a.proof_url,
    }


def user_private(u: UserProfile, achievements: list[Achievement] | None = None) -> dict:
    """Full profile — owner only."""
    return {
        "id": str(u.id),
        "full_name": u.full_name,   # decrypted by EncryptedString
        "phone": u.phone,           # decrypted
        "email": u.email,
        "age": u.age,
        "gender": u.gender,
        "city": u.city,
        "region": u.region,
        "status": u.status,
        "is_migrant_child": u.is_migrant_child,
        "needs": u.needs or [],
        "interests": u.interests or [],
        "domains": u.domains or [],
        "education": u.education,
        "bio": u.bio,
        "languages": u.languages or [],
        "skills": u.skills or [],
        "trust_score": u.trust_score,
        "language_pref": u.language_pref,
        "profile_public": u.profile_public,
        "is_adult": u.age >= 18,
        "created_at": _s(u.created_at),
        "achievements": [achievement_dict(a) for a in (achievements or [])],
    }


def user_public(u: UserProfile, achievements: list[Achievement] | None = None) -> dict:
    """Public/shared profile — NO PII (no phone/full contact). Minimal data."""
    verified = [a for a in (achievements or []) if a.verified]
    return {
        "id": str(u.id),
        "display_name": (u.full_name or "Пользователь Имкон"),
        "city": u.city,
        "age_bucket": age_bucket(u.age),
        "trust_score": u.trust_score,
        "bio": u.bio,
        "education": u.education,
        "domains": u.domains or [],
        "skills": [s for s in (u.skills or []) if isinstance(s, dict)],
        "languages": u.languages or [],
        "verified_achievements": [achievement_dict(a) for a in verified],
        "is_adult": u.age >= 18,
    }


def age_bucket(age: int) -> str:
    if age < 18:
        return "14-17"
    if age < 23:
        return "18-22"
    if age < 28:
        return "23-27"
    return "28-35"


def _node_dict(n: RoadmapNode) -> dict:
    return {
        "id": str(n.id),
        "order": n.order_index,
        "label": n.label,
        "description": n.description,
        "status": n.status,
        "suggested_resource": n.suggested_resource,
        "resource": (
            {"id": str(n.linked_opportunity_id)} if n.linked_opportunity_id else None
        ),
        "is_final_job": n.is_final_job,
        "vacancy_id": str(n.linked_opportunity_id) if (n.is_final_job and n.linked_opportunity_id) else None,
    }


def roadmap_steps(roadmap: Roadmap) -> dict:
    nodes = sorted(roadmap.nodes, key=lambda n: n.order_index)
    done = sum(1 for n in nodes if n.status == "done")
    total = len(nodes)
    return {
        "id": str(roadmap.id),
        "goal": roadmap.profession or roadmap.goal_text,
        "goal_text": roadmap.goal_text,
        "progress": {
            "done": done,
            "total": total,
            "label": f"{done} из {total} шагов до первой оплачиваемой работы",
        },
        "steps": [_node_dict(n) for n in nodes],
    }
