# routes/interview.py — Save interview analysis results

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from middleware.auth import get_current_user
from config.database import get_db

router = APIRouter(prefix="/interview", tags=["interview"])

class InterviewReport(BaseModel):
    duration_seconds: int
    filler_words:     List[str]
    filler_count:     int
    word_count:       int
    words_per_minute: float
    confidence_score: float
    transcript:       Optional[str] = ""

@router.post("/save")
async def save_interview(report: InterviewReport, user=Depends(get_current_user)):
    db = get_db()
    doc = report.dict()
    doc["user_id"]    = user["id"]
    doc["created_at"] = datetime.utcnow()
    result = await db.interview_reports.insert_one(doc)
    return {"id": str(result.inserted_id), "message": "Interview report saved"}

@router.get("/history")
async def interview_history(user=Depends(get_current_user)):
    db = get_db()
    cursor = db.interview_reports.find({"user_id": user["id"]}).sort("created_at", -1).limit(5)
    reports = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        reports.append(doc)
    return reports
