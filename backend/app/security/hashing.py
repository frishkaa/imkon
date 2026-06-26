"""Password hashing with Argon2 (never plaintext)."""
from __future__ import annotations

from argon2 import PasswordHasher

_ph = PasswordHasher()


def hash_password(password: str) -> str:
    return _ph.hash(password)


def verify_password(stored_hash: str | None, password: str) -> bool:
    if not stored_hash:
        return False
    try:
        return _ph.verify(stored_hash, password)
    except Exception:
        return False
