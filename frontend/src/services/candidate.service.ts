// src/services/candidate.service.ts
import api from './api';

import type { PaginatedResponse } from '../types/api.types';
import type {
  Candidate,
  CandidateFilters,
  CandidatePreview,
  PipelineGroup,
} from '../types/candidate.types';

export const candidateService = {
  async getAll(
    filters: CandidateFilters,
    page = 1,
    limit = 25,
  ): Promise<PaginatedResponse<CandidatePreview>> {
    const params = { ...filters, page, limit };
    const { data } = await api.get('/candidates', { params });
    return data.data;
  },

  async getById(id: string): Promise<Candidate> {
    const { data } = await api.get(`/candidates/${id}`);
    return data.data;
  },

  async uploadResume(formData: FormData): Promise<Candidate> {
    const { data } = await api.post('/candidates/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },

  async updateStage(id: string, stage: string): Promise<CandidatePreview> {
    const { data } = await api.patch(`/candidates/${id}/stage`, { stage });
    return data.data;
  },

  async updateStatus(id: string, status: string): Promise<CandidatePreview> {
    const { data } = await api.patch(`/candidates/${id}/status`, { status });
    return data.data;
  },

  async addNote(id: string, content: string): Promise<Candidate['notes'][0]> {
    const { data } = await api.post(`/candidates/${id}/notes`, { content });
    return data.data;
  },

  async deleteNote(candidateId: string, noteId: string): Promise<void> {
    await api.delete(`/candidates/${candidateId}/notes/${noteId}`);
  },

  async scheduleInterview(
    id: string,
    payload: { date: string; time: string; type: string; link?: string; notes?: string },
  ): Promise<Candidate['interviews'][0]> {
    const { data } = await api.post(`/candidates/${id}/schedule`, payload);
    return data.data;
  },

  async downloadReport(id: string): Promise<Blob> {
    const { data } = await api.get(`/candidates/${id}/report`, {
      responseType: 'blob',
    });
    return data;
  },

  async exportCSV(ids: string[] | 'all', filters?: CandidateFilters): Promise<Blob> {
    const { data } = await api.post(
      '/candidates/export',
      { ids, filters },
      { responseType: 'blob' },
    );
    return data;
  },

  async getPipeline(job_id?: string): Promise<PipelineGroup[]> {
    const { data } = await api.get('/pipeline', { params: { job_id } });
    return data.data;
  },

  async moveInPipeline(payload: {
    candidate_id: string;
    from_stage: string;
    to_stage: string;
    position: number;
  }): Promise<void> {
    await api.patch('/pipeline/move', payload);
  },
};
