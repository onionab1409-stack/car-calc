'use client';

import React, { useCallback } from 'react';
import type { Country, Destination } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';
import { Button } from '@/components/ui';
import { useTelegram } from '@/components/TelegramProvider';
import type { HistoryEntry } from './useHistory';

/**
 * P6.7 · Экран истории расчётов
 *
 * Список карточек из localStorage (макс 20)
 * Клик → повторный расчёт с теми же параметрами
 * Свайп/кнопка → удалить
 *
 * Референс: ref-18-history.png
 */

interface StepHistoryProps {
  entries: HistoryEntry[];
  onSelectEntry: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
  onRemoveEntry: (id: string) => void;
  onBack: () => void;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$', KRW: '₩', AED: 'AED', CNY: '¥',
};

const ENGINE_EMOJI: Record<string, string> = {
  petrol: '⛽', diesel: '🛢️', electric: '⚡', hybrid: '🔋',
};

/** Форматирование даты: "28 фев, 14:30" */
function formatDate(ts: number): string {
  const d = new Date(ts);
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const day = d.getDate();
  const month = months[d.getMonth()];
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  return `${day} ${month}, ${hours}:${mins}`;
}

/** Форматирование рублей: "3 972 193" */
function formatRUB(n: number): string {
  return Math.round(n).toLocaleString('ru-RU');
}

/** Краткая цена: "3.97М" */
function formatShort(n: number): string {
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'М';
  }
  if (n >= 1_000) {
    return Math.round(n / 1_000) + 'К';
  }
  return String(Math.round(n));
}

export function StepHistory({
  entries, onSelectEntry, onClearHistory, onRemoveEntry, onBack,
}: StepHistoryProps) {
  const { haptic } = useTelegram();

  const handleSelect = useCallback((entry: HistoryEntry) => {
    haptic?.impactOccurred('light');
    onSelectEntry(entry);
  }, [haptic, onSelectEntry]);

  const handleRemove = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    haptic?.impactOccurred('medium');
    onRemoveEntry(id);
  }, [haptic, onRemoveEntry]);

  const handleClear = useCallback(() => {
    haptic?.notificationOccurred('warning');
    onClearHistory();
  }, [haptic, onClearHistory]);

  // ─── Пустая история ───
  if (entries.length === 0) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-6 animate-fade-in">
        <div className="text-5xl mb-4 opacity-30">📋</div>
        <h2 className="font-serif text-xl text-gold-100 mb-2">История пуста</h2>
        <p className="text-sm text-neutral-500 text-center mb-8 max-w-[260px]">
          Здесь будут сохраняться ваши расчёты — до 20 последних
        </p>
        <Button onClick={onBack}>
          Рассчитать стоимость
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      {/* Заголовок */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={onBack}
            className="text-neutral-500 hover:text-gold-400 transition-colors text-sm"
          >
            ← Назад
          </button>
          {entries.length > 1 && (
            <button
              onClick={handleClear}
              className="text-xs text-neutral-600 hover:text-error transition-colors"
            >
              Очистить
            </button>
          )}
        </div>
        <h1 className="font-serif text-2xl text-gold-50 tracking-tight">
          История расчётов
        </h1>
        <p className="text-neutral-500 text-sm mt-0.5">
          {entries.length} из 20 · нажмите для повторного расчёта
        </p>
      </div>

      {/* Статистика */}
      <div className="px-5 pb-3">
        <div className="flex gap-3">
          <StatBadge
            label="Расчётов"
            value={String(entries.length)}
          />
          <StatBadge
            label="Средняя цена"
            value={`${formatShort(entries.reduce((s, e) => s + e.totalRUB, 0) / entries.length)}₽`}
          />
          <StatBadge
            label="Стран"
            value={String(new Set(entries.map(e => e.country)).size)}
          />
        </div>
      </div>

      {/* Список */}
      <div className="flex-1 px-5 pb-5 space-y-2.5 overflow-y-auto">
        {entries.map((entry) => {
          const currency = COUNTRY_CURRENCY[entry.country];
          const symbol = CURRENCY_SYMBOL[currency];

          return (
            <div
              key={entry.id}
              onClick={() => handleSelect(entry)}
              className="
                bg-bg-card rounded-lg border border-[rgba(196,162,101,0.08)]
                p-3.5 cursor-pointer group
                hover:border-[rgba(196,162,101,0.20)]
                hover:bg-bg-cardHover
                transition-all duration-200
                active:scale-[0.98]
              "
            >
              <div className="flex items-start justify-between">
                {/* Левая часть: флаги + инфо */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Флаг */}
                  <div className="text-xl leading-none pt-0.5">
                    {COUNTRY_FLAG[entry.country]}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Маршрут + дата */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gold-200 font-medium">
                        {COUNTRY_NAME_RU[entry.country]}
                      </span>
                      <span className="text-neutral-600 text-xs">→</span>
                      <span className="text-xs text-neutral-400">
                        {entry.destination === 'RU' ? '🇷🇺 РФ' : '🇧🇾 РБ'}
                      </span>
                    </div>

                    {/* Параметры */}
                    <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                      <span>{symbol}{entry.price.toLocaleString('ru-RU')}</span>
                      <span>·</span>
                      <span>{entry.year}</span>
                      <span>·</span>
                      <span>{ENGINE_EMOJI[entry.engineType]} {entry.horsePower}лс</span>
                    </div>

                    {/* Дата */}
                    <div className="text-[10px] text-neutral-600 mt-1">
                      {formatDate(entry.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Правая часть: цена + удалить */}
                <div className="flex items-start gap-2 ml-2">
                  <div className="text-right">
                    <div className="font-serif text-lg text-gold-100 leading-tight">
                      {formatShort(entry.totalRUB)}
                      <span className="text-gold-400 text-xs">₽</span>
                    </div>
                  </div>

                  {/* Кнопка удаления */}
                  <button
                    onClick={(e) => handleRemove(e, entry.id)}
                    className="
                      opacity-0 group-hover:opacity-100
                      text-neutral-600 hover:text-error
                      transition-all duration-200
                      p-1 -mr-1 -mt-0.5
                    "
                    aria-label="Удалить"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Мини-бейдж статистики */
function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="
      flex-1 bg-bg-card rounded-lg border border-[rgba(196,162,101,0.06)]
      px-3 py-2 text-center
    ">
      <div className="text-sm font-serif text-gold-200">{value}</div>
      <div className="text-[10px] text-neutral-600 mt-0.5">{label}</div>
    </div>
  );
}
