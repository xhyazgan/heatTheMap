import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { KPIGrid } from '../components/dashboard/KPIGrid';
import { HeatmapVisualization } from '../components/dashboard/HeatmapVisualization';
import { HourlyDistributionChart } from '../components/dashboard/HourlyDistributionChart';
import { DailyTrendsChart } from '../components/dashboard/DailyTrendsChart';
import { ZoneComparisonChart } from '../components/dashboard/ZoneComparisonChart';
import { ChatButton } from '../components/chatbot/ChatButton';
import { ChatPanel } from '../components/chatbot/ChatPanel';
import { useFilterStore } from '../stores/useFilterStore';
import {
  useDailySummary,
  useWeeklyTrends,
  useHourlyDistribution,
  useZonePerformance,
} from '../hooks/useAnalytics';
import { subDays, format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { selectedStore, dateRange } = useFilterStore();

  // Fetch all analytics data
  const { data: dailySummary, isLoading: loadingSummary } = useDailySummary(
    selectedStore,
    dateRange.start
  );

  const weekStart = format(subDays(new Date(dateRange.start), 6), 'yyyy-MM-dd');
  const { data: weeklyTrends, isLoading: loadingTrends } = useWeeklyTrends(
    selectedStore,
    weekStart
  );

  const { data: hourlyDist, isLoading: loadingHourly } = useHourlyDistribution(
    selectedStore,
    dateRange.start
  );

  const { data: zonePerf, isLoading: loadingZones } = useZonePerformance(
    selectedStore,
    weekStart,
    dateRange.end
  );

  if (!selectedStore) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to HeatTheMap</h2>
            <p className="text-gray-400">Please select a store from the sidebar to view analytics</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* KPIs */}
        <KPIGrid data={dailySummary} loading={loadingSummary} />

        {/* Heatmap and Hourly Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HeatmapVisualization loading={loadingSummary} />
          <HourlyDistributionChart data={hourlyDist} loading={loadingHourly} />
        </div>

        {/* Trends and Zone Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyTrendsChart data={weeklyTrends} loading={loadingTrends} />
          <ZoneComparisonChart data={zonePerf} loading={loadingZones} />
        </div>
      </div>

      {/* Chatbot */}
      {!isChatOpen && <ChatButton onClick={() => setIsChatOpen(true)} />}
      <ChatPanel isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </Layout>
  );
};
