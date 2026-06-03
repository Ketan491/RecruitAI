// src/types/ai.types.ts

export interface AIScoreInput {
  resume_text: string;
  job_description: string;
  required_skills: string[];
  required_experience_years: number;
  job_title: string;
}

export interface RescoringStatus {
  candidate_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
}
