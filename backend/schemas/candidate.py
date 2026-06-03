# schemas/candidate.py
from typing import Any, Literal

from pydantic import BaseModel


class StageUpdate(BaseModel):
    stage: Literal[
        "Applied",
        "Screened",
        "Phone Screen",
        "Technical",
        "Final Round",
        "Offer",
        "Hired",
        "Rejected",
    ]


class StatusUpdate(BaseModel):
    status: Literal["active", "archived", "rejected", "hired"]


class NoteCreate(BaseModel):
    content: str


class InterviewCreate(BaseModel):
    date: str
    time: str
    type: Literal["video", "phone", "onsite"]
    link: str | None = None
    notes: str | None = None


class PipelineMoveRequest(BaseModel):
    candidate_id: str
    from_stage: str
    to_stage: str
    position: int = 0


class CandidatePreviewOut(BaseModel):
    id: str
    name: str
    email: str
    job_id: str
    job_title: str
    stage: str
    status: str
    source: str
    overall_score: float
    ats_score: float
    days_in_stage: int
    created_at: str


class CandidateOut(CandidatePreviewOut):
    phone: str | None = None
    resume_url: str | None = None
    ai_score: dict[str, Any] | None = None
    parsed_resume: dict[str, Any] | None = None
    notes: list[dict[str, Any]] = []
    timeline: list[dict[str, Any]] = []
    interviews: list[dict[str, Any]] = []
    updated_at: str
