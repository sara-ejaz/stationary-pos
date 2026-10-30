import React, { forwardRef } from 'react';

export const Input = forwardRef(
  ({ label, error, icon, rightElement, helperText, className = '', id, required, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700">
            {label}
            {required && <span className="text-[#f43f5e] ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3.5 pointer-events-none text-slate-400 shrink-0">
              {icon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            required={required}
            className={`w-full bg-white border rounded-lg text-sm text-slate-900 placeholder-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#007f87]/20 ${
              icon ? 'pl-10' : 'pl-3.5'
            } ${rightElement ? 'pr-11' : 'pr-3.5'} py-2 ${
              error ? 'border-[#f43f5e] focus:border-[#f43f5e]' : 'border-slate-300 focus:border-[#007f87]'
            } ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 text-slate-400 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[#f43f5e] mt-1">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
