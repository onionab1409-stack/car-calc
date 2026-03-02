'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, selected, className = '', onClick, style }: CardProps) {
  return (
    <div
      className={`card-3d ${selected ? 'card-3d-selected' : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
