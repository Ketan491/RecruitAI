// src/components/ui/ScoreBadge.tsx
import React from 'react';

import { SCORE_COLOR, SCORE_LABEL } from '../../utils/constants';

interface ScoreBadgeProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  showLabel = false,
  size = 'md',
}) => {
  const color = SCORE_COLOR(score);
  const label = SCORE_LABEL(score);

  const sizeMap = {
    sm: 'text-xs w-9 h-7',
    md: 'text-sm w-11 h-8',
    lg: 'text-base w-14 h-10',
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-md ${sizeMap[size]}`}
      style={{ backgroundColor: `${color}1A`, color, border: `1px solid ${color}44` }}
      title={label}
    >
      {score}
      {showLabel && <span className="ml-1 font-normal text-xs opacity-70">{label}</span>}
    </span>
  );
};
