"""Résumé / CV generation from profile + VERIFIED achievements only."""
from __future__ import annotations

import json

from app.ai.llm_client import complete_text
from app.ai.prompts import RESUME_SYSTEM


def _fallback_resume(profile: dict, achievements: list[dict], lang: str) -> str:
    name = profile.get("full_name") or "—"
    lines = [f"# {name}", ""]
    if profile.get("goal"):
        lines += ["## Цель", profile["goal"], ""]
    skills = profile.get("skills") or []
    if skills:
        lines.append("## Навыки")
        for s in skills:
            mark = " ✅" if (isinstance(s, dict) and s.get("verified")) else ""
            nm = s.get("name") if isinstance(s, dict) else str(s)
            lines.append(f"- {nm}{mark}")
        lines.append("")
    if achievements:
        lines.append("## Опыт и достижения (подтверждённые)")
        for a in achievements:
            lines.append(f"- {a.get('title')} — {a.get('verified_by', '')} ✅")
        lines.append("")
    contacts = [c for c in (profile.get("email"), profile.get("city")) if c]
    if contacts:
        lines += ["## Контакты", ", ".join(contacts)]
    return "\n".join(lines)


def generate_resume(profile: dict, achievements: list[dict], lang: str = "ru") -> str:
    lang_word = "таджикском" if lang == "tajik" else "русском"
    system = RESUME_SYSTEM.format(lang=lang_word)
    payload = {
        "name": profile.get("full_name"),
        "goal": profile.get("goal") or profile.get("target"),
        "target_position": profile.get("target"),
        "city": profile.get("city"),
        "email": profile.get("email"),
        "phone": profile.get("phone"),
        "linkedin": profile.get("linkedin"),
        "bio": profile.get("bio"),
        "education": profile.get("education"),
        "domains": profile.get("domains"),
        "skills": profile.get("skills"),
        "languages": profile.get("languages"),
        "work_experience": profile.get("experience"),
        "trust_score": profile.get("trust_score"),
        "verified_achievements": achievements,
    }
    fallback = _fallback_resume(profile, achievements, lang)
    text = complete_text(
        system, json.dumps(payload, ensure_ascii=False),
        temperature=0.4, max_tokens=1200, fallback=fallback,
    )
    return text.strip() or fallback
