# models/job.py
from datetime import UTC, datetime
from typing import ClassVar, Literal

from beanie import Document
from pydantic import Field
from pymongo import ASCENDING, IndexModel


class JobDoc(Document):
    title: str
    department: str
    location: str
    employment_type: Literal["Full-time", "Part-time", "Contract", "Internship"] = "Full-time"
    description: str
    required_skills: list[str] = Field(default_factory=list)
    required_experience_years: int = 0
    status: Literal["Draft", "Active", "Paused", "Closed"] = "Draft"
    applicant_count: int = 0
    avg_ai_score: float = 0.0
    created_by: str  # User ID
    created_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    closed_at: datetime | None = None
    close_reason: str | None = None

    class Settings:
        name = "jobs"
        indexes: ClassVar[list[IndexModel]] = [
            IndexModel([("created_by", ASCENDING)]),
            IndexModel([("created_by", ASCENDING), ("status", ASCENDING)]),
        ]
