import React, { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#007f87]/50 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-[#007f87] hover:bg-[#009aa4] text-white shadow-md shadow-[#007f87]/20 border border-[#009aa4]/40 active:translate-y-0.5',
    secondary: 'bg-[#003d40] hover:bg-[#005f6a] text-[#d4f1f4] border border-[#143d41] active:translate-y-0.5',
    danger: 'bg-[#f43f5e] hover:bg-[#e11d48] text-white shadow-md shadow-[#f43f5e]/20 active:translate-y-0.5',
    outline: 'border border-[#143d41] hover:border-[#007f87] text-[#8da5a7] hover:text-[#d4f1f4] hover:bg-[#003d40]/30',
    ghost: 'text-[#8da5a7] hover:text-[#f2fbfa] hover:bg-[#0a2224]'
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  );
};
