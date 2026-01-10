import React from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  subtitle?: string;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  subtitle,
  icon,
  loading,
}) => {
  const changeColor = change !== undefined
    ? change > 0
      ? 'text-green-400'
      : change < 0
      ? 'text-red-400'
      : 'text-gray-400'
    : '';

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-700 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="card p-6 hover:border-primary-500 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        {icon && <div className="text-primary-400">{icon}</div>}
      </div>

      <div className="mb-2">
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {change !== undefined && (
          <span className={`font-medium ${changeColor}`}>
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}%
          </span>
        )}
        {subtitle && <span className="text-gray-400">{subtitle}</span>}
      </div>
    </div>
  );
};
