# models/candidate.py
from datetime import UTC, datetime
from typing import Any, ClassVar, Literal

from beanie import Document
from pydantic import Field
from pymongo import ASCENDING, DESCENDING, IndexModel


class CandidateDoc(Document):
    name: str
    email: str
    phone: str | None = None
    job_id: str
    job_title: str
    company_id: str  # User's company ID for multi-tenancy
    stage: Literal[
        "Applied",
        "Screened",
        "Phone Screen",
        "Technical",
        "Final Round",
        "Offer",
        "Hired",
        "Rejected",
    ] = "Applied"
    status: Literal["active", "archived", "rejected", "hired"] = "active"
    source: Literal["LinkedIn", "Naukri", "Referral", "Direct", "Other"] = "Direct"

    resume_url: str | None = None
    # resume_text is NOT stored in MongoDB — fetch from S3 via resume_url for re-scoring

    overall_score: float = 0.0
    ats_score: float = 0.0
    ai_score: dict[str, Any] | None = None
    parsed_resume: dict[str, Any] | None = None

    notes: list[dict[str, Any]] = Field(default_factory=list)
    timeline: list[dict[str, Any]] = Field(default_factory=list)
    interviews: list[dict[str, Any]] = Field(default_factory=list)

    days_in_stage: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))

    class Settings:
        name = "candidates"
        indexes: ClassVar[list[IndexModel]] = [
            IndexModel([("company_id", ASCENDING)]),
            IndexModel([("job_id", ASCENDING)]),
            IndexModel([("company_id", ASCENDING), ("stage", ASCENDING)]),
            IndexModel([("company_id", ASCENDING), ("overall_score", DESCENDING)]),
            IndexModel(
                [("company_id", ASCENDING), ("email", ASCENDING)],
                unique=True,
                sparse=True,
            ),
            # Full-text search index for candidate name + email
            IndexModel(
                [("name", "text"), ("email", "text")],
                name="candidates_text_search",
            ),
        ]
