import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-[#007f87]/40 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variantStyles = {
    primary: 'bg-[#007f87] hover:bg-[#006970] text-white shadow-sm shadow-[#007f87]/20 border border-[#007f87] active:translate-y-0.5',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 active:translate-y-0.5 shadow-2xs',
    danger: 'bg-[#f43f5e] hover:bg-[#e11d48] text-white shadow-sm shadow-rose-500/20 active:translate-y-0.5',
    outline: 'border border-slate-300 hover:border-[#007f87] text-slate-700 hover:text-[#007f87] hover:bg-teal-50/50 active:translate-y-0.5',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
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
export default Button;
