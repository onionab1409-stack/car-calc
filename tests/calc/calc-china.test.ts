// ============================================
// 🧪 Тесты: calc-china.ts
// ============================================
// Эталонные расчёты из master-context.md
// Курсы на 27.02.2026: CNY_RUB 11.40₽ (ЦБ + спред ВТБ)

import { describe, it, expect } from 'vitest';
import { calcChina, calcChinaQuick, calcChinaComponents } from '@/calc/calc-china';
import { CHINA } from '@/calc/data/constants';
import type { CarInput, ExchangeRates } from '@/types';

// ─────────────────────────────────────────────
// 📐 Тестовые курсы
// ─────────────────────────────────────────────

const TEST_RATES: ExchangeRates = {
  USDT_RUB: 78.50,
  KRW_RUB: 0.05364,
  CNY_RUB: 11.40,
  AED_USD: 3.67,
  updatedAt: '2026-02-27T12:00:00Z',
};

const EUR_RATE = 84.12;

// ─────────────────────────────────────────────
// 🔍 Тесты констант
// ─────────────────────────────────────────────

describe('CHINA constants', () => {
  it('коэффициенты и фиксы корректны', () => {
    expect(CHINA.LOGISTICS_CNY).toBe(8000);
    expect(CHINA.INSURANCE_RATE).toBe(0.025);
    expect(CHINA.CUSTOMS_MULTIPLIER_RU).toBe(1.48);
    expect(CHINA.CUSTOMS_MULTIPLIER_BY).toBe(1.30);
    expect(CHINA.FIXED_RU_RUB).toBe(590_000);
    expect(CHINA.FIXED_BY_RUB).toBe(720_000);
  });
});

// ─────────────────────────────────────────────
// 🧮 Тесты компонентов
// ─────────────────────────────────────────────

describe('calcChinaComponents', () => {
  it('180K¥ Китай→РФ: компоненты', () => {
    const c = calcChinaComponents(180_000, 'RU', 11.40);

    // logisticsCNY = 8000
    expect(c.logisticsCNY).toBe(8000);

    // insuranceCNY = 180000 × 0.025 = 4500 (от цены, НЕ от цены+логистика!)
    expect(c.insuranceCNY).toBe(4500);

    // baseCNY = 180000 + 8000 + 4500 = 192500
    expect(c.baseCNY).toBe(192_500);

    // baseRUB = 192500 × 11.40 = 2,194,500
    expect(c.baseRUB).toBeCloseTo(2_194_500, -1);

    // customsRUB = 2,194,500 × 0.48 = 1,053,360
    expect(c.customsRUB).toBeCloseTo(1_053_360, -1);

    // withCustomsRUB = 2,194,500 × 1.48 = 3,247,860
    expect(c.withCustomsRUB).toBeCloseTo(3_247_860, -1);

    // fixedCosts = 590,000
    expect(c.fixedCosts).toBe(590_000);

    // totalRUB = 3,247,860 + 590,000 = 3,837,860
    expect(c.totalRUB).toBeCloseTo(3_837_860, -1);
  });

  it('150K¥ Китай→РБ: компоненты', () => {
    const c = calcChinaComponents(150_000, 'BY', 11.40);

    // insuranceCNY = 150000 × 0.025 = 3750
    expect(c.insuranceCNY).toBe(3750);

    // baseCNY = 150000 + 8000 + 3750 = 161750
    expect(c.baseCNY).toBe(161_750);

    // baseRUB = 161750 × 11.40 = 1,843,950
    expect(c.baseRUB).toBeCloseTo(1_843_950, -1);

    // withCustomsRUB = 1,843,950 × 1.30 = 2,397,135
    expect(c.withCustomsRUB).toBeCloseTo(2_397_135, -1);

    // totalRUB = 2,397,135 + 720,000 = 3,117,135
    expect(c.totalRUB).toBeCloseTo(3_117_135, -1);
  });
});

// ─────────────────────────────────────────────
// 🎯 Эталонные расчёты (из master-context.md)
// ─────────────────────────────────────────────

describe('calcChina — эталонные расчёты', () => {
  it('🇨🇳 Китай → 🇷🇺 РФ: 180K¥, 150лс → ~3,838,000₽', () => {
    const car: CarInput = {
      country: 'China',
      destination: 'RU',
      price: 180_000,
      currency: 'CNY',
      year: 2024,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };

    const result = calcChina(car, TEST_RATES, EUR_RATE);

    // Допуск ±0.5%
    expect(result.totalRUB).toBeGreaterThan(3_837_860 * 0.99);
    expect(result.totalRUB).toBeLessThan(3_837_860 * 1.01);

    // Breakdown
    expect(result.breakdown.country).toBe('China');
    expect(result.breakdown.destination).toBe('RU');
    expect(result.breakdown.ageCategory).toBe('under3');
    expect(result.breakdown.carPriceOriginal).toBe(180_000);
    expect(result.breakdown.carPriceCurrency).toBe('CNY');
    expect(result.breakdown.fixedCosts).toBe(590_000);
    expect(result.breakdown.auctionFee).toBe(0);
    expect(result.breakdown.rateSource).toBe('cbr');
    expect(result.breakdown.usedTKS).toBe(true);

    // Страховка = 180K × 0.025 × 11.40 = 51,300₽
    expect(result.breakdown.insurance).toBeCloseTo(51_300, -1);

    // Логистика = 8000 × 11.40 = 91,200₽
    expect(result.breakdown.shipping).toBeCloseTo(91_200, -1);
  });

  it('🇨🇳 Китай → 🇧🇾 РБ: 150K¥, 120лс → ~3,117,000₽', () => {
    const car: CarInput = {
      country: 'China',
      destination: 'BY',
      price: 150_000,
      currency: 'CNY',
      year: 2024,
      engineType: 'petrol',
      engineCC: 1600,
      horsePower: 120,
    };

    const result = calcChina(car, TEST_RATES, EUR_RATE);

    // Допуск ±0.5%
    expect(result.totalRUB).toBeGreaterThan(3_117_000 * 0.995);
    expect(result.totalRUB).toBeLessThan(3_117_000 * 1.005);

    expect(result.breakdown.fixedCosts).toBe(720_000);
  });
});

// ─────────────────────────────────────────────
// ⚡ Быстрый расчёт
// ─────────────────────────────────────────────

describe('calcChinaQuick', () => {
  it('Китай→РБ 150K¥: совпадает с полным расчётом', () => {
    const quick = calcChinaQuick(150_000, 'BY', 11.40);
    const car: CarInput = {
      country: 'China',
      destination: 'BY',
      price: 150_000,
      currency: 'CNY',
      year: 2024,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };
    const full = calcChina(car, TEST_RATES, EUR_RATE);
    expect(quick).toBe(full.totalRUB);
  });

  it('Китай→РБ 150K¥: совпадает с полным расчётом', () => {
    const quick = calcChinaQuick(150_000, 'BY', 11.40);
    const car: CarInput = {
      country: 'China',
      destination: 'BY',
      price: 150_000,
      currency: 'CNY',
      year: 2024,
      engineType: 'petrol',
      engineCC: 1600,
      horsePower: 120,
    };
    const full = calcChina(car, TEST_RATES, EUR_RATE);
    expect(quick).toBe(full.totalRUB);
  });
});

// ─────────────────────────────────────────────
// 🔢 Дополнительные кейсы
// ─────────────────────────────────────────────

describe('calcChina — дополнительные кейсы', () => {
  it('дешёвое авто 80K¥ Китай→РФ', () => {
    const car: CarInput = {
      country: 'China',
      destination: 'RU',
      price: 80_000,
      currency: 'CNY',
      year: 2024,
      engineType: 'petrol',
      engineCC: 1500,
      horsePower: 110,
    };
    const result = calcChina(car, TEST_RATES, EUR_RATE);
    // baseCNY = 80K + 8K + 2K = 90K
    // ETT: 90K × 11.40 + ETT(1500cc) + 590K
    expect(result.totalRUB).toBeGreaterThan(2_000_000);
    expect(result.totalRUB).toBeLessThan(2_200_000);
  });

  it('дорогое авто 350K¥ Китай→РФ', () => {
    const car: CarInput = {
      country: 'China',
      destination: 'RU',
      price: 350_000,
      currency: 'CNY',
      year: 2024,
      engineType: 'petrol',
      engineCC: 2500,
      horsePower: 150,
    };
    const result = calcChina(car, TEST_RATES, EUR_RATE);
    // baseCNY = 350K + 8K + 8750 = 366,750
    // ETT: 366,750 × 11.40 + ETT(3000cc) + 590K
    expect(result.totalRUB).toBeGreaterThan(6_600_000);
    expect(result.totalRUB).toBeLessThan(7_000_000);
  });

  it('электромобиль 200K¥ Китай→РФ', () => {
    const car: CarInput = {
      country: 'China',
      destination: 'RU',
      price: 200_000,
      currency: 'CNY',
      year: 2024,
      engineType: 'electric',
      horsePower: 150,
    };
    const result = calcChina(car, TEST_RATES, EUR_RATE);
    // Электро: engineCC=0 → ETT=0, только baseRUB + fixed
    expect(result.totalRUB).toBeGreaterThan(3_900_000);
    expect(result.totalRUB).toBeLessThan(4_500_000);
  });

  it('авто 3–5 лет Китай→РФ — ЕТТ ЕАЭС', () => {
    const car: CarInput = {
      country: 'China',
      destination: 'RU',
      price: 150_000,
      currency: 'CNY',
      year: 2022, // 4 года → 3to5
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };
    const eurRate = 84.0;
    const result = calcChina(car, TEST_RATES, eurRate);

    expect(result.breakdown.ageCategory).toBe('3to5');
    expect(result.breakdown.usedTKS).toBe(true);

    // baseCNY = 150K + 8K + 3750 = 161,750
    // baseRUB = 161,750 × 11.40 = 1,843,950
    // ЕТТ: 2000см³ × 2.7€/см³ = 5400€ × 84₽ = 453,600₽
    // total = 1,843,950 + 453,600 + 590,000 = 2,887,550
    expect(result.totalRUB).toBeGreaterThan(2_840_000);
    expect(result.totalRUB).toBeLessThan(2_940_000);
  });

  it('авто 3–5 лет Китай→РБ — ЕТТ ЕАЭС', () => {
    const car: CarInput = {
      country: 'China',
      destination: 'BY',
      price: 120_000,
      currency: 'CNY',
      year: 2022,
      engineType: 'petrol',
      engineCC: 1800,
      horsePower: 130,
    };
    const eurRate = 84.0;
    const result = calcChina(car, TEST_RATES, eurRate);

    expect(result.breakdown.ageCategory).toBe('3to5');
    expect(result.breakdown.fixedCosts).toBe(720_000);

    // baseCNY = 120K + 8K + 3K = 131K
    // baseRUB = 131K × 11.40 = 1,493,400
    // ЕТТ: 1800 × 2.5 × 84 = 378,000
    // total = 1,493,400 + 378,000 + 720,000 = 2,591,400
    expect(result.totalRUB).toBeGreaterThan(2_540_000);
    expect(result.totalRUB).toBeLessThan(2_640_000);
  });

  it('авто 5+ лет Китай→РФ — ЕТТ 5+', () => {
    const car: CarInput = {
      country: 'China',
      destination: 'RU',
      price: 100_000,
      currency: 'CNY',
      year: 2019, // 7 лет → over5
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };
    const eurRate = 84.0;
    const result = calcChina(car, TEST_RATES, eurRate);

    expect(result.breakdown.ageCategory).toBe('over5');
    expect(result.breakdown.usedTKS).toBe(true);

    // ЕТТ 5+: 2000 × 4.8 × 84 = 806,400
    // baseCNY = 100K + 8K + 2.5K = 110.5K → baseRUB = 1,259,700
    // total = 1,259,700 + 806,400 + 590,000 = 2,656,100
    expect(result.totalRUB).toBeGreaterThan(2_610_000);
    expect(result.totalRUB).toBeLessThan(2_710_000);
  });

  it('бросает ошибку без engineCC для 3–5 лет', () => {
    const car: CarInput = {
      country: 'China',
      destination: 'RU',
      price: 150_000,
      currency: 'CNY',
      year: 2022,
      engineType: 'petrol',
      horsePower: 150,
    };
    expect(() => calcChina(car, TEST_RATES, 84.0)).toThrow('объём двигателя');
  });

  it('бросает ошибку без eurRate для РФ', () => {
    const car: CarInput = {
      country: 'China',
      destination: 'RU',
      price: 150_000,
      currency: 'CNY',
      year: 2022,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };
    expect(() => calcChina(car, TEST_RATES)).toThrow('EUR/RUB');
  });
});
