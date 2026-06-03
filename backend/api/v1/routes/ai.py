# api/v1/routes/ai.py
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException

from ....auth.deps import require_recruiter_or_admin
from ....models.candidate import CandidateDoc
from ....models.job import JobDoc
from ....models.user import User
from ....services.ai_service import score_resume
from ....services.resume_parser import parse_resume_from_url

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/rescore/{candidate_id}")
async def rescore_candidate(
    candidate_id: str,
    current_user: User = Depends(require_recruiter_or_admin),
):
    c = await CandidateDoc.get(candidate_id)
    if not c or c.company_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Candidate not found")

    if not c.resume_url:
        raise HTTPException(status_code=422, detail="No resume file available for re-scoring")

    # Fetch resume text from S3 on demand — not stored in MongoDB
    resume_text = await parse_resume_from_url(c.resume_url)
    if not resume_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from stored resume")

    job = await JobDoc.get(c.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Associated job not found")

    ai_result = await score_resume(
        resume_text=resume_text,
        job_description=job.description,
        required_skills=job.required_skills,
        required_experience_years=job.required_experience_years,
        job_title=job.title,
    )

    c.overall_score = float(ai_result.get("overall_score", 0))
    c.ats_score = float(ai_result.get("ats_score", 0))
    c.ai_score = ai_result
    c.updated_at = datetime.now(UTC)
    await c.save()

    return {"success": True, "data": {"status": "completed", "candidate_id": candidate_id}}


@router.post("/questions/{candidate_id}")
async def regenerate_questions(
    candidate_id: str,
    current_user: User = Depends(require_recruiter_or_admin),
):
    c = await CandidateDoc.get(candidate_id)
    if not c or c.company_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Candidate not found")

    if not c.ai_score:
        raise HTTPException(
            status_code=422, detail="No AI score available to regenerate questions from"
        )

    job = await JobDoc.get(c.job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Associated job not found")

    # Use the cached ai_score summary + parsed_resume to regenerate questions
    # without re-fetching the full resume file from S3
    context = f"Candidate: {c.name}\nRole: {c.job_title}\nSummary: {c.ai_score.get('summary', '')}"

    ai_result = await score_resume(
        resume_text=context,
        job_description=job.description,
        required_skills=job.required_skills,
        required_experience_years=job.required_experience_years,
        job_title=job.title,
    )
    c.ai_score["interview_questions"] = ai_result.get("interview_questions", {})
    c.updated_at = datetime.now(UTC)
    await c.save()

    return {"success": True, "data": {"interview_questions": c.ai_score["interview_questions"]}}
