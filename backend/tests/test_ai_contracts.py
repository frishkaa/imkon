"""AI robustness: malformed model output must NOT break requests (fallbacks),
JSON extraction tolerance, and dialog/roadmap shape guarantees."""
import app.ai.llm_client as llm
from app.ai.dialog import run_dialog
from app.ai.llm_client import _extract_json
from tests.conftest import auth, register


def test_extract_json_tolerant():
    assert _extract_json('{"a":1}') == {"a": 1}
    assert _extract_json('```json\n{"a":1}\n```') == {"a": 1}
    assert _extract_json('Вот ответ: {"a": 1} — спасибо') == {"a": 1}
    assert _extract_json("полный мусор без json") is None


def test_chat_json_fallback_on_junk(monkeypatch):
    monkeypatch.setattr(llm, "chat", lambda *a, **k: "это не json вообще")
    out = llm.chat_json([{"role": "user", "content": "x"}], fallback={"ok": True})
    assert out == {"ok": True}


def test_chat_json_fallback_on_exception(monkeypatch):
    def boom(*a, **k):
        raise RuntimeError("network down")
    monkeypatch.setattr(llm, "chat", boom)
    out = llm.chat_json([{"role": "user", "content": "x"}], fallback={"ok": "fb"})
    assert out == {"ok": "fb"}


def test_dialog_handles_garbage(monkeypatch):
    monkeypatch.setattr(llm, "chat", lambda *a, **k: "no json here")
    res = run_dialog([{"role": "user", "content": "помоги"}])
    assert res["done"] is True
    assert isinstance(res["needs"], list)


def test_roadmap_fallback_still_valid(client, monkeypatch):
    # force the model to fail -> roadmap must still persist a valid path
    def boom(*a, **k):
        raise RuntimeError("model unavailable")
    monkeypatch.setattr(llm, "chat", boom)
    data = register(client, age=20, status="neither")
    rm = client.post("/ai/roadmap", json={"user_id": data["user"]["id"],
                                          "goal_text": "повар"}, headers=auth(data["token"]))
    assert rm.status_code == 200
    body = rm.json()
    assert len(body["steps"]) >= 5
    assert body["steps"][0]["status"] == "current"
    assert body["steps"][-1]["is_final_job"] is True
