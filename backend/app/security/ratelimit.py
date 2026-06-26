"""Simple in-memory fixed-window rate limiter (anti-spam/bot on registration
and applications). For multi-process prod, back this with Redis."""
from __future__ import annotations

import threading
import time

from fastapi import HTTPException, Request

from app.config import settings

_buckets: dict[str, list[float]] = {}
_lock = threading.Lock()


def allow(key: str, limit: int, window: float) -> bool:
    now = time.time()
    with _lock:
        q = _buckets.setdefault(key, [])
        cutoff = now - window
        while q and q[0] < cutoff:
            q.pop(0)
        if len(q) >= limit:
            return False
        q.append(now)
        return True


def limiter(limit: int = 30, window: float = 60.0, scope: str = "default"):
    """FastAPI dependency factory. Raises 429 when exceeded."""

    def _dep(request: Request) -> None:
        if settings.app_env.lower() == "test":  # tests register many users from one IP
            return
        ip = request.client.host if request.client else "anon"
        if not allow(f"{scope}:{ip}", limit, window):
            raise HTTPException(status_code=429, detail="Слишком много запросов. Попробуйте позже.")

    return _dep
