"""
Resume routes: upload, analyze, retrieve.
Files saved to disk; metadata in MongoDB.
"""
import os
import aiofiles
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, status
from bson import ObjectId
from datetime import datetime
from app.core.database import get_db
from app.core.config import settings
from app.middleware.auth import get_current_user
from app.ai.resume_parser import parse_resume

router = APIRouter(prefix="/api/resume", tags=["Resume"])


@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported.",
        )

    content = await file.read()

    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum size is 5 MB.",
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    user_id = str(current_user["_id"])
    safe_name = file.filename.replace(" ", "_")
    filename = f"{user_id}_{int(datetime.utcnow().timestamp())}_{safe_name}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    parsed_data = parse_resume(content)

    resume_doc = {
        "user_id": user_id,
        "filename": file.filename,
        "file_path": file_path,
        "extracted_data": parsed_data,
        "uploaded_at": datetime.utcnow(),
        "analyzed": True,
    }

    result = await db.resumes.insert_one(resume_doc)

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"resume_uploaded": True, "skills": parsed_data.get("skills", [])}},
    )

    return {
        "id": str(result.inserted_id),
        "filename": file.filename,
        "extracted_data": parsed_data,
        "message": "Resume uploaded and analyzed successfully!",
    }


@router.get("/my")
async def get_my_resume(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    """Get the current user's most recent resume."""
    # FIX #14: use .sort() then .limit() instead of sort=[] param
    cursor = db.resumes.find(
        {"user_id": str(current_user["_id"])}
    ).sort("uploaded_at", -1).limit(1)

    docs = await cursor.to_list(length=1)
    if not docs:
        raise HTTPException(status_code=404, detail="No resume found. Please upload one.")

    doc = docs[0]
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    return doc


@router.get("/list")
async def list_resumes(
    current_user=Depends(get_current_user),
    db=Depends(get_db),
):
    cursor = db.resumes.find(
        {"user_id": str(current_user["_id"])}
    ).sort("uploaded_at", -1)

    resumes = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        resumes.append(doc)

    return {"resumes": resumes, "count": len(resumes)}
