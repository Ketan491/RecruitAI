// src/store/candidateStore.ts
import { create } from 'zustand';

import type { CandidatePreview, CandidateFilters, PipelineGroup } from '../types/candidate.types';

interface CandidateState {
  candidates: CandidatePreview[];
  pipeline: PipelineGroup[];
  filters: CandidateFilters;
  total: number;
  page: number;
  hasMore: boolean;
  selectedIds: string[];
  setCandidates: (candidates: CandidatePreview[], total: number, hasMore: boolean) => void;
  setPipeline: (pipeline: PipelineGroup[]) => void;
  setFilters: (filters: Partial<CandidateFilters>) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  updateCandidateStage: (id: string, stage: string) => void;
}

const DEFAULT_FILTERS: CandidateFilters = {};

export const useCandidateStore = create<CandidateState>((set) => ({
  candidates: [],
  pipeline: [],
  filters: DEFAULT_FILTERS,
  total: 0,
  page: 1,
  hasMore: false,
  selectedIds: [],
  setCandidates: (candidates, total, hasMore) => set({ candidates, total, hasMore }),
  setPipeline: (pipeline) => set({ pipeline }),
  setFilters: (newFilters) => set((s) => ({ filters: { ...s.filters, ...newFilters }, page: 1 })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS, page: 1 }),
  setPage: (page) => set({ page }),
  toggleSelect: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    })),
  selectAll: () => set((s) => ({ selectedIds: s.candidates.map((c) => c.id) })),
  clearSelection: () => set({ selectedIds: [] }),
  updateCandidateStage: (id, stage) =>
    set((s) => ({
      pipeline: s.pipeline.map((group) => ({
        ...group,
        candidates: group.candidates.map((c) =>
          c.id === id ? { ...c, stage: stage as CandidatePreview['stage'] } : c,
        ),
      })),
    })),
}));
