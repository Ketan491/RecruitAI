# services/recommender.py
# Rule-based + skill-matching recommendation engine

from typing import List, Dict, Any

# ── Job role → required skills mapping ───────────────────────────────
ROLE_SKILLS: Dict[str, List[str]] = {
    "Frontend Developer":       ["React", "Javascript", "Typescript", "Html", "Css", "Tailwind"],
    "Backend Developer":        ["Python", "Nodejs", "Fastapi", "Django", "Postgresql", "Rest Api"],
    "Full Stack Developer":     ["React", "Nodejs", "Python", "Mongodb", "Docker", "Git"],
    "Data Scientist":           ["Python", "Machine Learning", "Pandas", "Numpy", "Scikit-Learn", "Sql"],
    "ML Engineer":              ["Python", "Tensorflow", "Pytorch", "Nlp", "Deep Learning", "Docker"],
    "DevOps Engineer":          ["Docker", "Kubernetes", "Aws", "Ci/Cd", "Linux", "Terraform"],
    "UI/UX Designer":           ["Figma", "Adobe Xd", "Sketch", "Html", "Css", "Creativity"],
    "Mobile Developer":         ["React", "Javascript", "Typescript", "Git"],
    "Cloud Architect":          ["Aws", "Azure", "Gcp", "Docker", "Kubernetes", "Terraform"],
    "Database Administrator":   ["Sql", "Postgresql", "Mongodb", "Redis", "Mysql"],
    "Cybersecurity Analyst":    ["Linux", "Networking", "Python", "Bash"],
    "Product Manager":          ["Project Management", "Agile", "Scrum", "Communication", "Leadership"],
}

# ── Course recommendations per skill ─────────────────────────────────
SKILL_COURSES: Dict[str, List[Dict[str, str]]] = {
    "Python":           [{"name": "Python Bootcamp", "platform": "Udemy", "url": "https://udemy.com"}],
    "React":            [{"name": "React - The Complete Guide", "platform": "Udemy", "url": "https://udemy.com"}],
    "Machine Learning": [{"name": "ML Specialization", "platform": "Coursera", "url": "https://coursera.org"}],
    "Docker":           [{"name": "Docker & Kubernetes", "platform": "Udemy", "url": "https://udemy.com"}],
    "Aws":              [{"name": "AWS Certified Developer", "platform": "Coursera", "url": "https://coursera.org"}],
    "Sql":              [{"name": "SQL for Data Science", "platform": "Coursera", "url": "https://coursera.org"}],
    "Typescript":       [{"name": "Understanding TypeScript", "platform": "Udemy", "url": "https://udemy.com"}],
    "Figma":            [{"name": "UI/UX Design with Figma", "platform": "YouTube", "url": "https://youtube.com"}],
}

DEFAULT_COURSES = [
    {"name": "Data Structures & Algorithms", "platform": "LeetCode", "url": "https://leetcode.com"},
    {"name": "System Design Primer",          "platform": "GitHub",   "url": "https://github.com"},
    {"name": "Clean Code",                    "platform": "Book",     "url": "https://www.amazon.com"},
]

def recommend_roles(skills: List[str]) -> List[Dict[str, Any]]:
    """Score each role based on how many required skills the user has."""
    skill_set = set(s.lower() for s in skills)
    scored = []
    for role, required in ROLE_SKILLS.items():
        req_set = set(r.lower() for r in required)
        match   = skill_set & req_set
        pct     = round(len(match) / len(req_set) * 100) if req_set else 0
        scored.append({
            "role":           role,
            "match_percent":  pct,
            "matched_skills": [s.title() for s in match],
            "missing_skills": [s.title() for s in req_set - skill_set],
        })
    scored.sort(key=lambda x: x["match_percent"], reverse=True)
    return scored[:5]

def recommend_courses(missing_skills: List[str]) -> List[Dict[str, str]]:
    """Return courses for the missing skills."""
    courses = []
    for skill in missing_skills[:6]:
        skill_key = skill.title()
        if skill_key in SKILL_COURSES:
            courses.extend(SKILL_COURSES[skill_key])
    if not courses:
        courses = DEFAULT_COURSES
    return courses[:8]

def get_recommendations(skills: List[str], job_description: str = "") -> Dict[str, Any]:
    roles   = recommend_roles(skills)
    missing = roles[0]["missing_skills"] if roles else []
    courses = recommend_courses(missing)
    return {
        "recommended_roles":   roles,
        "recommended_courses": courses,
        "top_role":            roles[0]["role"] if roles else "General Developer",
        "skill_gap_count":     len(missing),
    }
