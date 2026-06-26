"""All ORM models for IMKON (full schema from spec section 3, plus
share_tokens and access_logs to satisfy the security checklist).

Sensitive columns (phone, full_name) use EncryptedString (AES-256-GCM at rest).
"""
from __future__ import annotations

import uuid
from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.security.crypto import EncryptedString


def _uuid() -> uuid.UUID:
    return uuid.uuid4()


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    telegram_id: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    phone: Mapped[str | None] = mapped_column(EncryptedString, nullable=True)        # ENCRYPTED
    email: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    full_name: Mapped[str | None] = mapped_column(EncryptedString, nullable=True)    # ENCRYPTED
    password_hash: Mapped[str | None] = mapped_column(String, nullable=True)         # argon2
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str | None] = mapped_column(String, default="all")
    city: Mapped[str | None] = mapped_column(String, index=True)
    region: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str | None] = mapped_column(String, nullable=True)  # 18+ only
    is_migrant_child: Mapped[bool] = mapped_column(Boolean, default=False)
    needs: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    interests: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    domains: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)  # "в чём разбираешься"
    education: Mapped[str | None] = mapped_column(String, nullable=True)      # education level
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)             # short about / goal
    languages: Mapped[list | dict] = mapped_column(JSONB, default=list)       # [{lang, level}]
    skills: Mapped[list | dict] = mapped_column(JSONB, default=list)          # [{name, verified, domain}]
    trust_score: Mapped[int] = mapped_column(Integer, default=0)
    language_pref: Mapped[str] = mapped_column(String, default="tajik")
    profile_public: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_given: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_active: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    achievements: Mapped[list["Achievement"]] = relationship(back_populates="user")
    roadmaps: Mapped[list["Roadmap"]] = relationship(back_populates="user")


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String, nullable=False)
    type: Mapped[str] = mapped_column(String)  # school|employer|university
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    contact: Mapped[str | None] = mapped_column(String, nullable=True)
    brand_color: Mapped[str | None] = mapped_column(String, nullable=True)  # logo bg color
    logo_text: Mapped[str | None] = mapped_column(String, nullable=True)    # monogram text
    sphere: Mapped[str | None] = mapped_column(String, nullable=True)       # IT / Маркетинг / ...
    login_email: Mapped[str | None] = mapped_column(String, nullable=True, index=True)
    password_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Opportunity(Base):
    __tablename__ = "opportunities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    title: Mapped[str] = mapped_column(String, nullable=False)
    organization: Mapped[str | None] = mapped_column(String, nullable=True)
    org_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    category: Mapped[str] = mapped_column(String, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    age_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    age_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender_req: Mapped[str] = mapped_column(String, default="all")
    location: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    for_migrant_child: Mapped[bool] = mapped_column(Boolean, default=False)
    min_legal_age: Mapped[int] = mapped_column(Integer, default=14)
    requires_employment: Mapped[bool] = mapped_column(Boolean, default=False)
    requires_education: Mapped[str | None] = mapped_column(String, nullable=True)  # FILTER only
    is_free: Mapped[bool] = mapped_column(Boolean, default=True)
    # --- vacancy detail (employment/internship) ---
    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    experience: Mapped[str | None] = mapped_column(String, nullable=True)  # none|junior|middle|senior
    employment_format: Mapped[str | None] = mapped_column(String, nullable=True)  # office|remote|hybrid
    sphere: Mapped[str | None] = mapped_column(String, nullable=True)
    responsibilities: Mapped[str | None] = mapped_column(Text, nullable=True)
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    contact_info: Mapped[str | None] = mapped_column(String, nullable=True)
    source_url: Mapped[str | None] = mapped_column(String, nullable=True)
    skills_tags: Mapped[list[str]] = mapped_column(ARRAY(String), default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_profiles.id"))
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"))
    claim_type: Mapped[str] = mapped_column(String)  # course|employment|degree|...
    claim_detail: Mapped[dict] = mapped_column(JSONB, default=dict)
    roadmap_node_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("roadmap_nodes.id"), nullable=True
    )
    status: Mapped[str] = mapped_column(String, default="pending")  # pending|confirmed|rejected
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_profiles.id"))
    org_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    type: Mapped[str] = mapped_column(String)  # course|job|degree|project|test
    title: Mapped[str] = mapped_column(String)
    detail: Mapped[dict] = mapped_column(JSONB, default=dict)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    verified_by: Mapped[str | None] = mapped_column(String, nullable=True)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    proof_url: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["UserProfile"] = relationship(back_populates="achievements")


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_profiles.id"))
    goal_text: Mapped[str] = mapped_column(Text)
    profession: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["UserProfile"] = relationship(back_populates="roadmaps")
    nodes: Mapped[list["RoadmapNode"]] = relationship(
        back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapNode.order_index"
    )


class RoadmapNode(Base):
    __tablename__ = "roadmap_nodes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    roadmap_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("roadmaps.id"))
    label: Mapped[str] = mapped_column(String)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order_index: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String, default="locked")  # locked|current|done
    suggested_resource: Mapped[str | None] = mapped_column(String, nullable=True)
    linked_opportunity_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("opportunities.id"), nullable=True
    )
    is_final_job: Mapped[bool] = mapped_column(Boolean, default=False)

    roadmap: Mapped["Roadmap"] = relationship(back_populates="nodes")


class Gig(Base):
    __tablename__ = "gigs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    seller_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_profiles.id"))
    title: Mapped[str] = mapped_column(String)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    price: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    delivery_days: Mapped[int | None] = mapped_column(Integer, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    poster_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_profiles.id"))
    title: Mapped[str] = mapped_column(String)
    location: Mapped[str | None] = mapped_column(String, nullable=True)
    pay: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    duration_hours: Mapped[float | None] = mapped_column(Numeric, nullable=True)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="open")  # open|taken|done
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_profiles.id"))
    opportunity_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("opportunities.id"), nullable=True)
    gig_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("gigs.id"), nullable=True)
    task_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("tasks.id"), nullable=True)
    status: Mapped[str] = mapped_column(String, default="sent")  # sent|viewed|shortlisted|accepted|rejected
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class JobAlert(Base):
    __tablename__ = "job_alerts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_profiles.id"))
    criteria: Mapped[dict] = mapped_column(JSONB, default=dict)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class University(Base):
    __tablename__ = "universities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    name: Mapped[str] = mapped_column(String)
    city: Mapped[str | None] = mapped_column(String, nullable=True)
    programs: Mapped[list | dict] = mapped_column(JSONB, default=list)
    requirements: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class MatchLog(Base):
    __tablename__ = "matches_log"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_profiles.id"))
    opportunity_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("opportunities.id"))
    score: Mapped[int] = mapped_column(Integer)
    matched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    clicked: Mapped[bool] = mapped_column(Boolean, default=False)
    applied: Mapped[bool] = mapped_column(Boolean, default=False)
    # denormalized, anonymized dims for the dashboard (NO PII)
    city: Mapped[str | None] = mapped_column(String, nullable=True)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    age_bucket: Mapped[str | None] = mapped_column(String, nullable=True)


class ShareToken(Base):
    __tablename__ = "share_tokens"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user_profiles.id"))
    token: Mapped[str] = mapped_column(String, unique=True, index=True)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    one_time: Mapped[bool] = mapped_column(Boolean, default=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AccessLog(Base):
    __tablename__ = "access_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=_uuid)
    actor: Mapped[str | None] = mapped_column(String, nullable=True)  # user_id / org_id / "public"
    action: Mapped[str] = mapped_column(String)
    target_user_id: Mapped[uuid.UUID | None] = mapped_column(nullable=True)
    meta: Mapped[dict] = mapped_column(JSONB, default=dict)
    at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
