'use client';

import React, { useState, useCallback } from 'react';
import type { Country, Destination } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';
import { useTelegram } from '@/components/TelegramProvider';

interface StepDestinationProps {
  country: Country;
  price: number;
  year: number;
  horsePower: number;
  engineType: string;
  onSubmit: (destination: Destination) => void;
  onBack: () => void;
}

const DEST_META: Record<Destination, {
  flag: string; name: string; description: string; route: string; badge: string;
}> = {
  RU: { flag: '🇷🇺', name: 'Россия', description: 'Москва, Владивосток, Новороссийск', route: 'Таможня РФ · полная растаможка', badge: 'РФ' },
  BY: { flag: '🇧🇾', name: 'Беларусь', description: 'Минск, Брест', route: 'Таможня ЕАЭС · через РБ', badge: 'РБ' },
};

const DESTINATIONS: Destination[] = ['RU', 'BY'];
const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', KRW: '₩', AED: 'AED', CNY: '¥' };

function engineTypeLabel(type: string): string {
  return { petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид' }[type] || type;
}

export function StepDestination({
  country, price, year, horsePower, engineType, onSubmit, onBack,
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
    if (!selected) { haptic?.notificationOccurred('error'); return; }
    haptic?.impactOccurred('heavy');
    onSubmit(selected);
  }, [selected, haptic, onSubmit]);

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-5 pb-2">
        <button onClick={onBack} className="btn-ghost-3d mb-3" style={{ height: 32, fontSize: 12, padding: '0 12px' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: 4 }}>
            <path d="M8.5 3L4.5 7L8.5 11" stroke="var(--gold-warm)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Назад
        </button>
        <h1 className="text-[26px] tracking-tight" style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--gold-bright)',
        }}>
          Куда доставляем?
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--txt-muted)' }}>Выберите страну назначения</p>
      </div>

      {/* Progress */}
      <div className="px-5 pb-4 flex items-center gap-[6px]">
        <div className="dot-3d dot-3d-done" />
        <div className="dot-3d dot-3d-done" />
        <div className="dot-3d dot-3d-active" />
        <div className="dot-3d" />
        <span className="ml-auto text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--txt-dim)' }}>3 / 4</span>
      </div>

      {/* Summary */}
      <div className="px-5 pb-4">
        <div className="info-bar" style={{ gap: 10 }}>
          <span className="text-[18px]">{COUNTRY_FLAG[country]}</span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium truncate" style={{ color: 'var(--txt-gold)' }}>
              {COUNTRY_NAME_RU[country]} · {symbol}{price.toLocaleString('ru-RU')}
            </p>
            <p className="text-[11px]" style={{ color: 'var(--txt-muted)' }}>
              {year} · {engineTypeLabel(engineType)} · {horsePower} л.с.
            </p>
          </div>
        </div>
      </div>

      {/* Destination Cards */}
      <div className="flex-1 px-5 pb-4 space-y-3">
        {DESTINATIONS.map((dest) => {
          const meta = DEST_META[dest];
          const isSelected = selected === dest;
          return (
            <button
              key={dest}
              onClick={() => handleSelect(dest)}
              className={`card-3d w-full text-left ${isSelected ? 'card-3d-selected' : ''}`}
              style={{ padding: '16px 16px' }}
            >
              <div className="flex items-center gap-4">
                <div className={`text-[44px] flex-shrink-0 transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
                  {meta.flag}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-[18px]" style={{
                      fontFamily: "'Playfair Display', serif", fontWeight: 500,
                      color: isSelected ? 'var(--gold-bright)' : 'var(--txt-primary)',
                    }}>
                      {meta.name}
                    </h3>
                    <span className={isSelected ? 'pill-3d' : 'pill-3d-dark'} style={{ fontSize: 9, height: 20, padding: '0 8px' }}>
                      {meta.badge}
                    </span>
                  </div>
                  <p className="text-[12px] mb-1" style={{ color: 'var(--txt-secondary)' }}>{meta.description}</p>
                  <p className="text-[11px]" style={{ color: 'var(--txt-muted)' }}>{meta.route}</p>
                </div>
                {/* Checkmark */}
                <div className={`check-3d flex-shrink-0 ${isSelected ? 'check-3d-active' : ''}`}>
                  {isSelected && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7L5.5 9.5L11 4" stroke="var(--txt-on-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Hint */}
      <div className="px-5 pb-3">
        <div className="info-bar" style={{ gap: 8 }}>
          <span className="text-[13px]">💡</span>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--txt-secondary)' }}>
            {selected === 'BY'
              ? 'Через Беларусь — ставка ×1.30 (ниже РФ). Фиксы отличаются.'
              : 'Россия — прямая растаможка ×1.48. Доставка до города включена.'}
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-1 safe-bottom">
        <button
          className="cta-gold-bar"
          onClick={handleSubmit}
          disabled={!selected}
        >
          Рассчитать стоимость →
        </button>
      </div>
    </div>
  );
}
