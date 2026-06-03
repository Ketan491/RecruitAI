// src/hooks/useDashboard.ts
import { useQuery } from '@tanstack/react-query';

import api from '../services/api';

import type {
  ActivityEntry,
  DashboardStats,
  FunnelData,
  SourceData,
  TopCandidate,
} from '../types/api.types';

const fetchStats = async (): Promise<DashboardStats> => {
  const { data } = await api.get('/dashboard/stats');
  return data.data;
};
const fetchFunnel = async (job_id?: string): Promise<FunnelData[]> => {
  const { data } = await api.get('/dashboard/funnel', { params: { job_id } });
  return data.data;
};
const fetchSources = async (): Promise<SourceData[]> => {
  const { data } = await api.get('/dashboard/sources');
  return data.data;
};
const fetchActivity = async (): Promise<ActivityEntry[]> => {
  const { data } = await api.get('/dashboard/activity');
  return data.data;
};
const fetchTopCandidates = async (): Promise<TopCandidate[]> => {
  const { data } = await api.get('/dashboard/top-candidates');
  return data.data;
};

export const useDashboardStats = () =>
  useQuery({ queryKey: ['dashboard-stats'], queryFn: fetchStats, staleTime: 60_000 });

export const useFunnelData = (job_id?: string) =>
  useQuery({ queryKey: ['funnel', job_id], queryFn: () => fetchFunnel(job_id), staleTime: 60_000 });

export const useSourceData = () =>
  useQuery({ queryKey: ['sources'], queryFn: fetchSources, staleTime: 60_000 });

export const useActivityFeed = () =>
  useQuery({ queryKey: ['activity'], queryFn: fetchActivity, staleTime: 30_000 });

export const useTopCandidates = () =>
  useQuery({ queryKey: ['top-candidates'], queryFn: fetchTopCandidates, staleTime: 60_000 });
