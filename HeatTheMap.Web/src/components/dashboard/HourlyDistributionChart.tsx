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
        <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-64 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Hourly Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="hour" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '0.5rem',
              color: '#fff',
            }}
          />
          <Legend />
          <Bar dataKey="entries" fill="#0EA5E9" name="Entries" />
          <Bar dataKey="exits" fill="#F59E0B" name="Exits" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
