import React from 'react';
import { KPICard } from './KPICard';
import { DailySummary } from '../../types';

interface KPIGridProps {
  data?: DailySummary;
  loading?: boolean;
}

export const KPIGrid: React.FC<KPIGridProps> = ({ data, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard
        title="Today's Visitors"
        value={data?.todayVisitors.toLocaleString() || '0'}
        change={data?.weeklyChangePercent}
        subtitle="vs last week"
        loading={loading}
      />

      <KPICard
        title="Average Stay"
        value={data ? `${Math.floor(data.averageStayDuration / 60)}m ${Math.floor(data.averageStayDuration % 60)}s` : '0m'}
        subtitle="per customer"
        loading={loading}
      />

      <KPICard
        title="Peak Hour"
        value={data ? `${data.peakHour}:00` : '--:--'}
        subtitle="busiest time"
        loading={loading}
      />

      <KPICard
        title="Current Occupancy"
        value={data?.currentOccupancy || '0'}
        subtitle="people in store"
        loading={loading}
      />
    </div>
  );
};
