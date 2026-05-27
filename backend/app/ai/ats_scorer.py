"""
ATS (Applicant Tracking System) scorer.
Compares resume skills/keywords against a job description to generate a match score.
Uses TF-IDF similarity via scikit-learn.
"""
import re
from typing import Dict, List, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

def clean_text(text: str) -> str:
    """Normalize text for comparison."""
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def extract_keywords_from_jd(job_description: str) -> List[str]:
    """Extract important keywords/skills from job description."""
    # Common tech skills to look for in JD
    tech_skills = [
        "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
        "react", "vue", "angular", "next.js", "node.js", "express", "fastapi",
        "django", "flask", "spring", "mongodb", "postgresql", "mysql", "redis",
        "docker", "kubernetes", "aws", "gcp", "azure", "terraform", "git",
        "machine learning", "deep learning", "tensorflow", "pytorch", "nlp",
        "pandas", "numpy", "scikit-learn", "html", "css", "tailwind", "bootstrap",
        "rest api", "graphql", "microservices", "agile", "scrum", "linux", "sql"
    ]
    
    jd_lower = job_description.lower()
    found = []
    for skill in tech_skills:
        if re.search(r'\b' + re.escape(skill) + r'\b', jd_lower):
            found.append(skill)
    
    return found

def calculate_skill_overlap(
    resume_skills: List[str],
    jd_keywords: List[str]
) -> Tuple[List[str], List[str], float]:
    """
    Compare resume skills against JD keywords.
    Returns matched skills, missing skills, and match percentage.
    """
    resume_set = set(s.lower() for s in resume_skills)
    jd_set = set(s.lower() for s in jd_keywords)
    
    matched = list(resume_set & jd_set)
    missing = list(jd_set - resume_set)
    
    if not jd_set:
        return matched, missing, 0.0
    
    score = len(matched) / len(jd_set) * 100
    return matched, missing, round(score, 1)

def calculate_text_similarity(resume_text: str, job_description: str) -> float:
    """
    Use TF-IDF + cosine similarity to measure overall text similarity.
    This catches context beyond just keyword matching.
    """
    try:
        vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=500
        )
        tfidf_matrix = vectorizer.fit_transform([
            clean_text(resume_text),
            clean_text(job_description)
        ])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return round(float(similarity) * 100, 1)
    except Exception as e:
        print(f"Similarity error: {e}")
        return 0.0

def generate_ats_suggestions(
    missing_skills: List[str],
    score: float,
    resume_text: str
) -> List[str]:
    """Generate actionable improvement suggestions based on ATS analysis."""
    suggestions = []
    
    if score < 40:
        suggestions.append("Your resume needs significant work to match this role. Focus on adding the missing skills.")
    elif score < 60:
        suggestions.append("Your resume partially matches. Add the missing technical skills to boost your score.")
    elif score < 80:
        suggestions.append("Good match! A few targeted additions could push you into the strong candidate range.")
    else:
        suggestions.append("Excellent match! Your profile aligns well with this job description.")
    
    if missing_skills:
        top_missing = missing_skills[:3]
        suggestions.append(f"Prioritize adding: {', '.join(top_missing)} to your resume.")
    
    if "github" not in resume_text.lower():
        suggestions.append("Include your GitHub profile link to showcase your projects.")
    
    if len(resume_text) < 500:
        suggestions.append("Your resume seems thin. Add more detail about your projects and experience.")
    
    suggestions.append("Use action verbs like 'built', 'developed', 'designed', 'led' in your descriptions.")
    suggestions.append("Quantify your achievements where possible (e.g., 'reduced load time by 40%').")
    
    return suggestions

def score_resume_against_jd(
    resume_data: dict,
    job_description: str,
    job_title: str = None
) -> dict:
    """
    Main ATS scoring function.
    Combines skill matching + text similarity for a holistic score.
    """
    resume_skills = resume_data.get("skills", [])
    resume_text = resume_data.get("raw_text", "") or " ".join(resume_skills)
    
    # Extract keywords from job description
    jd_keywords = extract_keywords_from_jd(job_description)
    
    # Skill-level comparison
    matched_skills, missing_skills, skill_score = calculate_skill_overlap(
        resume_skills, jd_keywords
    )
    
    # Text-level similarity
    text_score = calculate_text_similarity(resume_text, job_description)
    
    # Weighted final score: 60% skill match + 40% text similarity
    overall_score = round((skill_score * 0.6) + (text_score * 0.4), 1)
    
    # Estimate experience match (simplified)
    experience_match = min(100.0, text_score * 1.2)
    
    # Education match (simplified — checks for degree keywords)
    education_keywords = ["bachelor", "master", "phd", "b.e", "b.tech", "m.tech"]
    edu_matches = sum(1 for k in education_keywords if k in job_description.lower())
    education_match = 80.0 if edu_matches > 0 else 60.0
    
    suggestions = generate_ats_suggestions(missing_skills, overall_score, resume_text)
    
    return {
        "overall_score": min(overall_score, 100.0),
        "skill_score": skill_score,
        "text_similarity": text_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills[:10],
        "matched_keywords": matched_skills,
        "missing_keywords": missing_skills,
        "experience_match": round(experience_match, 1),
        "education_match": education_match,
        "suggestions": suggestions
    }
