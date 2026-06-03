// src/components/ui/Spinner.tsx
import React from 'react';

interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 20, className = '' }) => (
  <span
    className={`inline-block border-2 border-accent-primary border-t-transparent rounded-full animate-spin ${className}`}
    style={{ width: size, height: size }}
    role="status"
    aria-label="Loading"
  />
);

export const PageSpinner: React.FC = () => (
  <div className="flex h-full min-h-[200px] w-full items-center justify-center">
    <Spinner size={32} />
  </div>
);
