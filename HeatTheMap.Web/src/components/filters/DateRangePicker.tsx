import React from 'react';
import { useFilterStore } from '../../stores/useFilterStore';
import { format } from 'date-fns';

export const DateRangePicker: React.FC = () => {
  const { dateRange, setDateRange } = useFilterStore();

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
          Start Date
        </label>
        <input
          id="startDate"
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          className="input w-full"
        />
      </div>

      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
          End Date
        </label>
        <input
          id="endDate"
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          className="input w-full"
        />
      </div>

      <button
        onClick={() => {
          const today = format(new Date(), 'yyyy-MM-dd');
          setDateRange({ start: today, end: today });
        }}
        className="btn-secondary w-full text-sm"
      >
        Today
      </button>
    </div>
  );
};
