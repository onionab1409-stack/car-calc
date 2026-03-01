'use client';

import React from 'react';
import type { Country } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU } from '@/types';
import { useTelegram } from '@/components/TelegramProvider';

/**
 * P6.2 · Экран выбора страны (первый шаг визарда)
 *
 * 4 карточки в сетке 2×2:
 *   🇺🇸 США    — аукционы Copart, IAAI
 *   🇰🇷 Корея  — новые и б/у
 *   🇦🇪 ОАЭ    — только новые
 *   🇨🇳 Китай  — новые авто
 *
 * Tap → haptic → onSelect(country)
 *
 * Референс: desing/ref-05-country-list.png
 */

interface StepCountryProps {
  onSelect: (country: Country) => void;
}

/** Мета-данные для каждой страны */
const COUNTRY_META: Record<Country, {
  subtitle: string;
  tags: string[];
  priceHint: string;
  /** SVG path для мини-карты региона (упрощённый контур) */
  mapPath: string;
  mapViewBox: string;
}> = {
  USA: {
    subtitle: 'Аукционы',
    tags: ['Copart', 'IAAI'],
    priceHint: '$10K – $80K',
    mapPath: 'M10,25 L15,12 L30,8 L55,10 L75,15 L85,22 L90,35 L80,45 L65,48 L50,50 L35,48 L20,42 L10,35Z M72,50 L80,48 L88,52 L85,58 L75,56Z',
    mapViewBox: '0 0 100 65',
  },
  Korea: {
    subtitle: 'Новые и б/у',
    tags: ['Encar', 'Дилеры'],
    priceHint: '₩15M – ₩80M',
    mapPath: 'M45,5 L55,8 L58,18 L62,30 L58,42 L52,55 L48,68 L42,78 L38,85 L35,80 L32,70 L30,58 L33,45 L38,32 L40,20 L42,12Z',
    mapViewBox: '0 0 100 90',
  },
  UAE: {
    subtitle: 'Только новые',
    tags: ['Дубай', 'Шарджа'],
    priceHint: 'AED 50K – 500K',
    mapPath: 'M15,35 L30,25 L50,20 L70,22 L85,30 L90,40 L88,50 L80,58 L65,62 L50,60 L35,55 L20,48 L12,42Z',
    mapViewBox: '0 0 100 80',
  },
  China: {
    subtitle: 'Новые авто',
    tags: ['Дилеры', 'Заводы'],
    priceHint: '¥100K – ¥500K',
    mapPath: 'M25,15 L40,8 L55,5 L70,8 L85,15 L92,25 L90,38 L85,50 L75,58 L65,62 L50,65 L35,60 L22,52 L15,42 L12,30 L18,20Z',
    mapViewBox: '0 0 100 70',
  },
};

const COUNTRIES: Country[] = ['USA', 'Korea', 'UAE', 'China'];

/** SVG мини-карта с золотыми точками */
function CountryMap({ country }: { country: Country }) {
  const meta = COUNTRY_META[country];

  return (
    <div className="relative w-full h-[90px] mb-3 overflow-hidden rounded-md bg-bg-elevated">
      <svg
        viewBox={meta.mapViewBox}
        className="absolute inset-0 w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Контур региона */}
        <path
          d={meta.mapPath}
          fill="rgba(196,162,101,0.06)"
          stroke="rgba(196,162,101,0.25)"
          strokeWidth="0.8"
        />
        {/* Золотые точки — «города»/«маршруты» */}
        <GoldDots mapPath={meta.mapPath} />
        {/* Сетка для эффекта карты */}
        <GridLines viewBox={meta.mapViewBox} />
      </svg>
      {/* Флаг поверх карты */}
      <div className="absolute top-2 right-2 text-2xl drop-shadow-lg">
        {COUNTRY_FLAG[country]}
      </div>
    </div>
  );
}

/** Золотые точки разных размеров внутри контура */
function GoldDots({ mapPath }: { mapPath: string }) {
  // Генерируем фиксированные точки по координатам из path
  // Парсим первые несколько точек из path
  const coords = mapPath
    .replace(/[A-Z]/g, ' ')
    .trim()
    .split(/\s+/)
    .reduce<Array<[number, number]>>((acc, val, i, arr) => {
      if (i % 2 === 0 && i + 1 < arr.length) {
        acc.push([parseFloat(val), parseFloat(arr[i + 1])]);
      }
      return acc;
    }, [])
    .slice(0, 6);

  return (
    <g>
      {coords.map(([x, y], i) => (
        <React.Fragment key={i}>
          {/* Свечение */}
          <circle cx={x} cy={y} r={3} fill="rgba(196,162,101,0.15)" />
          {/* Точка */}
          <circle
            cx={x}
            cy={y}
            r={i === 0 ? 1.5 : 0.9}
            fill={i === 0 ? '#C4A265' : 'rgba(196,162,101,0.6)'}
          />
        </React.Fragment>
      ))}
      {/* Соединяющие линии между первыми 3 точками */}
      {coords.length >= 3 && (
        <polyline
          points={coords.slice(0, 3).map(([x, y]) => `${x},${y}`).join(' ')}
          fill="none"
          stroke="rgba(196,162,101,0.12)"
          strokeWidth="0.4"
          strokeDasharray="2 2"
        />
      )}
    </g>
  );
}

/** Тонкая сетка — эффект карты / blueprint */
function GridLines({ viewBox }: { viewBox: string }) {
  const [, , w, h] = viewBox.split(' ').map(Number);
  const lines: React.ReactNode[] = [];
  const step = 10;

  for (let x = step; x < w; x += step) {
    lines.push(
      <line key={`v${x}`} x1={x} y1={0} x2={x} y2={h}
        stroke="rgba(196,162,101,0.04)" strokeWidth="0.3" />
    );
  }
  for (let y = step; y < h; y += step) {
    lines.push(
      <line key={`h${y}`} x1={0} y1={y} x2={w} y2={y}
        stroke="rgba(196,162,101,0.04)" strokeWidth="0.3" />
    );
  }

  return <g>{lines}</g>;
}

/** Иконка стрелки */
function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M3.75 9H14.25M14.25 9L9.75 4.5M14.25 9L9.75 13.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StepCountry({ onSelect }: StepCountryProps) {
  const { haptic } = useTelegram();

  const handleSelect = (country: Country) => {
    haptic?.impactOccurred('light');
    onSelect(country);
  };

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      {/* ─── Заголовок ─── */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-serif text-display text-gold-50 tracking-tight">
          Откуда везём?
        </h1>
        <p className="text-neutral-400 text-sm mt-1.5">
          Выберите страну отправления
        </p>
      </div>

      {/* ─── Прогресс ─── */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-1.5">
          <StepDot active />
          <StepDot />
          <StepDot />
          <StepDot />
          <span className="ml-auto text-xs text-neutral-500 font-mono">1 / 4</span>
        </div>
      </div>

      {/* ─── Сетка стран 2×2 ─── */}
      <div className="flex-1 px-5 pb-5">
        <div className="grid grid-cols-2 gap-3">
          {COUNTRIES.map((country) => {
            const meta = COUNTRY_META[country];
            return (
              <button
                key={country}
                onClick={() => handleSelect(country)}
                className="
                  group relative text-left
                  bg-bg-card rounded-lg border border-[rgba(196,162,101,0.14)]
                  transition-all duration-250 ease-out
                  hover:border-[rgba(196,162,101,0.30)]
                  hover:shadow-gold hover:-translate-y-0.5
                  active:translate-y-0 active:scale-[0.97]
                  focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-gold-400 focus-visible:ring-offset-2
                  focus-visible:ring-offset-bg-app
                  overflow-hidden
                "
              >
                {/* Карта региона */}
                <CountryMap country={country} />

                {/* Контент */}
                <div className="px-3 pb-3">
                  {/* Название страны */}
                  <h3 className="font-serif text-lg text-gold-100 mb-0.5">
                    {COUNTRY_NAME_RU[country]}
                  </h3>

                  {/* Подзаголовок */}
                  <p className="text-xs text-neutral-400 mb-2.5">
                    {meta.subtitle}
                  </p>

                  {/* Теги */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {meta.tags.map((tag) => (
                      <span
                        key={tag}
                        className="
                          inline-flex items-center text-[10px] font-medium
                          text-gold-300 bg-[rgba(196,162,101,0.08)]
                          border border-[rgba(196,162,101,0.06)]
                          rounded-full px-2 py-0.5
                        "
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Нижняя строка: диапазон цен + стрелка */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-neutral-500">
                      {meta.priceHint}
                    </span>
                    <div className="
                      w-7 h-7 rounded-full flex items-center justify-center
                      bg-[rgba(196,162,101,0.10)] text-gold-400
                      group-hover:bg-gold-400 group-hover:text-[#1A1208]
                      transition-all duration-250
                    ">
                      <ArrowIcon />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Нижняя панель с подсказкой ─── */}
      <div className="px-5 pb-6 safe-bottom">
        <div className="
          flex items-center gap-3 p-3
          rounded-lg bg-bg-elevated
          border border-[rgba(196,162,101,0.06)]
        ">
          <div className="text-lg">💡</div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Стоимость включает доставку, таможню и все сборы. Вы получите итоговую цену «под ключ».
          </p>
        </div>
      </div>
    </div>
  );
}

/** Точка прогресса */
function StepDot({ active = false }: { active?: boolean }) {
  return (
    <div
      className={`
        h-1.5 rounded-full transition-all duration-300
        ${active
          ? 'w-6 bg-gold-400'
          : 'w-1.5 bg-neutral-700'
        }
      `}
    />
  );
}
