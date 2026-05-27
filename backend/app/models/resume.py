"""Resume-related Pydantic models."""
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ResumeData(BaseModel):
    """Structured data extracted from a resume PDF."""
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    skills: List[str] = []
    education: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    certifications: List[str] = []
    languages: List[str] = []
    keywords: List[str] = []
    raw_text: Optional[str] = None

class ResumeResponse(BaseModel):
    """What gets returned after uploading/analyzing a resume."""
    id: str
    user_id: str
    filename: str
    file_path: str
    extracted_data: ResumeData
    uploaded_at: datetime
    analyzed: bool = False

class ATSRequest(BaseModel):
    """Request body for ATS score calculation."""
    resume_id: str
    job_description: str
    job_title: Optional[str] = None

class ATSResponse(BaseModel):
    """ATS score result with detailed breakdown."""
    resume_id: str
    job_title: Optional[str] = None
    overall_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    matched_keywords: List[str]
    missing_keywords: List[str]
    experience_match: float
    education_match: float
    suggestions: List[str]
    calculated_at: datetime

class RecommendationResponse(BaseModel):
    """AI-generated recommendations based on resume analysis."""
    user_id: str
    recommended_roles: List[Dict[str, Any]]
    missing_skills: List[str]
    recommended_courses: List[Dict[str, Any]]
    career_path: List[str]
    generated_at: datetime
