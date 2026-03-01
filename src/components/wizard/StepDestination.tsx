'use client';

import React, { useState, useCallback } from 'react';
import type { Country, Destination } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';
import { Button } from '@/components/ui';
import { useTelegram } from '@/components/TelegramProvider';

/**
 * P6.4 · Экран выбора направления (третий шаг визарда)
 *
 * 2 карточки: 🇷🇺 Россия / 🇧🇾 Беларусь
 * Золотое свечение на выбранной
 * CTA «Рассчитать» внизу
 *
 * Референс: desing/ref-06-destination.png
 */

interface StepDestinationProps {
  country: Country;
  price: number;
  year: number;
  horsePower: number;
  engineType: string;
  onSubmit: (destination: Destination) => void;
  onBack: () => void;
}

/** Мета-данные направлений */
const DEST_META: Record<Destination, {
  flag: string;
  name: string;
  description: string;
  route: string;
  badge: string;
}> = {
  RU: {
    flag: '🇷🇺',
    name: 'Россия',
    description: 'Москва, Владивосток, Новороссийск',
    route: 'Таможня РФ · полная растаможка',
    badge: 'РФ',
  },
  BY: {
    flag: '🇧🇾',
    name: 'Беларусь',
    description: 'Минск, Брест',
    route: 'Таможня ЕАЭС · через РБ',
    badge: 'РБ',
  },
};

const DESTINATIONS: Destination[] = ['RU', 'BY'];

/** Символы валют */
const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$', KRW: '₩', AED: 'AED', CNY: '¥',
};

export function StepDestination({
  country, price, year, horsePower, engineType,
  onSubmit, onBack,
}: StepDestinationProps) {
  const { haptic } = useTelegram();
  const [selected, setSelected] = useState<Destination | null>(null);

  const currency = COUNTRY_CURRENCY[country];
  const symbol = CURRENCY_SYMBOL[currency];

  const handleSelect = useCallback((dest: Destination) => {
    haptic?.selectionChanged();
    setSelected(dest);
  }, [haptic]);

  const handleSubmit = useCallback(() => {
    if (!selected) {
      haptic?.notificationOccurred('error');
      return;
    }
    haptic?.impactOccurred('heavy');
    onSubmit(selected);
  }, [selected, haptic, onSubmit]);

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      {/* ─── Заголовок ─── */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={onBack}
            className="text-neutral-500 hover:text-gold-400 transition-colors text-sm"
            aria-label="Назад"
          >
            ← Назад
          </button>
        </div>
        <h1 className="font-serif text-2xl text-gold-50 tracking-tight">
          Куда доставляем?
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Выберите страну назначения
        </p>
      </div>

      {/* ─── Прогресс ─── */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-1.5">
          <StepDot done />
          <StepDot done />
          <StepDot active />
          <StepDot />
          <span className="ml-auto text-xs text-neutral-500 font-mono">3 / 4</span>
        </div>
      </div>

      {/* ─── Сводка выбранного авто ─── */}
      <div className="px-5 pb-4">
        <div className="
          flex items-center gap-3 p-3 rounded-lg
          bg-bg-elevated border border-[rgba(196,162,101,0.06)]
        ">
          <span className="text-xl">{COUNTRY_FLAG[country]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gold-100 font-medium truncate">
              {COUNTRY_NAME_RU[country]} · {symbol}{price.toLocaleString('ru-RU')}
            </p>
            <p className="text-xs text-neutral-500">
              {year} · {engineTypeLabel(engineType)} · {horsePower} л.с.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Карточки направлений ─── */}
      <div className="flex-1 px-5 pb-4 space-y-3">
        {DESTINATIONS.map((dest) => {
          const meta = DEST_META[dest];
          const isSelected = selected === dest;

          return (
            <button
              key={dest}
              onClick={() => handleSelect(dest)}
              className={`
                w-full text-left rounded-lg p-4
                border-2 transition-all duration-300 ease-out
                ${isSelected
                  ? 'border-gold-400 bg-[rgba(196,162,101,0.06)] shadow-gold-lg'
                  : 'border-[rgba(196,162,101,0.10)] bg-bg-card hover:border-[rgba(196,162,101,0.25)] hover:shadow-gold'
                }
              `}
            >
              <div className="flex items-center gap-4">
                {/* Флаг */}
                <div className={`
                  text-5xl flex-shrink-0
                  transition-transform duration-300
                  ${isSelected ? 'scale-110' : ''}
                `}>
                  {meta.flag}
                </div>

                {/* Контент */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`
                      font-serif text-xl
                      ${isSelected ? 'text-gold-50' : 'text-gold-200'}
                    `}>
                      {meta.name}
                    </h3>
                    <span className={`
                      text-[10px] font-bold px-2 py-0.5 rounded-full
                      ${isSelected
                        ? 'bg-gold-400 text-[#1A1208]'
                        : 'bg-[rgba(196,162,101,0.12)] text-gold-400'
                      }
                    `}>
                      {meta.badge}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-400 mb-1.5">
                    {meta.description}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {meta.route}
                  </p>
                </div>

                {/* Чекмарк */}
                <div className={`
                  w-6 h-6 rounded-full flex-shrink-0
                  flex items-center justify-center
                  border-2 transition-all duration-300
                  ${isSelected
                    ? 'border-gold-400 bg-gold-400'
                    : 'border-neutral-700 bg-transparent'
                  }
                `}>
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6L5 8.5L9.5 4"
                        stroke="#1A1208"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── Подсказка ─── */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-elevated border border-[rgba(196,162,101,0.06)]">
          <div className="text-lg">💡</div>
          <p className="text-xs text-neutral-400 leading-relaxed">
            {selected === 'BY'
              ? 'Через Беларусь — таможенная ставка ×1.30 (ниже чем РФ). Фиксированные расходы отличаются.'
              : 'Россия — прямая растаможка, ставка ×1.48. Доставка до вашего города включена.'
            }
          </p>
        </div>
      </div>

      {/* ─── Кнопка «Рассчитать» ─── */}
      <div className="px-5 pb-5 pt-1 safe-bottom">
        <Button
          onClick={handleSubmit}
          disabled={!selected}
        >
          Рассчитать стоимость →
        </Button>
      </div>
    </div>
  );
}

/** Лейбл типа двигателя */
function engineTypeLabel(type: string): string {
  const map: Record<string, string> = {
    petrol: 'Бензин',
    diesel: 'Дизель',
    electric: 'Электро',
    hybrid: 'Гибрид',
  };
  return map[type] || type;
}

/** Точка прогресса */
function StepDot({ active = false, done = false }: { active?: boolean; done?: boolean }) {
  return (
    <div
      className={`
        h-1.5 rounded-full transition-all duration-300
        ${active
          ? 'w-6 bg-gold-400'
          : done
            ? 'w-1.5 bg-gold-500'
            : 'w-1.5 bg-neutral-700'
        }
      `}
    />
  );
}
