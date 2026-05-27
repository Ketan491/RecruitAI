# models/resume.py — Resume and ATS score schemas

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ResumeData(BaseModel):
    user_id: str
    filename: str
    raw_text: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    skills: List[str] = []
    education: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    keywords: List[str] = []
    uploaded_at: Optional[datetime] = None

class ATSRequest(BaseModel):
    resume_text: str
    job_description: str

class ATSResponse(BaseModel):
    score: float
    matched_skills: List[str]
    missing_skills: List[str]
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggestions: List[str]

class JobModel(BaseModel):
    title: str
    company: str
    description: str
    required_skills: List[str]
    location: Optional[str] = None
    salary_range: Optional[str] = None
