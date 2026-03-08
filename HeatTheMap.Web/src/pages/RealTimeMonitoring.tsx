import React, { useState, useCallback, useMemo } from 'react';
import { DetectionPanel } from '../components/detection/DetectionPanel';
import { EntryLineEditor } from '../components/zone/EntryLineEditor';
import { HeatmapVisualization } from '../components/dashboard/HeatmapVisualization';
import { useFilterStore } from '../stores/useFilterStore';
import { useSubmitDetection } from '../hooks/useDetection';
import { useEntryLine } from '../hooks/useEntryLine';
import { useLatestHeatmap } from '../hooks/useAnalytics';
import type { EntryLineConfig as TrackerEntryLineConfig } from '../lib/directionalEntryTracker';

export const RealTimeMonitoring: React.FC = () => {
  const [isEntryLineEditorOpen, setIsEntryLineEditorOpen] = useState(false);
  const { selectedStore } = useFilterStore();

  const { data: entryLineData } = useEntryLine(selectedStore);
  const { data: latestHeatmap } = useLatestHeatmap(selectedStore);
  const submitDetection = useSubmitDetection();

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
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Baslamak icin header'dan bir magaza secin</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-full">
      {/* Left: Camera Feed */}
      <div className="lg:col-span-3">
        <DetectionPanel
          onSubmitDetection={handleSubmitDetection}
          entryLine={trackerEntryLine}
        />
      </div>

      {/* Right: Controls & Stats */}
      <div className="lg:col-span-2 space-y-4">
        {/* Entry Line Button */}
        <button
          onClick={() => setIsEntryLineEditorOpen(true)}
          className="w-full px-4 py-2.5 text-sm font-medium rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
        >
          Entry Line Ayarla
        </button>

        {/* Mini Heatmap */}
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Isil Harita</h3>
          <HeatmapVisualization
            data={latestHeatmap?.zoneMatrix}
            width={latestHeatmap?.gridWidth}
            height={latestHeatmap?.gridHeight}
            loading={false}
          />
        </div>
      </div>

      {/* Entry Line Editor Modal */}
      {isEntryLineEditorOpen && (
        <EntryLineEditor
          storeId={selectedStore}
          existingLine={entryLineData}
          onClose={() => setIsEntryLineEditorOpen(false)}
        />
      )}
    </div>
  );
};
