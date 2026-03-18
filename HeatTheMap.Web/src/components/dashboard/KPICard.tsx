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
      ? 'text-emerald-400'
      : change < 0
      ? 'text-red-400'
      : 'text-gray-500'
    : '';

  const changeBg = change !== undefined
    ? change > 0
      ? 'bg-emerald-400/10'
      : change < 0
      ? 'bg-red-400/10'
      : 'bg-gray-500/10'
    : '';

  if (loading) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-4 bg-white/5 rounded-lg w-1/2 mb-4"></div>
        <div className="h-8 bg-white/5 rounded-lg w-3/4 mb-2"></div>
        <div className="h-3 bg-white/5 rounded-lg w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="card p-6 hover:bg-white/[0.07] hover:shadow-2xl hover:shadow-primary-500/5 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && (
          <div className="w-9 h-9 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 group-hover:bg-primary-500/15 transition-colors duration-300">
            {icon}
          </div>
        )}
      </div>

      <div className="mb-2">
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {change !== undefined && (
          <span className={`font-medium px-2 py-0.5 rounded-lg ${changeColor} ${changeBg}`}>
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}%
          </span>
        )}
        {subtitle && <span className="text-gray-500">{subtitle}</span>}
      </div>
    </div>
  );
};
