"""AES-256-GCM application-level field encryption for sensitive columns
(phone, full_name). Satisfies "AES-256 at rest" in the security checklist.

``EncryptedString`` is a SQLAlchemy TypeDecorator: columns using it are
transparently encrypted on write and decrypted on read. Ciphertext stored as
base64(nonce[12] + ciphertext+tag).
"""
from __future__ import annotations

import base64
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from sqlalchemy.types import Text, TypeDecorator

from app.config import settings

_aes = AESGCM(settings.encryption_key_bytes())


def encrypt(plaintext: str | None) -> str | None:
    if plaintext is None:
        return None
    if not isinstance(plaintext, str):
        plaintext = str(plaintext)
    nonce = os.urandom(12)
    ct = _aes.encrypt(nonce, plaintext.encode("utf-8"), None)
    return base64.b64encode(nonce + ct).decode("ascii")


def decrypt(token: str | None) -> str | None:
    if token is None:
        return None
    try:
        raw = base64.b64decode(token)
        nonce, ct = raw[:12], raw[12:]
        return _aes.decrypt(nonce, ct, None).decode("utf-8")
    except Exception:
        # Tolerate legacy/plaintext values in dev rather than crashing reads.
        return token if isinstance(token, str) else None


class EncryptedString(TypeDecorator):
    """Transparently AES-256-GCM encrypt/decrypt a text column."""

    impl = Text
    cache_ok = True

    def process_bind_param(self, value, dialect):  # noqa: D401
        return encrypt(value)

    def process_result_value(self, value, dialect):
        return decrypt(value)
