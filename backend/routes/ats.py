# routes/ats.py — ATS scoring endpoint

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from middleware.auth import get_current_user
from models.resume import ATSRequest, ATSResponse
from services.ats_scorer import compute_ats_score
from config.database import get_db

router = APIRouter(prefix="/ats", tags=["ats"])

@router.post("/score", response_model=ATSResponse)
async def score_ats(data: ATSRequest, user=Depends(get_current_user)):
    if len(data.resume_text) < 50:
        raise HTTPException(status_code=400, detail="Resume text too short")
    if len(data.job_description) < 30:
        raise HTTPException(status_code=400, detail="Job description too short")

    result = compute_ats_score(data.resume_text, data.job_description)

    # Save to DB
    db = get_db()
    await db.ats_scores.insert_one({
        "user_id":    user["id"],
        "score":      result["score"],
        "result":     result,
        "created_at": datetime.utcnow(),
    })

    return result

@router.get("/history")
async def get_ats_history(user=Depends(get_current_user)):
    db = get_db()
    cursor = db.ats_scores.find({"user_id": user["id"]}).sort("created_at", -1).limit(10)
    history = []
    async for doc in cursor:
        history.append({
            "id":         str(doc["_id"]),
            "score":      doc["score"],
            "created_at": doc.get("created_at"),
        })
    return history
