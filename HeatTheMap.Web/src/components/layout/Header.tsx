import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStores } from '../../hooks/useAnalytics';
import { useFilterStore } from '../../stores/useFilterStore';

const titleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/realtime': 'Canli Izleme',
  '/analytics': 'Analitik',
  '/settings': 'Ayarlar',
};

export const Header: React.FC = () => {
  const { username, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: stores } = useStores();
  const { selectedStore, setSelectedStore } = useFilterStore();

  const title = titleMap[location.pathname] || 'Dashboard';

  // Auto-select first store
  React.useEffect(() => {
    if (stores && stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0].id);
    }
  }, [stores, selectedStore, setSelectedStore]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-white">{title}</h1>
          <select
            value={selectedStore || ''}
            onChange={(e) => setSelectedStore(Number(e.target.value))}
            className="bg-gray-700 text-sm text-gray-200 rounded px-3 py-1.5 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Magaza sec</option>
            {stores?.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">{username || 'Admin'}</span>
          <button onClick={handleLogout} className="btn-secondary text-sm py-1.5 px-3">
            Cikis
          </button>
        </div>
      </div>
    </header>
  );
};
