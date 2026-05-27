# services/ats_scorer.py
# ATS scoring using TF-IDF cosine similarity + keyword matching

import re
from typing import Dict, Any, List
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from services.resume_parser import TECH_SKILLS, SOFT_SKILLS, extract_skills

ALL_SKILLS = [s.lower() for s in TECH_SKILLS + SOFT_SKILLS]

def tokenize(text: str) -> str:
    """Lowercase and remove punctuation."""
    return re.sub(r"[^a-z0-9\s]", " ", text.lower())

def compute_similarity(text1: str, text2: str) -> float:
    """TF-IDF cosine similarity between two texts."""
    try:
        vec = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        matrix = vec.fit_transform([tokenize(text1), tokenize(text2)])
        score = cosine_similarity(matrix[0], matrix[1])[0][0]
        return round(float(score) * 100, 1)
    except Exception:
        return 0.0

def extract_keywords_from_jd(jd: str) -> List[str]:
    """Pull skill keywords out of a job description."""
    jd_lower = jd.lower()
    return [s.title() for s in ALL_SKILLS if s in jd_lower]

def compute_ats_score(resume_text: str, job_description: str) -> Dict[str, Any]:
    """
    Main ATS scoring function.
    Returns score, matched/missing skills and keywords, suggestions.
    """
    resume_skills = set(s.lower() for s in extract_skills(resume_text))
    jd_skills     = set(s.lower() for s in extract_keywords_from_jd(job_description))

    matched_skills  = sorted([s.title() for s in resume_skills & jd_skills])
    missing_skills  = sorted([s.title() for s in jd_skills - resume_skills])

    # Keyword overlap
    resume_words = set(tokenize(resume_text).split())
    jd_words     = set(tokenize(job_description).split())
    # Filter to meaningful words (>3 chars)
    common = [w for w in resume_words & jd_words if len(w) > 3]
    missing_kw = [w for w in jd_words - resume_words if len(w) > 3][:15]

    # Composite score: 60% NLP similarity + 40% skill overlap
    nlp_score   = compute_similarity(resume_text, job_description)
    skill_score = (len(matched_skills) / max(len(jd_skills), 1)) * 100 if jd_skills else nlp_score
    final_score = round(0.6 * nlp_score + 0.4 * skill_score, 1)
    final_score = min(final_score, 98.0)  # cap at 98

    # Generate suggestions
    suggestions = []
    if missing_skills:
        suggestions.append(f"Add these skills to your resume: {', '.join(missing_skills[:4])}")
    if final_score < 60:
        suggestions.append("Tailor your resume summary to match the job description language")
    if final_score < 75:
        suggestions.append("Use more keywords from the job description in your experience bullets")
    suggestions.append("Quantify your achievements with numbers and metrics")
    suggestions.append("Ensure your resume uses standard section headings")

    return {
        "score":            final_score,
        "matched_skills":   matched_skills,
        "missing_skills":   missing_skills,
        "matched_keywords": sorted(common)[:15],
        "missing_keywords": sorted(missing_kw),
        "suggestions":      suggestions[:5],
    }
