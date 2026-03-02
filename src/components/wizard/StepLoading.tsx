'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Country, Destination } from '@/types';
import { COUNTRY_FLAG } from '@/types';

interface StepLoadingProps {
  country: Country;
  destination: Destination;
  price: number;
  year: number;
  engineType: string;
  horsePower: number;
  engineVolume?: number;
  onComplete: (totalRUB: number) => void;
  onError: (error: string) => void;
}

const LOADING_STAGES = [
  { pct: 10, text: 'Получаем курсы валют...' },
  { pct: 30, text: 'Рассчитываем таможню...' },
  { pct: 55, text: 'Считаем доставку...' },
  { pct: 75, text: 'Добавляем все сборы...' },
  { pct: 90, text: 'Формируем итог...' },
];

export function StepLoading({
  country, destination, price, year, engineType, horsePower, engineVolume,
  onComplete, onError,
}: StepLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [stageText, setStageText] = useState('Подключаемся...');
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    let currentStage = 0;
    const stageInterval = setInterval(() => {
      if (currentStage < LOADING_STAGES.length) {
        setProgress(LOADING_STAGES[currentStage].pct);
        setStageText(LOADING_STAGES[currentStage].text);
        currentStage++;
      }
    }, 400);

    const doFetch = async () => {
      try {
        const res = await fetch('/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ country, destination, price, year, engineType, horsePower, engineCC: engineVolume }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.details || data.error || `Ошибка сервера (${res.status})`);
        }
        const data = await res.json();
        clearInterval(stageInterval);
        setProgress(100);
        setStageText('Готово!');
        setTimeout(() => onComplete(data.totalRUB), 600);
      } catch (err) {
        clearInterval(stageInterval);
        onError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      }
    };
    doFetch();
    return () => { clearInterval(stageInterval); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const circumference = 2 * Math.PI * 52;

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 animate-fade-in">
      {/* Circular progress with glow */}
      <div className="relative w-48 h-48 mb-8">
        {/* Ambient glow behind the ring */}
        <div className="absolute inset-[-20px] rounded-full" style={{
          background: `radial-gradient(circle, rgba(201,154,72, ${0.08 + progress * 0.002}) 0%, transparent 70%)`,
          transition: 'background 500ms ease',
        }} />

        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90 relative z-10">
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--gold-peak)" />
              <stop offset="50%" stopColor="var(--gold-warm)" />
              <stop offset="100%" stopColor="var(--gold-med)" />
            </linearGradient>
          </defs>
          {/* Background track — recessed */}
          <circle cx="60" cy="60" r="52" fill="none"
            stroke="var(--sf-overlay)" strokeWidth="5" />
          <circle cx="60" cy="60" r="52" fill="none"
            stroke="rgba(0,0,0,0.15)" strokeWidth="5"
            style={{ filter: 'blur(1px)' }} />
          {/* Glow layer */}
          <circle cx="60" cy="60" r="52" fill="none"
            stroke="rgba(201,154,72,0.25)" strokeWidth="10" strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${circumference * (1 - progress / 100)}`}
            className="transition-all duration-500 ease-out"
            style={{ filter: 'blur(4px)' }} />
          {/* Main progress arc */}
          <circle cx="60" cy="60" r="52" fill="none"
            stroke="url(#goldGradient)" strokeWidth="4" strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${circumference * (1 - progress / 100)}`}
            className="transition-all duration-500 ease-out" />
        </svg>

        {/* Percentage center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 36, fontWeight: 300,
            color: 'var(--gold-bright)', fontVariantNumeric: 'tabular-nums',
            textShadow: '0 0 20px rgba(201,154,72,0.3)',
          }}>
            {progress}
            <span style={{ fontSize: 18, color: 'var(--gold-sub)' }}>%</span>
          </span>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[20px]">{COUNTRY_FLAG[country]}</span>
        <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
          <path d="M0 4H16M16 4L12 1M16 4L12 7" stroke="var(--gold-dim)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="text-[20px]">{destination === 'RU' ? '🇷🇺' : '🇧🇾'}</span>
      </div>

      {/* Status text */}
      <p className="text-[13px] text-center min-h-[20px]" style={{
        color: 'var(--txt-secondary)', transition: 'opacity 300ms',
      }}>
        {stageText}
      </p>

      {/* Stage dots */}
      <div className="flex gap-[6px] mt-6">
        {LOADING_STAGES.map((stage, i) => (
          <div key={i} className={`dot-3d ${progress >= stage.pct ? 'dot-3d-done' : ''}`} />
        ))}
      </div>
    </div>
  );
}
