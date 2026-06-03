// src/components/ui/EmptyState.tsx
import React from 'react';

import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center">
    {icon && <div className="text-text-muted opacity-50 mb-2">{icon}</div>}
    <h3 className="font-display text-lg font-semibold text-text-primary">{title}</h3>
    {description && <p className="text-sm text-text-secondary max-w-xs">{description}</p>}
    {action && (
      <Button variant="primary" onClick={action.onClick} className="mt-2">
        {action.label}
      </Button>
    )}
  </div>
);
