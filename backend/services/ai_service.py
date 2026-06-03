# services/ai_service.py
import json
import logging
from typing import Any

from anthropic import AsyncAnthropic
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from ..config import settings

logger = logging.getLogger(__name__)

_client: AsyncAnthropic | None = None


def get_anthropic_client() -> AsyncAnthropic:
    global _client
    if _client is None:
        _client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    return _client


SCORING_SYSTEM = """You are an expert ATS and HR scoring engine. Analyse the resume against the job requirements and respond ONLY with a valid JSON object — no preamble, no markdown, no explanation.

Score breakdown (must sum to overall_score rounded to nearest integer):
- skill_match: 0-40
- experience: 0-30
- education: 0-15
- communication: 0-15

Respond with exactly this schema:
{
  "overall_score": <int 0-100>,
  "breakdown": {
    "skill_match": {"score": <int 0-40>, "matched_skills": [], "missing_skills": [], "bonus_skills": []},
    "experience": {"score": <int 0-30>, "years_detected": <int>, "relevance": "high|medium|low", "highlights": []},
    "education": {"score": <int 0-15>, "degree": "<str>", "field": "<str>"},
    "communication": {"score": <int 0-15>, "clarity": "excellent|good|average|poor", "issues": []}
  },
  "ats_score": <int 0-100>,
  "ats_keywords_matched": [],
  "ats_keywords_missing": [],
  "summary": "<2-3 sentence honest assessment>",
  "strengths": ["<str>", "<str>", "<str>"],
  "weaknesses": ["<str>", "<str>"],
  "interview_questions": {
    "technical": ["<str>", "<str>", "<str>"],
    "behavioral": ["<str>", "<str>"],
    "culture_fit": ["<str>", "<str>"]
  },
  "duplicate_risk": "none|possible|likely",
  "duplicate_reason": null
}"""


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type(Exception),
)
async def score_resume(
    resume_text: str,
    job_description: str,
    required_skills: list[str],
    required_experience_years: int,
    job_title: str,
) -> dict[str, Any]:
    client = get_anthropic_client()

    user_prompt = f"""Job Title: {job_title}
Job Description:
{job_description}

Required Skills: {', '.join(required_skills)}
Required Experience: {required_experience_years}+ years

Resume:
{resume_text[:8000]}"""

    try:
        message = await client.messages.create(
            model=settings.ANTHROPIC_MODEL,
            max_tokens=2000,
            system=SCORING_SYSTEM,
            messages=[{"role": "user", "content": user_prompt}],
        )
        raw = message.content[0].text.strip()
        # Strip markdown fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        result = json.loads(raw)
        logger.info("AI scoring completed, overall_score=%s", result.get("overall_score"))
        return result
    except json.JSONDecodeError as e:
        logger.error("AI returned non-JSON response: %s", e)
        return _fallback_score()
    except Exception as e:
        logger.error("AI scoring failed: %s", e)
        raise


def _fallback_score() -> dict[str, Any]:
    return {
        "overall_score": 50,
        "breakdown": {
            "skill_match": {
                "score": 20,
                "matched_skills": [],
                "missing_skills": [],
                "bonus_skills": [],
            },
            "experience": {
                "score": 15,
                "years_detected": 0,
                "relevance": "medium",
                "highlights": [],
            },
            "education": {"score": 8, "degree": "Unknown", "field": "Unknown"},
            "communication": {"score": 7, "clarity": "average", "issues": []},
        },
        "ats_score": 50,
        "ats_keywords_matched": [],
        "ats_keywords_missing": [],
        "summary": "Scoring service temporarily unavailable. Please re-score manually.",
        "strengths": [],
        "weaknesses": [],
        "interview_questions": {"technical": [], "behavioral": [], "culture_fit": []},
        "duplicate_risk": "none",
        "duplicate_reason": None,
    }
