import React from 'react';
import { KPIGrid } from '../components/dashboard/KPIGrid';
import { HeatmapVisualization } from '../components/dashboard/HeatmapVisualization';
import { useFilterStore } from '../stores/useFilterStore';
import { useDailySummary, useLatestHeatmap } from '../hooks/useAnalytics';
import { useEntryLine } from '../hooks/useEntryLine';

export const DashboardOverview: React.FC = () => {
  const { selectedStore, dateRange } = useFilterStore();

  const { data: dailySummary, isLoading: loadingSummary } = useDailySummary(
    selectedStore,
    dateRange.start,
  );
  const { data: latestHeatmap } = useLatestHeatmap(selectedStore);
  const { data: entryLineData } = useEntryLine(selectedStore);

  if (!selectedStore) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">HeatTheMap</h2>
          <p className="text-gray-400">Baslamak icin header'dan bir magaza secin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <KPIGrid data={dailySummary} loading={loadingSummary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compact Heatmap */}
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Isil Harita</h3>
          <HeatmapVisualization
            data={latestHeatmap?.zoneMatrix}
            width={latestHeatmap?.gridWidth}
            height={latestHeatmap?.gridHeight}
            loading={loadingSummary}
          />
        </div>

        {/* Status */}
        <div className="card p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Sistem Durumu</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${entryLineData ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-sm text-gray-300">
                Entry Line: {entryLineData ? 'Yapilandirildi' : 'Yapilandirilmadi'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
              <span className="text-sm text-gray-300">API Baglantisi: Aktif</span>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Canli izleme icin sol menuden "Canli Izleme" sayfasina gidin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
