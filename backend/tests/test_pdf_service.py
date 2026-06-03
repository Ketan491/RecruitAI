# tests/test_pdf_service.py
from backend.services.pdf_service import generate_candidate_report


def test_generate_pdf_returns_bytes():
    candidate = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phone": "+91-9000000000",
        "job_title": "Senior Engineer",
        "stage": "Technical",
        "status": "active",
        "source": "LinkedIn",
        "overall_score": 85.0,
        "ats_score": 79.0,
        "ai_score": {
            "summary": "Excellent candidate with strong Python skills.",
            "strengths": ["Python", "FastAPI", "MongoDB"],
            "weaknesses": ["Limited DevOps experience"],
            "breakdown": {
                "skill_match": {
                    "score": 36,
                    "matched_skills": ["Python"],
                    "missing_skills": [],
                    "bonus_skills": [],
                },
                "experience": {
                    "score": 26,
                    "years_detected": 5,
                    "relevance": "high",
                    "highlights": [],
                },
                "education": {"score": 12, "degree": "B.Tech", "field": "CSE"},
                "communication": {"score": 11, "clarity": "good", "issues": []},
            },
            "interview_questions": {
                "technical": ["Explain async/await in Python"],
                "behavioral": ["Describe a challenge you overcame"],
                "culture_fit": ["What motivates you?"],
            },
        },
        "created_at": "2025-01-15T00:00:00",
    }
    pdf = generate_candidate_report(candidate)
    assert isinstance(pdf, bytes)
    assert pdf[:4] == b"%PDF"  # Valid PDF magic bytes
    assert len(pdf) > 1000  # Non-trivial content


def test_generate_pdf_minimal_data():
    """PDF generation must not crash on missing optional fields."""
    candidate = {
        "name": "Unknown",
        "email": "",
        "phone": None,
        "job_title": "Engineer",
        "stage": "Applied",
        "status": "active",
        "source": "Direct",
        "overall_score": 0.0,
        "ats_score": 0.0,
        "ai_score": None,
        "created_at": "2025-01-01T00:00:00",
    }
    pdf = generate_candidate_report(candidate)
    assert isinstance(pdf, bytes)
    assert pdf[:4] == b"%PDF"
