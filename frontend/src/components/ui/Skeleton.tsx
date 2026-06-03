// src/components/ui/Skeleton.tsx
import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
}) => <div className={`skeleton rounded ${className}`} style={{ width, height }} aria-hidden />;

export const CandidateRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 px-6 py-4 border-b border-white/06">
    <Skeleton width="32px" height="32px" className="rounded-full shrink-0" />
    <div className="flex flex-col gap-2 flex-1">
      <Skeleton width="160px" height="14px" />
      <Skeleton width="120px" height="12px" />
    </div>
    <Skeleton width="60px" height="24px" className="rounded-full" />
    <Skeleton width="48px" height="28px" className="rounded-md" />
    <Skeleton width="80px" height="24px" className="rounded-full" />
  </div>
);

export const KpiCardSkeleton: React.FC = () => (
  <div className="rounded-xl border border-white/06 bg-bg-secondary p-5 flex flex-col gap-3">
    <Skeleton width="100px" height="12px" />
    <Skeleton width="70px" height="32px" />
    <Skeleton width="80px" height="12px" />
  </div>
);
