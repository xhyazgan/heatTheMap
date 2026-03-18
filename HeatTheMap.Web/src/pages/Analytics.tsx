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
        <p className="text-gray-500">Başlamak için header'dan bir mağaza seçin</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Range Picker */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Başlangıç:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="input text-sm py-1.5"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Bitiş:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="input text-sm py-1.5"
          />
        </div>
        <button
          onClick={() => {
            const today = format(new Date(), 'yyyy-MM-dd');
            setDateRange({ start: today, end: today });
          }}
          className="btn-secondary text-sm py-1.5 px-4"
        >
          Bugün
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
