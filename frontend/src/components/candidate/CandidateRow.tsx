// src/components/candidate/CandidateRow.tsx
import { Calendar, ExternalLink } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { getInitials, formatRelativeTime } from '../../utils/formatters';
import { Badge } from '../ui/Badge';
import { ScoreBadge } from '../ui/ScoreBadge';

import type { CandidatePreview } from '../../types/candidate.types';

interface CandidateRowProps {
  candidate: CandidatePreview;
  selected?: boolean;
  onSelect?: (id: string) => void;
}

const CandidateRowComponent: React.FC<CandidateRowProps> = ({ candidate, selected, onSelect }) => {
  const navigate = useNavigate();

  return (
    <tr
      onClick={() => navigate(`/candidates/${candidate.id}`)}
      className="border-b border-white/04 hover:bg-white/02 cursor-pointer transition-colors group"
    >
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected ?? false}
          onChange={() => onSelect?.(candidate.id)}
          className="w-4 h-4 rounded border-white/20 bg-bg-tertiary checked:bg-accent-primary"
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent-secondary/20 flex items-center justify-center text-xs font-bold text-accent-secondary shrink-0">
            {getInitials(candidate.name)}
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">
              {candidate.name}
            </p>
            <p className="text-xs text-text-muted">{candidate.email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-text-secondary truncate max-w-[140px] block">
          {candidate.job_title}
        </span>
      </td>
      <td className="px-4 py-3">
        <Badge label={candidate.stage} type="stage" />
      </td>
      <td className="px-4 py-3">
        <ScoreBadge score={candidate.overall_score} />
      </td>
      <td className="px-4 py-3">
        <Badge label={candidate.source} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Calendar size={11} />
          {formatRelativeTime(candidate.created_at)}
        </div>
      </td>
      <td className="px-4 py-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ExternalLink size={14} className="text-text-muted" />
      </td>
    </tr>
  );
};

export const CandidateRow = React.memo(CandidateRowComponent);
