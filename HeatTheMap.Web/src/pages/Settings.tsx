import React from 'react';
import { EntryLineEditor } from '../components/zone/EntryLineEditor';
import { useFilterStore } from '../stores/useFilterStore';
import { useEntryLine } from '../hooks/useEntryLine';
import { useStores } from '../hooks/useAnalytics';

export const Settings: React.FC = () => {
  const { selectedStore } = useFilterStore();
  const { data: stores } = useStores();
  const { data: entryLineData } = useEntryLine(selectedStore);

  const currentStore = stores?.find((s) => s.id === selectedStore);

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
    </div>
  );
};
