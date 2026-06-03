// src/components/layout/Header.tsx
import { Search, Bell } from 'lucide-react';
import React from 'react';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/candidates': 'Candidates',
  '/pipeline': 'Pipeline',
  '/jobs': 'Jobs',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export const Header: React.FC = () => {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] ?? 'RecruitAI';

  return (
    <header className="h-16 border-b border-white/06 flex items-center justify-between px-6 shrink-0 bg-bg-primary/80 backdrop-blur sticky top-0 z-20">
      <h1 className="font-display text-xl font-bold text-text-primary">{title}</h1>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 h-8 px-3 rounded-md bg-bg-tertiary border border-white/08 text-text-muted hover:text-text-primary text-sm transition-colors">
          <Search size={14} />
          <span className="hidden md:inline">Search...</span>
          <kbd className="hidden md:inline text-[10px] bg-bg-secondary px-1.5 py-0.5 rounded border border-white/10 font-mono">
            ⌘K
          </kbd>
        </button>
        <button
          className="relative w-8 h-8 rounded-md bg-bg-tertiary border border-white/08 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors"
          aria-label="Notifications"
        >
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-primary" />
        </button>
      </div>
    </header>
  );
};
