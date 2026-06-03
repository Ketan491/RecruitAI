from datetime import UTC, datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from fastapi import HTTPException


class FakeQuery:
    def __init__(self, items):
        self.items = items

    def find(self, *_args, **_kwargs):
        return self

    def skip(self, *_args, **_kwargs):
        return self

    def limit(self, *_args, **_kwargs):
        return self

    async def count(self):
        return len(self.items)

    async def to_list(self):
        return self.items


class FakeCursor:
    def __init__(self, items):
        self.items = iter(items)

    def __aiter__(self):
        return self

    async def __anext__(self):
        try:
            return next(self.items)
        except StopIteration:
            raise StopAsyncIteration from None


def make_user():
    return SimpleNamespace(
        id="user-1",
        name="Recruiter",
        email="r@example.com",
        role="recruiter",
        company_name="Acme",
        created_at=datetime.now(UTC),
    )


def make_candidate(**overrides):
    candidate = SimpleNamespace(
        id="candidate-1",
        name="Alice",
        email="alice@example.com",
        phone="123",
        job_id="job-1",
        job_title="Engineer",
        company_id="user-1",
        stage="Applied",
        status="active",
        source="Direct",
        overall_score=80.0,
        ats_score=70.0,
        days_in_stage=3,
        resume_url="s3://resume.pdf",
        ai_score={"summary": "Strong", "interview_questions": {}},
        parsed_resume={},
        notes=[],
        timeline=[],
        interviews=[],
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    for key, value in overrides.items():
        setattr(candidate, key, value)
    candidate.save = AsyncMock()
    candidate.delete = AsyncMock()
    return candidate


def make_job(**overrides):
    job = SimpleNamespace(
        id="job-1",
        title="Engineer",
        department="Product",
        location="Remote",
        employment_type="Full-time",
        description="Build things",
        required_skills=["Python"],
        required_experience_years=3,
        status="Active",
        applicant_count=2,
        avg_ai_score=75.0,
        created_by="user-1",
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
        closed_at=None,
        close_reason=None,
    )
    for key, value in overrides.items():
        setattr(job, key, value)
    job.insert = AsyncMock()
    job.save = AsyncMock()
    job.delete = AsyncMock()
    return job


@pytest.mark.anyio
async def test_ai_routes_success(monkeypatch):
    from backend.api.v1.routes import ai

    candidate = make_candidate()
    job = make_job()
    result = {
        "overall_score": 91,
        "ats_score": 82,
        "interview_questions": {"technical": ["Q1"]},
    }

    monkeypatch.setattr(ai.CandidateDoc, "get", AsyncMock(return_value=candidate))
    monkeypatch.setattr(ai.JobDoc, "get", AsyncMock(return_value=job))
    monkeypatch.setattr(ai, "parse_resume_from_url", AsyncMock(return_value="resume text"))
    monkeypatch.setattr(ai, "score_resume", AsyncMock(return_value=result))

    user = make_user()
    rescore = await ai.rescore_candidate("candidate-1", user)
    questions = await ai.regenerate_questions("candidate-1", user)

    assert rescore["data"]["status"] == "completed"
    assert questions["data"]["interview_questions"]["technical"] == ["Q1"]
    assert candidate.save.await_count == 2


@pytest.mark.anyio
async def test_candidate_routes_success(monkeypatch):
    from backend.api.v1.routes import candidates
    from backend.schemas.candidate import InterviewCreate, NoteCreate, StageUpdate

    candidate = make_candidate()
    user = make_user()
    monkeypatch.setattr(candidates.CandidateDoc, "get", AsyncMock(return_value=candidate))
    monkeypatch.setattr(candidates.CandidateDoc, "find", lambda *_args, **_kwargs: FakeQuery([candidate]))
    monkeypatch.setattr(candidates, "generate_candidate_report", lambda _data: b"%PDF")

    detail = await candidates.get_candidate("candidate-1", user)
    stage = await candidates.update_stage("candidate-1", StageUpdate(stage="Screened"), user)
    note = await candidates.add_note("candidate-1", NoteCreate(content="Looks good"), user)
    interview = await candidates.schedule_interview(
        "candidate-1",
        InterviewCreate(date="2026-06-03", time="10:00", type="video"),
        user,
    )
    export = await candidates.export_candidates_csv(candidates.ExportRequest(), user)
    report = await candidates.download_report("candidate-1", user)

    assert detail["data"]["id"] == "candidate-1"
    assert stage["data"]["stage"] == "Screened"
    assert note["data"]["content"] == "Looks good"
    assert interview["data"]["type"] == "video"
    assert export.media_type == "text/csv"
    assert report.media_type == "application/pdf"


@pytest.mark.anyio
async def test_job_and_pipeline_routes_success(monkeypatch):
    from backend.api.v1.routes import jobs, pipeline
    from backend.schemas.candidate import PipelineMoveRequest
    from backend.schemas.job import JobCreate, JobStatusUpdate, JobUpdate

    user = make_user()
    job = make_job()
    candidate = make_candidate(stage="Applied")

    class FakeJobDoc:
        @staticmethod
        def find(*_args, **_kwargs):
            return FakeQuery([job])

        @staticmethod
        async def get(*_args, **_kwargs):
            return job

        def __new__(cls, **kwargs):
            return make_job(**kwargs)

    monkeypatch.setattr(jobs, "JobDoc", FakeJobDoc)
    monkeypatch.setattr(pipeline.CandidateDoc, "find", lambda *_args, **_kwargs: FakeQuery([candidate]))
    monkeypatch.setattr(pipeline.CandidateDoc, "get", AsyncMock(return_value=candidate))

    listed = await jobs.list_jobs(page=1, limit=25, current_user=user)
    created = await jobs.create_job(
        JobCreate(
            title="Engineer",
            department="Product",
            location="Remote",
            description="Build things",
        ),
        user,
    )
    updated = await jobs.update_job("job-1", JobUpdate(title="Senior Engineer"), user)
    closed = await jobs.update_job_status(
        "job-1",
        JobStatusUpdate(status="Closed", close_reason="Filled"),
        user,
    )
    await jobs.delete_job("job-1", user)
    board = await pipeline.get_pipeline(job_id=None, current_user=user)
    moved = await pipeline.move_candidate(
        PipelineMoveRequest(candidate_id="candidate-1", from_stage="Applied", to_stage="Offer"),
        user,
    )

    assert listed["data"]["total"] == 1
    assert created["data"]["title"] == "Engineer"
    assert updated["data"]["title"] == "Senior Engineer"
    assert closed["data"]["status"] == "Closed"
    assert board["data"][0]["stage"] == "Applied"
    assert moved["success"] is True


@pytest.mark.anyio
async def test_dashboard_read_routes():
    from backend.api.v1.routes import dashboard

    aggregate_results = [
        [{"_id": "Applied", "count": 2, "avg_score": 70}],
        [{"_id": "LinkedIn", "count": 2}],
        [
            {
                "_id": "candidate-1",
                "name": "Alice",
                "timeline": [
                    {
                        "id": "event-1",
                        "action": "applied",
                        "actor_name": "Recruiter",
                        "created_at": "2026-06-02T00:00:00",
                    }
                ],
            }
        ],
        [
            {
                "_id": "candidate-1",
                "name": "Alice",
                "job_title": "Engineer",
                "overall_score": 90,
                "ai_score": {"summary": "Strong"},
            }
        ],
        [{"week": "2026-W22", "avg_score": 88}],
    ]

    class FakeCollection:
        def aggregate(self, _pipeline):
            return FakeCursor(aggregate_results.pop(0))

    class FakeDb:
        def __getitem__(self, _name):
            return FakeCollection()

    user = make_user()
    db = FakeDb()

    funnel = await dashboard.get_funnel(current_user=user, db=db)
    sources = await dashboard.get_sources(current_user=user, db=db)
    activity = await dashboard.get_activity(current_user=user, db=db)
    top = await dashboard.get_top_candidates(current_user=user, db=db)
    trend = await dashboard.get_score_trend(current_user=user, db=db)

    assert funnel["data"][0]["count"] == 2
    assert sources["data"][0]["percentage"] == 100
    assert activity["data"][0]["candidate_name"] == "Alice"
    assert top["data"][0]["summary"] == "Strong"
    assert trend["data"][0]["avg_score"] == 88


@pytest.mark.anyio
async def test_route_error_branches(monkeypatch):
    from backend.api.v1.routes import ai, jobs, pipeline
    from backend.schemas.candidate import PipelineMoveRequest
    from backend.schemas.job import JobUpdate

    user = make_user()

    monkeypatch.setattr(ai.CandidateDoc, "get", AsyncMock(return_value=None))
    with pytest.raises(HTTPException) as missing_candidate:
        await ai.rescore_candidate("missing", user)
    assert missing_candidate.value.status_code == 404

    monkeypatch.setattr(ai.CandidateDoc, "get", AsyncMock(return_value=make_candidate(resume_url=None)))
    with pytest.raises(HTTPException) as missing_resume:
        await ai.rescore_candidate("candidate-1", user)
    assert missing_resume.value.status_code == 422

    monkeypatch.setattr(ai.CandidateDoc, "get", AsyncMock(return_value=make_candidate()))
    monkeypatch.setattr(ai, "parse_resume_from_url", AsyncMock(return_value=" "))
    with pytest.raises(HTTPException) as empty_resume:
        await ai.rescore_candidate("candidate-1", user)
    assert empty_resume.value.status_code == 422

    monkeypatch.setattr(ai, "parse_resume_from_url", AsyncMock(return_value="resume text"))
    monkeypatch.setattr(ai.JobDoc, "get", AsyncMock(return_value=None))
    with pytest.raises(HTTPException) as missing_job:
        await ai.rescore_candidate("candidate-1", user)
    assert missing_job.value.status_code == 404

    monkeypatch.setattr(ai.CandidateDoc, "get", AsyncMock(return_value=make_candidate(ai_score=None)))
    with pytest.raises(HTTPException) as missing_score:
        await ai.regenerate_questions("candidate-1", user)
    assert missing_score.value.status_code == 422

    class MissingJobDoc:
        @staticmethod
        async def get(*_args, **_kwargs):
            return None

    monkeypatch.setattr(jobs, "JobDoc", MissingJobDoc)
    with pytest.raises(HTTPException):
        await jobs.get_job("missing", user)
    with pytest.raises(HTTPException):
        await jobs.update_job("missing", JobUpdate(title="Nope"), user)
    with pytest.raises(HTTPException):
        await jobs.delete_job("missing", user)

    monkeypatch.setattr(pipeline.CandidateDoc, "get", AsyncMock(return_value=None))
    with pytest.raises(HTTPException):
        await pipeline.move_candidate(
            PipelineMoveRequest(candidate_id="missing", from_stage="Applied", to_stage="Offer"),
            user,
        )


def test_get_db_requires_connection():
    from backend.database.connection import get_db

    with pytest.raises(RuntimeError):
        get_db()


def test_pdf_score_color_branches():
    from backend.services.pdf_service import DANGER, INDIGO, SUCCESS, WARNING, score_color

    assert score_color(90) == SUCCESS
    assert score_color(75) == INDIGO
    assert score_color(60) == WARNING
    assert score_color(10) == DANGER
