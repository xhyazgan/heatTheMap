import React, { useState, useCallback, useMemo } from 'react';
import { Layout } from '../components/layout/Layout';
import { KPIGrid } from '../components/dashboard/KPIGrid';
import { HeatmapVisualization } from '../components/dashboard/HeatmapVisualization';
import { HourlyDistributionChart } from '../components/dashboard/HourlyDistributionChart';
import { DailyTrendsChart } from '../components/dashboard/DailyTrendsChart';
import { ZoneComparisonChart } from '../components/dashboard/ZoneComparisonChart';
import { ChatButton } from '../components/chatbot/ChatButton';
import { ChatPanel } from '../components/chatbot/ChatPanel';
import { DetectionPanel } from '../components/detection/DetectionPanel';
import { EntryLineEditor } from '../components/zone/EntryLineEditor';
import { useFilterStore } from '../stores/useFilterStore';
import {
  useDailySummary,
  useWeeklyTrends,
  useHourlyDistribution,
  useZonePerformance,
  useLatestHeatmap,
} from '../hooks/useAnalytics';
import { useSubmitDetection } from '../hooks/useDetection';
import { useEntryLine } from '../hooks/useEntryLine';
import { subDays, format } from 'date-fns';
import type { EntryLineConfig as TrackerEntryLineConfig } from '../lib/directionalEntryTracker';

export const Dashboard: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEntryLineEditorOpen, setIsEntryLineEditorOpen] = useState(false);
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

  const { data: latestHeatmap } = useLatestHeatmap(selectedStore);
  const { data: entryLineData } = useEntryLine(selectedStore);
  const submitDetection = useSubmitDetection();

  // Convert API EntryLineConfig to tracker EntryLineConfig
  const trackerEntryLine: TrackerEntryLineConfig | null = useMemo(() => {
    if (!entryLineData) return null;
    return {
      start: { x: entryLineData.startX, y: entryLineData.startY },
      end: { x: entryLineData.endX, y: entryLineData.endY },
      inDirection: entryLineData.inDirection as TrackerEntryLineConfig['inDirection'],
    };
  }, [entryLineData]);

  const handleSubmitDetection = useCallback(
    (data: { storeId: number; timestamp: string; personCount: number; exitCount: number; zoneDistribution: number[][] }) => {
      submitDetection.mutate(data);
    },
    [submitDetection],
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

        {/* Camera Detection and Heatmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <DetectionPanel
              onSubmitDetection={handleSubmitDetection}
              entryLine={trackerEntryLine}
            />
            <button
              onClick={() => setIsEntryLineEditorOpen(true)}
              className="mt-2 w-full px-4 py-2 text-sm font-medium rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            >
              Entry Line Ayarla
            </button>
          </div>
          <HeatmapVisualization
            data={latestHeatmap?.zoneMatrix}
            width={latestHeatmap?.gridWidth}
            height={latestHeatmap?.gridHeight}
            loading={loadingSummary}
          />
        </div>

        {/* Hourly Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Entry Line Editor Modal */}
      {isEntryLineEditorOpen && (
        <EntryLineEditor
          storeId={selectedStore}
          existingLine={entryLineData}
          onClose={() => setIsEntryLineEditorOpen(false)}
        />
      )}
    </Layout>
  );
};
