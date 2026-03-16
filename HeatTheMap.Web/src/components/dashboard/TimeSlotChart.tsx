import React, { useState } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface TimeSlotData {
  date: string;
  timeSlot: string;
  visitors: number;
  avgOccupancy: number;
  comparisonPercent: number;
}

interface TimeSlotAnalysis {
  timeSlots: TimeSlotData[];
  mostActiveSlot: string;
  leastActiveSlot: string;
}

interface TimeSlotChartProps {
  data?: TimeSlotAnalysis;
  loading?: boolean;
}

const SLOT_COLORS: Record<string, string> = {
  '09:00-11:00': '#8B5CF6',
  '11:00-13:00': '#3B82F6',
  '13:00-15:00': '#10B981',
  '15:00-17:00': '#F59E0B',
  '17:00-19:00': '#EF4444',
  '19:00-21:00': '#EC4899',
};

const SLOT_GRADIENTS: Record<string, { from: string; to: string }> = {
  '09:00-11:00': { from: '#8B5CF6', to: '#A78BFA' },
  '11:00-13:00': { from: '#3B82F6', to: '#60A5FA' },
  '13:00-15:00': { from: '#10B981', to: '#34D399' },
  '15:00-17:00': { from: '#F59E0B', to: '#FBBF24' },
  '17:00-19:00': { from: '#EF4444', to: '#F87171' },
  '19:00-21:00': { from: '#EC4899', to: '#F472B6' },
};

export const TimeSlotChart: React.FC<TimeSlotChartProps> = ({ data, loading }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'heatmap' | 'table'>('chart');

  const chartData = React.useMemo(() => {
    if (!data?.timeSlots) return [];

    // Group by date for better visualization
    const grouped = data.timeSlots.reduce((acc, slot) => {
      const dateStr = format(parseISO(slot.date), 'EEE, MMM dd');
      if (!acc[dateStr]) {
        acc[dateStr] = { date: dateStr, total: 0 };
      }
      acc[dateStr][slot.timeSlot] = slot.visitors;
      acc[dateStr].total += slot.visitors;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }, [data]);

  const heatmapData = React.useMemo(() => {
    if (!data?.timeSlots) return [];

    const slots = Object.keys(SLOT_COLORS);
    const dateMap = new Map<string, Map<string, TimeSlotData>>();

    data.timeSlots.forEach(slot => {
      const dateStr = format(parseISO(slot.date), 'MMM dd');
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, new Map());
      }
      dateMap.get(dateStr)!.set(slot.timeSlot, slot);
    });

    return Array.from(dateMap.entries()).map(([date, slotMap]) => ({
      date,
      slots: slots.map(slot => slotMap.get(slot))
    }));
  }, [data]);

  const statistics = React.useMemo(() => {
    if (!data?.timeSlots) return null;

    const totalVisitors = data.timeSlots.reduce((sum, slot) => sum + slot.visitors, 0);
    const avgVisitorsPerSlot = totalVisitors / data.timeSlots.length;
    const maxSlot = data.timeSlots.reduce((max, slot) =>
      slot.visitors > max.visitors ? slot : max
    , data.timeSlots[0]);
    const minSlot = data.timeSlots.reduce((min, slot) =>
      slot.visitors < min.visitors ? slot : min
    , data.timeSlots[0]);
    const avgComparison = data.timeSlots.reduce((sum, slot) => sum + slot.comparisonPercent, 0) / data.timeSlots.length;

    return {
      totalVisitors,
      avgVisitorsPerSlot: Math.round(avgVisitorsPerSlot),
      maxSlot,
      minSlot,
      avgComparison: avgComparison.toFixed(1)
    };
  }, [data]);

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-96 bg-gray-700 rounded"></div>
      </div>
    );
  }

  if (!data || !data.timeSlots.length) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Detailed Time Slot Analysis</h3>
        <p className="text-gray-400 text-center py-8">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Detailed Time Slot Analysis</h3>
            <p className="text-gray-400 text-sm">2-hour intervals with week-over-week comparison</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'chart'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Chart
            </button>
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'heatmap'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Heatmap
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Table
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-lg p-4">
            <div className="text-purple-400 text-xs font-semibold mb-1">Total Visitors</div>
            <div className="text-2xl font-bold text-white">{statistics?.totalVisitors.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-lg p-4">
            <div className="text-blue-400 text-xs font-semibold mb-1">Avg per Slot</div>
            <div className="text-2xl font-bold text-white">{statistics?.avgVisitorsPerSlot.toLocaleString()}</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-lg p-4">
            <div className="text-green-400 text-xs font-semibold mb-1">Peak Slot</div>
            <div className="text-sm font-bold text-white">{data.mostActiveSlot}</div>
            <div className="text-xs text-gray-400">{statistics?.maxSlot.visitors} visitors</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-lg p-4">
            <div className="text-orange-400 text-xs font-semibold mb-1">Quiet Slot</div>
            <div className="text-sm font-bold text-white">{data.leastActiveSlot}</div>
            <div className="text-xs text-gray-400">{statistics?.minSlot.visitors} visitors</div>
          </div>
          <div className={`bg-gradient-to-br rounded-lg p-4 border ${
            parseFloat(statistics?.avgComparison || '0') >= 0
              ? 'from-green-500/10 to-emerald-600/10 border-green-500/20'
              : 'from-red-500/10 to-rose-600/10 border-red-500/20'
          }`}>
            <div className={`text-xs font-semibold mb-1 ${parseFloat(statistics?.avgComparison || '0') >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              Avg Trend
            </div>
            <div className={`text-2xl font-bold ${parseFloat(statistics?.avgComparison || '0') >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {parseFloat(statistics?.avgComparison || '0') >= 0 ? '+' : ''}{statistics?.avgComparison}%
            </div>
          </div>
        </div>

        {/* Chart View */}
        {viewMode === 'chart' && (
          <div className="mt-6">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData}>
                <defs>
                  {Object.entries(SLOT_GRADIENTS).map(([slot, gradient]) => (
                    <linearGradient key={slot} id={`gradient-${slot}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={gradient.from} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={gradient.to} stopOpacity={0.2}/>
                    </linearGradient>
                  ))}
                </defs>
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
                  dataKey="total"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  name="Total Daily"
                  dot={{ fill: '#8B5CF6', r: 5 }}
                />
                {Object.entries(SLOT_COLORS).map(([slot, color]) => (
                  <Area
                    key={slot}
                    type="monotone"
                    dataKey={slot}
                    fill={`url(#gradient-${slot})`}
                    stroke={color}
                    strokeWidth={2}
                    name={slot}
                  />
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Heatmap View */}
        {viewMode === 'heatmap' && (
          <div className="mt-6 overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid gap-2" style={{ gridTemplateColumns: `auto repeat(${Object.keys(SLOT_COLORS).length}, 1fr)` }}>
                <div className="font-semibold text-gray-400 text-sm p-2"></div>
                {Object.keys(SLOT_COLORS).map(slot => (
                  <div key={slot} className="font-semibold text-gray-400 text-xs p-2 text-center">
                    {slot}
                  </div>
                ))}
                {heatmapData.map(({ date, slots }) => (
                  <React.Fragment key={date}>
                    <div className="font-semibold text-gray-300 text-sm p-2 whitespace-nowrap">{date}</div>
                    {slots.map((slotData, idx) => {
                      const intensity = slotData ? Math.min(slotData.visitors / 200, 1) : 0;
                      const color = Object.values(SLOT_COLORS)[idx];
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-lg text-center transition-all hover:scale-105 cursor-pointer relative group"
                          style={{
                            backgroundColor: slotData ? `${color}${Math.round(intensity * 255).toString(16).padStart(2, '0')}` : '#1F2937',
                            border: `1px solid ${slotData ? color : '#374151'}`
                          }}
                        >
                          <div className="text-white font-bold text-lg">{slotData?.visitors || 0}</div>
                          {slotData && (
                            <div className="absolute hidden group-hover:block bg-gray-900 text-white p-2 rounded shadow-lg z-10 top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                              <div className="text-xs">Occupancy: {slotData.avgOccupancy}</div>
                              <div className={`text-xs font-semibold ${slotData.comparisonPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {slotData.comparisonPercent >= 0 ? '+' : ''}{slotData.comparisonPercent.toFixed(1)}% vs last week
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-700">
                  <th className="text-left text-gray-400 pb-3 font-semibold">Date</th>
                  <th className="text-left text-gray-400 pb-3 font-semibold">Time Slot</th>
                  <th className="text-right text-gray-400 pb-3 font-semibold">Visitors</th>
                  <th className="text-right text-gray-400 pb-3 font-semibold">Avg Occupancy</th>
                  <th className="text-right text-gray-400 pb-3 font-semibold">vs Last Week</th>
                  <th className="text-right text-gray-400 pb-3 font-semibold">Performance</th>
                </tr>
              </thead>
              <tbody>
                {data.timeSlots.map((slot, idx) => (
                  <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="py-3 text-gray-300">{format(parseISO(slot.date), 'EEE, MMM dd')}</td>
                    <td className="py-3">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: SLOT_COLORS[slot.timeSlot] + '33',
                          color: SLOT_COLORS[slot.timeSlot],
                          border: `1px solid ${SLOT_COLORS[slot.timeSlot]}`
                        }}
                      >
                        {slot.timeSlot}
                      </span>
                    </td>
                    <td className="text-right">
                      <span className="text-white font-bold text-lg">{slot.visitors.toLocaleString()}</span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                            style={{ width: `${Math.min((slot.avgOccupancy / 200) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-gray-300 w-12">{slot.avgOccupancy}</span>
                      </div>
                    </td>
                    <td className={`text-right font-bold ${slot.comparisonPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {slot.comparisonPercent >= 0 ? '↗' : '↘'}
                        {slot.comparisonPercent >= 0 ? '+' : ''}{slot.comparisonPercent.toFixed(1)}%
                      </div>
                    </td>
                    <td className="text-right">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        slot.visitors > (statistics?.avgVisitorsPerSlot || 0) * 1.2
                          ? 'bg-green-500/20 text-green-400'
                          : slot.visitors < (statistics?.avgVisitorsPerSlot || 0) * 0.8
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-700 text-gray-400'
                      }`}>
                        {slot.visitors > (statistics?.avgVisitorsPerSlot || 0) * 1.2
                          ? 'Excellent'
                          : slot.visitors < (statistics?.avgVisitorsPerSlot || 0) * 0.8
                          ? 'Low'
                          : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Time Slot Legend */}
      <div className="card p-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-3">Time Slot Colors</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(SLOT_COLORS).map(([slot, color]) => (
            <div key={slot} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-300">{slot}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
