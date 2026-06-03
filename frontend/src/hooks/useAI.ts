// src/hooks/useAI.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useToast } from './useToast';
import { aiService } from '../services/ai.service';

export const useRescore = (candidateId: string) => {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: () => aiService.rescore(candidateId),
    onSuccess: () => {
      toast.info('Re-scoring started. This may take a few seconds.');
      setTimeout(() => {
        void qc.invalidateQueries({ queryKey: ['candidate', candidateId] });
      }, 5000);
    },
    onError: () => toast.error('Failed to trigger re-scoring'),
  });
};

export const useRegenerateQuestions = (candidateId: string) => {
  const qc = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: () => aiService.regenerateQuestions(candidateId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['candidate', candidateId] });
      toast.success('Interview questions regenerated');
    },
    onError: () => toast.error('Failed to regenerate questions'),
  });
};
