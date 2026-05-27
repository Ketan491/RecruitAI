# routes/recommendations.py — AI job/course recommendations

from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import get_current_user
from services.recommender import get_recommendations
from config.database import get_db

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/")
async def get_my_recommendations(user=Depends(get_current_user)):
    db = get_db()
    resume = await db.resumes.find_one({"user_id": user["id"]})
    if not resume:
        raise HTTPException(status_code=404, detail="Upload a resume first to get recommendations")

    skills = resume.get("skills", [])
    return get_recommendations(skills)
