// src/types/job.types.ts

export type JobStatus = 'Draft' | 'Active' | 'Paused' | 'Closed';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  description: string;
  required_skills: string[];
  required_experience_years: number;
  status: JobStatus;
  applicant_count: number;
  avg_ai_score: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  close_reason?: string;
}

export interface JobAnalytics {
  job_id: string;
  funnel: { stage: string; count: number; conversion_pct: number }[];
  avg_score: number;
  top_candidates: { id: string; name: string; score: number }[];
  time_to_fill_estimate_days: number;
  source_breakdown: { source: string; count: number }[];
}

export interface JobFormData {
  title: string;
  department: string;
  location: string;
  employment_type: Job['employment_type'];
  description: string;
  required_skills: string[];
  required_experience_years: number;
  status: JobStatus;
}
