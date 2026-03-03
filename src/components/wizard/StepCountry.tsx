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
        <div className="grid grid-cols-2 gap-3">
          {COUNTRIES.map((country) => {
            const meta = COUNTRY_META[country];
            return (
              <button
                key={country}
                onClick={() => { haptic?.impactOccurred('medium'); onSelect(country); }}
                className="card-3d text-left"
                style={{ padding: 0, cursor: 'pointer' }}
              >
                <div className="px-4 pt-5 pb-4">
                  {/* 3D Flag */}
                  <div className="mb-3" style={{
                    width: 48, height: 48,
                    fontSize: 36, lineHeight: '48px',
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.45)) drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
                  }}>
                    {COUNTRY_FLAG[country]}
                  </div>

                  {/* Title */}
                  <h3 className="text-[16px] mb-0.5" style={{
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
