"""HMAC-SHA256 signed, URL-safe tokens (sessions + share links).

Stateless and tamper-evident. Share-link revocation/one-time use is enforced
separately via the share_tokens table (see services/share.py)."""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time

from app.config import settings


def _b64e(b: bytes) -> str:
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode("ascii")


def _b64d(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def _sig(body: str) -> bytes:
    return hmac.new(settings.secret_key.encode(), body.encode(), hashlib.sha256).digest()


def sign(payload: dict, ttl_seconds: int | None = None) -> str:
    data = dict(payload)
    if ttl_seconds:
        data["exp"] = int(time.time()) + ttl_seconds
    body = _b64e(json.dumps(data, separators=(",", ":"), sort_keys=True).encode())
    return f"{body}.{_b64e(_sig(body))}"


def verify(token: str | None) -> dict | None:
    if not token:
        return None
    try:
        body, sig = token.split(".")
        if not hmac.compare_digest(_b64d(sig), _sig(body)):
            return None
        data = json.loads(_b64d(body))
        if "exp" in data and data["exp"] < int(time.time()):
            return None
        return data
    except Exception:
        return None
