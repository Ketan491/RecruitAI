# schemas/job.py
from typing import Literal

from pydantic import BaseModel


class JobCreate(BaseModel):
    title: str
    department: str
    location: str
    employment_type: Literal["Full-time", "Part-time", "Contract", "Internship"] = "Full-time"
    description: str
    required_skills: list[str] = []
    required_experience_years: int = 0
    status: Literal["Draft", "Active", "Paused", "Closed"] = "Draft"


class JobUpdate(BaseModel):
    title: str | None = None
    department: str | None = None
    location: str | None = None
    employment_type: Literal["Full-time", "Part-time", "Contract", "Internship"] | None = None
    description: str | None = None
    required_skills: list[str] | None = None
    required_experience_years: int | None = None
    status: Literal["Draft", "Active", "Paused", "Closed"] | None = None


class JobStatusUpdate(BaseModel):
    status: Literal["Draft", "Active", "Paused", "Closed"]
    close_reason: str | None = None


class JobOut(BaseModel):
    id: str
    title: str
    department: str
    location: str
    employment_type: str
    description: str
    required_skills: list[str]
    required_experience_years: int
    status: str
    applicant_count: int
    avg_ai_score: float
    created_by: str
    created_at: str
    updated_at: str
    closed_at: str | None = None
    close_reason: str | None = None
