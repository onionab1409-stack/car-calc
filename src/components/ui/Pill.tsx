'use client';

import React from 'react';

interface PillProps {
  children: React.ReactNode;
  variant?: 'gold' | 'dark';
  className?: string;
  style?: React.CSSProperties;
}

export function Pill({ children, variant = 'gold', className = '', style }: PillProps) {
  return (
    <span className={`${variant === 'dark' ? 'pill-3d-dark' : 'pill-3d'} ${className}`} style={style}>
      {children}
    </span>
  );
}
