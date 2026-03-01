'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: React.ReactNode;
  gold?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  suffix,
  gold = true,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm text-neutral-400 ml-1">{label}</label>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={`
            w-full h-[52px] px-4 text-[16px] text-white
            bg-bg-input rounded-md
            border transition-all duration-250 ease-out
            placeholder:text-neutral-600
            focus:outline-none
            ${error
              ? 'border-error/40 focus:border-error focus:shadow-[0_0_0_3px_rgba(248,113,113,0.12)]'
              : gold
                ? 'border-[rgba(196,162,101,0.08)] focus:border-gold-400 focus:shadow-[0_0_0_3px_rgba(196,162,101,0.12)]'
                : 'border-neutral-800 focus:border-neutral-600'
            }
            ${suffix ? 'pr-14' : ''}
            ${className}
          `}
          {...props}
        />
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-medium">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-error ml-1">{error}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';
