"""
HR dashboard routes — protected to HR role only.
"""
from fastapi import APIRouter, Depends
from app.core.database import get_db
from app.middleware.auth import get_hr_user

router = APIRouter(prefix="/api/hr", tags=["HR Dashboard"])

@router.get("/candidates")
async def get_all_candidates(hr_user=Depends(get_hr_user), db=Depends(get_db)):
    """Get all user candidates with their resume data."""
    cursor = db.users.find({"role": "user"}).sort("created_at", -1)
    candidates = []
    
    async for user in cursor:
        user_id = str(user["_id"])
        
        # Get their latest resume
        resume = await db.resumes.find_one(
            {"user_id": user_id},
            sort=[("uploaded_at", -1)]
        )
        
        # Get their best ATS score
        ats = await db.ats_scores.find_one(
            {"user_id": user_id},
            sort=[("overall_score", -1)]
        )
        
        candidates.append({
            "id": user_id,
            "name": user.get("name"),
            "email": user.get("email"),
            "skills": user.get("skills", []),
            "resume_uploaded": user.get("resume_uploaded", False),
            "created_at": user.get("created_at"),
            "best_ats_score": ats.get("overall_score") if ats else None,
            "skill_count": len(user.get("skills", []))
        })
    
    return {"candidates": candidates, "total": len(candidates)}

@router.get("/analytics")
async def get_analytics(hr_user=Depends(get_hr_user), db=Depends(get_db)):
    """Get analytics data for the HR dashboard charts."""
    # Total counts
    total_candidates = await db.users.count_documents({"role": "user"})
    total_resumes = await db.resumes.count_documents({})
    total_ats = await db.ats_scores.count_documents({})
    
    # Average ATS score
    pipeline = [{"$group": {"_id": None, "avg_score": {"$avg": "$overall_score"}}}]
    result = await db.ats_scores.aggregate(pipeline).to_list(1)
    avg_ats = round(result[0]["avg_score"], 1) if result else 0
    
    # Skill frequency analysis
    skill_freq = {}
    async for user in db.users.find({"role": "user"}):
        for skill in user.get("skills", []):
            skill_freq[skill] = skill_freq.get(skill, 0) + 1
    
    top_skills = sorted(skill_freq.items(), key=lambda x: x[1], reverse=True)[:10]
    
    return {
        "total_candidates": total_candidates,
        "total_resumes": total_resumes,
        "total_ats_evaluations": total_ats,
        "average_ats_score": avg_ats,
        "top_skills": [{"skill": s, "count": c} for s, c in top_skills],
        "ats_score_distribution": [
            {"range": "0-40", "label": "Low"},
            {"range": "41-60", "label": "Medium"},
            {"range": "61-80", "label": "Good"},
            {"range": "81-100", "label": "Excellent"}
        ]
    }
