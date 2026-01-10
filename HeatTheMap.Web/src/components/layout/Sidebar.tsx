import React from 'react';
import { StoreSelector } from '../filters/StoreSelector';
import { DateRangePicker } from '../filters/DateRangePicker';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-80 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">HeatTheMap</h2>
        <p className="text-gray-400 text-sm">Retail Analytics</p>
      </div>

      <div className="space-y-6">
        <StoreSelector />
        <DateRangePicker />
      </div>

      <div className="mt-8 pt-8 border-t border-gray-700">
        <div className="text-xs text-gray-500">
          <p className="mb-1">Version 1.0.0</p>
          <p>Powered by .NET Aspire</p>
        </div>
      </div>
    </aside>
  );
};
