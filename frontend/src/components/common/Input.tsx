import React, { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightElement, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-[#8da5a7]">
            {label}
            {props.required && <span className="text-[#f43f5e] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 pointer-events-none text-[#8da5a7] shrink-0">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={`w-full bg-[#07181a] border rounded-lg text-sm text-[#f2fbfa] placeholder-[#59787a] transition-all focus:outline-none focus:ring-1 focus:ring-[#007f87] ${
              icon ? 'pl-10' : 'pl-3.5'
            } ${rightElement ? 'pr-11' : 'pr-3.5'} py-2 ${
              error ? 'border-[#f43f5e] focus:border-[#f43f5e]' : 'border-[#143d41] focus:border-[#007f87]'
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 text-[#8da5a7] flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[#f43f5e] mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#59787a] mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
