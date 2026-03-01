'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Country, Destination } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';
import { Button } from '@/components/ui';
import { useTelegram } from '@/components/TelegramProvider';

/**
 * P6.5 · Экран результата — ОДНА ЦИФРА
 *
 * - Огромная цена (Playfair Display, gold glow)
 * - Count-up анимация
 * - Сводка параметров
 * - CTA «Оставить заявку»
 * - Кнопка «Рассчитать другой»
 *
 * КЛИЕНТ ВИДИТ ТОЛЬКО ИТОГОВУЮ ЦЕНУ. Никакого breakdown.
 *
 * Референсы: ref-12-result-minimal.png, ref-13-result-gradient.png
 */

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

/** Символы валют */
const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$', KRW: '₩', AED: 'AED', CNY: '¥',
};

/** Тип двигателя на русском */
const ENGINE_LABEL: Record<string, string> = {
  petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид',
};

/** Форматирование рублей с пробелами */
function formatRUB(n: number): string {
  return Math.round(n).toLocaleString('ru-RU');
}

/** Хук count-up анимации */
function useCountUp(target: number, duration: number = 1200): number {
  const [value, setValue] = useState(0);
  const startTimeRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target <= 0) return;

    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
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

  // Показываем контент с задержкой для эффекта
  useEffect(() => {
    haptic?.notificationOccurred('success');
    const t = setTimeout(() => setShowContent(true), 800);
    return () => clearTimeout(t);
  }, [haptic]);

  const handleLead = useCallback(() => {
    haptic?.impactOccurred('medium');
    onLeadRequest();
  }, [haptic, onLeadRequest]);

  const handleNewCalc = useCallback(() => {
    haptic?.impactOccurred('light');
    onNewCalc();
  }, [haptic, onNewCalc]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ─── Верхняя часть: цена ─── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-10 pb-6">
        {/* Маршрут */}
        <div className="flex items-center gap-2 mb-4 animate-fade-in">
          <span className="text-xl">{COUNTRY_FLAG[country]}</span>
          <span className="text-neutral-500 text-sm">→</span>
          <span className="text-xl">{destination === 'RU' ? '🇷🇺' : '🇧🇾'}</span>
        </div>

        {/* Лейбл */}
        <p className="text-sm text-neutral-400 mb-2 animate-fade-in tracking-widest uppercase">
          Итого
        </p>

        {/* ГЛАВНАЯ ЦЕНА */}
        <div className="relative animate-count-up">
          {/* Свечение за ценой */}
          <div className="absolute inset-0 blur-[60px] bg-[rgba(196,162,101,0.15)] rounded-full scale-150" />

          <h1 className="relative price-display text-center whitespace-nowrap">
            {formatRUB(animatedPrice)}
            <span className="text-gold-300 text-[28px] ml-1">₽</span>
          </h1>
        </div>

        {/* Подпись */}
        <p className="text-xs text-neutral-500 mt-3 animate-fade-in">
          стоимость «под ключ»
        </p>

        {/* Золотые частицы-точки */}
        <div className="flex items-center gap-1 mt-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="rounded-full bg-gold-400 animate-gold-pulse"
              style={{
                width: `${2 + Math.sin(i * 1.2) * 2}px`,
                height: `${2 + Math.sin(i * 1.2) * 2}px`,
                opacity: 0.3 + Math.sin(i * 0.8) * 0.4,
                animationDelay: `${i * 200}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ─── Нижняя часть: детали + CTA ─── */}
      <div
        className={`
          px-5 pb-5 space-y-4 transition-all duration-700
          ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {/* Сводка авто */}
        <div className="bg-bg-card rounded-lg border border-[rgba(196,162,101,0.10)] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gold-200">Параметры расчёта</span>
            <span className="pill-gold text-[10px]">
              {COUNTRY_NAME_RU[country]} → {destination === 'RU' ? 'Россия' : 'Беларусь'}
            </span>
          </div>
          <div className="divider-gold mb-3" />
          <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
            <InfoRow label="Цена авто" value={`${symbol}${price.toLocaleString('ru-RU')}`} />
            <InfoRow label="Год" value={String(year)} />
            <InfoRow label="Двигатель" value={ENGINE_LABEL[engineType] || engineType} />
            <InfoRow label="Мощность" value={`${horsePower} л.с.`} />
          </div>
        </div>

        {/* CTA */}
        <Button onClick={handleLead}>
          Оставить заявку 📩
        </Button>

        {/* Вторая кнопка */}
        <button
          onClick={handleNewCalc}
          className="
            w-full h-12 text-sm text-gold-400
            border border-[rgba(196,162,101,0.14)] rounded-lg
            hover:border-[rgba(196,162,101,0.25)] hover:bg-[rgba(196,162,101,0.04)]
            transition-all duration-250
          "
        >
          Рассчитать другой автомобиль
        </button>
      </div>
    </div>
  );
}

/** Строка информации */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-neutral-500">{label}</p>
      <p className="text-sm text-gold-100 font-medium">{value}</p>
    </div>
  );
}
