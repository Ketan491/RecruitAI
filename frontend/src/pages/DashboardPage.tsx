// src/pages/DashboardPage.tsx
import { Users, UserCheck, MessageSquare, Gift, UserX, Briefcase } from 'lucide-react';
import React from 'react';

import { FunnelChart } from '../components/charts/FunnelChart';
import { ScoreTrendChart } from '../components/charts/ScoreTrendChart';
import { SourcePieChart } from '../components/charts/SourcePieChart';
import { KpiCard } from '../components/dashboard/KpiCard';
import { ScoreBadge } from '../components/ui/ScoreBadge';
import { PageSpinner } from '../components/ui/Spinner';
import {
  useDashboardStats,
  useFunnelData,
  useSourceData,
  useActivityFeed,
  useTopCandidates,
} from '../hooks/useDashboard';
import { formatRelativeTime } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: funnel } = useFunnelData();
  const { data: sources } = useSourceData();
  const { data: activity } = useActivityFeed();
  const { data: topCandidates } = useTopCandidates();

  const kpis = [
    {
      label: 'Total Applicants',
      key: 'total_applicants',
      icon: <Users size={16} />,
      color: '#6366F1',
    },
    { label: 'Shortlisted', key: 'shortlisted', icon: <UserCheck size={16} />, color: '#10B981' },
    {
      label: 'In Interview',
      key: 'in_interview',
      icon: <MessageSquare size={16} />,
      color: '#F59E0B',
    },
    { label: 'Offers Sent', key: 'offers_sent', icon: <Gift size={16} />, color: '#8B5CF6' },
    { label: 'Hired', key: 'hired', icon: <Briefcase size={16} />, color: '#059669' },
    { label: 'Rejected', key: 'rejected', icon: <UserX size={16} />, color: '#EF4444' },
  ] as const;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {kpis.map(({ label, key, icon, color }) => (
          <KpiCard
            key={key}
            label={label}
            value={stats?.[key] ?? 0}
            delta={stats?.deltas?.[key]}
            icon={icon}
            iconColor={color}
            loading={statsLoading}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 bg-bg-secondary border border-white/06 rounded-xl p-5">
          <h3 className="font-display text-sm font-semibold text-text-primary mb-4">
            Hiring Funnel
          </h3>
          {funnel ? <FunnelChart data={funnel} /> : <div className="h-[220px] skeleton rounded" />}
        </div>
        <div className="bg-bg-secondary border border-white/06 rounded-xl p-5">
          <h3 className="font-display text-sm font-semibold text-text-primary mb-4">
            Source Breakdown
          </h3>
          {sources ? (
            <SourcePieChart data={sources} />
          ) : (
            <div className="h-[220px] skeleton rounded" />
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Score Trend */}
        <div className="bg-bg-secondary border border-white/06 rounded-xl p-5">
          <h3 className="font-display text-sm font-semibold text-text-primary mb-4">
            AI Score Trend
          </h3>
          <ScoreTrendChart />
        </div>

        {/* Top Candidates */}
        <div className="bg-bg-secondary border border-white/06 rounded-xl p-5">
          <h3 className="font-display text-sm font-semibold text-text-primary mb-4">
            Top Candidates
          </h3>
          {topCandidates ? (
            <div className="flex flex-col gap-3">
              {topCandidates.slice(0, 5).map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{c.name}</p>
                    <p className="text-xs text-text-muted truncate">{c.job_title}</p>
                  </div>
                  <ScoreBadge score={c.overall_score} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <PageSpinner />
          )}
        </div>

        {/* Activity Feed */}
        <div className="bg-bg-secondary border border-white/06 rounded-xl p-5 overflow-hidden">
          <h3 className="font-display text-sm font-semibold text-text-primary mb-4">
            Recent Activity
          </h3>
          {activity ? (
            <div className="flex flex-col gap-3 overflow-y-auto max-h-60">
              {activity.slice(0, 12).map((a) => (
                <div key={a.id} className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-bg-tertiary flex items-center justify-center text-[10px] font-bold text-accent-primary shrink-0 mt-0.5">
                    {a.actor_name?.[0] ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-secondary leading-relaxed">
                      <span className="text-text-primary font-medium">{a.actor_name}</span>{' '}
                      {a.action}
                      {a.candidate_name && (
                        <>
                          {' '}
                          — <span className="text-accent-primary">{a.candidate_name}</span>
                        </>
                      )}
                    </p>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      {formatRelativeTime(a.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <PageSpinner />
          )}
        </div>
      </div>
    </div>
  );
};
