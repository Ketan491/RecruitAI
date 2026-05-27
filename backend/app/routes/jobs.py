"""
Jobs board routes — browse, search, and post job listings.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from typing import Optional, List
from app.core.database import get_db
from app.middleware.auth import get_current_user, get_hr_user

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])

# Seed jobs returned when collection is empty
SAMPLE_JOBS = [
    {
        "title": "Full Stack Developer",
        "company": "TechCorp India",
        "location": "Bangalore, India",
        "type": "full-time",
        "description": "We are looking for a skilled Full Stack Developer with experience in React and Node.js. You will build scalable web applications and collaborate with a cross-functional team.",
        "required_skills": ["react", "node.js", "mongodb", "javascript", "rest api"],
        "nice_to_have": ["typescript", "docker", "aws"],
        "salary": "₹8–16 LPA",
        "posted_at": datetime.utcnow(),
        "posted_by": None,
        "active": True,
    },
    {
        "title": "Python Backend Developer",
        "company": "AI Ventures Pvt Ltd",
        "location": "Remote",
        "type": "full-time",
        "description": "Join our AI team to build production-grade Python APIs. You'll work on FastAPI services, ML pipelines, and cloud infrastructure.",
        "required_skills": ["python", "fastapi", "postgresql", "docker", "rest api"],
        "nice_to_have": ["kubernetes", "aws", "machine learning"],
        "salary": "₹10–20 LPA",
        "posted_at": datetime.utcnow(),
        "posted_by": None,
        "active": True,
    },
    {
        "title": "Data Scientist",
        "company": "FinAnalytics",
        "location": "Mumbai, India",
        "type": "full-time",
        "description": "Analyze large datasets and build predictive models to drive business decisions. Strong Python and ML skills required.",
        "required_skills": ["python", "machine learning", "pandas", "scikit-learn", "sql"],
        "nice_to_have": ["tensorflow", "pytorch", "nlp"],
        "salary": "₹12–22 LPA",
        "posted_at": datetime.utcnow(),
        "posted_by": None,
        "active": True,
    },
    {
        "title": "Frontend React Developer",
        "company": "StartupXYZ",
        "location": "Pune, India",
        "type": "full-time",
        "description": "Build beautiful, performant UI components using React and Tailwind CSS. You care deeply about user experience.",
        "required_skills": ["react", "javascript", "html", "css", "tailwind"],
        "nice_to_have": ["typescript", "next.js", "figma"],
        "salary": "₹6–12 LPA",
        "posted_at": datetime.utcnow(),
        "posted_by": None,
        "active": True,
    },
    {
        "title": "DevOps Engineer",
        "company": "CloudNative Systems",
        "location": "Hyderabad, India",
        "type": "full-time",
        "description": "Manage CI/CD pipelines, Kubernetes clusters, and cloud infrastructure. You'll own reliability and deployment automation.",
        "required_skills": ["docker", "kubernetes", "aws", "linux", "git"],
        "nice_to_have": ["terraform", "ansible", "python"],
        "salary": "₹10–20 LPA",
        "posted_at": datetime.utcnow(),
        "posted_by": None,
        "active": True,
    },
    {
        "title": "ML Engineer (Internship)",
        "company": "ResearchLab AI",
        "location": "Remote",
        "type": "internship",
        "description": "6-month internship working on NLP and computer vision models. Great opportunity for final-year students.",
        "required_skills": ["python", "machine learning", "numpy", "pandas"],
        "nice_to_have": ["tensorflow", "pytorch", "nlp", "opencv"],
        "salary": "₹20,000–40,000/month",
        "posted_at": datetime.utcnow(),
        "posted_by": None,
        "active": True,
    },
]


def _serialize(doc: dict) -> dict:
    doc["id"] = str(doc["_id"])
    del doc["_id"]
    if doc.get("posted_by"):
        doc["posted_by"] = str(doc["posted_by"])
    return doc


@router.get("/")
async def list_jobs(
    q: Optional[str] = Query(None, description="Search by title, company, or skill"),
    job_type: Optional[str] = Query(None, description="full-time | internship | part-time"),
    db=Depends(get_db),
    _=Depends(get_current_user),
):
    """List all active jobs with optional search and filter."""
    # Seed if collection is empty
    count = await db.jobs.count_documents({})
    if count == 0:
        await db.jobs.insert_many([dict(j) for j in SAMPLE_JOBS])

    query: dict = {"active": True}
    if job_type:
        query["type"] = job_type
    if q:
        query["$or"] = [
            {"title":    {"$regex": q, "$options": "i"}},
            {"company":  {"$regex": q, "$options": "i"}},
            {"required_skills": {"$elemMatch": {"$regex": q, "$options": "i"}}},
        ]

    cursor = db.jobs.find(query).sort("posted_at", -1)
    jobs = [_serialize(doc) async for doc in cursor]
    return {"jobs": jobs, "count": len(jobs)}


@router.get("/{job_id}")
async def get_job(job_id: str, db=Depends(get_db), _=Depends(get_current_user)):
    doc = await db.jobs.find_one({"_id": ObjectId(job_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Job not found.")
    return _serialize(doc)


class JobCreate(BaseModel):
    title: str
    company: str
    location: str
    type: str = "full-time"
    description: str
    required_skills: List[str] = []
    nice_to_have: List[str] = []
    salary: Optional[str] = None


@router.post("/", status_code=201)
async def create_job(
    job: JobCreate,
    db=Depends(get_db),
    hr_user=Depends(get_hr_user),
):
    """HR only — post a new job listing."""
    doc = {
        **job.model_dump(),
        "posted_at": datetime.utcnow(),
        "posted_by": str(hr_user["_id"]),
        "active": True,
    }
    result = await db.jobs.insert_one(doc)
    doc["_id"] = result.inserted_id
    return _serialize(doc)


@router.delete("/{job_id}")
async def delete_job(
    job_id: str,
    db=Depends(get_db),
    hr_user=Depends(get_hr_user),
):
    """HR only — soft-delete (deactivate) a job listing."""
    result = await db.jobs.update_one(
        {"_id": ObjectId(job_id), "posted_by": str(hr_user["_id"])},
        {"$set": {"active": False}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Job not found or not yours.")
    return {"message": "Job removed."}
