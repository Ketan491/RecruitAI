"""
Recommendation engine that suggests job roles, missing skills, and courses
based on a candidate's extracted resume data.
"""
from typing import List, Dict, Any

# Job role → required skills mapping
JOB_ROLES = {
    "Frontend Developer": {
        "required": ["react", "javascript", "html", "css", "typescript"],
        "nice_to_have": ["next.js", "tailwind", "figma", "graphql"],
        "avg_salary": "₹6–12 LPA"
    },
    "Backend Developer": {
        "required": ["python", "node.js", "rest api", "sql", "mongodb"],
        "nice_to_have": ["docker", "aws", "redis", "microservices"],
        "avg_salary": "₹7–14 LPA"
    },
    "Full Stack Developer": {
        "required": ["react", "node.js", "mongodb", "javascript", "rest api"],
        "nice_to_have": ["typescript", "docker", "aws", "graphql"],
        "avg_salary": "₹8–18 LPA"
    },
    "Data Scientist": {
        "required": ["python", "machine learning", "pandas", "numpy", "scikit-learn"],
        "nice_to_have": ["deep learning", "tensorflow", "pytorch", "nlp"],
        "avg_salary": "₹8–20 LPA"
    },
    "ML Engineer": {
        "required": ["python", "machine learning", "tensorflow", "docker", "sql"],
        "nice_to_have": ["kubernetes", "aws", "mlops", "pytorch"],
        "avg_salary": "₹12–25 LPA"
    },
    "DevOps Engineer": {
        "required": ["docker", "kubernetes", "aws", "linux", "git"],
        "nice_to_have": ["terraform", "ansible", "jenkins", "python"],
        "avg_salary": "₹10–20 LPA"
    },
    "Android Developer": {
        "required": ["kotlin", "java", "android", "git"],
        "nice_to_have": ["react native", "firebase", "rest api"],
        "avg_salary": "₹6–15 LPA"
    },
    "Cloud Engineer": {
        "required": ["aws", "azure", "linux", "docker", "terraform"],
        "nice_to_have": ["kubernetes", "python", "monitoring"],
        "avg_salary": "₹10–22 LPA"
    }
}

# Online courses for skill gaps
COURSE_CATALOG = {
    "react": {"title": "React - The Complete Guide", "platform": "Udemy", "url": "https://www.udemy.com/course/react-the-complete-guide-incl-redux/", "duration": "48 hrs"},
    "python": {"title": "Python Bootcamp", "platform": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=rfscVS0vtbw", "duration": "4 hrs"},
    "machine learning": {"title": "ML Course by Andrew Ng", "platform": "Coursera", "url": "https://www.coursera.org/learn/machine-learning", "duration": "60 hrs"},
    "docker": {"title": "Docker for Beginners", "platform": "YouTube", "url": "https://www.youtube.com/watch?v=fqMOX6JJhGo", "duration": "3 hrs"},
    "aws": {"title": "AWS Cloud Practitioner", "platform": "AWS Training", "url": "https://aws.amazon.com/training/", "duration": "40 hrs"},
    "node.js": {"title": "Node.js Crash Course", "platform": "YouTube", "url": "https://www.youtube.com/watch?v=fBNz5xF-Kx4", "duration": "2 hrs"},
    "typescript": {"title": "TypeScript Full Course", "platform": "freeCodeCamp", "url": "https://www.youtube.com/watch?v=30LWjhZzg50", "duration": "7 hrs"},
    "sql": {"title": "SQL Tutorial for Beginners", "platform": "W3Schools", "url": "https://www.w3schools.com/sql/", "duration": "10 hrs"},
    "kubernetes": {"title": "Kubernetes for Beginners", "platform": "TechWorld", "url": "https://www.youtube.com/watch?v=X48VuDVv0do", "duration": "4 hrs"},
    "tensorflow": {"title": "TensorFlow 2.0 Complete", "platform": "Udemy", "url": "https://www.udemy.com/course/tensorflow-developer-certificate-machine-learning-zero-to-mastery/", "duration": "63 hrs"},
}

def score_role_fit(user_skills: List[str], role_data: Dict) -> float:
    """Calculate how well a user's skills match a specific job role (0-100)."""
    required = set(role_data["required"])
    user_set = set(s.lower() for s in user_skills)
    
    if not required:
        return 0.0
    
    matched = len(required & user_set)
    base_score = (matched / len(required)) * 100
    
    # Bonus for nice-to-have skills
    nice = set(role_data.get("nice_to_have", []))
    nice_matched = len(nice & user_set)
    bonus = (nice_matched / max(len(nice), 1)) * 10
    
    return min(round(base_score + bonus, 1), 100.0)

def get_recommendations(resume_data: dict) -> dict:
    """
    Main recommendation function.
    Analyzes user skills and returns role recommendations + course suggestions.
    """
    user_skills = [s.lower() for s in resume_data.get("skills", [])]
    
    # Score each role
    role_scores = []
    for role_name, role_data in JOB_ROLES.items():
        score = score_role_fit(user_skills, role_data)
        required_set = set(role_data["required"])
        user_set = set(user_skills)
        missing = list(required_set - user_set)
        
        role_scores.append({
            "role": role_name,
            "match_score": score,
            "avg_salary": role_data["avg_salary"],
            "missing_skills": missing[:3],
            "your_skills": list(required_set & user_set)
        })
    
    # Sort by match score, recommend top 3
    role_scores.sort(key=lambda x: x["match_score"], reverse=True)
    recommended_roles = role_scores[:3]
    
    # Gather all missing skills from top roles
    all_missing = set()
    for role in recommended_roles:
        all_missing.update(role["missing_skills"])
    
    # Find course recommendations for missing skills
    recommended_courses = []
    for skill in list(all_missing)[:6]:
        if skill in COURSE_CATALOG:
            recommended_courses.append({
                "skill": skill,
                **COURSE_CATALOG[skill]
            })
    
    # Career path based on top role
    top_role = recommended_roles[0]["role"] if recommended_roles else "Software Developer"
    career_paths = {
        "Frontend Developer": ["Junior Frontend Dev", "Frontend Developer", "Senior Frontend Dev", "Tech Lead"],
        "Backend Developer": ["Junior Backend Dev", "Backend Developer", "Senior Backend Dev", "Architect"],
        "Full Stack Developer": ["Junior Dev", "Full Stack Developer", "Senior Full Stack Dev", "Engineering Manager"],
        "Data Scientist": ["Data Analyst", "Data Scientist", "Senior Data Scientist", "ML Research Scientist"],
        "ML Engineer": ["ML Engineer", "Senior ML Engineer", "Staff ML Engineer", "ML Principal Engineer"],
        "DevOps Engineer": ["Junior DevOps", "DevOps Engineer", "Senior DevOps", "Site Reliability Engineer"],
    }
    career_path = career_paths.get(top_role, ["Junior Developer", "Developer", "Senior Developer", "Tech Lead"])
    
    return {
        "recommended_roles": recommended_roles,
        "missing_skills": list(all_missing)[:8],
        "recommended_courses": recommended_courses,
        "career_path": career_path
    }
