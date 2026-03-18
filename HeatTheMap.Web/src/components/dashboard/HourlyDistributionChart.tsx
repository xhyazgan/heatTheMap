import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { HourlyDistribution } from '../../types';

interface HourlyDistributionChartProps {
  data?: HourlyDistribution;
  loading?: boolean;
}

export const HourlyDistributionChart: React.FC<HourlyDistributionChartProps> = ({
  data,
  loading,
}) => {
  const chartData = React.useMemo(() => {
    if (!data) return [];

    const hours = Object.keys(data.hourlyEntries).map(Number).sort((a, b) => a - b);
    return hours.map((hour) => ({
      hour: `${hour}:00`,
      entries: data.hourlyEntries[hour] || 0,
      exits: data.hourlyExits[hour] || 0,
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
      <h3 className="text-lg font-semibold text-white mb-4">Saatlik Dağılım</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="hour" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(15,23,42,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.75rem',
              color: '#fff',
              backdropFilter: 'blur(12px)',
            }}
          />
          <Legend />
          <Bar dataKey="entries" fill="#6366f1" name="Girişler" radius={[4, 4, 0, 0]} />
          <Bar dataKey="exits" fill="#a78bfa" name="Çıkışlar" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
