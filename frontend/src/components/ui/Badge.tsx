// src/components/ui/Badge.tsx
import React from 'react';

import { STAGE_COLORS } from '../../utils/constants';

interface BadgeProps {
  label: string;
  type?: 'stage' | 'status' | 'source' | 'custom';
  color?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ label, type = 'custom', color, size = 'md' }) => {
  const getColor = () => {
    if (color) return color;
    if (type === 'stage') return STAGE_COLORS[label] ?? '#6366F1';
    if (type === 'status') {
      const map: Record<string, string> = {
        active: '#10B981',
        hired: '#059669',
        rejected: '#EF4444',
        archived: '#6B7280',
      };
      return map[label.toLowerCase()] ?? '#6366F1';
    }
    return '#6366F1';
  };

  const c = getColor();
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClass} shrink-0`}
      style={{ backgroundColor: `${c}22`, color: c, border: `1px solid ${c}44` }}
    >
      {label}
    </span>
  );
};
