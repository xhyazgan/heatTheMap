import React from 'react';
import { useStores } from '../../hooks/useAnalytics';
import { useFilterStore } from '../../stores/useFilterStore';

export const StoreSelector: React.FC = () => {
  const { data: stores, isLoading } = useStores();
  const { selectedStore, setSelectedStore } = useFilterStore();

  React.useEffect(() => {
    if (stores && stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0].id);
    }
  }, [stores, selectedStore, setSelectedStore]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor="store" className="block text-sm font-medium text-gray-300 mb-2">
        Store
      </label>
      <select
        id="store"
        value={selectedStore || ''}
        onChange={(e) => setSelectedStore(Number(e.target.value))}
        className="input w-full"
      >
        <option value="">Select a store</option>
        {stores?.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name} - {store.location}
          </option>
        ))}
      </select>
    </div>
  );
};
