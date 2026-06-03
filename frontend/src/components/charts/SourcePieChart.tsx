// src/components/charts/SourcePieChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

import type { SourceData } from '../../types/api.types';

const COLORS = ['#6366F1', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'];

interface SourcePieChartProps {
  data: SourceData[];
}

export const SourcePieChart: React.FC<SourcePieChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={220}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        innerRadius={55}
        outerRadius={85}
        paddingAngle={3}
        dataKey="count"
        nameKey="source"
      >
        {data.map((_, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip
        formatter={(value, name) => [`${value}`, name]}
        contentStyle={{
          backgroundColor: '#1A1D24',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8,
          fontSize: 12,
        }}
      />
      <Legend
        iconType="circle"
        iconSize={8}
        formatter={(value) => <span style={{ color: '#94A3B8', fontSize: 11 }}>{value}</span>}
      />
    </PieChart>
  </ResponsiveContainer>
);
