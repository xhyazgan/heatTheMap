import { create } from 'zustand';
import { format } from 'date-fns';

interface FilterState {
  selectedStore: number | null;
  dateRange: {
    start: string;
    end: string;
  };
  setSelectedStore: (storeId: number) => void;
  setDateRange: (range: { start: string; end: string }) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  selectedStore: null,
  dateRange: {
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  },
  setSelectedStore: (storeId) => set({ selectedStore: storeId }),
  setDateRange: (range) => set({ dateRange: range }),
}));
