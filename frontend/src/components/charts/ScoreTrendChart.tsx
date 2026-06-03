// src/components/charts/ScoreTrendChart.tsx
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import api from '../../services/api';
import { Skeleton } from '../ui/Skeleton';

interface TrendPoint {
  week: string;
  avg_score: number;
}

const fetchScoreTrend = async (): Promise<TrendPoint[]> => {
  const { data } = await api.get('/dashboard/score-trend');
  return data.data;
};

export const ScoreTrendChart: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['score-trend'],
    queryFn: fetchScoreTrend,
    staleTime: 5 * 60_000,
  });

  if (isLoading || !data) return <Skeleton height="220px" />;

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis
          dataKey="week"
          tick={{ fill: '#94A3B8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[40, 100]}
          tick={{ fill: '#475569', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1A1D24',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v) => [`${v}`, 'Avg Score']}
        />
        <Area
          type="monotone"
          dataKey="avg_score"
          stroke="#6366F1"
          strokeWidth={2}
          fill="url(#scoreGrad)"
          dot={{ fill: '#6366F1', r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
