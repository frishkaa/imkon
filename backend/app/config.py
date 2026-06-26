"""Central configuration. All settings come from .env (repo root) + api.txt.

The single most important switch lives here: ``LLM_PROVIDER``.
  - "deepseek" -> DEVELOPMENT (synthetic data only). Key read from api.txt.
  - "local"    -> PRODUCTION (local Qwen via Ollama/vLLM). No data leaves server.
Flipping dev->prod is ONE line in .env (LLM_PROVIDER=local). See ai/llm_client.py.
"""
from __future__ import annotations

import base64
import binascii
import functools
import os
import pathlib

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

# repo root = .../Imkon  (this file is .../Imkon/backend/app/config.py)
ROOT = pathlib.Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- AI provider switch ---
    llm_provider: str = Field(default="deepseek")  # "deepseek" | "local"
    deepseek_base_url: str = "https://api.deepseek.com"
    deepseek_model: str = "deepseek-chat"
    deepseek_key_file: str = "api.txt"
    local_llm_url: str = "http://localhost:11434"
    local_llm_model: str = "qwen2.5:14b"

    # --- Database ---
    database_url: str = "postgresql+psycopg://imkon:imkon@localhost:5433/imkon"

    # --- Security ---
    encryption_key: str = ""
    secret_key: str = "dev-insecure-secret-change-me"

    # --- Telegram (bot stays OFF if empty) ---
    telegram_bot_token: str = ""

    # --- App ---
    app_env: str = "development"
    public_base_url: str = "http://localhost:5173"
    api_base_url: str = "http://localhost:8000"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"

    # --- Supabase (parity only; unused in local-Postgres mode) ---
    supabase_url: str = ""
    supabase_key: str = ""

    # ---- derived helpers ----
    @property
    def sqlalchemy_url(self) -> str:
        """Normalize any Postgres URL (Render/Neon give postgres:// or postgresql://)
        to the psycopg3 driver SQLAlchemy expects."""
        url = self.database_url
        if url.startswith("postgres://"):
            url = "postgresql+psycopg://" + url[len("postgres://"):]
        elif url.startswith("postgresql://"):
            url = "postgresql+psycopg://" + url[len("postgresql://"):]
        return url

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.app_env.lower().startswith("prod")

    def deepseek_api_key(self) -> str:
        """DeepSeek key: env DEEPSEEK_API_KEY first (for hosting), else api.txt (local dev)."""
        env_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
        if env_key:
            return env_key
        p = ROOT / self.deepseek_key_file
        if p.exists():
            return p.read_text(encoding="utf-8").strip()
        return ""

    def encryption_key_bytes(self) -> bytes:
        """Return a 32-byte AES-256 key. Accepts base64 / hex / raw."""
        k = self.encryption_key.strip()
        if k:
            for decode in (base64.b64decode, binascii.unhexlify):
                try:
                    b = decode(k)
                    if len(b) == 32:
                        return b
                except Exception:
                    pass
            b = k.encode("utf-8")
            if len(b) >= 32:
                return b[:32]
            return (b + b"\x00" * 32)[:32]
        # dev fallback only — .env should always set a real key
        return b"\x00" * 32


@functools.lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
