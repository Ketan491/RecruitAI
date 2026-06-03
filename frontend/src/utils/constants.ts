// src/utils/constants.ts

export const STAGE_COLORS: Record<string, string> = {
  Applied: '#6366F1',
  Screened: '#8B5CF6',
  'Phone Screen': '#3B82F6',
  Technical: '#F59E0B',
  'Final Round': '#F97316',
  Offer: '#10B981',
  Hired: '#059669',
  Rejected: '#EF4444',
};

export const SCORE_COLOR = (score: number): string => {
  if (score >= 85) return 'var(--score-excellent)';
  if (score >= 70) return 'var(--score-good)';
  if (score >= 50) return 'var(--score-average)';
  return 'var(--score-poor)';
};

export const SCORE_LABEL = (score: number): string => {
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  return 'Poor';
};

export const PIPELINE_STAGES = [
  'Applied',
  'Screened',
  'Phone Screen',
  'Technical',
  'Final Round',
  'Offer',
  'Hired',
  'Rejected',
] as const;

export const CANDIDATE_SOURCES = ['LinkedIn', 'Naukri', 'Referral', 'Direct', 'Other'] as const;

export const ITEMS_PER_PAGE = 25;

export const DEBOUNCE_MS = 300;

export const MAX_FILE_SIZE_MB = 5;
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx'];

export const TOKEN_STORAGE_KEY = 'recruit_access_token';
