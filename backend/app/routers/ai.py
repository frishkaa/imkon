"""AI endpoints: dialog -> needs JSON, résumé, roadmap (persisted)."""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai import dialog as ai_dialog
from app.ai import resume as ai_resume
from app.ai import roadmap as ai_roadmap
from app.ai.llm_client import complete_text
from app.constants import WORK_CATEGORIES
from app.database import get_db
from app.models import Achievement, UserProfile
from app.schemas import AiImproveBody, AiTextBody, DialogBody, ResumeBody, RoadmapBody
from app.security.access import current_user
from app.serializers import achievement_dict, roadmap_steps
from app.services.roadmaps import persist_roadmap

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/dialog")
def dialog(body: DialogBody, db: Session = Depends(get_db)):
    result = ai_dialog.run_dialog(body.history)
    # if completed and a user is supplied, persist needs/interests
    if result.get("done") and body.user_id:
        user = db.get(UserProfile, uuid.UUID(body.user_id))
        if user:
            needs = [n for n in result.get("needs", [])]
            if user.age < 18:
                needs = [n for n in needs if n not in WORK_CATEGORIES]
            if needs:
                user.needs = list(dict.fromkeys((user.needs or []) + needs))
            if result.get("interests") and user.age < 18:
                user.interests = list(dict.fromkeys((user.interests or []) + result["interests"]))
            db.add(user)
            db.commit()
    return result


@router.post("/resume")
def resume(body: ResumeBody, db: Session = Depends(get_db),
           viewer: UserProfile = Depends(current_user)):
    if str(viewer.id) != body.user_id:
        raise HTTPException(403, "Нет доступа")
    achs = db.query(Achievement).filter(
        Achievement.user_id == viewer.id, Achievement.verified.is_(True)
    ).all()
    profile = {
        "full_name": viewer.full_name, "city": viewer.city, "email": viewer.email,
        "phone": viewer.phone, "bio": viewer.bio, "education": viewer.education,
        "domains": viewer.domains, "skills": viewer.skills, "languages": viewer.languages,
        "trust_score": viewer.trust_score,
        # guided builder extras
        "linkedin": body.linkedin, "experience": body.experience, "target": body.target,
    }
    text = ai_resume.generate_resume(profile, [achievement_dict(a) for a in achs],
                                     lang=body.lang or viewer.language_pref)
    return {"resume": text}


@router.post("/text")
def ai_text(body: AiTextBody, viewer: UserProfile = Depends(current_user)):
    """Generic short-text helper (e.g. gig description). Falls back to empty."""
    txt = complete_text(
        "Ты пишешь короткие тексты на простом русском или таджикском. Верни только текст.",
        body.prompt, temperature=0.6, max_tokens=300, fallback="",
    )
    return {"text": txt}


_IMPROVE_SYS = {
    "resume": "Ты редактор резюме. Перепиши текст профессионально, ясно и кратко на {lang}. "
              "Сохрани все факты, не выдумывай. Верни только улучшенный текст.",
    "gig": "Ты копирайтер фриланс-площадки. Сделай описание услуги продающим, конкретным и коротким "
           "на {lang}. Верни только текст.",
    "bio": "Ты помогаешь написать короткое «о себе» для профиля на {lang}. Дружелюбно, уверенно, 2-3 "
           "предложения. Верни только текст.",
    "text": "Улучши текст: понятнее, грамотнее, профессиональнее, на {lang}. Верни только текст.",
}


@router.post("/improve")
def ai_improve(body: AiImproveBody, viewer: UserProfile = Depends(current_user)):
    """Improve a piece of text (resume / gig description / bio) with AI."""
    lang_word = "таджикском" if (body.lang or viewer.language_pref) == "tajik" else (
        "английском" if (body.lang or "") == "en" else "русском")
    system = _IMPROVE_SYS.get(body.kind, _IMPROVE_SYS["text"]).format(lang=lang_word)
    improved = complete_text(system, body.text, temperature=0.5, max_tokens=600, fallback=body.text)
    return {"text": improved.strip() or body.text}


@router.post("/roadmap")
def roadmap(body: RoadmapBody, db: Session = Depends(get_db),
            viewer: UserProfile = Depends(current_user)):
    if str(viewer.id) != body.user_id:
        raise HTTPException(403, "Нет доступа")
    if not body.goal_text.strip():
        raise HTTPException(400, "Укажите цель")
    generated = ai_roadmap.generate(db, goal_text=body.goal_text, age=viewer.age,
                                    city=viewer.city, status=viewer.status)
    rm = persist_roadmap(db, viewer, body.goal_text, generated)
    return roadmap_steps(rm)
