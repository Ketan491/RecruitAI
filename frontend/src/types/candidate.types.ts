// src/types/candidate.types.ts

export type CandidateStage =
  | 'Applied'
  | 'Screened'
  | 'Phone Screen'
  | 'Technical'
  | 'Final Round'
  | 'Offer'
  | 'Hired'
  | 'Rejected';

export type CandidateSource = 'LinkedIn' | 'Naukri' | 'Referral' | 'Direct' | 'Other';

export type CandidateStatus = 'active' | 'archived' | 'rejected' | 'hired';

export interface ScoreBreakdown {
  skill_match: {
    score: number;
    matched_skills: string[];
    missing_skills: string[];
    bonus_skills: string[];
  };
  experience: {
    score: number;
    years_detected: number;
    relevance: 'high' | 'medium' | 'low';
    highlights: string[];
  };
  education: {
    score: number;
    degree: string;
    field: string;
  };
  communication: {
    score: number;
    clarity: 'excellent' | 'good' | 'average' | 'poor';
    issues: string[];
  };
}

export interface AIScoreResult {
  overall_score: number;
  breakdown: ScoreBreakdown;
  ats_score: number;
  ats_keywords_matched: string[];
  ats_keywords_missing: string[];
  summary: string;
  strengths: string[];
  weaknesses: string[];
  interview_questions: {
    technical: string[];
    behavioral: string[];
    culture_fit: string[];
  };
  duplicate_risk: 'none' | 'possible' | 'likely';
  duplicate_reason: string | null;
}

export interface CandidateNote {
  id: string;
  content: string;
  author_id: string;
  author_name: string;
  author_avatar?: string;
  created_at: string;
  updated_at?: string;
}

export interface TimelineEntry {
  id: string;
  action: string;
  actor_name: string;
  actor_avatar?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Interview {
  id: string;
  date: string;
  time: string;
  type: 'video' | 'phone' | 'onsite';
  link?: string;
  notes?: string;
  created_at: string;
}

export interface ParsedResume {
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
  };
  skills: string[];
  experience: {
    company: string;
    title: string;
    start_date: string;
    end_date?: string;
    description: string;
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    graduation_year?: string;
  }[];
  certifications: string[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  job_id: string;
  job_title: string;
  stage: CandidateStage;
  status: CandidateStatus;
  source: CandidateSource;
  overall_score: number;
  ats_score: number;
  ai_score?: AIScoreResult;
  parsed_resume?: ParsedResume;
  resume_url?: string;
  notes: CandidateNote[];
  timeline: TimelineEntry[];
  interviews: Interview[];
  days_in_stage: number;
  created_at: string;
  updated_at: string;
}

export interface CandidatePreview {
  id: string;
  name: string;
  email: string;
  job_id: string;
  job_title: string;
  stage: CandidateStage;
  status: CandidateStatus;
  source: CandidateSource;
  overall_score: number;
  ats_score: number;
  days_in_stage: number;
  created_at: string;
}

export interface CandidateFilters {
  search?: string;
  stage?: CandidateStage[];
  source?: CandidateSource[];
  score_min?: number;
  score_max?: number;
  date_from?: string;
  date_to?: string;
  job_id?: string;
}

export interface PipelineGroup {
  stage: CandidateStage;
  candidates: CandidatePreview[];
  count: number;
  avg_score: number;
}
