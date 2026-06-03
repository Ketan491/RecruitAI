// src/hooks/useCandidates.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from './useToast';
import { candidateService } from '../services/candidate.service';
import { useCandidateStore } from '../store/candidateStore';

import type { CandidateFilters, CandidatePreview } from '../types/candidate.types';

export const useCandidates = (filters: CandidateFilters, page = 1) => {
  const { setCandidates } = useCandidateStore();

  const query = useQuery({
    queryKey: ['candidates', filters, page],
    queryFn: () => candidateService.getAll(filters, page),
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  if (query.data) {
    setCandidates(query.data.items, query.data.total, query.data.has_more);
  }

  return query;
};

export const useCandidate = (id: string) =>
  useQuery({
    queryKey: ['candidate', id],
    queryFn: () => candidateService.getById(id),
    staleTime: 30_000,
    enabled: !!id,
  });

export const useUpdateStage = () => {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      candidateService.updateStage(id, stage),
    onSuccess: (_, { id }) => {
      void qc.invalidateQueries({ queryKey: ['candidate', id] });
      void qc.invalidateQueries({ queryKey: ['candidates'] });
      toast.success('Stage updated');
    },
    onError: () => toast.error('Failed to update stage'),
  });
};

export const useAddNote = (candidateId: string) => {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: (content: string) => candidateService.addNote(candidateId, content),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['candidate', candidateId] });
      toast.success('Note added');
    },
    onError: () => toast.error('Failed to add note'),
  });
};

export const useUpdateStageOptimistic = () => {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) =>
      candidateService.updateStage(id, stage),

    onMutate: async ({ id, stage }) => {
      // Cancel any in-flight queries
      await qc.cancelQueries({ queryKey: ['pipeline'] });
      const prev = qc.getQueryData(['pipeline']);

      // Optimistically update pipeline cache
      qc.setQueryData(['pipeline'], (old: unknown) => {
        if (!Array.isArray(old)) return old;
        let movedCandidate: CandidatePreview | undefined;
        const removed = old.map((group) => {
          const found = group.candidates.find((c: CandidatePreview) => c.id === id);
          if (found) movedCandidate = { ...found, stage: stage as CandidatePreview['stage'] };
          return {
            ...group,
            candidates: group.candidates.filter((c: CandidatePreview) => c.id !== id),
          };
        });
        if (!movedCandidate) return old;
        const candidateToMove = movedCandidate;
        return removed.map((group) => {
          if (group.stage !== stage) return group;
          return { ...group, candidates: [candidateToMove, ...group.candidates] };
        });
      });

      return { prev };
    },

    onError: (_err, _vars, context) => {
      if (context?.prev) qc.setQueryData(['pipeline'], context.prev);
      toast.error('Failed to move candidate');
    },

    onSettled: () => {
      void qc.invalidateQueries({ queryKey: ['pipeline'] });
      void qc.invalidateQueries({ queryKey: ['candidates'] });
    },
  });
};
