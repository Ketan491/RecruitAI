// src/components/dashboard/KpiCard.tsx
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import React from 'react';

import { Skeleton } from '../ui/Skeleton';

interface KpiCardProps {
  label: string;
  value: number | string;
  delta?: number;
  icon: React.ReactNode;
  iconColor?: string;
  loading?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label,
  value,
  delta,
  icon,
  iconColor = '#6366F1',
  loading = false,
}) => {
  const isPositive = delta !== undefined && delta > 0;
  const isNegative = delta !== undefined && delta < 0;

  if (loading)
    return (
      <div className="rounded-xl border border-white/06 bg-bg-secondary p-5 flex flex-col gap-3">
        <Skeleton width="100px" height="12px" />
        <Skeleton width="70px" height="32px" />
        <Skeleton width="80px" height="12px" />
      </div>
    );

  return (
    <div className="rounded-xl border border-white/06 bg-bg-secondary p-5 flex flex-col gap-3 hover:border-accent-primary/30 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</span>
        <span
          className="w-8 h-8 rounded-lg flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: `${iconColor}22`, color: iconColor }}
        >
          {icon}
        </span>
      </div>
      <span className="font-display text-3xl font-bold text-text-primary">{value}</span>
      {delta !== undefined && (
        <div
          className={`flex items-center gap-1 text-xs ${
            isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-text-muted'
          }`}
        >
          {isPositive ? (
            <TrendingUp size={12} />
          ) : isNegative ? (
            <TrendingDown size={12} />
          ) : (
            <Minus size={12} />
          )}
          <span>{Math.abs(delta)}% vs last 30 days</span>
        </div>
      )}
    </div>
  );
};
