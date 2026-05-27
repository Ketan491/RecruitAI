"""
Resume parsing using PyPDF2 for text extraction and spaCy/regex for NLP.
This extracts structured info from raw resume text.
"""
import re
import PyPDF2
import io
from typing import Dict, List, Any, Optional

# Common tech skills to look for
TECH_SKILLS = [
    "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "kotlin",
    "react", "vue", "angular", "next.js", "nuxt", "svelte", "node.js", "express",
    "fastapi", "django", "flask", "spring", "laravel", "rails",
    "mongodb", "postgresql", "mysql", "sqlite", "redis", "elasticsearch",
    "docker", "kubernetes", "aws", "gcp", "azure", "terraform", "ansible",
    "git", "github", "gitlab", "ci/cd", "jenkins", "github actions",
    "machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn",
    "pandas", "numpy", "matplotlib", "opencv", "nlp", "computer vision",
    "html", "css", "sass", "tailwind", "bootstrap", "figma",
    "rest api", "graphql", "grpc", "microservices", "agile", "scrum",
    "linux", "bash", "sql", "nosql", "data structures", "algorithms"
]

SOFT_SKILLS = [
    "leadership", "communication", "teamwork", "problem-solving", "critical thinking",
    "time management", "adaptability", "creativity", "collaboration", "presentation"
]

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract raw text from PDF bytes using PyPDF2."""
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def extract_email(text: str) -> Optional[str]:
    """Find email address in text using regex."""
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    matches = re.findall(pattern, text)
    return matches[0] if matches else None

def extract_phone(text: str) -> Optional[str]:
    """Find phone number in text."""
    pattern = r'(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}'
    matches = re.findall(pattern, text)
    return matches[0] if matches else None

def extract_skills(text: str) -> List[str]:
    """
    Look for known tech skills in resume text.
    Case-insensitive matching against our skills list.
    """
    text_lower = text.lower()
    found_skills = []
    
    for skill in TECH_SKILLS + SOFT_SKILLS:
        # Word boundary matching to avoid false positives
        if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
            found_skills.append(skill)
    
    return list(set(found_skills))

def extract_education(text: str) -> List[Dict[str, Any]]:
    """Extract education entries from resume text."""
    education = []
    
    # Common degree patterns
    degree_patterns = [
        r'(B\.?E\.?|B\.?Tech\.?|Bachelor of Engineering|Bachelor of Technology)',
        r'(B\.?Sc\.?|Bachelor of Science)',
        r'(M\.?Tech\.?|M\.?E\.?|Master of Technology|Master of Engineering)',
        r'(M\.?Sc\.?|Master of Science)',
        r'(MBA|Master of Business Administration)',
        r'(Ph\.?D\.?|Doctor of Philosophy)',
        r'(B\.?C\.?A\.?|Bachelor of Computer Applications)',
        r'(M\.?C\.?A\.?|Master of Computer Applications)',
        r'(Diploma)',
        r'(12th|HSC|Higher Secondary)',
        r'(10th|SSC|Secondary)'
    ]
    
    for pattern in degree_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            # Extract surrounding context (about 100 chars)
            start = max(0, match.start() - 20)
            end = min(len(text), match.end() + 100)
            context = text[start:end].strip().replace('\n', ' ')
            
            education.append({
                "degree": match.group(),
                "details": context[:200]
            })
    
    return education[:5]  # Max 5 entries

def extract_experience(text: str) -> List[Dict[str, Any]]:
    """Extract work experience sections from resume."""
    experience = []
    
    # Look for year patterns that indicate experience
    year_pattern = r'(20\d{2})\s*[-–—to]+\s*(20\d{2}|present|current)'
    matches = re.finditer(year_pattern, text, re.IGNORECASE)
    
    for match in matches:
        start = max(0, match.start() - 50)
        end = min(len(text), match.end() + 200)
        context = text[start:end].strip().replace('\n', ' ')
        
        experience.append({
            "period": f"{match.group(1)} - {match.group(2)}",
            "details": context[:300]
        })
    
    return experience[:5]

def extract_keywords(text: str) -> List[str]:
    """Extract important keywords using frequency analysis."""
    # Clean and tokenize
    clean_text = re.sub(r'[^\w\s]', ' ', text.lower())
    words = clean_text.split()
    
    # Filter stop words
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought',
        'used', 'able', 'this', 'that', 'these', 'those', 'my', 'your', 'his',
        'her', 'its', 'our', 'their', 'i', 'we', 'you', 'he', 'she', 'it',
        'as', 'if', 'then', 'than', 'so', 'yet', 'both', 'either', 'not'
    }
    
    word_freq = {}
    for word in words:
        if len(word) > 3 and word not in stop_words:
            word_freq[word] = word_freq.get(word, 0) + 1
    
    # Return top 20 keywords by frequency
    sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
    return [word for word, _ in sorted_words[:20]]

def parse_resume(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Main function to parse a resume PDF.
    Returns structured data extracted from the resume.
    """
    raw_text = extract_text_from_pdf(pdf_bytes)
    
    if not raw_text:
        return {
            "error": "Could not extract text from PDF",
            "raw_text": "",
            "skills": [],
            "education": [],
            "experience": [],
            "keywords": []
        }
    
    return {
        "raw_text": raw_text[:5000],  # Limit stored raw text
        "email": extract_email(raw_text),
        "phone": extract_phone(raw_text),
        "skills": extract_skills(raw_text),
        "education": extract_education(raw_text),
        "experience": extract_experience(raw_text),
        "keywords": extract_keywords(raw_text),
        "certifications": [],
        "languages": [],
        "summary": raw_text[:300] if raw_text else None
    }
