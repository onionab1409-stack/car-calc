'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { Country, Destination, EngineType } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';
import { Input } from '@/components/ui';
import { useTelegram } from '@/components/TelegramProvider';

// ─── Types ───────────────────────────────────────

export interface StepFormProps {
  country: Country;
  onBack: () => void;
  /** Called when calculation completes successfully — for history saving */
  onCalcComplete?: (data: {
    country: Country;
    destination: Destination;
    price: number;
    year: number;
    engineType: EngineType;
    horsePower: number;
    totalRUB: number;
  }) => void;
}

// ─── Constants ───────────────────────────────────

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', KRW: '₩', AED: 'AED', CNY: '¥' };
const PRICE_HINT: Record<Country, string> = {
  USA: '5 000 – 80 000',
  Korea: '10 000 000 – 100 000 000',
  UAE: '30 000 – 500 000',
  China: '50 000 – 800 000',
};
const PRICE_MAX: Record<Country, number> = {
  USA: 500_000,
  Korea: 500_000_000,
  UAE: 2_000_000,
  China: 5_000_000,
};

const CURRENT_YEAR = new Date().getFullYear();
const AGE_PRESETS = [
  { label: '0–3 лет', year: CURRENT_YEAR },       // under3
  { label: '3–5 лет', year: CURRENT_YEAR - 4 },   // 3to5
];

const DEST_INFO: Record<Destination, { flag: string; name: string; hint: string }> = {
  RU: { flag: '🇷🇺', name: 'Россия', hint: 'Таможня РФ · ×1.48' },
  BY: { flag: '🇧🇾', name: 'Беларусь', hint: 'Таможня ЕАЭС · ×1.30' },
};

// ─── Helpers ─────────────────────────────────────

function formatNumber(n: number): string {
  if (n === 0) return '';
  return n.toLocaleString('ru-RU');
}

function formatRUB(n: number): string {
  return Math.round(n).toLocaleString('ru-RU');
}

// ─── Count-up hook ───────────────────────────────

function useCountUp(target: number, duration: number = 1400): number {
  const [value, setValue] = useState(0);
  const startRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (target <= 0) { setValue(0); return; }
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

// ─── Component ───────────────────────────────────

type FormPhase = 'input' | 'calculating' | 'result' | 'lead' | 'lead-sending' | 'lead-success' | 'lead-error';

export function StepForm({ country, onBack, onCalcComplete }: StepFormProps) {
  const { haptic, user } = useTelegram();
  const currency = COUNTRY_CURRENCY[country];
  const symbol = CURRENCY_SYMBOL[currency];

  // ── Form state ──
  const [price, setPrice] = useState<string>('');
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const engineType: EngineType = 'petrol'; // always petrol for физлица
  const [horsePower, setHorsePower] = useState<string>('150');
  const [engineVolume, setEngineVolume] = useState<string>('');
  const [destination, setDestination] = useState<Destination | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Result state ──
  const [phase, setPhase] = useState<FormPhase>('input');
  const [totalRUB, setTotalRUB] = useState<number>(0);
  const [calcError, setCalcError] = useState<string>('');
  const animatedPrice = useCountUp(phase === 'result' || phase === 'lead' || phase === 'lead-sending' || phase === 'lead-success' ? totalRUB : 0);
  const fetchedRef = useRef(false);

  // ── Lead state ──
  const [leadName, setLeadName] = useState(user?.first_name || '');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadComment, setLeadComment] = useState('');
  const [leadErrors, setLeadErrors] = useState<Record<string, string>>({});
  const [leadServerError, setLeadServerError] = useState('');
  const leadSubmittedRef = useRef(false);

  // ── Refs for scrolling ──
  const resultRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);

  // ── Derived ──
  const priceNum = useMemo(() => Number(price.replace(/\s/g, '')) || 0, [price]);
  const carAge = CURRENT_YEAR - year;
  const needsVolume = carAge >= 3 || parseInt(horsePower) > 160;

  // ── Handlers: form ──

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    if (raw.length > 12) return;
    setPrice(raw ? formatNumber(Number(raw)) : '');
    setErrors(prev => ({ ...prev, price: '' }));
    // Reset result if user changes input after calculation
    if (phase !== 'input') { setPhase('input'); setTotalRUB(0); fetchedRef.current = false; }
  }, [phase]);

  const handleHPChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    if (Number(raw) > 2000) return;
    setHorsePower(raw);
    setErrors(prev => ({ ...prev, horsePower: '' }));
    if (phase !== 'input') { setPhase('input'); setTotalRUB(0); fetchedRef.current = false; }
  }, [phase]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    if (Number(raw) > 10000) return;
    setEngineVolume(raw);
    if (phase !== 'input') { setPhase('input'); setTotalRUB(0); fetchedRef.current = false; }
  }, [phase]);

  const handleYearSelect = useCallback((y: number) => {
    haptic?.selectionChanged();
    setYear(y);
    if (phase !== 'input') { setPhase('input'); setTotalRUB(0); fetchedRef.current = false; }
  }, [haptic, phase]);

  const handleDestSelect = useCallback((dest: Destination) => {
    haptic?.selectionChanged();
    setDestination(dest);
    setErrors(prev => ({ ...prev, destination: '' }));
    if (phase !== 'input') { setPhase('input'); setTotalRUB(0); fetchedRef.current = false; }
  }, [haptic, phase]);

  // ── Handler: calculate ──

  const handleCalculate = useCallback(async () => {
    // Validation
    const newErrors: Record<string, string> = {};
    if (priceNum <= 0) newErrors.price = 'Введите цену авто';
    else if (priceNum > PRICE_MAX[country]) newErrors.price = `Максимум ${formatNumber(PRICE_MAX[country])}`;
    const hpNum = parseInt(horsePower) || 0;
    if (hpNum <= 0) newErrors.horsePower = 'Введите мощность';
    else if (hpNum > 2000) newErrors.horsePower = 'Максимум 2 000 л.с.';
    if (needsVolume && !engineVolume) newErrors.engineVolume = 'Нужен для расчёта таможни';
    if (!destination) newErrors.destination = 'Выберите направление';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      haptic?.notificationOccurred('error');
      return;
    }

    // Start calculation
    setPhase('calculating');
    setCalcError('');
    haptic?.impactOccurred('medium');

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country,
          destination,
          price: priceNum,
          year,
          engineType,
          horsePower: hpNum,
          engineCC: engineVolume ? parseInt(engineVolume) : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || `Ошибка сервера (${res.status})`);
      }

      const data = await res.json();
      setTotalRUB(data.totalRUB);
      setPhase('result');
      haptic?.notificationOccurred('success');

      // Notify parent for history saving
      if (onCalcComplete && destination) {
        onCalcComplete({
          country,
          destination,
          price: priceNum,
          year,
          engineType,
          horsePower: parseInt(horsePower) || 0,
          totalRUB: data.totalRUB,
        });
      }

      // Scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    } catch (err) {
      setCalcError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setPhase('input');
      haptic?.notificationOccurred('error');
    }
  }, [priceNum, horsePower, engineVolume, destination, country, year, needsVolume, haptic, onCalcComplete]);

  // ── Handler: lead ──

  const handleShowLead = useCallback(() => {
    setPhase('lead');
    haptic?.impactOccurred('light');
    setTimeout(() => {
      leadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  }, [haptic]);

  const handleLeadPhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d+\-() ]/g, '');
    if (val.length > 20) return;
    setLeadPhone(val);
    setLeadErrors(prev => ({ ...prev, phone: '' }));
  }, []);

  const handleLeadSubmit = useCallback(async () => {
    if (leadSubmittedRef.current) return;

    const newErrors: Record<string, string> = {};
    if (!leadName.trim()) newErrors.name = 'Введите ваше имя';
    if (!leadPhone.trim() || leadPhone.replace(/\D/g, '').length < 5) newErrors.phone = 'Введите номер телефона';

    if (Object.keys(newErrors).length > 0) {
      setLeadErrors(newErrors);
      haptic?.notificationOccurred('error');
      return;
    }

    leadSubmittedRef.current = true;
    setPhase('lead-sending');
    haptic?.impactOccurred('medium');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: leadName.trim(),
          phone: leadPhone.trim(),
          comment: leadComment.trim(),
          country,
          destination,
          price: priceNum,
          year,
          engineType,
          horsePower: parseInt(horsePower) || 0,
          totalRUB,
          telegramUserId: user?.id,
          telegramUsername: user?.username,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Ошибка отправки');
      }

      haptic?.notificationOccurred('success');
      setPhase('lead-success');
    } catch (err) {
      leadSubmittedRef.current = false;
      setLeadServerError(err instanceof Error ? err.message : 'Ошибка');
      setPhase('lead-error');
      haptic?.notificationOccurred('error');
    }
  }, [leadName, leadPhone, leadComment, country, destination, priceNum, year, horsePower, totalRUB, user, haptic]);

  const handleNewCalc = useCallback(() => {
    setPrice('');
    setYear(CURRENT_YEAR);
    setHorsePower('');
    setEngineVolume('');
    setDestination(null);
    setErrors({});
    setPhase('input');
    setTotalRUB(0);
    setCalcError('');
    setLeadName(user?.first_name || '');
    setLeadPhone('');
    setLeadComment('');
    setLeadErrors({});
    setLeadServerError('');
    fetchedRef.current = false;
    leadSubmittedRef.current = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [user]);

  // ── Booleans ──
  const isCalculating = phase === 'calculating';
  const hasResult = phase === 'result' || phase === 'lead' || phase === 'lead-sending' || phase === 'lead-success' || phase === 'lead-error';
  const showLeadForm = phase === 'lead' || phase === 'lead-sending' || phase === 'lead-error';
  const isLeadSuccess = phase === 'lead-success';

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      {/* ─── Header ─── */}
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

      {/* ─── Scrollable form ─── */}
      <div className="flex-1 overflow-y-auto px-5 pb-6 space-y-5 scrollbar-none">

        {/* ── Price Block ── */}
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

        {/* ── Age Category ── */}
        <section>
          <p className="label-gold mb-2 ml-1">Возраст авто</p>
          <div className="grid grid-cols-2 gap-3">
            {AGE_PRESETS.map((preset) => {
              const active = year === preset.year;
              return (
                <button
                  key={preset.label}
                  onClick={() => handleYearSelect(preset.year)}
                  className={`chip-3d ${active ? 'chip-3d-active' : ''}`}
                  style={{ height: 44, fontSize: 14, fontWeight: 500 }}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          {carAge >= 3 && (
            <p className="text-[11px] mt-1.5 ml-1" style={{ color: 'var(--gold-warm)' }}>
              ⚠ Расчёт по ставкам ЕТТ ЕАЭС
            </p>
          )}
        </section>

        {/* ── Horsepower ── */}
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

        {/* ── Engine Volume (conditional) ── */}
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

        {/* ── Divider ── */}
        <div className="divider-gold" />

        {/* ── Destination: Russia / Belarus ── */}
        <section>
          <p className="label-gold mb-3 ml-1">Куда доставляем?</p>
          <div className="grid grid-cols-2 gap-3">
            {(['RU', 'BY'] as Destination[]).map((dest) => {
              const meta = DEST_INFO[dest];
              const isSelected = destination === dest;
              return (
                <button
                  key={dest}
                  onClick={() => handleDestSelect(dest)}
                  className={`card-3d text-center ${isSelected ? 'card-3d-selected' : ''}`}
                  style={{ padding: '20px 12px' }}
                >
                  <span className={`block mb-3 transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`} style={{
                    fontSize: 96, lineHeight: 1,
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.6)) drop-shadow(0 4px 6px rgba(0,0,0,0.4)) drop-shadow(0 16px 32px rgba(0,0,0,0.3))',
                  }}>
                    {meta.flag}
                  </span>
                  <p className="text-[15px] mb-1" style={{
                    fontFamily: "'Playfair Display', serif", fontWeight: 500,
                    color: isSelected ? 'var(--gold-bright)' : 'var(--txt-primary)',
                  }}>
                    {meta.name}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--txt-muted)' }}>
                    {meta.hint}
                  </p>
                </button>
              );
            })}
          </div>
          {errors.destination && (
            <p className="text-[11px] mt-2 ml-1" style={{ color: '#e87066' }}>{errors.destination}</p>
          )}
        </section>

        {/* ── Calculate Button ── */}
        <section>
          <button
            className="cta-gold-bar"
            onClick={handleCalculate}
            disabled={isCalculating}
          >
            {isCalculating ? (
              <span className="flex items-center gap-2">
                <span className="loading-ring" style={{ width: 20, height: 20, borderWidth: 2 }} />
                Рассчитываем...
              </span>
            ) : (
              'Рассчитать стоимость →'
            )}
          </button>

          {calcError && (
            <div className="error-box mt-3">
              <p>{calcError}</p>
            </div>
          )}
        </section>

        {/* ── Result Block (appears after calculation) ── */}
        {hasResult && (
          <section ref={resultRef} className="animate-slide-up">
            <div className="divider-gold mb-5" />

            {/* Price hero */}
            <div className="flex flex-col items-center py-6">
              {/* Route */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[20px]">{COUNTRY_FLAG[country]}</span>
                <svg width="20" height="8" viewBox="0 0 20 8" fill="none">
                  <path d="M0 4H16M16 4L12 1M16 4L12 7" stroke="var(--gold-dim)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-[20px]">{destination === 'RU' ? '🇷🇺' : '🇧🇾'}</span>
              </div>

              <p className="label-gold mb-3 tracking-[3px]">Итого</p>

              {/* THE PRICE */}
              <div className="relative">
                <div className="absolute inset-0 rounded-full" style={{
                  filter: 'blur(60px)', transform: 'scale(2)',
                  background: 'radial-gradient(circle, rgba(201,154,72,0.20) 0%, transparent 70%)',
                }} />
                <div className="absolute inset-0 rounded-full" style={{
                  filter: 'blur(30px)', transform: 'scale(1.5)',
                  background: 'radial-gradient(circle, rgba(217,165,78,0.12) 0%, transparent 70%)',
                }} />
                <h2 className="relative price-display text-center whitespace-nowrap">
                  {formatRUB(animatedPrice)}
                  <span style={{ fontSize: 28, color: 'var(--gold-sub)', marginLeft: 4 }}>₽</span>
                </h2>
              </div>

              <p className="text-[12px] mt-3" style={{ color: 'var(--txt-muted)' }}>
                стоимость «под ключ»
              </p>

              {/* Decorative dots */}
              <div className="flex items-center gap-[6px] mt-4">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="rounded-full" style={{
                    width: `${2 + Math.sin(i * 1.1) * 1.5}px`,
                    height: `${2 + Math.sin(i * 1.1) * 1.5}px`,
                    background: 'var(--gold-warm)',
                    opacity: 0.25 + Math.sin(i * 0.7) * 0.35,
                    boxShadow: '0 0 4px var(--glow-gold-dim)',
                  }} />
                ))}
              </div>
            </div>

            {/* Summary card */}
            <div className="card-3d mb-4" style={{ padding: 16 }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-medium" style={{ color: 'var(--txt-gold)' }}>Параметры расчёта</span>
                <span className="pill-3d" style={{ height: 20, fontSize: 9, padding: '0 8px' }}>
                  {COUNTRY_NAME_RU[country]} → {destination === 'RU' ? 'Россия' : 'Беларусь'}
                </span>
              </div>
              <div className="divider-gold mb-3" />
              <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                <InfoRow label="Цена авто" value={`${symbol}${priceNum.toLocaleString('ru-RU')}`} />
                <InfoRow label="Возраст" value={carAge >= 3 ? '3–5 лет' : '0–3 лет'} />
                <InfoRow label="Мощность" value={`${horsePower} л.с.`} />
              </div>
            </div>

            {/* CTA: Оставить заявку */}
            {!isLeadSuccess && !showLeadForm && (
              <div className="space-y-3">
                <button className="cta-gold-bar" onClick={handleShowLead}>
                  Оставить заявку 📩
                </button>
                <button
                  className="btn-ghost-3d w-full"
                  style={{ height: 44, fontSize: 13 }}
                  onClick={handleNewCalc}
                >
                  Рассчитать другой автомобиль
                </button>
              </div>
            )}

            {/* ── Lead Form (inline) ── */}
            {showLeadForm && (
              <div ref={leadRef} className="space-y-4 animate-slide-up">
                <div className="divider-gold" />
                <h3 className="text-[20px] tracking-tight" style={{
                  fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--gold-bright)',
                }}>
                  Оставить заявку
                </h3>
                <p className="text-[12px] -mt-2" style={{ color: 'var(--txt-muted)' }}>
                  Мы свяжемся с вами для обсуждения деталей
                </p>

                <Input label="Ваше имя" placeholder="Иван" value={leadName}
                  onChange={(e) => { setLeadName(e.target.value); setLeadErrors(prev => ({ ...prev, name: '' })); }}
                  error={leadErrors.name} maxLength={100} />
                <Input type="tel" label="Телефон" placeholder="+7 (900) 123-45-67"
                  value={leadPhone} onChange={handleLeadPhoneChange} error={leadErrors.phone} />

                <div className="space-y-1.5">
                  <p className="label-gold ml-1">Комментарий <span style={{ color: 'var(--txt-dim)' }}>(необязательно)</span></p>
                  <textarea
                    placeholder="Интересует конкретная модель, сроки..."
                    value={leadComment} onChange={(e) => setLeadComment(e.target.value)}
                    maxLength={500} rows={3}
                    className="input-3d"
                    style={{ height: 'auto', padding: '12px 16px', resize: 'none', borderRadius: 14 }}
                  />
                </div>

                {phase === 'lead-error' && leadServerError && (
                  <div className="error-box"><p>{leadServerError}</p></div>
                )}

                <button
                  className="cta-gold-bar"
                  onClick={handleLeadSubmit}
                  disabled={phase === 'lead-sending'}
                >
                  {phase === 'lead-sending' ? 'Отправляем...' : 'Отправить заявку 📩'}
                </button>
              </div>
            )}

            {/* ── Lead Success (inline) ── */}
            {isLeadSuccess && (
              <div className="space-y-4 animate-slide-up">
                <div className="divider-gold" />

                <div className="flex flex-col items-center py-4">
                  {/* Success icon */}
                  <div className="relative w-20 h-20 mb-4">
                    <div className="absolute inset-[-12px] rounded-full" style={{
                      background: 'radial-gradient(circle, rgba(201,154,72,0.15) 0%, transparent 70%)',
                    }} />
                    <svg viewBox="0 0 120 120" className="w-full h-full relative z-10">
                      <circle cx="60" cy="60" r="52" fill="none" stroke="var(--gold-warm)" strokeWidth="3" />
                      <path d="M38 60 L52 74 L82 44" fill="none" stroke="var(--gold-warm)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-[20px] text-center mb-1" style={{
                    fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--gold-bright)',
                  }}>
                    Заявка отправлена
                  </h3>
                  <p className="text-[12px] text-center" style={{ color: 'var(--txt-secondary)' }}>
                    Наш менеджер свяжется с вами в ближайшее время
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="info-bar" style={{ gap: 10 }}>
                    <span style={{ color: 'var(--gold-warm)', fontWeight: 700 }}>✓</span>
                    <p className="text-[12px]" style={{ color: 'var(--txt-secondary)' }}>Мы получили вашу заявку</p>
                  </div>
                  <div className="info-bar" style={{ gap: 10 }}>
                    <span style={{ color: 'var(--gold-warm)', fontWeight: 700 }}>✓</span>
                    <p className="text-[12px]" style={{ color: 'var(--txt-secondary)' }}>Ответим в течение 30 минут в рабочее время</p>
                  </div>
                </div>

                <button className="cta-gold-bar" onClick={handleNewCalc}>
                  Рассчитать другой автомобиль
                </button>
              </div>
            )}
          </section>
        )}

      </div>
    </div>
  );
}

// ── Helper component ──

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px]" style={{ color: 'var(--txt-muted)' }}>{label}</p>
      <p className="text-[13px] font-medium" style={{
        color: 'var(--txt-gold)',
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 400,
      }}>
        {value}
      </p>
    </div>
  );
}
