import React from 'react';
import { HourlyDistributionChart } from '../components/dashboard/HourlyDistributionChart';
import { DailyTrendsChart } from '../components/dashboard/DailyTrendsChart';
import { ZoneComparisonChart } from '../components/dashboard/ZoneComparisonChart';
import { useFilterStore } from '../stores/useFilterStore';
import {
  useWeeklyTrends,
  useHourlyDistribution,
  useZonePerformance,
} from '../hooks/useAnalytics';
import { subDays, format } from 'date-fns';

export const Analytics: React.FC = () => {
  const { selectedStore, dateRange, setDateRange } = useFilterStore();

  const weekStart = format(subDays(new Date(dateRange.start), 6), 'yyyy-MM-dd');

  const { data: weeklyTrends, isLoading: loadingTrends } = useWeeklyTrends(
    selectedStore,
    weekStart,
  );
  const { data: hourlyDist, isLoading: loadingHourly } = useHourlyDistribution(
    selectedStore,
    dateRange.start,
  );
  const { data: zonePerf, isLoading: loadingZones } = useZonePerformance(
    selectedStore,
    weekStart,
    dateRange.end,
  );

  if (!selectedStore) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Baslamak icin header'dan bir magaza secin</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Baslangic:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="bg-gray-700 text-sm text-white rounded px-3 py-1.5 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Bitis:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="bg-gray-700 text-sm text-white rounded px-3 py-1.5 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <button
          onClick={() => {
            const today = format(new Date(), 'yyyy-MM-dd');
            setDateRange({ start: today, end: today });
          }}
          className="btn-secondary text-sm py-1.5 px-3"
        >
          Bugun
        </button>
      </div>

      {/* Hourly Distribution - Full Width */}
      <HourlyDistributionChart data={hourlyDist} loading={loadingHourly} />

      {/* Trends + Zone Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyTrendsChart data={weeklyTrends} loading={loadingTrends} />
        <ZoneComparisonChart data={zonePerf} loading={loadingZones} />
      </div>
    </div>
  );
};
