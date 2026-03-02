'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, suffix, className = '', ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="label-gold block ml-1">{label}</label>
      )}
      <div className="relative">
        <input
          ref={ref}
          className={`input-3d ${error ? 'input-3d-error' : ''} ${suffix ? '!pr-14' : ''} ${className}`}
          style={{ borderRadius: 14 }}
          {...props}
        />
        {suffix && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'var(--gold-dim)' }}>
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs ml-1" style={{ color: '#e8725a' }}>{error}</p>
      )}
    </div>
  );
});
Input.displayName = 'Input';
