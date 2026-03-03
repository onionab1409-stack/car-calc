'use client';

import React, { useCallback } from 'react';
import type { Country, Destination } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';
import { useTelegram } from '@/components/TelegramProvider';
import type { HistoryEntry } from './useHistory';

/**
 * P6.7 · Экран истории расчётов — OBSIDIAN GOLD FORGE
 *
 * Список карточек из localStorage (макс 20)
 * Клик → повторный расчёт с теми же параметрами
 * Свайп/кнопка → удалить
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
      <div className="flex flex-col min-h-screen items-center justify-center p-6"
        style={{ animation: 'fadeIn 400ms ease' }}>
        {/* Empty icon */}
        <div className="icon-btn-3d" style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 20 }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
              stroke="var(--gold-dim)" strokeWidth="1.5" strokeLinecap="round" />
            <rect x="9" y="3" width="6" height="4" rx="1"
              stroke="var(--gold-dim)" strokeWidth="1.5" />
          </svg>
        </div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 500,
          fontSize: 22, color: 'var(--gold-bright)', marginBottom: 8,
        }}>
          История пуста
        </h2>
        <p style={{
          fontSize: 13, color: 'var(--txt-muted)', textAlign: 'center',
          maxWidth: 260, marginBottom: 32, lineHeight: 1.5,
        }}>
          Здесь будут сохраняться ваши расчёты — до 20 последних
        </p>
        <button onClick={onBack} className="btn-gold-3d">
          Рассчитать стоимость
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ animation: 'fadeIn 400ms ease' }}>
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center justify-between mb-1">
          <button onClick={onBack} className="btn-ghost-3d" style={{ height: 32, padding: '0 12px', fontSize: 12 }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: 4 }}>
              <path d="M7.5 2.5L4 6L7.5 9.5" stroke="var(--gold-warm)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Назад
          </button>
          {entries.length > 1 && (
            <button onClick={handleClear} className="btn-ghost-3d"
              style={{ height: 32, padding: '0 12px', fontSize: 11, color: 'var(--txt-muted)' }}>
              Очистить
            </button>
          )}
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 500,
          fontSize: 28, color: 'var(--gold-bright)', letterSpacing: '-0.02em', marginTop: 8,
        }}>
          История расчётов
        </h1>
        <p style={{ fontSize: 13, color: 'var(--txt-muted)', marginTop: 4 }}>
          {entries.length} из 20 · нажмите для повторного расчёта
        </p>
      </div>

      {/* Stats bar */}
      <div className="px-5 pb-4">
        <div className="grid grid-cols-3 gap-2">
          <StatBadge label="Расчётов" value={String(entries.length)} />
          <StatBadge
            label="Средняя"
            value={`${formatShort(entries.reduce((s, e) => s + e.totalRUB, 0) / entries.length)}₽`}
          />
          <StatBadge
            label="Стран"
            value={String(new Set(entries.map(e => e.country)).size)}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="px-5 pb-3">
        <hr className="divider-gold" />
      </div>

      {/* List */}
      <div className="flex-1 px-5 pb-5 space-y-2.5 overflow-y-auto scrollbar-none safe-bottom">
        {entries.map((entry, index) => {
          const currency = COUNTRY_CURRENCY[entry.country];
          const symbol = CURRENCY_SYMBOL[currency];

          return (
            <div
              key={entry.id}
              onClick={() => handleSelect(entry)}
              className="card-3d group"
              style={{
                padding: '14px 16px', cursor: 'pointer',
                animationDelay: `${index * 60}ms`,
                animation: 'slideUp 400ms ease backwards',
              }}
            >
              <div className="flex items-start justify-between">
                {/* Left: flag + info */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Flag circle */}
                  <div className="icon-btn-3d flex-shrink-0" style={{ width: 40, height: 40, borderRadius: 12 }}>
                    <span style={{ fontSize: 18 }}>{COUNTRY_FLAG[entry.country]}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Route */}
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{
                        fontFamily: "'Playfair Display', serif", fontWeight: 500,
                        fontSize: 14, color: 'var(--txt-primary)',
                      }}>
                        {COUNTRY_NAME_RU[entry.country]}
                      </span>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5H8M6 3L8 5L6 7" stroke="var(--gold-dim)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ fontSize: 12, color: 'var(--txt-secondary)' }}>
                        {entry.destination === 'RU' ? '🇷🇺 РФ' : '🇧🇾 РБ'}
                      </span>
                    </div>

                    {/* Params as pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="pill-3d-dark" style={{ height: 20, fontSize: 9, padding: '0 7px' }}>
                        {symbol}{entry.price.toLocaleString('ru-RU')}
                      </span>
                      <span className="pill-3d-dark" style={{ height: 20, fontSize: 9, padding: '0 7px' }}>
                        {entry.year}
                      </span>
                      <span className="pill-3d-dark" style={{ height: 20, fontSize: 9, padding: '0 7px' }}>
                        {entry.horsePower} л.с.
                      </span>
                    </div>

                    {/* Date */}
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10, color: 'var(--txt-dim)', marginTop: 6,
                    }}>
                      {formatDate(entry.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Right: price + delete */}
                <div className="flex flex-col items-end gap-2 ml-3 flex-shrink-0">
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
                      fontSize: 18, color: 'var(--gold-bright)', lineHeight: 1,
                    }}>
                      {formatShort(entry.totalRUB)}
                      <span style={{ fontSize: 11, color: 'var(--gold-sub)', marginLeft: 2 }}>₽</span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleRemove(e, entry.id)}
                    className="icon-btn-3d"
                    style={{ width: 28, height: 28, borderRadius: 8 }}
                    aria-label="Удалить"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M3 3L9 9M9 3L3 9" stroke="var(--gold-dim)" strokeWidth="1.2" strokeLinecap="round" />
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

/** Мини-бейдж статистики — info-bar variant */
function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="info-bar" style={{
      flexDirection: 'column', alignItems: 'center',
      padding: '10px 8px', gap: 2,
    }}>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
        fontSize: 14, color: 'var(--gold-bright)',
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 9, color: 'var(--txt-muted)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        {label}
      </div>
    </div>
  );
}
