"""IMKON FastAPI application entrypoint."""
from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.ai.llm_client import provider_info
from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import Opportunity  # noqa: F401 (ensure models imported for metadata)
from app.routers import (
    ai,
    auth,
    catalog,
    dev,
    earning,
    org,
    profiles,
    roadmaps,
    users,
    verifications,
)
from app.services.seed import seed_all

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("imkon")

app = FastAPI(title="IMKON API", version="0.1.0",
              description="Career-ecosystem platform for vulnerable youth (Tajikistan).")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_origin_regex=r"https://([a-z0-9-]+\.)*netlify\.app|http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for r in (auth.router, users.router, ai.router, roadmaps.router, verifications.router,
          org.router, profiles.router, earning.router, catalog.router, dev.router):
    app.include_router(r)


@app.on_event("startup")
def _startup() -> None:
    Base.metadata.create_all(bind=engine)
    # auto-seed real reference data on first boot (idempotent)
    db = SessionLocal()
    try:
        result = seed_all(db, reset=False)
        log.info("seed: %s", result)
    except Exception as exc:  # never block startup
        log.warning("seed skipped: %s", exc)
    finally:
        db.close()


@app.get("/")
def root() -> dict:
    return {"app": "IMKON API", "version": "0.1.0", "docs": "/docs",
            "ai": provider_info()}


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "ai": provider_info(),
            "llm_provider": settings.llm_provider, "env": settings.app_env}
