// src/pages/ReportsPage.tsx
import { Download } from 'lucide-react';
import React from 'react';

import { FunnelChart } from '../components/charts/FunnelChart';
import { ScoreTrendChart } from '../components/charts/ScoreTrendChart';
import { SourcePieChart } from '../components/charts/SourcePieChart';
import { Button } from '../components/ui/Button';
import { useFunnelData, useSourceData } from '../hooks/useDashboard';
import { reportService } from '../services/report.service';

export const ReportsPage: React.FC = () => {
  const { data: funnel } = useFunnelData();
  const { data: sources } = useSourceData();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs text-text-muted">Analytics for the last 90 days</p>
        <Button
          variant="secondary"
          size="sm"
          icon={<Download size={13} />}
          onClick={() => reportService.exportPipelineCSV()}
        >
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-secondary border border-white/06 rounded-xl p-5">
          <h3 className="font-display text-sm font-semibold text-text-primary mb-4">
            Hiring Funnel
          </h3>
          {funnel ? <FunnelChart data={funnel} /> : <div className="h-52 skeleton rounded" />}
        </div>
        <div className="bg-bg-secondary border border-white/06 rounded-xl p-5">
          <h3 className="font-display text-sm font-semibold text-text-primary mb-4">
            Source Breakdown
          </h3>
          {sources ? <SourcePieChart data={sources} /> : <div className="h-52 skeleton rounded" />}
        </div>
        <div className="lg:col-span-2 bg-bg-secondary border border-white/06 rounded-xl p-5">
          <h3 className="font-display text-sm font-semibold text-text-primary mb-4">
            AI Score Trend (8 weeks)
          </h3>
          <ScoreTrendChart />
        </div>
      </div>
    </div>
  );
};
