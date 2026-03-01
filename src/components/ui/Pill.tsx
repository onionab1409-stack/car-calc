'use client';

import React from 'react';

interface PillProps {
  children: React.ReactNode;
  variant?: 'gold' | 'success' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export function Pill({ children, variant = 'gold', size = 'md', className = '' }: PillProps) {
  const variants = {
    gold:    'bg-[rgba(196,162,101,0.12)] text-gold-300 border-[rgba(196,162,101,0.08)]',
    success: 'bg-[rgba(74,222,128,0.10)] text-success border-[rgba(74,222,128,0.1)]',
    error:   'bg-[rgba(248,113,113,0.10)] text-error border-[rgba(248,113,113,0.1)]',
    neutral: 'bg-neutral-800/50 text-neutral-300 border-neutral-800',
  };

  const sizes = {
    sm: 'h-6 px-2.5 text-[11px]',
    md: 'h-8 px-3 text-[13px]',
  };

  return (
    <span className={`
      inline-flex items-center rounded-full border font-medium
      ${variants[variant]} ${sizes[size]} ${className}
    `}>
      {children}
    </span>
  );
}
