'use client';

import React, { useState, useCallback, useMemo } from 'react';
import type { Country, EngineType } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';
import { Input, Button, Pill } from '@/components/ui';
import { useTelegram } from '@/components/TelegramProvider';

/**
 * P6.3 · Экран ввода данных авто (второй шаг визарда)
 *
 * Поля:
 *   1. Цена авто (крупное золотое число + input)
 *   2. Год выпуска (select с пресетами)
 *   3. Тип двигателя (4 pills)
 *   4. Мощность (л.с.)
 *   5. Объём двигателя (см³) — для 3-5 лет / утильсбора
 *
 * Референсы: ref-07-input-form.png, ref-08-price-input.png, ref-09-engine-type.png
 */

interface StepCarProps {
  country: Country;
  onSubmit: (data: CarFormData) => void;
  onBack: () => void;
}

export interface CarFormData {
  price: number;
  year: number;
  engineType: EngineType;
  horsePower: number;
  engineVolume?: number;
}

/** Символы валют */
const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$',
  KRW: '₩',
  AED: 'AED',
  CNY: '¥',
};

/** Подсказка по диапазону цен */
const PRICE_HINT: Record<Country, string> = {
  USA: '5 000 – 80 000',
  Korea: '10 000 000 – 100 000 000',
  UAE: '30 000 – 500 000',
  China: '50 000 – 800 000',
};

/** Максимальные значения цен для валидации */
const PRICE_MAX: Record<Country, number> = {
  USA: 500_000,
  Korea: 500_000_000,
  UAE: 2_000_000,
  China: 5_000_000,
};

/** Данные типов двигателя */
const ENGINE_TYPES: Array<{ value: EngineType; label: string; icon: string }> = [
  { value: 'petrol', label: 'Бензин', icon: '⛽' },
  { value: 'diesel', label: 'Дизель', icon: '🛢️' },
  { value: 'electric', label: 'Электро', icon: '⚡' },
  { value: 'hybrid', label: 'Гибрид', icon: '🔋' },
];

/** Текущий год */
const CURRENT_YEAR = new Date().getFullYear();

/** Возрастные пресеты */
const YEAR_PRESETS = [
  { label: 'Новый', year: CURRENT_YEAR },
  { label: `${CURRENT_YEAR - 1}`, year: CURRENT_YEAR - 1 },
  { label: `${CURRENT_YEAR - 2}`, year: CURRENT_YEAR - 2 },
  { label: `${CURRENT_YEAR - 3}`, year: CURRENT_YEAR - 3 },
  { label: `${CURRENT_YEAR - 4}`, year: CURRENT_YEAR - 4 },
  { label: `${CURRENT_YEAR - 5}`, year: CURRENT_YEAR - 5 },
];

/** Форматирование числа с пробелами */
function formatNumber(n: number): string {
  if (n === 0) return '';
  return n.toLocaleString('ru-RU');
}

export function StepCar({ country, onSubmit, onBack }: StepCarProps) {
  const { haptic } = useTelegram();

  const currency = COUNTRY_CURRENCY[country];
  const symbol = CURRENCY_SYMBOL[currency];

  // ─── Стейт формы ───
  const [price, setPrice] = useState<string>('');
  const [year, setYear] = useState<number>(CURRENT_YEAR);
  const [engineType, setEngineType] = useState<EngineType>('petrol');
  const [horsePower, setHorsePower] = useState<string>('');
  const [engineVolume, setEngineVolume] = useState<string>('');

  // ─── Ошибки ───
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Числовое значение цены */
  const priceNum = useMemo(() => {
    const cleaned = price.replace(/\s/g, '');
    return Number(cleaned) || 0;
  }, [price]);

  /** Возраст авто */
  const carAge = CURRENT_YEAR - year;

  /** Нужен ли объём двигателя (для ЕТТ ЕАЭС: 3-5 лет, или для утильсбора) */
  const needsVolume = engineType !== 'electric' && (carAge >= 3 || parseInt(horsePower) > 160);

  /** Ограничение по ОАЭ: только новые авто */
  const isUAE = country === 'UAE';

  // ─── Обработчик ввода цены ───
  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    if (raw.length > 12) return;
    setPrice(raw ? formatNumber(Number(raw)) : '');
    setErrors(prev => ({ ...prev, price: '' }));
  }, []);

  // ─── Обработчик ввода мощности ───
  const handleHPChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    if (Number(raw) > 2000) return;
    setHorsePower(raw);
    setErrors(prev => ({ ...prev, horsePower: '' }));
  }, []);

  // ─── Обработчик ввода объёма ───
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    if (Number(raw) > 10000) return;
    setEngineVolume(raw);
  }, []);

  // ─── Выбор года ───
  const handleYearSelect = useCallback((y: number) => {
    haptic?.selectionChanged();
    setYear(y);
  }, [haptic]);

  // ─── Выбор типа двигателя ───
  const handleEngineSelect = useCallback((type: EngineType) => {
    haptic?.selectionChanged();
    setEngineType(type);
    if (type === 'electric') {
      setEngineVolume('');
    }
  }, [haptic]);

  // ─── Валидация и сабмит ───
  const handleSubmit = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (priceNum <= 0) {
      newErrors.price = 'Введите цену авто';
    } else if (priceNum > PRICE_MAX[country]) {
      newErrors.price = `Максимум ${formatNumber(PRICE_MAX[country])}`;
    }

    const hpNum = parseInt(horsePower) || 0;
    if (hpNum <= 0) {
      newErrors.horsePower = 'Введите мощность';
    } else if (hpNum > 2000) {
      newErrors.horsePower = 'Максимум 2 000 л.с.';
    }

    if (needsVolume && !engineVolume) {
      newErrors.engineVolume = 'Нужен для расчёта таможни';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      haptic?.notificationOccurred('error');
      return;
    }

    haptic?.impactOccurred('medium');
    onSubmit({
      price: priceNum,
      year,
      engineType,
      horsePower: hpNum,
      engineVolume: engineVolume ? parseInt(engineVolume) : undefined,
    });
  }, [priceNum, horsePower, engineVolume, year, engineType, country, needsVolume, haptic, onSubmit]);

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      {/* ─── Заголовок ─── */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={onBack}
            className="text-neutral-500 hover:text-gold-400 transition-colors text-sm"
            aria-label="Назад"
          >
            ← Назад
          </button>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl text-gold-50 tracking-tight">
            Параметры авто
          </h1>
          <span className="pill-gold text-xs">
            {COUNTRY_FLAG[country]} {COUNTRY_NAME_RU[country]}
          </span>
        </div>
      </div>

      {/* ─── Прогресс ─── */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-1.5">
          <StepDot done />
          <StepDot active />
          <StepDot />
          <StepDot />
          <span className="ml-auto text-xs text-neutral-500 font-mono">2 / 4</span>
        </div>
      </div>

      {/* ─── Форма (скроллируемая) ─── */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">

        {/* ━━━ БЛОК 1: Цена ━━━ */}
        <section>
          <div className="bg-bg-card rounded-lg border border-[rgba(196,162,101,0.14)] p-4">
            {/* Крупное отображение цены */}
            <div className="mb-3">
              <p className="text-xs text-neutral-500 mb-1">Цена авто</p>
              <div className="font-serif text-[36px] leading-none text-gold-50 tabular-nums min-h-[44px]">
                {priceNum > 0 ? (
                  <>
                    <span className="text-gold-300 text-[28px] mr-1">{symbol}</span>
                    {formatNumber(priceNum)}
                  </>
                ) : (
                  <span className="text-neutral-700">{symbol}0</span>
                )}
              </div>
            </div>

            <Input
              type="text"
              inputMode="numeric"
              placeholder={PRICE_HINT[country]}
              value={price}
              onChange={handlePriceChange}
              suffix={currency}
              error={errors.price}
            />
          </div>
        </section>

        {/* ━━━ БЛОК 2: Год выпуска ━━━ */}
        <section>
          <label className="block text-sm text-neutral-400 mb-2 ml-1">
            Год выпуска
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            {YEAR_PRESETS.map((preset) => {
              // ОАЭ: только новые (текущий или прошлый год)
              const disabled = isUAE && (CURRENT_YEAR - preset.year > 1);
              return (
                <button
                  key={preset.year}
                  onClick={() => !disabled && handleYearSelect(preset.year)}
                  disabled={disabled}
                  className={`
                    flex-shrink-0 h-10 px-4 rounded-md text-sm font-medium
                    border transition-all duration-200
                    ${year === preset.year
                      ? 'bg-[rgba(196,162,101,0.12)] border-gold-400 text-gold-100'
                      : disabled
                        ? 'border-neutral-800 text-neutral-700 cursor-not-allowed'
                        : 'border-[rgba(196,162,101,0.08)] text-neutral-400 hover:border-[rgba(196,162,101,0.20)] hover:text-gold-300'
                    }
                  `}
                >
                  {preset.label}
                </button>
              );
            })}
            {/* Ввод произвольного года */}
            <input
              type="text"
              inputMode="numeric"
              placeholder="Другой"
              maxLength={4}
              className="
                flex-shrink-0 w-20 h-10 px-3 rounded-md text-sm text-center
                bg-transparent border border-[rgba(196,162,101,0.08)] text-neutral-300
                focus:border-gold-400 focus:outline-none
                placeholder:text-neutral-600
              "
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v >= 2000 && v <= CURRENT_YEAR) {
                  handleYearSelect(v);
                }
              }}
            />
          </div>
          {isUAE && (
            <p className="text-[11px] text-neutral-500 mt-1.5 ml-1">
              ОАЭ: только новые авто (до 1 года)
            </p>
          )}
          {carAge >= 3 && !isUAE && (
            <p className="text-[11px] text-warning mt-1.5 ml-1">
              ⚠ Авто {carAge}+ лет — расчёт по ставкам ЕТТ ЕАЭС
            </p>
          )}
        </section>

        {/* ━━━ БЛОК 3: Тип двигателя ━━━ */}
        <section>
          <label className="block text-sm text-neutral-400 mb-2 ml-1">
            Тип двигателя
          </label>
          <div className="grid grid-cols-4 gap-2">
            {ENGINE_TYPES.map((et) => (
              <button
                key={et.value}
                onClick={() => handleEngineSelect(et.value)}
                className={`
                  flex flex-col items-center gap-1 py-3 px-2 rounded-lg
                  border text-center transition-all duration-200
                  ${engineType === et.value
                    ? 'bg-[rgba(196,162,101,0.10)] border-gold-400 shadow-gold'
                    : 'border-[rgba(196,162,101,0.08)] hover:border-[rgba(196,162,101,0.20)]'
                  }
                `}
              >
                <span className="text-xl">{et.icon}</span>
                <span className={`
                  text-xs font-medium
                  ${engineType === et.value ? 'text-gold-100' : 'text-neutral-400'}
                `}>
                  {et.label}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* ━━━ БЛОК 4: Мощность ━━━ */}
        <section>
          <Input
            type="text"
            inputMode="numeric"
            label="Мощность"
            placeholder="150"
            value={horsePower}
            onChange={handleHPChange}
            suffix="л.с."
            error={errors.horsePower}
          />
          {parseInt(horsePower) > 160 && (
            <p className="text-[11px] text-warning mt-1.5 ml-1">
              ⚠ Более 160 л.с. — доплата за утилизационный сбор
            </p>
          )}
        </section>

        {/* ━━━ БЛОК 5: Объём двигателя (условный) ━━━ */}
        {needsVolume && (
          <section className="animate-slide-up">
            <Input
              type="text"
              inputMode="numeric"
              label="Объём двигателя"
              placeholder="2000"
              value={engineVolume}
              onChange={handleVolumeChange}
              suffix="см³"
              error={errors.engineVolume}
            />
            <p className="text-[11px] text-neutral-500 mt-1 ml-1">
              Нужен для расчёта таможенных ставок
            </p>
          </section>
        )}

      </div>

      {/* ─── Кнопка «Далее» ─── */}
      <div className="px-5 pb-5 pt-2 safe-bottom">
        <Button onClick={handleSubmit}>
          Далее →
        </Button>
      </div>
    </div>
  );
}

/** Точка прогресса */
function StepDot({ active = false, done = false }: { active?: boolean; done?: boolean }) {
  return (
    <div
      className={`
        h-1.5 rounded-full transition-all duration-300
        ${active
          ? 'w-6 bg-gold-400'
          : done
            ? 'w-1.5 bg-gold-500'
            : 'w-1.5 bg-neutral-700'
        }
      `}
    />
  );
}
