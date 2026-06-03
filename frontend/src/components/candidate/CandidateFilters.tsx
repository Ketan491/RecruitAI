// src/components/candidate/CandidateFilters.tsx
import { Search, SlidersHorizontal, X } from 'lucide-react';
import React from 'react';

import { useCandidateStore } from '../../store/candidateStore';
import { PIPELINE_STAGES, CANDIDATE_SOURCES } from '../../utils/constants';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

import type { CandidateSource, CandidateStage } from '../../types/candidate.types';

export const CandidateFiltersBar: React.FC = () => {
  const { filters, setFilters, resetFilters } = useCandidateStore();
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-white/06">
      <div className="flex-1 min-w-[200px] max-w-sm">
        <Input
          placeholder="Search name or email…"
          value={filters.search ?? ''}
          onChange={(e) => setFilters({ search: e.target.value || undefined })}
          icon={<Search size={14} />}
        />
      </div>

      <select
        className="h-9 px-3 rounded-md bg-bg-tertiary border border-white/10 text-sm text-text-secondary focus:outline-none focus:border-accent-primary"
        value={filters.stage?.[0] ?? ''}
        onChange={(e) =>
          setFilters({ stage: e.target.value ? [e.target.value as CandidateStage] : undefined })
        }
      >
        <option value="">All stages</option>
        {PIPELINE_STAGES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <select
        className="h-9 px-3 rounded-md bg-bg-tertiary border border-white/10 text-sm text-text-secondary focus:outline-none focus:border-accent-primary"
        value={filters.source?.[0] ?? ''}
        onChange={(e) =>
          setFilters({ source: e.target.value ? [e.target.value as CandidateSource] : undefined })
        }
      >
        <option value="">All sources</option>
        {CANDIDATE_SOURCES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-2">
        <label className="text-xs text-text-muted">Score</label>
        <Input
          type="number"
          min={0}
          max={100}
          placeholder="Min"
          className="w-16"
          value={filters.score_min ?? ''}
          onChange={(e) =>
            setFilters({ score_min: e.target.value ? Number(e.target.value) : undefined })
          }
        />
        <span className="text-text-muted text-xs">–</span>
        <Input
          type="number"
          min={0}
          max={100}
          placeholder="Max"
          className="w-16"
          value={filters.score_max ?? ''}
          onChange={(e) =>
            setFilters({ score_max: e.target.value ? Number(e.target.value) : undefined })
          }
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" icon={<X size={13} />} onClick={resetFilters}>
          Clear
        </Button>
      )}

      <div className="ml-auto">
        <Button variant="secondary" size="sm" icon={<SlidersHorizontal size={13} />}>
          More filters
        </Button>
      </div>
    </div>
  );
};
