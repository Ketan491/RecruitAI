# tests/test_ai_service.py
import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.mark.anyio
async def test_score_resume_returns_dict():
    mock_response = MagicMock()
    mock_response.content = [
        MagicMock(
            text=json.dumps(
                {
                    "overall_score": 78,
                    "breakdown": {
                        "skill_match": {
                            "score": 32,
                            "matched_skills": ["Python"],
                            "missing_skills": [],
                            "bonus_skills": [],
                        },
                        "experience": {
                            "score": 22,
                            "years_detected": 4,
                            "relevance": "high",
                            "highlights": [],
                        },
                        "education": {"score": 12, "degree": "B.Tech", "field": "CS"},
                        "communication": {"score": 12, "clarity": "good", "issues": []},
                    },
                    "ats_score": 80,
                    "ats_keywords_matched": ["Python"],
                    "ats_keywords_missing": [],
                    "summary": "Strong candidate.",
                    "strengths": ["Python expertise"],
                    "weaknesses": [],
                    "interview_questions": {"technical": [], "behavioral": [], "culture_fit": []},
                    "duplicate_risk": "none",
                    "duplicate_reason": None,
                }
            )
        )
    ]

    with patch("backend.services.ai_service.get_anthropic_client") as mock_client:
        mock_instance = AsyncMock()
        mock_instance.messages.create = AsyncMock(return_value=mock_response)
        mock_client.return_value = mock_instance

        from backend.services.ai_service import score_resume

        result = await score_resume(
            resume_text="Python developer with 4 years experience.",
            job_description="We need a Python developer.",
            required_skills=["Python"],
            required_experience_years=3,
            job_title="Backend Engineer",
        )

    assert result["overall_score"] == 78
    assert "breakdown" in result
    assert result["breakdown"]["skill_match"]["score"] == 32


@pytest.mark.anyio
async def test_fallback_on_json_error():
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text="NOT VALID JSON {{{")]

    with patch("backend.services.ai_service.get_anthropic_client") as mock_client:
        mock_instance = AsyncMock()
        mock_instance.messages.create = AsyncMock(return_value=mock_response)
        mock_client.return_value = mock_instance

        from backend.services.ai_service import score_resume

        result = await score_resume("resume", "job", [], 0, "role")

    assert result["overall_score"] == 50  # fallback
    assert "breakdown" in result
