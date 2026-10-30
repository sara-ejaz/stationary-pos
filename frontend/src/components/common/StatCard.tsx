import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlightColor?: 'teal' | 'emerald' | 'amber' | 'rose' | 'cyan';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlightColor = 'teal',
  onClick
}) => {
  const colorMap = {
    teal: 'bg-[#003d40]/40 text-[#d4f1f4] border-[#007f87]/40',
    emerald: 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30',
    amber: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30',
    rose: 'bg-[#f43f5e]/15 text-[#f43f5e] border-[#f43f5e]/30',
    cyan: 'bg-[#06b6d4]/15 text-[#06b6d4] border-[#06b6d4]/30'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-[#0a2224] border border-[#143d41] rounded-xl p-5 transition-all duration-200 hover:border-[#007f87]/60 hover:shadow-lg hover:shadow-black/40 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-[#8da5a7] uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-[#f2fbfa] tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg border ${colorMap[highlightColor]} shrink-0`}>
          {icon}
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-[#143d41]/60 flex items-center justify-between text-xs">
          {subtitle && <span className="text-[#8da5a7] truncate">{subtitle}</span>}
          {trend && (
            <span
              className={`font-medium ml-auto flex items-center gap-1 ${
                trend.isPositive ? 'text-[#10b981]' : 'text-[#f43f5e]'
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
