// src/types/api.types.ts

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    total?: number;
    limit?: number;
    cursor?: string;
  };
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  detail?: Record<string, unknown>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'recruiter' | 'viewer';
  company_name: string;
  avatar?: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  user: User;
}

export interface DashboardStats {
  total_applicants: number;
  shortlisted: number;
  in_interview: number;
  offers_sent: number;
  hired: number;
  rejected: number;
  deltas: {
    total_applicants: number;
    shortlisted: number;
    in_interview: number;
    offers_sent: number;
    hired: number;
    rejected: number;
  };
}

export interface FunnelData {
  stage: string;
  count: number;
  avg_score: number;
  conversion_pct: number;
}

export interface SourceData {
  source: string;
  count: number;
  percentage: number;
}

export interface ActivityEntry {
  id: string;
  action: string;
  actor_name: string;
  actor_avatar?: string;
  candidate_name?: string;
  candidate_id?: string;
  created_at: string;
}

export interface TopCandidate {
  id: string;
  name: string;
  job_title: string;
  overall_score: number;
  summary: string;
}

export interface UpcomingInterview {
  id: string;
  candidate_name: string;
  candidate_id: string;
  job_title: string;
  date: string;
  time: string;
  type: 'video' | 'phone' | 'onsite';
}
