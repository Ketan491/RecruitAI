"""Interview analysis routes."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.ai.interview_analyzer import analyze_interview

router = APIRouter(prefix="/api/interview", tags=["Interview"])

class InterviewRequest(BaseModel):
    transcript: str
    duration_seconds: int = 60

@router.post("/analyze")
async def analyze_interview_session(
    request: InterviewRequest,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Analyze a recorded interview transcript."""
    if len(request.transcript.strip()) < 20:
        raise HTTPException(status_code=400, detail="Transcript too short for analysis.")
    
    analysis = analyze_interview(request.transcript, request.duration_seconds)
    
    # Save report
    report = {
        "user_id": str(current_user["_id"]),
        "analysis": analysis,
        "session_date": datetime.utcnow()
    }
    
    result = await db.interview_reports.insert_one(report)
    
    return {
        "id": str(result.inserted_id),
        "analysis": analysis
    }

@router.get("/reports")
async def get_my_interview_reports(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get all interview reports for the current user."""
    cursor = db.interview_reports.find(
        {"user_id": str(current_user["_id"])}
    ).sort("session_date", -1).limit(10)
    
    reports = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        reports.append(doc)
    
    return {"reports": reports}
