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
        <div className="h-6 bg-white/5 rounded-lg w-1/3 mb-4"></div>
        <div className="h-64 bg-white/5 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Haftalık Trendler</h3>
        {data && (
          <span className="text-sm text-gray-500">
            Toplam: {data.totalVisitors.toLocaleString()} ziyaretçi
          </span>
        )}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" stroke="#6b7280" />
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
          <Line
            type="monotone"
            dataKey="visitors"
            stroke="#6366f1"
            strokeWidth={2}
            name="Ziyaretçiler"
            dot={{ fill: '#6366f1', r: 4 }}
            activeDot={{ r: 6, fill: '#818cf8' }}
          />
          <Line
            type="monotone"
            dataKey="occupancy"
            stroke="#10B981"
            strokeWidth={2}
            name="Pik Doluluk"
            dot={{ fill: '#10B981', r: 4 }}
            activeDot={{ r: 6, fill: '#34d399' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
