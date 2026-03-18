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
      'Tüm analitik verileri kalıcı olarak silinecektir. Devam etmek istediğinize emin misiniz?'
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
        <p className="text-gray-500">Başlamak için header'dan bir mağaza seçin</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Store Info */}
      {currentStore && (
        <div className="card p-5">
          <h3 className="text-sm font-medium text-gray-400 mb-4">Mağaza Bilgisi</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-white/[0.03]">
              <span className="text-gray-500 block text-xs mb-1">Ad</span>
              <span className="text-white">{currentStore.name}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03]">
              <span className="text-gray-500 block text-xs mb-1">Konum</span>
              <span className="text-white">{currentStore.location}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03]">
              <span className="text-gray-500 block text-xs mb-1">Adres</span>
              <span className="text-white">{currentStore.address}</span>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03]">
              <span className="text-gray-500 block text-xs mb-1">Alan</span>
              <span className="text-white">{currentStore.floorArea} m²</span>
            </div>
          </div>
        </div>
      )}

      {/* Entry Line Editor - Inline */}
      <div className="card p-5">
        <h3 className="text-sm font-medium text-gray-400 mb-4">Giriş Çizgisi Yapılandırması</h3>
        <EntryLineEditor
          storeId={selectedStore}
          existingLine={entryLineData}
          onClose={() => {}}
          mode="inline"
        />
      </div>

      {/* Danger Zone */}
      <div className="card p-5 border-red-500/20">
        <h3 className="text-sm font-medium text-red-400 mb-4">Tehlikeli Bölge</h3>
        <div className="space-y-4">
          <div>
            <h4 className="text-white font-medium">Mağaza Verilerini Sıfırla</h4>
            <p className="text-sm text-gray-500 mt-1">
              Bu işlem seçili mağazanın tüm analitik verilerini (günlük ziyaretçi, ısı haritası, müşteri rotaları) kalıcı olarak siler. Bu işlem geri alınamaz.
            </p>
          </div>

          {resetResult && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-sm text-emerald-300">
              Veriler başarıyla silindi: {resetResult.dailyFootfalls} günlük ziyaretçi, {resetResult.heatmapData} ısı haritası, {resetResult.customerRoutes} müşteri rotası kaydı silindi.
            </div>
          )}

          {resetMutation.isError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-300">
              Bir hata oluştu: {
                resetMutation.error instanceof AxiosError
                  ? resetMutation.error.response?.data || resetMutation.error.message
                  : resetMutation.error instanceof Error
                    ? resetMutation.error.message
                    : 'Bilinmeyen hata'
              }. Lütfen tekrar deneyin.
            </div>
          )}

          <button
            onClick={handleReset}
            disabled={resetMutation.isPending}
            className="btn-danger text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resetMutation.isPending ? 'Siliniyor...' : 'Verileri Sıfırla'}
          </button>
        </div>
      </div>
    </div>
  );
};
