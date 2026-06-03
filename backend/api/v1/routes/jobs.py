# api/v1/routes/jobs.py
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query

from ....auth.deps import get_current_user, require_recruiter_or_admin
from ....models.job import JobDoc
from ....models.user import User
from ....schemas.job import JobCreate, JobStatusUpdate, JobUpdate

router = APIRouter(prefix="/jobs", tags=["jobs"])


def _job_out(j: JobDoc) -> dict:
    return {
        "id": str(j.id),
        "title": j.title,
        "department": j.department,
        "location": j.location,
        "employment_type": j.employment_type,
        "description": j.description,
        "required_skills": j.required_skills,
        "required_experience_years": j.required_experience_years,
        "status": j.status,
        "applicant_count": j.applicant_count,
        "avg_ai_score": round(j.avg_ai_score, 1),
        "created_by": j.created_by,
        "created_at": j.created_at.isoformat(),
        "updated_at": j.updated_at.isoformat(),
        "closed_at": j.closed_at.isoformat() if j.closed_at else None,
        "close_reason": j.close_reason,
    }


@router.get("/", include_in_schema=False)
@router.get("")
async def list_jobs(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
):
    query = JobDoc.find({"created_by": str(current_user.id)})
    total = await query.count()
    jobs = await query.skip((page - 1) * limit).limit(limit).to_list()
    return {
        "success": True,
        "data": {
            "items": [_job_out(j) for j in jobs],
            "total": total,
            "page": page,
            "limit": limit,
            "has_more": (page * limit) < total,
        },
    }


@router.get("/{job_id}")
async def get_job(job_id: str, current_user: User = Depends(get_current_user)):
    job = await JobDoc.get(job_id)
    if not job or job.created_by != str(current_user.id):
        raise HTTPException(status_code=404, detail="Job not found")
    return {"success": True, "data": _job_out(job)}


@router.post("", status_code=201)
async def create_job(body: JobCreate, current_user: User = Depends(require_recruiter_or_admin)):
    job = JobDoc(**body.model_dump(), created_by=str(current_user.id))
    await job.insert()
    return {"success": True, "data": _job_out(job)}


@router.put("/{job_id}")
async def update_job(
    job_id: str,
    body: JobUpdate,
    current_user: User = Depends(require_recruiter_or_admin),
):
    job = await JobDoc.get(job_id)
    if not job or job.created_by != str(current_user.id):
        raise HTTPException(status_code=404, detail="Job not found")

    update_data = body.model_dump(exclude_none=True)
    for k, v in update_data.items():
        setattr(job, k, v)
    job.updated_at = datetime.now(UTC)
    await job.save()
    return {"success": True, "data": _job_out(job)}


@router.patch("/{job_id}/status")
async def update_job_status(
    job_id: str,
    body: JobStatusUpdate,
    current_user: User = Depends(require_recruiter_or_admin),
):
    job = await JobDoc.get(job_id)
    if not job or job.created_by != str(current_user.id):
        raise HTTPException(status_code=404, detail="Job not found")

    job.status = body.status
    if body.status == "Closed":
        job.closed_at = datetime.now(UTC)
        job.close_reason = body.close_reason
    job.updated_at = datetime.now(UTC)
    await job.save()
    return {"success": True, "data": _job_out(job)}


@router.delete("/{job_id}", status_code=204)
async def delete_job(job_id: str, current_user: User = Depends(require_recruiter_or_admin)):
    job = await JobDoc.get(job_id)
    if not job or job.created_by != str(current_user.id):
        raise HTTPException(status_code=404, detail="Job not found")
    await job.delete()
