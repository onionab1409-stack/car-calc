'use client';

import React, { useMemo } from 'react';
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

function CountryMap({ country }: { country: Country }) {
  const paths: Record<Country, string> = {
    USA: 'M8 28 Q12 22 18 24 Q24 20 32 22 L38 18 Q42 16 48 18 L52 22 Q48 26 44 28 Q38 30 32 28 Z',
    Korea: 'M28 16 Q30 14 32 16 Q34 18 33 22 Q32 26 30 28 Q28 26 27 22 Q26 18 28 16 Z',
    UAE: 'M24 22 L32 20 Q36 20 38 22 L40 26 Q38 28 34 28 L28 28 Q24 26 24 22 Z',
    China: 'M18 16 Q22 12 28 14 Q34 12 38 16 L42 22 Q40 28 36 30 Q30 32 24 30 Q18 28 16 24 Q14 20 18 16 Z',
  };
  return (
    <svg viewBox="0 0 56 44" className="w-full h-full" style={{ opacity: 0.35 }}>
      <defs>
        <radialGradient id={`glow-${country}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--gold-warm)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--gold-warm)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d={paths[country]} fill="none" stroke="var(--gold-dim)" strokeWidth="0.5" opacity="0.6" />
      <circle cx="30" cy="22" r="8" fill={`url(#glow-${country})`} />
      {[...Array(5)].map((_, i) => (
        <circle key={i} cx={22 + i * 4 + Math.random() * 3} cy={18 + Math.random() * 8}
          r="0.8" fill="var(--gold-warm)" opacity={0.3 + Math.random() * 0.5} />
      ))}
    </svg>
  );
}

export function StepCountry({ onSelect }: StepCountryProps) {
  const { haptic } = useTelegram();
  const mapMemo = useMemo(() => COUNTRIES.map(c => <CountryMap key={c} country={c} />), []);

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

      {/* Progress */}
      <div className="px-5 pb-4 flex items-center gap-[6px]">
        <div className="dot-3d dot-3d-active" />
        <div className="dot-3d" />
        <div className="dot-3d" />
        <div className="dot-3d" />
        <span className="ml-auto text-[11px]" style={{
          fontFamily: "'JetBrains Mono', monospace", color: 'var(--txt-dim)',
        }}>1 / 4</span>
      </div>

      {/* Country Grid */}
      <div className="flex-1 px-5 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {COUNTRIES.map((country, idx) => {
            const meta = COUNTRY_META[country];
            return (
              <button
                key={country}
                onClick={() => { haptic?.impactOccurred('medium'); onSelect(country); }}
                className="card-3d text-left"
                style={{ padding: 0, cursor: 'pointer' }}
              >
                {/* Map area */}
                <div className="relative h-[80px] overflow-hidden rounded-t-[15px]" style={{
                  background: 'linear-gradient(170deg, rgba(184,147,63,0.04) 0%, transparent 60%)',
                }}>
                  <div className="absolute inset-0 flex items-center justify-center p-3">
                    {mapMemo[idx]}
                  </div>
                  {/* Flag */}
                  <div className="absolute top-2 right-2 text-[20px]">{COUNTRY_FLAG[country]}</div>
                </div>

                {/* Content */}
                <div className="px-3 pb-3 pt-2">
                  <h3 className="text-[15px] mb-1" style={{
                    fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--txt-primary)',
                  }}>
                    {COUNTRY_NAME_RU[country]}
                  </h3>
                  <p className="text-[10px] mb-2" style={{ color: 'var(--txt-muted)' }}>{meta.desc}</p>

                  {/* Tags + Arrow */}
                  <div className="flex items-center gap-1.5">
                    {meta.tags.map(t => (
                      <span key={t} className="pill-3d-dark" style={{ height: 18, fontSize: 8, padding: '0 6px' }}>{t}</span>
                    ))}
                    <div className="ml-auto icon-btn-3d" style={{ width: 28, height: 28, borderRadius: 8 }}>
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
