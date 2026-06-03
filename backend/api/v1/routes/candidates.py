# api/v1/routes/candidates.py
import csv
import io
import logging
import uuid
from datetime import UTC, datetime
from typing import Literal

from bson import ObjectId
from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Request,
    UploadFile,
)
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel

from ....auth.deps import get_current_user, require_recruiter_or_admin
from ....models.candidate import CandidateDoc
from ....models.job import JobDoc
from ....models.user import User
from ....schemas.candidate import (
    InterviewCreate,
    NoteCreate,
    StageUpdate,
)
from ....services.ai_service import score_resume
from ....services.pdf_service import generate_candidate_report
from ....services.resume_parser import detect_mime_from_magic, parse_resume
from ....services.storage import upload_resume

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/candidates", tags=["candidates"])

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


class ExportRequest(BaseModel):
    ids: list[str] | Literal["all"] = "all"
    filters: dict | None = None


async def _extract_contact_info(resume_text: str) -> dict:
    """Use Claude to extract name, email, phone from resume text."""
    import json as _json

    from ....config import settings as _settings
    from ....services.ai_service import get_anthropic_client

    try:
        client = get_anthropic_client()
        msg = await client.messages.create(
            model=_settings.ANTHROPIC_MODEL,
            max_tokens=300,
            system="Extract contact info from resume text. Respond ONLY with JSON: {name, email, phone}. No markdown.",
            messages=[{"role": "user", "content": resume_text[:3000]}],
        )
        raw = msg.content[0].text.strip().removeprefix("```json").removesuffix("```").strip()
        return _json.loads(raw)
    except Exception:
        return {"name": None, "email": None, "phone": None}


def _preview(c: CandidateDoc) -> dict:
    return {
        "id": str(c.id),
        "name": c.name,
        "email": c.email,
        "job_id": c.job_id,
        "job_title": c.job_title,
        "stage": c.stage,
        "status": c.status,
        "source": c.source,
        "overall_score": round(c.overall_score, 1),
        "ats_score": round(c.ats_score, 1),
        "days_in_stage": c.days_in_stage,
        "created_at": c.created_at.isoformat(),
    }


def _detail(c: CandidateDoc) -> dict:
    return {
        **_preview(c),
        "phone": c.phone,
        "resume_url": c.resume_url,
        "ai_score": c.ai_score,
        "parsed_resume": c.parsed_resume,
        "notes": c.notes,
        "timeline": c.timeline,
        "interviews": c.interviews,
        "updated_at": c.updated_at.isoformat(),
    }


async def _query_to_list(query) -> list:
    if hasattr(query, "to_list"):
        return await query.to_list()
    return []


@router.get("/", include_in_schema=False)
@router.get("")
async def list_candidates(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    search: str | None = None,
    stage: str | None = None,
    source: str | None = None,
    score_min: float | None = None,
    score_max: float | None = None,
    job_id: str | None = None,
    current_user: User = Depends(get_current_user),
):
    query = CandidateDoc.find({"company_id": str(current_user.id)})

    if search:
        # Use the candidates_text_search index (name + email) for efficient full-text search
        query = query.find({"$text": {"$search": search}})
    if stage:
        query = query.find({"stage": stage})
    if source:
        query = query.find({"source": source})
    if score_min is not None:
        query = query.find({"overall_score": {"$gte": score_min}})
    if score_max is not None:
        query = query.find({"overall_score": {"$lte": score_max}})
    if job_id:
        query = query.find({"job_id": job_id})

    total = await query.count()
    candidates = await _query_to_list(query.skip((page - 1) * limit).limit(limit))

    return {
        "success": True,
        "data": {
            "items": [_preview(c) for c in candidates],
            "total": total,
            "page": page,
            "limit": limit,
            "has_more": (page * limit) < total,
        },
    }


@router.get("/{candidate_id}")
async def get_candidate(candidate_id: str, current_user: User = Depends(get_current_user)):
    c = await CandidateDoc.get(candidate_id)
    if not c or c.company_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Candidate not found")
    return {"success": True, "data": _detail(c)}


@router.post("/upload", status_code=201)
async def upload_candidate(
    request: Request,
    resume: UploadFile = File(...),
    job_id: str = Form(...),
    source: str = Form("Direct"),
    current_user: User = Depends(require_recruiter_or_admin),
):
    # Check Content-Length BEFORE reading body (spec requirement)
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_FILE_SIZE + 10240:
        raise HTTPException(status_code=413, detail="File exceeds 5MB limit")

    content = await resume.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File exceeds 5MB limit")

    # Detect MIME from magic bytes for security
    try:
        mime_type = detect_mime_from_magic(content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e

    # Validate filename characters
    safe_chars = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-. ")
    if not all(c in safe_chars for c in (resume.filename or "")):
        raise HTTPException(status_code=400, detail="Invalid filename characters")

    job = await JobDoc.get(job_id)
    if not job or job.created_by != str(current_user.id):
        raise HTTPException(status_code=404, detail="Job not found")

    resume_text = parse_resume(content, mime_type)
    if not resume_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from resume")

    candidate_id = str(uuid.uuid4())
    resume_url = await upload_resume(content, resume.filename or "resume", candidate_id)

    # Create candidate doc — resume_text is NOT stored in MongoDB (fetch from S3 for re-scoring)
    candidate = CandidateDoc(
        name="Parsing…",
        email="",
        job_id=job_id,
        job_title=job.title,
        company_id=str(current_user.id),
        source=source,
        resume_url=resume_url,
    )
    await candidate.insert()

    # Score asynchronously (fire and forget in background)
    try:
        ai_result = await score_resume(
            resume_text=resume_text,
            job_description=job.description,
            required_skills=job.required_skills,
            required_experience_years=job.required_experience_years,
            job_title=job.title,
        )
        # Extract name/email from resume text using a focused AI call
        contact_info = await _extract_contact_info(resume_text)
        candidate.name = contact_info.get("name") or (resume.filename or "Unknown").replace(
            ".pdf", ""
        ).replace(".docx", "")
        candidate.email = contact_info.get("email", "")
        candidate.phone = contact_info.get("phone")
        candidate.parsed_resume = contact_info
        candidate.overall_score = float(ai_result.get("overall_score", 0))
        candidate.ats_score = float(ai_result.get("ats_score", 0))
        candidate.ai_score = ai_result
        candidate.updated_at = datetime.now(UTC)
        await candidate.save()
    except Exception as e:
        logger.error("AI scoring failed for candidate %s: %s", candidate_id, e)

    return {"success": True, "data": _detail(candidate)}


@router.patch("/{candidate_id}/stage")
async def update_stage(
    candidate_id: str,
    body: StageUpdate,
    current_user: User = Depends(require_recruiter_or_admin),
):
    c = await CandidateDoc.get(candidate_id)
    if not c or c.company_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Candidate not found")

    old_stage = c.stage
    c.stage = body.stage
    c.days_in_stage = 0
    c.updated_at = datetime.now(UTC)
    c.timeline.append(
        {
            "id": str(uuid.uuid4()),
            "action": f"moved from {old_stage} to {body.stage}",
            "actor_name": current_user.name,
            "created_at": datetime.now(UTC).isoformat(),
        }
    )
    await c.save()
    return {"success": True, "data": _preview(c)}


@router.post("/{candidate_id}/notes")
async def add_note(
    candidate_id: str,
    body: NoteCreate,
    current_user: User = Depends(require_recruiter_or_admin),
):
    c = await CandidateDoc.get(candidate_id)
    if not c or c.company_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Candidate not found")

    note = {
        "id": str(uuid.uuid4()),
        "content": body.content,
        "author_id": str(current_user.id),
        "author_name": current_user.name,
        "created_at": datetime.now(UTC).isoformat(),
    }
    c.notes.append(note)
    c.updated_at = datetime.now(UTC)
    await c.save()
    return {"success": True, "data": note}


@router.post("/{candidate_id}/schedule")
async def schedule_interview(
    candidate_id: str,
    body: InterviewCreate,
    current_user: User = Depends(require_recruiter_or_admin),
):
    c = await CandidateDoc.get(candidate_id)
    if not c or c.company_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Candidate not found")

    interview = {
        "id": str(uuid.uuid4()),
        **body.model_dump(),
        "created_at": datetime.now(UTC).isoformat(),
    }
    c.interviews.append(interview)
    c.updated_at = datetime.now(UTC)
    await c.save()
    return {"success": True, "data": interview}


@router.post("/export")
async def export_candidates_csv(
    body: ExportRequest,
    current_user: User = Depends(require_recruiter_or_admin),
):
    query = CandidateDoc.find({"company_id": str(current_user.id)})

    if body.ids != "all" and isinstance(body.ids, list):
        valid_ids = []
        for i in body.ids:
            try:
                valid_ids.append(ObjectId(i))
            except Exception:
                pass
        query = query.find({"_id": {"$in": valid_ids}})

    candidates = await query.to_list()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "Name",
            "Email",
            "Phone",
            "Job Title",
            "Stage",
            "Status",
            "Source",
            "AI Score",
            "ATS Score",
            "Days in Stage",
            "Applied At",
        ]
    )
    for c in candidates:
        writer.writerow(
            [
                c.name,
                c.email,
                c.phone or "",
                c.job_title,
                c.stage,
                c.status,
                c.source,
                round(c.overall_score, 1),
                round(c.ats_score, 1),
                c.days_in_stage,
                c.created_at.strftime("%Y-%m-%d"),
            ]
        )

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=candidates-export.csv"},
    )


@router.get("/{candidate_id}/report")
async def download_report(
    candidate_id: str,
    current_user: User = Depends(get_current_user),
):
    c = await CandidateDoc.get(candidate_id)
    if not c or c.company_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Candidate not found")

    pdf_bytes = generate_candidate_report(
        {
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "job_title": c.job_title,
            "stage": c.stage,
            "status": c.status,
            "source": c.source,
            "overall_score": c.overall_score,
            "ats_score": c.ats_score,
            "ai_score": c.ai_score,
            "created_at": c.created_at.isoformat(),
        }
    )

    safe_name = "".join(c for c in c.name if c.isalnum() or c in "_ -")[:40]
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{safe_name}-report.pdf"'},
    )
