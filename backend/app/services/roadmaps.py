"""Persist a generated roadmap, link steps to real opportunities, and compute
step statuses (locked/current/done). A step is `done` when its linked
achievement is verified; the first non-done step is `current`; the rest locked.
"""
from __future__ import annotations

import re

from sqlalchemy.orm import Session

from app.matching.engine import apply_legal_filter
from app.models import JobAlert, Opportunity, Roadmap, RoadmapNode, UserProfile

_STOP = {"основы", "курс", "проект", "первая", "работа", "шаг"}


def _keywords(text: str) -> list[str]:
    return [w for w in re.split(r"\W+", (text or "").lower()) if len(w) > 3 and w not in _STOP]


def _find_opportunity(db: Session, step: dict, user: UserProfile) -> Opportunity | None:
    kws = _keywords(step.get("label", "") + " " + step.get("description", ""))
    rows = db.query(Opportunity).filter(Opportunity.is_active.is_(True)).limit(300).all()
    best, best_score = None, 0
    want_job = step.get("is_final_job")
    for o in rows:
        odict = {
            "requires_employment": o.requires_employment,
            "category": o.category,
            "min_legal_age": o.min_legal_age,
        }
        # never link a minor's step to a work item (legal filter)
        if not apply_legal_filter(user.age, odict):
            continue
        if want_job and o.category not in ("employment", "internship"):
            continue
        blob = f"{o.title} {o.description or ''} {' '.join(o.skills_tags or [])}".lower()
        s = sum(blob.count(k) for k in kws)
        if o.is_free:
            s += 1
        if s > best_score:
            best, best_score = o, s
    return best if best_score > 0 else None


def persist_roadmap(db: Session, user: UserProfile, goal_text: str, generated: dict) -> Roadmap:
    rm = Roadmap(user_id=user.id, goal_text=goal_text, profession=generated.get("profession"))
    db.add(rm)
    db.flush()
    final_node: RoadmapNode | None = None
    for st in generated["steps"]:
        node = RoadmapNode(
            roadmap_id=rm.id,
            label=st["label"],
            description=st.get("description"),
            order_index=st["order_index"],
            suggested_resource=st.get("suggested_resource"),
            is_final_job=st.get("is_final_job", False),
            status="locked",
        )
        link = _find_opportunity(db, st, user)
        if link:
            node.linked_opportunity_id = link.id
        db.add(node)
        if node.is_final_job:
            final_node = node
    db.flush()
    # "work finds you": if the final step has no real vacancy, create a job alert
    if final_node is not None and final_node.linked_opportunity_id is None and user.age >= 18:
        db.add(JobAlert(user_id=user.id, criteria={"goal": generated.get("profession") or goal_text,
                                                   "city": user.city}))
    recompute_step_statuses(db, rm)
    db.commit()
    db.refresh(rm)
    return rm


def recompute_step_statuses(db: Session, roadmap: Roadmap) -> None:
    nodes = sorted(roadmap.nodes, key=lambda n: n.order_index)
    first_not_done = next((n for n in nodes if n.status != "done"), None)
    for n in nodes:
        if n.status == "done":
            continue
        n.status = "current" if (first_not_done and n.id == first_not_done.id) else "locked"
        db.add(n)
    db.commit()


def mark_node_done(db: Session, node: RoadmapNode) -> None:
    node.status = "done"
    db.add(node)
    db.flush()
    rm = db.get(Roadmap, node.roadmap_id)
    if rm:
        recompute_step_statuses(db, rm)
