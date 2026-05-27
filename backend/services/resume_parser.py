# services/resume_parser.py
# Extracts skills, education, experience from PDF using PyPDF2 + regex

import re
import io
from typing import Dict, Any, List
import PyPDF2

# ── Skill keywords database ───────────────────────────────────────────
TECH_SKILLS = [
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust",
    "react", "vue", "angular", "nextjs", "nodejs", "express", "fastapi", "django",
    "flask", "spring boot", "mongodb", "postgresql", "mysql", "redis", "sqlite",
    "docker", "kubernetes", "aws", "azure", "gcp", "firebase", "terraform",
    "git", "github", "ci/cd", "jenkins", "github actions",
    "machine learning", "deep learning", "nlp", "computer vision", "tensorflow",
    "pytorch", "scikit-learn", "pandas", "numpy", "matplotlib", "seaborn",
    "html", "css", "tailwind", "bootstrap", "sass",
    "rest api", "graphql", "microservices", "agile", "scrum",
    "linux", "bash", "powershell", "sql", "nosql",
    "figma", "adobe xd", "sketch", "photoshop",
]

SOFT_SKILLS = [
    "leadership", "communication", "teamwork", "problem solving",
    "critical thinking", "time management", "creativity", "adaptability",
    "project management", "collaboration",
]

DEGREE_KEYWORDS = [
    "b.tech", "btech", "b.e", "be ", "bachelor", "b.sc", "bsc",
    "m.tech", "mtech", "m.e", "master", "m.sc", "msc", "mba",
    "phd", "ph.d", "diploma", "12th", "10th", "ssc", "hsc",
]

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Read all text from PDF bytes."""
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text = ""
        for page in reader.pages:
            text += (page.extract_text() or "") + "\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"Could not read PDF: {e}")

def extract_email(text: str) -> str:
    match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    return match.group(0) if match else ""

def extract_phone(text: str) -> str:
    match = re.search(r"(\+?\d[\d\s\-]{8,13}\d)", text)
    return match.group(0).strip() if match else ""

def extract_name(text: str) -> str:
    """Heuristic: first non-empty line that looks like a name."""
    lines = [l.strip() for l in text.split("\n") if l.strip()]
    for line in lines[:5]:
        if re.match(r"^[A-Za-z][A-Za-z\s\.]{3,40}$", line):
            return line
    return lines[0] if lines else ""

def extract_skills(text: str) -> List[str]:
    """Return deduplicated list of matched skills (preserves order)."""
    text_lower = text.lower()
    seen  = set()
    found = []
    for skill in TECH_SKILLS + SOFT_SKILLS:
        if skill in text_lower and skill not in seen:
            seen.add(skill)
            found.append(skill.title())
    return found

def extract_education(text: str) -> List[Dict[str, Any]]:
    education = []
    lines = text.split("\n")
    for i, line in enumerate(lines):
        line_lower = line.lower()
        for deg in DEGREE_KEYWORDS:
            if deg in line_lower:
                education.append({
                    "degree":  line.strip(),
                    "context": lines[i + 1].strip() if i + 1 < len(lines) else "",
                })
                break
    return education[:5]

def extract_experience(text: str) -> List[Dict[str, Any]]:
    """Extract job experience blocks via date-range pattern."""
    experience = []
    year_pattern = re.compile(
        r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*\d{4})"
        r"\s*[-–to]+\s*"
        r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)?\s*(?:\d{4}|Present|Current))",
        re.IGNORECASE,
    )
    lines = text.split("\n")
    for i, line in enumerate(lines):
        match = year_pattern.search(line)
        if match:
            experience.append({
                "period":  match.group(0).strip(),
                "role":    lines[i - 1].strip() if i > 0 else "",
                "company": line.replace(match.group(0), "").strip(),
            })
    return experience[:6]

def parse_resume(file_bytes: bytes) -> Dict[str, Any]:
    """Full resume parsing pipeline. Calls extract_skills only once."""
    text   = extract_text_from_pdf(file_bytes)
    skills = extract_skills(text)          # ← called once, reused below
    return {
        "raw_text":  text,
        "name":      extract_name(text),
        "email":     extract_email(text),
        "phone":     extract_phone(text),
        "skills":    skills,
        "education": extract_education(text),
        "experience":extract_experience(text),
        "keywords":  skills[:20],          # ← reuse, no duplicate call
    }
