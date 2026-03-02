'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type { Country, EngineType } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';
import { Input } from '@/components/ui';
import { useTelegram } from '@/components/TelegramProvider';

export interface CarFormData {
  price: number;
  year: number;
  engineType: EngineType;
  horsePower: number;
  engineVolume?: number;
}

interface StepCarProps {
  country: Country;
  onSubmit: (data: CarFormData) => void;
  onBack: () => void;
}

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', KRW: '₩', AED: 'AED', CNY: '¥' };
const PRICE_HINT: Record<Country, string> = { USA: '5 000 – 80 000', Korea: '10 000 000 – 100 000 000', UAE: '30 000 – 500 000', China: '50 000 – 800 000' };
const PRICE_MAX: Record<Country, number> = { USA: 500_000, Korea: 500_000_000, UAE: 2_000_000, China: 5_000_000 };

const ENGINE_TYPES: Array<{ value: EngineType; label: string; icon: string }> = [
  { value: 'petrol', label: 'Бензин', icon: '⛽' },
  { value: 'diesel', label: 'Дизель', icon: '🛢️' },
  { value: 'electric', label: 'Электро', icon: '⚡' },
  { value: 'hybrid', label: 'Гибрид', icon: '🔋' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_PRESETS = [
  { label: 'Новый', year: CURRENT_YEAR },
  { label: `${CURRENT_YEAR - 1}`, year: CURRENT_YEAR - 1 },
  { label: `${CURRENT_YEAR - 2}`, year: CURRENT_YEAR - 2 },
  { label: `${CURRENT_YEAR - 3}`, year: CURRENT_YEAR - 3 },
  { label: `${CURRENT_YEAR - 4}`, year: CURRENT_YEAR - 4 },
  { label: `${CURRENT_YEAR - 5}`, year: CURRENT_YEAR - 5 },
];

function formatNumber(n: number): string {
  if (n === 0) return '';
  return n.toLocaleString('ru-RU');
}

export function StepCar({ country, onSubmit, onBack }: StepCarProps) {
  const { haptic } = useTelegram();
  const currency = COUNTRY_CURRENCY[country];
  const symbol = CURRENCY_SYMBOL[currency];

  const [price, setPrice] = useState<string>('');
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [engineType, setEngineType] = useState<EngineType>('petrol');
  const [horsePower, setHorsePower] = useState<string>('');
  const [engineVolume, setEngineVolume] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const priceNum = useMemo(() => Number(price.replace(/\s/g, '')) || 0, [price]);
  const carAge = CURRENT_YEAR - year;
  const needsVolume = engineType !== 'electric' && (carAge >= 3 || parseInt(horsePower) > 160);
  const isUAE = country === 'UAE';

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    if (raw.length > 12) return;
    setPrice(raw ? formatNumber(Number(raw)) : '');
    setErrors(prev => ({ ...prev, price: '' }));
  }, []);

  const handleHPChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    if (Number(raw) > 2000) return;
    setHorsePower(raw);
    setErrors(prev => ({ ...prev, horsePower: '' }));
  }, []);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    if (Number(raw) > 10000) return;
    setEngineVolume(raw);
  }, []);

  const handleYearSelect = useCallback((y: number) => { haptic?.selectionChanged(); setYear(y); }, [haptic]);
  const handleEngineSelect = useCallback((type: EngineType) => {
    haptic?.selectionChanged();
    setEngineType(type);
    if (type === 'electric') setEngineVolume('');
  }, [haptic]);

  const handleSubmit = useCallback(() => {
    const newErrors: Record<string, string> = {};
    if (priceNum <= 0) newErrors.price = 'Введите цену авто';
    else if (priceNum > PRICE_MAX[country]) newErrors.price = `Максимум ${formatNumber(PRICE_MAX[country])}`;
    const hpNum = parseInt(horsePower) || 0;
    if (hpNum <= 0) newErrors.horsePower = 'Введите мощность';
    else if (hpNum > 2000) newErrors.horsePower = 'Максимум 2 000 л.с.';
    if (needsVolume && !engineVolume) newErrors.engineVolume = 'Нужен для расчёта таможни';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); haptic?.notificationOccurred('error'); return; }
    haptic?.impactOccurred('medium');
    onSubmit({ price: priceNum, year, engineType, horsePower: hpNum, engineVolume: engineVolume ? parseInt(engineVolume) : undefined });
  }, [priceNum, horsePower, engineVolume, year, engineType, country, needsVolume, haptic, onSubmit]);

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
        <div className="flex items-center justify-between">
          <h1 className="text-[26px] tracking-tight" style={{
            fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--gold-bright)',
          }}>
            Параметры авто
          </h1>
          <span className="pill-3d" style={{ height: 26, fontSize: 11, padding: '0 10px' }}>
            {COUNTRY_FLAG[country]} {COUNTRY_NAME_RU[country]}
          </span>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 pb-4 flex items-center gap-[6px]">
        <div className="dot-3d dot-3d-done" />
        <div className="dot-3d dot-3d-active" />
        <div className="dot-3d" />
        <div className="dot-3d" />
        <span className="ml-auto text-[11px]" style={{ fontFamily: "'JetBrains Mono', monospace", color: 'var(--txt-dim)' }}>2 / 4</span>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5 scrollbar-none">

        {/* Price Block */}
        <section>
          <div className="card-3d" style={{ padding: '16px' }}>
            <div className="mb-3">
              <p className="label-gold mb-1">Цена авто</p>
              <div className="min-h-[44px]" style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 34, lineHeight: 1,
                color: priceNum > 0 ? 'var(--gold-bright)' : 'var(--txt-dim)',
                fontWeight: 300, fontVariantNumeric: 'tabular-nums',
              }}>
                {priceNum > 0 ? (
                  <>
                    <span style={{ fontSize: 24, color: 'var(--gold-sub)', marginRight: 4 }}>{symbol}</span>
                    {formatNumber(priceNum)}
                  </>
                ) : (
                  <span>{symbol}0</span>
                )}
              </div>
            </div>
            <Input
              type="text" inputMode="numeric"
              placeholder={PRICE_HINT[country]}
              value={price} onChange={handlePriceChange}
              suffix={currency} error={errors.price}
            />
          </div>
        </section>

        {/* Year Block */}
        <section>
          <p className="label-gold mb-2 ml-1">Год выпуска</p>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {YEAR_PRESETS.map((preset) => {
              const disabled = isUAE && (CURRENT_YEAR - preset.year > 1);
              const active = year === preset.year;
              return (
                <button
                  key={preset.year}
                  onClick={() => !disabled && handleYearSelect(preset.year)}
                  disabled={disabled}
                  className={`chip-3d flex-shrink-0 ${active ? 'chip-3d-active' : ''}`}
                  style={{
                    height: 38, padding: '0 14px', fontSize: 13,
                    opacity: disabled ? 0.3 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  {preset.label}
                </button>
              );
            })}
            <input
              type="text" inputMode="numeric" placeholder="Другой" maxLength={4}
              className="input-3d flex-shrink-0 text-center"
              style={{ width: 76, height: 38, fontSize: 13, padding: '0 8px', borderRadius: 10 }}
              onChange={(e) => { const v = parseInt(e.target.value); if (v >= 2000 && v <= CURRENT_YEAR) handleYearSelect(v); }}
            />
          </div>
          {isUAE && (
            <p className="text-[11px] mt-1.5 ml-1" style={{ color: 'var(--txt-muted)' }}>
              ОАЭ: только новые авто (до 1 года)
            </p>
          )}
          {carAge >= 3 && !isUAE && (
            <p className="text-[11px] mt-1.5 ml-1" style={{ color: 'var(--gold-warm)' }}>
              ⚠ Авто {carAge}+ лет — расчёт по ставкам ЕТТ ЕАЭС
            </p>
          )}
        </section>

        {/* Engine Type */}
        <section>
          <p className="label-gold mb-2 ml-1">Тип двигателя</p>
          <div className="grid grid-cols-4 gap-2">
            {ENGINE_TYPES.map((et) => {
              const active = engineType === et.value;
              return (
                <button
                  key={et.value}
                  onClick={() => handleEngineSelect(et.value)}
                  className={`chip-3d ${active ? 'chip-3d-active' : ''}`}
                  style={{ height: 56, flexDirection: 'column', gap: 2, padding: '6px 4px', borderRadius: 12, display: 'flex' }}
                >
                  <span style={{ fontSize: 18 }}>{et.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.3 }}>{et.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Horsepower */}
        <section>
          <Input
            type="text" inputMode="numeric"
            label="Мощность" placeholder="150"
            value={horsePower} onChange={handleHPChange}
            suffix="л.с." error={errors.horsePower}
          />
          {parseInt(horsePower) > 160 && (
            <p className="text-[11px] mt-1.5 ml-1" style={{ color: 'var(--gold-warm)' }}>
              ⚠ Более 160 л.с. — доплата за утильсбор
            </p>
          )}
        </section>

        {/* Engine Volume (conditional) */}
        {needsVolume && (
          <section className="animate-slide-up">
            <Input
              type="text" inputMode="numeric"
              label="Объём двигателя" placeholder="2000"
              value={engineVolume} onChange={handleVolumeChange}
              suffix="см³" error={errors.engineVolume}
            />
            <p className="text-[11px] mt-1 ml-1" style={{ color: 'var(--txt-muted)' }}>
              Нужен для расчёта таможенных ставок
            </p>
          </section>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-2 safe-bottom">
        <button className="btn-gold-3d w-full" onClick={handleSubmit}>
          Далее →
        </button>
      </div>
    </div>
  );
}
