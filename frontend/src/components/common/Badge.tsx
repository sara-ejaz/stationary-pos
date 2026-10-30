import React from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'primary';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  size = 'md'
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30',
    warning: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30',
    danger: 'bg-[#f43f5e]/15 text-[#f43f5e] border-[#f43f5e]/30',
    info: 'bg-[#06b6d4]/15 text-[#06b6d4] border-[#06b6d4]/30',
    neutral: 'bg-[#143d41]/40 text-[#8da5a7] border-[#143d41]',
    primary: 'bg-[#007f87]/20 text-[#d4f1f4] border-[#007f87]/50'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
