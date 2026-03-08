import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ZonePerformance } from '../../types';

interface ZoneComparisonChartProps {
  data?: ZonePerformance;
  loading?: boolean;
}

export const ZoneComparisonChart: React.FC<ZoneComparisonChartProps> = ({
  data,
  loading,
}) => {
  const chartData = React.useMemo(() => {
    if (!data?.hotZones) return [];

    return data.hotZones.map((zone) => ({
      zone: zone.zoneName.replace('Zone_', '').replace('_', ','),
      visits: zone.visitCount,
      percentage: zone.percentage,
    }));
  }, [data]);

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Top Zones</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis type="number" stroke="#9CA3AF" />
          <YAxis dataKey="zone" type="category" stroke="#9CA3AF" width={80} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
            formatter={((value: number | undefined, name: string | undefined) => [
              name === 'visits' ? `${value ?? 0} visits` : `${value ?? 0}%`,
              name === 'visits' ? 'Visits' : 'Percentage',
            ]) as any}
          />
          <Bar dataKey="visits" fill="#EF4444" name="Visits" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
