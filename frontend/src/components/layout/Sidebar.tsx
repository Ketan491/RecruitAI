// src/components/layout/Sidebar.tsx
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Briefcase,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { getInitials } from '../../utils/formatters';

const navItems = [
  { to: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/candidates', icon: <Users size={18} />, label: 'Candidates' },
  { to: '/pipeline', icon: <GitBranch size={18} />, label: 'Pipeline' },
  { to: '/jobs', icon: <Briefcase size={18} />, label: 'Jobs' },
  { to: '/reports', icon: <BarChart3 size={18} />, label: 'Reports' },
  { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
];

export const Sidebar: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-bg-secondary border-r border-white/06 transition-all duration-300 shrink-0 ${
        sidebarCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/06 shrink-0 overflow-hidden">
        <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center shrink-0 shadow-glow">
          <Zap size={16} className="text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-display font-bold text-text-primary text-base tracking-tight whitespace-nowrap">
            RecruitAI
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-0.5 px-2">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-150
              ${
                isActive
                  ? 'bg-accent-primary/15 text-accent-primary'
                  : 'text-text-muted hover:text-text-primary hover:bg-white/05'
              }`
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <span className="shrink-0">{icon}</span>
            {!sidebarCollapsed && <span className="whitespace-nowrap">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/06 px-2 py-3 shrink-0">
        {!sidebarCollapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-1 rounded-md">
            <div className="w-7 h-7 rounded-full bg-accent-secondary flex items-center justify-center text-xs font-bold text-white shrink-0">
              {getInitials(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{user.name}</p>
              <p className="text-[10px] text-text-muted truncate capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-text-muted hover:text-red-400 hover:bg-red-500/08 transition-all duration-150"
          title="Sign out"
        >
          <LogOut size={16} className="shrink-0" />
          {!sidebarCollapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-bg-tertiary border border-white/10 flex items-center justify-center text-text-muted hover:text-text-primary hover:border-accent-primary transition-all duration-150 z-10"
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
};
