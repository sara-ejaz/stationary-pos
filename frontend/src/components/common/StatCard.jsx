import React from 'react';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlightColor = 'teal',
  onClick
}) => {
  const colorMap = {
    teal: 'bg-[#e6f7f8] text-[#007f87] border-[#99dfe3]',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-xl p-5 transition-all duration-200 hover:border-[#007f87]/60 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg border ${colorMap[highlightColor] || colorMap.teal} shrink-0`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-semibold ml-auto flex items-center gap-1 ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
export default StatCard;
