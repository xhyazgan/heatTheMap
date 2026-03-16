import React, { useState } from 'react';
import { AxiosError } from 'axios';
import { EntryLineEditor } from '../components/zone/EntryLineEditor';
import { useFilterStore } from '../stores/useFilterStore';
import { useEntryLine } from '../hooks/useEntryLine';
import { useStores, useResetStoreData } from '../hooks/useAnalytics';

export const Settings: React.FC = () => {
  const { selectedStore } = useFilterStore();
  const { data: stores } = useStores();
  const { data: entryLineData } = useEntryLine(selectedStore);
  const resetMutation = useResetStoreData();
  const [resetResult, setResetResult] = useState<{
    dailyFootfalls: number;
    heatmapData: number;
    customerRoutes: number;
  } | null>(null);

  const currentStore = stores?.find((s) => s.id === selectedStore);

  const handleReset = () => {
    if (!selectedStore) return;

    const confirmed = window.confirm(
      'Tum analitik verileri kalici olarak silinecektir. Devam etmek istediginize emin misiniz?'
    );

    if (!confirmed) return;

    setResetResult(null);
    resetMutation.mutate(selectedStore, {
      onSuccess: (data) => {
        setResetResult(data.deletedCounts);
      },
    });
  };

  if (!selectedStore) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400">Baslamak icin header'dan bir magaza secin</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Store Info */}
      {currentStore && (
        <div className="card p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Magaza Bilgisi</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Ad:</span>
              <span className="ml-2 text-white">{currentStore.name}</span>
            </div>
            <div>
              <span className="text-gray-500">Konum:</span>
              <span className="ml-2 text-white">{currentStore.location}</span>
            </div>
            <div>
              <span className="text-gray-500">Adres:</span>
              <span className="ml-2 text-white">{currentStore.address}</span>
            </div>
            <div>
              <span className="text-gray-500">Alan:</span>
              <span className="ml-2 text-white">{currentStore.floorArea} m2</span>
            </div>
          </div>
        </div>
      )}

      {/* Entry Line Editor - Inline */}
      <div className="card p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Entry Line Yapilandirmasi</h3>
        <EntryLineEditor
          storeId={selectedStore}
          existingLine={entryLineData}
          onClose={() => {}}
          mode="inline"
        />
      </div>

      {/* Danger Zone */}
      <div className="card p-5 border border-red-900/50">
        <h3 className="text-sm font-medium text-red-400 mb-3">Tehlikeli Bolge</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-white font-medium">Magaza Verilerini Sifirla</h4>
            <p className="text-sm text-gray-400 mt-1">
              Bu islem secili magazanin tum analitik verilerini (gunluk ziyaretci, isi haritasi, musteri rotalari) kalici olarak siler. Bu islem geri alinamaz.
            </p>
          </div>

          {resetResult && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 text-sm text-green-300">
              Veriler basariyla silindi: {resetResult.dailyFootfalls} gunluk ziyaretci, {resetResult.heatmapData} isi haritasi, {resetResult.customerRoutes} musteri rotasi kaydi silindi.
            </div>
          )}

          {resetMutation.isError && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-sm text-red-300">
              Bir hata olustu: {
                resetMutation.error instanceof AxiosError
                  ? resetMutation.error.response?.data || resetMutation.error.message
                  : resetMutation.error instanceof Error
                    ? resetMutation.error.message
                    : 'Bilinmeyen hata'
              }. Lutfen tekrar deneyin.
            </div>
          )}

          <button
            onClick={handleReset}
            disabled={resetMutation.isPending}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
          >
            {resetMutation.isPending ? 'Siliniyor...' : 'Verileri Sifirla'}
          </button>
        </div>
      </div>
    </div>
  );
};
