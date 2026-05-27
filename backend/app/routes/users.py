"""User profile routes."""
from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from app.core.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import UserUpdate

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.put("/profile")
async def update_profile(
    update_data: UserUpdate,
    current_user=Depends(get_current_user),
    db=Depends(get_db)
):
    """Update user profile fields."""
    update_fields = {k: v for k, v in update_data.dict().items() if v is not None}
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update.")
    
    await db.users.update_one(
        {"_id": ObjectId(str(current_user["_id"]))},
        {"$set": update_fields}
    )
    
    updated = await db.users.find_one({"_id": ObjectId(str(current_user["_id"]))})
    updated["id"] = str(updated["_id"])
    
    return {"message": "Profile updated!", "user": {
        "id": updated["id"],
        "name": updated.get("name"),
        "email": updated.get("email"),
        "skills": updated.get("skills", []),
        "bio": updated.get("bio"),
        "location": updated.get("location"),
        "linkedin": updated.get("linkedin"),
        "github": updated.get("github")
    }}

@router.get("/stats")
async def get_user_stats(current_user=Depends(get_current_user), db=Depends(get_db)):
    """Get statistics for the user dashboard."""
    user_id = str(current_user["_id"])
    
    resume_count = await db.resumes.count_documents({"user_id": user_id})
    ats_count = await db.ats_scores.count_documents({"user_id": user_id})
    interview_count = await db.interview_reports.count_documents({"user_id": user_id})
    
    # Best ATS score
    best_ats = await db.ats_scores.find_one(
        {"user_id": user_id},
        sort=[("overall_score", -1)]
    )
    
    return {
        "resume_count": resume_count,
        "ats_evaluations": ats_count,
        "interview_sessions": interview_count,
        "skill_count": len(current_user.get("skills", [])),
        "best_ats_score": best_ats.get("overall_score") if best_ats else None,
        "profile_complete": bool(current_user.get("resume_uploaded"))
    }
