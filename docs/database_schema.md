# Database Schema — MongoDB Collections

## users
```json
{
  "_id": ObjectId,
  "name": "Ketan Sharma",
  "email": "ketan@example.com",
  "password": "$2b$12$hashedpassword",
  "role": "user",           // "user" | "hr"
  "avatar": null,
  "created_at": ISODate,
  "skills": ["python", "react", "mongodb"],
  "resume_uploaded": true,
  "phone": "+91 9876543210",
  "location": "Mumbai, India",
  "bio": "BE student passionate about AI",
  "linkedin": "linkedin.com/in/ketan",
  "github": "github.com/ketan"
}
```

## resumes
```json
{
  "_id": ObjectId,
  "user_id": "string (ObjectId ref)",
  "filename": "ketan_resume.pdf",
  "file_path": "./uploads/userId_timestamp_filename.pdf",
  "extracted_data": {
    "raw_text": "Extracted text...",
    "email": "ketan@email.com",
    "phone": "+91 ...",
    "skills": ["python", "react"],
    "education": [{"degree": "B.E.", "details": "..."}],
    "experience": [{"period": "2023 - present", "details": "..."}],
    "keywords": ["developer", "python", "api"],
    "certifications": [],
    "languages": []
  },
  "uploaded_at": ISODate,
  "analyzed": true
}
```

## ats_scores
```json
{
  "_id": ObjectId,
  "user_id": "string",
  "resume_id": "string",
  "job_title": "Full Stack Developer",
  "job_description": "We are looking for...",
  "overall_score": 73.5,
  "skill_score": 65.0,
  "text_similarity": 85.2,
  "matched_skills": ["python", "react"],
  "missing_skills": ["docker", "kubernetes"],
  "matched_keywords": ["python", "react"],
  "missing_keywords": ["docker"],
  "experience_match": 70.0,
  "education_match": 80.0,
  "suggestions": ["Add Docker experience", "..."],
  "calculated_at": ISODate
}
```

## interview_reports
```json
{
  "_id": ObjectId,
  "user_id": "string",
  "analysis": {
    "transcript": "I am a developer who...",
    "filler_words": {"um": 3, "like": 5},
    "filler_word_count": 8,
    "total_words": 142,
    "filler_ratio": 0.056,
    "speech_speed_wpm": 138,
    "confidence_score": 72.5,
    "clarity_score": 68.0,
    "feedback": ["..."],
    "strengths": ["..."],
    "improvements": ["..."],
    "duration_seconds": 62,
    "analyzed_at": "ISODate string"
  },
  "session_date": ISODate
}
```

## jobs (future expansion)
```json
{
  "_id": ObjectId,
  "title": "Senior React Developer",
  "company": "TechCorp India",
  "description": "We are looking for...",
  "required_skills": ["react", "typescript"],
  "location": "Bangalore",
  "type": "full-time",
  "posted_at": ISODate,
  "posted_by": "hr_user_id"
}
```
