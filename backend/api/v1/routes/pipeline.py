# api/v1/routes/pipeline.py
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Query

from ....auth.deps import get_current_user, require_recruiter_or_admin
from ....models.candidate import CandidateDoc
from ....models.user import User
from ....schemas.candidate import PipelineMoveRequest
from ....utils.constants import PIPELINE_STAGES

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.get("/", include_in_schema=False)
@router.get("")
async def get_pipeline(
    job_id: str | None = Query(None),
    current_user: User = Depends(get_current_user),
):
    query = CandidateDoc.find({"company_id": str(current_user.id), "status": "active"})
    if job_id:
        query = query.find({"job_id": job_id})

    all_candidates = await query.to_list()

    # Group by stage
    groups = []
    for stage in PIPELINE_STAGES:
        stage_candidates = [c for c in all_candidates if c.stage == stage]
        scores = [c.overall_score for c in stage_candidates if c.overall_score]
        groups.append(
            {
                "stage": stage,
                "count": len(stage_candidates),
                "avg_score": round(sum(scores) / len(scores), 1) if scores else 0.0,
                "candidates": [
                    {
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
                    for c in stage_candidates
                ],
            }
        )

    return {"success": True, "data": groups}


@router.patch("/move")
async def move_candidate(
    body: PipelineMoveRequest,
    current_user: User = Depends(require_recruiter_or_admin),
):
    c = await CandidateDoc.get(body.candidate_id)
    if not c or c.company_id != str(current_user.id):
        raise HTTPException(status_code=404, detail="Candidate not found")

    old_stage = c.stage
    c.stage = body.to_stage
    c.days_in_stage = 0
    c.updated_at = datetime.now(UTC)
    c.timeline.append(
        {
            "id": str(uuid.uuid4()),
            "action": f"moved from {old_stage} to {body.to_stage}",
            "actor_name": current_user.name,
            "created_at": datetime.now(UTC).isoformat(),
        }
    )
    await c.save()
    return {"success": True, "data": None}
