"""PROVIDER-AGNOSTIC LLM CLIENT — the single place every model call goes through.

    >>> Flip dev -> prod with ONE line in .env:  LLM_PROVIDER=local <<<

  * "deepseek"  (DEVELOPMENT, synthetic data only): OpenAI-compatible API,
                key read from api.txt. Model class ~ the local target.
  * "local"     (PRODUCTION): Ollama serving Qwen 3.5 9B / Qwen 2.5 14B.
                No data ever leaves the server.

Same prompts, same JSON contracts for both providers. Because the production
target is a small (9-14B) model, prompts stay simple and we force strict JSON.
Every public call is wrapped so a provider outage NEVER breaks a request — a
caller-supplied fallback is returned instead (demo resilience).
"""
from __future__ import annotations

import json
import logging
import re

import httpx

from app.config import settings

log = logging.getLogger("imkon.ai")

_TIMEOUT = httpx.Timeout(90.0, connect=10.0)


class LLMUnavailable(Exception):
    pass


def provider_info() -> dict:
    p = settings.llm_provider.lower()
    if p == "local":
        return {"provider": "local", "model": settings.local_llm_model, "url": settings.local_llm_url}
    return {"provider": "deepseek", "model": settings.deepseek_model,
            "key_present": bool(settings.deepseek_api_key())}


# --------------------------------------------------------------------------- #
# Provider implementations                                                    #
# --------------------------------------------------------------------------- #
def _deepseek_chat(messages, temperature, max_tokens, force_json) -> str:
    key = settings.deepseek_api_key()
    if not key:
        raise LLMUnavailable("DeepSeek key missing (api.txt)")
    payload: dict = {
        "model": settings.deepseek_model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False,
    }
    if force_json:
        payload["response_format"] = {"type": "json_object"}
    resp = httpx.post(
        f"{settings.deepseek_base_url}/chat/completions",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        json=payload,
        timeout=_TIMEOUT,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


def _local_chat(messages, temperature, max_tokens, force_json) -> str:
    """Ollama native /api/chat. (vLLM users: point at its OpenAI-compatible URL
    and switch to the deepseek-style branch — same message contract.)"""
    payload: dict = {
        "model": settings.local_llm_model,
        "messages": messages,
        "stream": False,
        "options": {"temperature": temperature, "num_predict": max_tokens},
    }
    if force_json:
        payload["format"] = "json"
    resp = httpx.post(f"{settings.local_llm_url}/api/chat", json=payload, timeout=_TIMEOUT)
    resp.raise_for_status()
    return resp.json()["message"]["content"]


# --------------------------------------------------------------------------- #
# Public API                                                                  #
# --------------------------------------------------------------------------- #
def chat(messages: list[dict], *, temperature: float = 0.4,
         max_tokens: int = 900, force_json: bool = False) -> str:
    provider = settings.llm_provider.lower()
    if provider == "local":
        return _local_chat(messages, temperature, max_tokens, force_json)
    return _deepseek_chat(messages, temperature, max_tokens, force_json)


def _extract_json(text: str):
    """Tolerant JSON extraction — small models sometimes wrap JSON in prose."""
    if text is None:
        return None
    text = text.strip()
    # strip ```json fences
    text = re.sub(r"^```(?:json)?|```$", "", text.strip(), flags=re.IGNORECASE).strip()
    try:
        return json.loads(text)
    except Exception:
        pass
    # grab first {...} or [...] block
    for pattern in (r"\{.*\}", r"\[.*\]"):
        m = re.search(pattern, text, re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                continue
    return None


def chat_json(messages: list[dict], *, fallback, temperature: float = 0.2,
              max_tokens: int = 1100) -> dict | list:
    try:
        raw = chat(messages, temperature=temperature, max_tokens=max_tokens, force_json=True)
        data = _extract_json(raw)
        if data is None:
            log.warning("LLM returned non-JSON; using fallback")
            return fallback
        return data
    except Exception as exc:  # network/auth/timeout/etc — never break the request
        log.warning("LLM call failed (%s); using fallback", exc)
        return fallback


def complete_text(system: str, user: str, *, temperature: float = 0.5,
                  max_tokens: int = 900, fallback: str = "") -> str:
    try:
        return chat(
            [{"role": "system", "content": system}, {"role": "user", "content": user}],
            temperature=temperature, max_tokens=max_tokens,
        )
    except Exception as exc:
        log.warning("LLM text call failed (%s); using fallback", exc)
        return fallback


def complete_json(system: str, user: str, *, fallback, temperature: float = 0.2,
                  max_tokens: int = 1100):
    return chat_json(
        [{"role": "system", "content": system}, {"role": "user", "content": user}],
        fallback=fallback, temperature=temperature, max_tokens=max_tokens,
    )
