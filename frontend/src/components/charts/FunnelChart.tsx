// src/components/charts/FunnelChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import { STAGE_COLORS } from '../../utils/constants';

import type { FunnelData } from '../../types/api.types';

interface FunnelChartProps {
  data: FunnelData[];
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: FunnelData }[];
}) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-bg-tertiary border border-white/10 rounded-lg p-3 text-xs shadow-lg">
      <p className="font-semibold text-text-primary mb-1">{d.stage}</p>
      <p className="text-text-secondary">{d.count} candidates</p>
      <p className="text-text-muted">Avg score: {d.avg_score?.toFixed(0)}</p>
      {d.conversion_pct !== null && d.conversion_pct !== undefined && (
        <p className="text-emerald-400">Conversion: {d.conversion_pct.toFixed(1)}%</p>
      )}
    </div>
  );
};

export const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
      <XAxis
        dataKey="stage"
        tick={{ fill: '#94A3B8', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />
      <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
        {data.map((entry) => (
          <Cell key={entry.stage} fill={STAGE_COLORS[entry.stage] ?? '#6366F1'} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);
