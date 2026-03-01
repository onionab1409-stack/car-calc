'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  glow?: boolean;
}

export function Card({ children, selected, onClick, className = '', glow = false }: CardProps) {
  const interactive = !!onClick;

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={interactive ? (e) => e.key === 'Enter' && onClick?.() : undefined}
      className={`
        bg-bg-card rounded-lg p-4 transition-all duration-250 ease-out
        border
        ${selected
          ? 'border-gold-400 shadow-gold bg-[rgba(196,162,101,0.04)]'
          : 'border-[rgba(196,162,101,0.14)]'
        }
        ${interactive && !selected
          ? 'cursor-pointer hover:border-[rgba(196,162,101,0.25)] hover:shadow-gold hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'
          : ''
        }
        ${glow ? 'shadow-gold-glow' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
