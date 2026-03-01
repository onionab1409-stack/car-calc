'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Country, Destination } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU } from '@/types';

/**
 * P6.5 · Экран загрузки (вызов API + анимация)
 *
 * Золотой круговой прогресс + статусные сообщения
 * Вызывает POST /api/calculate → onComplete(totalRUB)
 *
 * Референс: desing/ref-10-loading-circle.png
 */

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

/** Статусные сообщения при загрузке */
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

    // Анимация прогресса
    let currentStage = 0;
    const stageInterval = setInterval(() => {
      if (currentStage < LOADING_STAGES.length) {
        setProgress(LOADING_STAGES[currentStage].pct);
        setStageText(LOADING_STAGES[currentStage].text);
        currentStage++;
      }
    }, 400);

    // Реальный запрос к API
    const doFetch = async () => {
      try {
        const res = await fetch('/api/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country,
            destination,
            price,
            year,
            engineType,
            horsePower,
            engineCC: engineVolume,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.details || data.error || `Ошибка сервера (${res.status})`);
        }

        const data = await res.json();

        // Доводим прогресс до 100%
        clearInterval(stageInterval);
        setProgress(100);
        setStageText('Готово!');

        // Короткая пауза для анимации завершения
        setTimeout(() => {
          onComplete(data.totalRUB);
        }, 600);

      } catch (err) {
        clearInterval(stageInterval);
        const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
        onError(message);
      }
    };

    doFetch();

    return () => {
      clearInterval(stageInterval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 animate-fade-in">
      {/* Круговой прогресс */}
      <div className="relative w-48 h-48 mb-8">
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full -rotate-90"
        >
          {/* Фоновое кольцо */}
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="rgba(196,162,101,0.08)"
            strokeWidth="4"
          />
          {/* Прогресс-кольцо */}
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            className="transition-all duration-500 ease-out"
          />
          {/* Свечение прогресса */}
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="rgba(196,162,101,0.20)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - progress / 100)}`}
            className="transition-all duration-500 ease-out blur-[2px]"
          />
          {/* Градиент */}
          <defs>
            <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFE2A9" />
              <stop offset="50%" stopColor="#C4A265" />
              <stop offset="100%" stopColor="#A08050" />
            </linearGradient>
          </defs>
        </svg>

        {/* Процент в центре */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-4xl text-gold-50 tabular-nums">
            {progress}
            <span className="text-xl text-gold-300">%</span>
          </span>
        </div>
      </div>

      {/* Страна + направление */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{COUNTRY_FLAG[country]}</span>
        <span className="text-neutral-500">→</span>
        <span className="text-lg">{destination === 'RU' ? '🇷🇺' : '🇧🇾'}</span>
      </div>

      {/* Статус */}
      <p className="text-sm text-neutral-400 text-center min-h-[20px] transition-opacity duration-300">
        {stageText}
      </p>

      {/* Тикеры-точки */}
      <div className="flex gap-1 mt-6">
        {LOADING_STAGES.map((stage, i) => (
          <div
            key={i}
            className={`
              w-1.5 h-1.5 rounded-full transition-all duration-500
              ${progress >= stage.pct
                ? 'bg-gold-400'
                : 'bg-neutral-700'
              }
            `}
          />
        ))}
      </div>
    </div>
  );
}
