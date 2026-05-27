# routes/hr.py — HR dashboard endpoints

from fastapi import APIRouter, Depends
from middleware.auth import require_hr
from config.database import get_db

router = APIRouter(prefix="/hr", tags=["hr"])

@router.get("/candidates")
async def list_candidates(search: str = "", _=Depends(require_hr)):
    db = get_db()
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]
    cursor = db.users.find({**query, "role": "candidate"}).limit(50)
    candidates = []
    async for user in cursor:
        # Attach latest ATS score
        ats = await db.ats_scores.find_one(
            {"user_id": str(user["_id"])},
            sort=[("created_at", -1)]
        )
        resume = await db.resumes.find_one({"user_id": str(user["_id"])})
        candidates.append({
            "id":         str(user["_id"]),
            "name":       user.get("name"),
            "email":      user.get("email"),
            "skills":     resume.get("skills", [])[:6] if resume else [],
            "ats_score":  ats.get("score") if ats else None,
            "created_at": user.get("created_at"),
        })
    # Rank by ATS score
    candidates.sort(key=lambda x: x["ats_score"] or 0, reverse=True)
    return candidates

@router.get("/analytics")
async def analytics(_=Depends(require_hr)):
    db = get_db()
    # Top skills across all resumes
    skill_counts: dict = {}
    async for resume in db.resumes.find({}):
        for skill in resume.get("skills", []):
            skill_counts[skill] = skill_counts.get(skill, 0) + 1

    top_skills = sorted(skill_counts.items(), key=lambda x: x[1], reverse=True)[:10]

    # ATS score distribution
    scores = []
    async for doc in db.ats_scores.find({}):
        scores.append(doc.get("score", 0))

    avg_score = round(sum(scores) / len(scores), 1) if scores else 0

    total_candidates = await db.users.count_documents({"role": "candidate"})
    total_resumes    = await db.resumes.count_documents({})

    return {
        "total_candidates": total_candidates,
        "total_resumes":    total_resumes,
        "total_interviews": await db.interview_reports.count_documents({}),
        "avg_ats_score":    avg_score,
        "top_skills":       [{"skill": k, "count": v} for k, v in top_skills],
        "score_distribution": {
            "excellent": len([s for s in scores if s >= 80]),
            "good":      len([s for s in scores if 60 <= s < 80]),
            "average":   len([s for s in scores if 40 <= s < 60]),
            "poor":      len([s for s in scores if s < 40]),
        }
    }
