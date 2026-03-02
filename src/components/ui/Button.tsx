'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'ghost' | 'cta';
}

export function Button({ variant = 'gold', className = '', children, ...props }: ButtonProps) {
  const cls = variant === 'cta' ? 'cta-gold-bar' : variant === 'ghost' ? 'btn-ghost-3d' : 'btn-gold-3d w-full';
  return (
    <button className={`${cls} ${className}`} {...props}>
      {children}
    </button>
  );
}
