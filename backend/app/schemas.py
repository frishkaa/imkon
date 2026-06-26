"""Pydantic request bodies. Responses are serialized via app/serializers.py."""
from __future__ import annotations

from pydantic import BaseModel, Field


class UserCreate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    email: str | None = None
    password: str | None = None
    age: int = Field(ge=10, le=99)
    gender: str = "all"
    city: str | None = None
    region: str | None = None
    status: str | None = None  # 18+ only
    is_migrant_child: bool = False
    needs: list[str] = []        # need ids OR canonical categories
    interests: list[str] = []
    domains: list[str] = []       # "в чём разбираешься": it/design/marketing/...
    education: str | None = None  # education level
    bio: str | None = None        # short about / goal
    languages: list | dict = []   # [{lang, level}] spoken languages
    skills: list | dict = []      # [{name, verified, domain}] technologies/skills
    language_pref: str = "russian"
    consent_given: bool = False
    telegram_id: str | None = None


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    email: str | None = None
    city: str | None = None
    status: str | None = None
    is_migrant_child: bool | None = None
    needs: list[str] | None = None
    interests: list[str] | None = None
    domains: list[str] | None = None
    education: str | None = None
    bio: str | None = None
    languages: list | dict | None = None
    skills: list | dict | None = None
    language_pref: str | None = None
    profile_public: bool | None = None


class LoginBody(BaseModel):
    email: str | None = None
    phone: str | None = None
    password: str


class OrgLoginBody(BaseModel):
    login_email: str
    password: str


class DialogBody(BaseModel):
    user_id: str | None = None
    history: list[dict] = []  # [{"role","content"}]


class ResumeBody(BaseModel):
    user_id: str
    lang: str | None = None
    # optional extra context for the guided AI resume builder
    linkedin: str | None = None
    phone: str | None = None
    experience: str | None = None
    target: str | None = None


class AiTextBody(BaseModel):
    prompt: str
    lang: str | None = None


class AiImproveBody(BaseModel):
    text: str
    kind: str = "text"   # resume | gig | bio | text
    lang: str | None = None


class RoadmapBody(BaseModel):
    user_id: str
    goal_text: str


class VerificationCreate(BaseModel):
    user_id: str
    org_id: str
    claim_type: str
    claim_detail: dict = {}
    roadmap_node_id: str | None = None


class VerificationResolve(BaseModel):
    decision: str  # "confirmed" | "rejected"


class ShareCreate(BaseModel):
    ttl_seconds: int | None = None
    one_time: bool = False


class GigCreate(BaseModel):
    title: str
    category: str | None = None
    price: float | None = None
    delivery_days: int | None = None
    description: str | None = None


class TaskCreate(BaseModel):
    title: str
    location: str | None = None
    pay: float | None = None
    duration_hours: float | None = None
    category: str | None = None


class ApplicationCreate(BaseModel):
    opportunity_id: str | None = None
    gig_id: str | None = None
    task_id: str | None = None
    note: str | None = None


class ApplicationStatusUpdate(BaseModel):
    status: str


class JobAlertCreate(BaseModel):
    criteria: dict = {}
