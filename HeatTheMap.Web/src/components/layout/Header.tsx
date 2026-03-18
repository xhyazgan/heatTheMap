import React from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStores } from '../../hooks/useAnalytics';
import { useFilterStore } from '../../stores/useFilterStore';

const titleMap: Record<string, { title: string; description: string }> = {
  '/': { title: 'Dashboard', description: 'Mağaza performans özeti' },
  '/realtime': { title: 'Canlı İzleme', description: 'Gerçek zamanlı müşteri takibi' },
  '/analytics': { title: 'Analitik', description: 'Detaylı veri analizi' },
  '/settings': { title: 'Ayarlar', description: 'Sistem yapılandırması' },
};

export const Header: React.FC = () => {
  const { username, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: stores } = useStores();
  const { selectedStore, setSelectedStore } = useFilterStore();

  const pageInfo = titleMap[location.pathname] || { title: 'Dashboard', description: '' };

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
    <header className="bg-slate-900/80 backdrop-blur-xl border-b border-white/5 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-lg font-semibold text-white">{pageInfo.title}</h1>
            <p className="text-xs text-gray-500">{pageInfo.description}</p>
          </div>
          <select
            value={selectedStore || ''}
            onChange={(e) => setSelectedStore(Number(e.target.value))}
            className="bg-white/5 text-sm text-gray-300 rounded-xl px-3 py-1.5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all duration-200"
          >
            <option value="">Mağaza seç</option>
            {stores?.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm text-gray-400">{username || 'Admin'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-400 px-3 py-1.5 rounded-xl hover:bg-red-500/10 transition-all duration-200"
          >
            Çıkış
          </button>
        </div>
      </div>
    </header>
  );
};
