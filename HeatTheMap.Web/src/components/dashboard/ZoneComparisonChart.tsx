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
        <div className="h-6 bg-white/5 rounded-lg w-1/3 mb-4"></div>
        <div className="h-64 bg-white/5 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Popüler Bölgeler</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" stroke="#6b7280" />
          <YAxis dataKey="zone" type="category" stroke="#6b7280" width={80} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15,23,42,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.75rem',
              color: '#fff',
              backdropFilter: 'blur(12px)',
            }}
            formatter={((value: number | undefined, name: string | undefined) => [
              name === 'visits' ? `${value ?? 0} ziyaret` : `${value ?? 0}%`,
              name === 'visits' ? 'Ziyaret' : 'Yüzde',
            ]) as any}
          />
          <Bar dataKey="visits" fill="#f43f5e" name="Ziyaretler" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
