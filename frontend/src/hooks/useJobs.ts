// src/hooks/useJobs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from './useToast';
import { jobService } from '../services/job.service';

import type { JobFormData } from '../types/job.types';

export const useJobs = (page = 1) =>
  useQuery({
    queryKey: ['jobs', page],
    queryFn: () => jobService.getAll(page),
    staleTime: 30_000,
  });

export const useJob = (id: string) =>
  useQuery({
    queryKey: ['job', id],
    queryFn: () => jobService.getById(id),
    enabled: !!id,
  });

export const useCreateJob = () => {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: JobFormData) => jobService.create(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job created successfully');
    },
    onError: () => toast.error('Failed to create job'),
  });
};

export const useUpdateJob = (id: string) => {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (payload: Partial<JobFormData>) => jobService.update(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['job', id] });
      void qc.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated');
    },
    onError: () => toast.error('Failed to update job'),
  });
};

export const useDeleteJob = () => {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (id: string) => jobService.delete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted');
    },
    onError: () => toast.error('Failed to delete job'),
  });
};
