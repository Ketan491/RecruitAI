"""Recommendation routes."""
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.ai.recommender import get_recommendations

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.get("/")
async def get_my_recommendations(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get AI-generated job/skill recommendations based on user's resume."""
    # Fetch latest resume
    resume = await db.resumes.find_one(
        {"user_id": str(current_user["_id"])},
        sort=[("uploaded_at", -1)]
    )
    
    if not resume:
        # Return defaults for users without a resume
        return {
            "recommended_roles": [
                {"role": "Software Developer", "match_score": 0, "avg_salary": "₹5–10 LPA", "missing_skills": ["Upload resume first"], "your_skills": []},
            ],
            "missing_skills": [],
            "recommended_courses": [],
            "career_path": ["Upload your resume for personalized recommendations"],
            "message": "Upload your resume to get personalized recommendations!"
        }
    
    result = get_recommendations(resume.get("extracted_data", {}))
    result["user_id"] = str(current_user["_id"])
    result["generated_at"] = datetime.utcnow().isoformat()
    
    return result
