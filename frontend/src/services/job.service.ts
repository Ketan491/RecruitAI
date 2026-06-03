// src/services/job.service.ts
import api from './api';

import type { PaginatedResponse } from '../types/api.types';
import type { Job, JobFormData, JobAnalytics } from '../types/job.types';

export const jobService = {
  async getAll(page = 1, limit = 25): Promise<PaginatedResponse<Job>> {
    const { data } = await api.get('/jobs', { params: { page, limit } });
    return data.data;
  },

  async getById(id: string): Promise<Job & { analytics: JobAnalytics }> {
    const { data } = await api.get(`/jobs/${id}`);
    return data.data;
  },

  async create(payload: JobFormData): Promise<Job> {
    const { data } = await api.post('/jobs', payload);
    return data.data;
  },

  async update(id: string, payload: Partial<JobFormData>): Promise<Job> {
    const { data } = await api.put(`/jobs/${id}`, payload);
    return data.data;
  },

  async updateStatus(id: string, status: string, close_reason?: string): Promise<Job> {
    const { data } = await api.patch(`/jobs/${id}/status`, { status, close_reason });
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/jobs/${id}`);
  },
};
