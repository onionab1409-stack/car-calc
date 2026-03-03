'use client';

import React from 'react';
import type { Country } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';
import { useTelegram } from '@/components/TelegramProvider';

interface StepCountryProps {
  onSelect: (country: Country) => void;
}

const COUNTRIES: Country[] = ['USA', 'Korea', 'UAE', 'China'];

const COUNTRY_META: Record<Country, { tags: string[]; desc: string }> = {
  USA:   { tags: ['Copart', 'IAAI'], desc: 'Аукционы США' },
  Korea: { tags: ['Encar', 'SK'], desc: 'Южная Корея' },
  UAE:   { tags: ['Новые авто'], desc: 'Дубай, ОАЭ' },
  China: { tags: ['BYD', 'Li Auto'], desc: 'Китайский рынок' },
};

export function StepCountry({ onSelect }: StepCountryProps) {
  const { haptic } = useTelegram();

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-[28px] tracking-tight" style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--gold-bright)',
        }}>
          Откуда везём?
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--txt-muted)' }}>
          Выберите страну для расчёта
        </p>
      </div>

      {/* Country Grid */}
      <div className="flex-1 px-5 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {COUNTRIES.map((country) => {
            const meta = COUNTRY_META[country];
            return (
              <button
                key={country}
                onClick={() => { haptic?.impactOccurred('medium'); onSelect(country); }}
                className="card-3d text-left relative overflow-hidden"
                style={{ padding: 0, cursor: 'pointer', minHeight: 220 }}
              >
                {/* 3D Flag — top right, big, decorative */}
                <div className="absolute" style={{
                  top: 10, right: 10,
                  fontSize: 72, lineHeight: 1,
                  filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5)) drop-shadow(0 3px 4px rgba(0,0,0,0.35))',
                  opacity: 0.85,
                  pointerEvents: 'none',
                }}>
                  {COUNTRY_FLAG[country]}
                </div>

                <div className="relative px-4 pt-5 pb-4 flex flex-col justify-end" style={{ minHeight: 220 }}>
                  {/* Title */}
                  <h3 className="text-[17px] mb-0.5" style={{
                    fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--txt-primary)',
                  }}>
                    {COUNTRY_NAME_RU[country]}
                  </h3>
                  <p className="text-[11px] mb-3" style={{ color: 'var(--txt-muted)' }}>{meta.desc}</p>

                  {/* Tags + Arrow */}
                  <div className="flex items-center gap-1.5">
                    {meta.tags.map(t => (
                      <span key={t} className="pill-3d-dark" style={{ height: 20, fontSize: 9, padding: '0 7px' }}>{t}</span>
                    ))}
                    <div className="ml-auto icon-btn-3d" style={{ width: 30, height: 30, borderRadius: 8 }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M4.5 2.5L8 6L4.5 9.5" stroke="var(--gold-warm)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="px-5 pb-5 safe-bottom">
        <div className="info-bar" style={{ gap: 10 }}>
          <span className="text-[13px]">🚗</span>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--txt-secondary)' }}>
            Рассчитаем полную стоимость «под ключ» — с доставкой и растаможкой
          </p>
        </div>
      </div>
    </div>
  );
}
