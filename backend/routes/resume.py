# routes/resume.py — Upload and retrieve resumes

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from datetime import datetime
from middleware.auth import get_current_user
from services.resume_parser import parse_resume
from config.database import get_db

router = APIRouter(prefix="/resume", tags=["resume"])

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    user=Depends(get_current_user)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files accepted")

    content = await file.read()
    if len(content) > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    # Parse resume
    parsed = parse_resume(content)
    parsed["user_id"]     = user["id"]
    parsed["filename"]    = file.filename
    parsed["uploaded_at"] = datetime.utcnow()

    db = get_db()
    # Replace existing resume for this user
    await db.resumes.replace_one(
        {"user_id": user["id"]},
        parsed,
        upsert=True
    )

    return {
        "message":    "Resume uploaded and parsed successfully",
        "name":       parsed.get("name"),
        "email":      parsed.get("email"),
        "phone":      parsed.get("phone"),
        "skills":     parsed.get("skills", []),
        "education":  parsed.get("education", []),
        "experience": parsed.get("experience", []),
        "keywords":   parsed.get("keywords", []),
        "filename":   file.filename,
    }

@router.get("/me")
async def get_my_resume(user=Depends(get_current_user)):
    db = get_db()
    resume = await db.resumes.find_one({"user_id": user["id"]})
    if not resume:
        raise HTTPException(status_code=404, detail="No resume found. Please upload one.")
    resume["id"] = str(resume["_id"])
    del resume["_id"]
    return resume
