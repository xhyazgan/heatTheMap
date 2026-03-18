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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0V7.875c0-1.036.84-1.875 1.875-1.875h14.25c1.035 0 1.875.84 1.875 1.875V9.35" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-1">HeatTheMap</h2>
          <p className="text-sm text-gray-500">Başlamak için header'dan bir mağaza seçin</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <KPIGrid data={dailySummary} loading={loadingSummary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compact Heatmap */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Isı Haritası</h3>
          <HeatmapVisualization
            data={latestHeatmap?.zoneMatrix}
            width={latestHeatmap?.gridWidth}
            height={latestHeatmap?.gridHeight}
            loading={loadingSummary}
          />
        </div>

        {/* Status */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Sistem Durumu</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <span className={`w-2.5 h-2.5 rounded-full ${entryLineData ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400 shadow-sm shadow-amber-400/50'}`} />
              <span className="text-sm text-gray-300">
                Giriş Çizgisi: {entryLineData ? 'Yapılandırıldı' : 'Yapılandırılmadı'}
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              <span className="text-sm text-gray-300">API Bağlantısı: Aktif</span>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5">
              <p className="text-xs text-gray-600">
                Canlı izleme için sol menüden "Canlı İzleme" sayfasına gidin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
