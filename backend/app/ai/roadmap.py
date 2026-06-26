"""Roadmap generation (Роҳи Ман core). Returns a normalized dict; persistence
lives in services/roadmaps.py. Always returns a valid path (fallback on failure)."""
from __future__ import annotations

from sqlalchemy.orm import Session

from app.ai.llm_client import complete_json
from app.ai.prompts import ROADMAP_SYSTEM
from app.ai.rag import retrieve_context


def _fallback_roadmap(goal: str) -> dict:
    """Generic but real-shaped path so the demo never shows an empty roadmap."""
    return {
        "profession": goal.strip()[:60] or "Специалист",
        "steps": [
            {"order_index": 1, "label": "Основы и базовые навыки",
             "description": "Освой базу профессии по бесплатным материалам.",
             "suggested_resource": "UNICEF Lab / бесплатные курсы", "est_time": "1-2 мес",
             "is_final_job": False},
            {"order_index": 2, "label": "Практический курс",
             "description": "Пройди структурированный курс с практикой.",
             "suggested_resource": "Ilmhona", "est_time": "2-3 мес", "is_final_job": False},
            {"order_index": 3, "label": "Проект в портфолио",
             "description": "Сделай реальный проект и получи подтверждение.",
             "suggested_resource": "SmartHub", "est_time": "1 мес", "is_final_job": False},
            {"order_index": 4, "label": "Стажировка / волонтёрство",
             "description": "Набери опыт на реальных задачах.",
             "suggested_resource": "Партнёрские организации", "est_time": "1-2 мес",
             "is_final_job": False},
            {"order_index": 5, "label": "Первая оплачиваемая работа",
             "description": "Откликнись на стартовую вакансию по профессии.",
             "suggested_resource": "Вакансии Имкон", "est_time": "—", "is_final_job": True},
        ],
    }


def _normalize(data: dict, goal: str) -> dict:
    if not isinstance(data, dict) or not isinstance(data.get("steps"), list) or not data["steps"]:
        data = _fallback_roadmap(goal)
    steps = []
    for i, st in enumerate(data["steps"], start=1):
        if not isinstance(st, dict):
            continue
        steps.append({
            "order_index": i,
            "label": str(st.get("label") or f"Шаг {i}")[:120],
            "description": str(st.get("description") or "")[:600],
            "suggested_resource": str(st.get("suggested_resource") or "")[:160],
            "est_time": str(st.get("est_time") or "")[:40],
            "is_final_job": bool(st.get("is_final_job", False)),
        })
    if not steps:
        return _normalize(_fallback_roadmap(goal), goal)
    # ensure exactly the last step is the final job
    for s in steps:
        s["is_final_job"] = False
    steps[-1]["is_final_job"] = True
    return {"profession": str(data.get("profession") or goal)[:80], "steps": steps}


def generate(db: Session, *, goal_text: str, age: int, city: str | None,
             status: str | None) -> dict:
    ctx = retrieve_context(db, goal_text, city)
    system = ROADMAP_SYSTEM.format(goal=goal_text, age=age, city=city or "—",
                                   status=status or "—")
    user_msg = (
        f"КОНТЕКСТ из базы (реальные ресурсы Таджикистана):\n{ctx or '(нет данных)'}\n\n"
        f"Построй путь к цели: {goal_text}"
    )
    data = complete_json(system, user_msg, fallback=_fallback_roadmap(goal_text),
                         max_tokens=1500, temperature=0.3)
    return _normalize(data, goal_text)
