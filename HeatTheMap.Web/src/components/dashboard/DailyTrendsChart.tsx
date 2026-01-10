import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { WeeklyTrends } from '../../types';
import { format, parseISO } from 'date-fns';

interface DailyTrendsChartProps {
  data?: WeeklyTrends;
  loading?: boolean;
}

export const DailyTrendsChart: React.FC<DailyTrendsChartProps> = ({
  data,
  loading,
}) => {
  const chartData = React.useMemo(() => {
    if (!data?.dailyData) return [];

    return data.dailyData.map((day) => ({
      date: format(parseISO(day.date), 'MMM dd'),
      visitors: day.totalVisitors,
      occupancy: day.peakOccupancy,
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Weekly Trends</h3>
        {data && (
          <span className="text-sm text-gray-400">
            Total: {data.totalVisitors.toLocaleString()} visitors
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
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
          <Line
            type="monotone"
            dataKey="visitors"
            stroke="#0EA5E9"
            strokeWidth={2}
            name="Visitors"
          />
          <Line
            type="monotone"
            dataKey="occupancy"
            stroke="#10B981"
            strokeWidth={2}
            name="Peak Occupancy"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
