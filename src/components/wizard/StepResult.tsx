'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Country, Destination } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';
import { useTelegram } from '@/components/TelegramProvider';

interface StepResultProps {
  totalRUB: number;
  country: Country;
  destination: Destination;
  price: number;
  year: number;
  engineType: string;
  horsePower: number;
  onLeadRequest: () => void;
  onNewCalc: () => void;
}

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', KRW: '₩', AED: 'AED', CNY: '¥' };
const ENGINE_LABEL: Record<string, string> = { petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид' };

function formatRUB(n: number): string { return Math.round(n).toLocaleString('ru-RU'); }

function useCountUp(target: number, duration: number = 1400): number {
  const [value, setValue] = useState(0);
  const startRef = useRef<number>(0);
  const frameRef = useRef<number>(0);
  useEffect(() => {
    if (target <= 0) return;
    startRef.current = performance.now();
    const animate = (now: number) => {
      const p = Math.min((now - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration]);
  return value;
}

export function StepResult({
  totalRUB, country, destination, price, year, engineType, horsePower,
  onLeadRequest, onNewCalc,
}: StepResultProps) {
  const { haptic } = useTelegram();
  const animatedPrice = useCountUp(totalRUB, 1400);
  const [showContent, setShowContent] = useState(false);
  const currency = COUNTRY_CURRENCY[country];
  const symbol = CURRENCY_SYMBOL[currency];

  useEffect(() => {
    haptic?.notificationOccurred('success');
    const t = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(t);
  }, [haptic]);

  const handleLead = useCallback(() => { haptic?.impactOccurred('medium'); onLeadRequest(); }, [haptic, onLeadRequest]);
  const handleNewCalc = useCallback(() => { haptic?.impactOccurred('light'); onNewCalc(); }, [haptic, onNewCalc]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Price Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-6">
        {/* Route */}
        <div className="flex items-center gap-3 mb-4 animate-fade-in">
          <span className="text-[22px]">{COUNTRY_FLAG[country]}</span>
          <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
            <path d="M0 4H16M16 4L12 1M16 4L12 7" stroke="var(--gold-dim)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[22px]">{destination === 'RU' ? '🇷🇺' : '🇧🇾'}</span>
        </div>

        {/* Label */}
        <p className="label-gold mb-3 animate-fade-in tracking-[3px]">Итого</p>

        {/* THE PRICE — hero */}
        <div className="relative animate-count-up">
          {/* Multi-layer glow */}
          <div className="absolute inset-0 rounded-full" style={{
            filter: 'blur(60px)', transform: 'scale(2)',
            background: 'radial-gradient(circle, rgba(201,154,72,0.20) 0%, transparent 70%)',
          }} />
          <div className="absolute inset-0 rounded-full" style={{
            filter: 'blur(30px)', transform: 'scale(1.5)',
            background: 'radial-gradient(circle, rgba(217,165,78,0.12) 0%, transparent 70%)',
          }} />

          <h1 className="relative price-display text-center whitespace-nowrap">
            {formatRUB(animatedPrice)}
            <span style={{ fontSize: 28, color: 'var(--gold-sub)', marginLeft: 4 }}>₽</span>
          </h1>
        </div>

        <p className="text-[12px] mt-3 animate-fade-in" style={{ color: 'var(--txt-muted)' }}>
          стоимость «под ключ»
        </p>

        {/* Decorative gold particles */}
        <div className="flex items-center gap-[6px] mt-5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="rounded-full animate-gold-pulse" style={{
              width: `${2 + Math.sin(i * 1.1) * 1.5}px`,
              height: `${2 + Math.sin(i * 1.1) * 1.5}px`,
              background: 'var(--gold-warm)',
              opacity: 0.25 + Math.sin(i * 0.7) * 0.35,
              animationDelay: `${i * 250}ms`,
              boxShadow: '0 0 4px var(--glow-gold-dim)',
            }} />
          ))}
        </div>
      </div>

      {/* Bottom content */}
      <div className={`px-5 pb-5 space-y-4 transition-all duration-700 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Summary card */}
        <div className="card-3d" style={{ padding: 16 }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-medium" style={{ color: 'var(--txt-gold)' }}>Параметры расчёта</span>
            <span className="pill-3d" style={{ height: 20, fontSize: 9, padding: '0 8px' }}>
              {COUNTRY_NAME_RU[country]} → {destination === 'RU' ? 'Россия' : 'Беларусь'}
            </span>
          </div>
          <div className="divider-gold mb-3" />
          <div className="grid grid-cols-2 gap-y-3 gap-x-4">
            <InfoRow label="Цена авто" value={`${symbol}${price.toLocaleString('ru-RU')}`} />
            <InfoRow label="Год" value={String(year)} />
            <InfoRow label="Двигатель" value={ENGINE_LABEL[engineType] || engineType} />
            <InfoRow label="Мощность" value={`${horsePower} л.с.`} />
          </div>
        </div>

        {/* CTA */}
        <button className="cta-gold-bar" onClick={handleLead}>
          Оставить заявку 📩
        </button>

        <button className="btn-ghost-3d w-full" style={{ height: 44, fontSize: 13 }} onClick={handleNewCalc}>
          Рассчитать другой автомобиль
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px]" style={{ color: 'var(--txt-muted)' }}>{label}</p>
      <p className="text-[13px] font-medium" style={{ color: 'var(--txt-gold)', fontFamily: "'JetBrains Mono', monospace", fontWeight: 400 }}>
        {value}
      </p>
    </div>
  );
}
