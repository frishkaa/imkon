"""Dialog-based matching: up to 3 short questions -> needs JSON."""
from __future__ import annotations

from app.ai.llm_client import chat_json
from app.ai.prompts import DIALOG_SYSTEM


def run_dialog(history: list[dict]) -> dict:
    """history = [{"role":"user"/"assistant","content":...}, ...].
    Returns either {"question": "...", "done": false} or
    {"needs":[...], "interests":[...], "notes":"", "done": true}."""
    messages = [{"role": "system", "content": DIALOG_SYSTEM}, *history]
    fallback = {"needs": [], "interests": [], "notes": "", "done": True}
    data = chat_json(messages, fallback=fallback, temperature=0.3, max_tokens=400)
    if not isinstance(data, dict):
        return fallback
    if not data.get("done") and data.get("question"):
        return {"question": str(data["question"])[:300], "done": False}
    # normalize completion shape
    return {
        "needs": [str(n) for n in (data.get("needs") or []) if n],
        "interests": [str(i) for i in (data.get("interests") or []) if i],
        "goal": str(data.get("goal") or "")[:80],
        "positions": [str(p) for p in (data.get("positions") or []) if p][:4],
        "notes": str(data.get("notes") or "")[:500],
        "done": True,
    }
