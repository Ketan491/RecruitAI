// src/services/report.service.ts
import api from './api';

export const reportService = {
  async downloadCandidateReport(candidateId: string): Promise<void> {
    const { data } = await api.get(`/candidates/${candidateId}/report`, {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate-report-${candidateId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async exportPipelineCSV(filters?: Record<string, unknown>): Promise<void> {
    const { data } = await api.post(
      '/candidates/export',
      { ids: 'all', filters },
      { responseType: 'blob' },
    );
    const url = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-export-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
