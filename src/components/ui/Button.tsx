'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger';
  size?: 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'lg',
  loading = false,
  fullWidth = true,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'relative flex items-center justify-center font-semibold transition-all duration-250 ease-out active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none';

  const sizes = {
    md: 'h-12 px-5 text-[15px] rounded-md',
    lg: 'h-[52px] px-6 text-[16px] rounded-lg',
  };

  const variants = {
    primary: 'bg-gradient-to-br from-gold-300 via-gold-400 to-gold-500 text-[#1A1208] hover:shadow-gold-lg hover:-translate-y-0.5',
    ghost: 'bg-transparent text-gold-400 border border-[rgba(196,162,101,0.14)] hover:border-[rgba(196,162,101,0.25)] hover:bg-[rgba(196,162,101,0.06)]',
    danger: 'bg-transparent text-error border border-[rgba(248,113,113,0.2)] hover:bg-[rgba(248,113,113,0.06)]',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
