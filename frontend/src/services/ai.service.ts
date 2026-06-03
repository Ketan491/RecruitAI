// src/services/ai.service.ts
import api from './api';

import type { RescoringStatus } from '../types/ai.types';

export const aiService = {
  async rescore(candidateId: string): Promise<RescoringStatus> {
    const { data } = await api.post(`/ai/rescore/${candidateId}`);
    return data.data;
  },

  async regenerateQuestions(
    candidateId: string,
  ): Promise<{ questions: { technical: string[]; behavioral: string[]; culture_fit: string[] } }> {
    const { data } = await api.post(`/ai/questions/${candidateId}`);
    return data.data;
  },
};
