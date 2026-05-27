"""ATS scoring routes."""
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.resume import ATSRequest
from app.ai.ats_scorer import score_resume_against_jd

router = APIRouter(prefix="/api/ats", tags=["ATS Scoring"])

@router.post("/score")
async def calculate_ats_score(
    request: ATSRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Calculate ATS score by comparing resume against a job description."""
    # Fetch the resume
    resume = await db.resumes.find_one({"_id": ObjectId(request.resume_id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found.")
    
    # Verify ownership
    if resume["user_id"] != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Not your resume.")
    
    # Run ATS scoring
    result = score_resume_against_jd(
        resume_data=resume.get("extracted_data", {}),
        job_description=request.job_description,
        job_title=request.job_title
    )
    
    # Save score to DB for history
    score_doc = {
        "user_id": str(current_user["_id"]),
        "resume_id": request.resume_id,
        "job_title": request.job_title,
        "job_description": request.job_description[:500],  # Truncate for storage
        "calculated_at": datetime.utcnow(),
        **result
    }
    
    saved = await db.ats_scores.insert_one(score_doc)
    
    return {
        "id": str(saved.inserted_id),
        "job_title": request.job_title,
        "calculated_at": score_doc["calculated_at"],
        **result
    }

@router.get("/history")
async def get_ats_history(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get a user's ATS score history."""
    cursor = db.ats_scores.find(
        {"user_id": str(current_user["_id"])}
    ).sort("calculated_at", -1).limit(10)
    
    history = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        history.append(doc)
    
    return {"history": history}
