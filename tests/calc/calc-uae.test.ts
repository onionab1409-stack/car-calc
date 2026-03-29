// ============================================
// 🧪 Тесты: calc-uae.ts
// ============================================
// Эталонные расчёты из master-context.md
// Курсы на 27.02.2026: USDT 78.50₽

import { describe, it, expect } from 'vitest';
import { calcUAE, calcUAEQuick, calcUAEComponents } from '@/calc/calc-uae';
import { UAE, lookupFixedCost, FIXED_COSTS_UAE_RU, FIXED_COSTS_UAE_BY } from '@/calc/data/constants';
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
// 🔍 Тесты фиксов ОАЭ
// ─────────────────────────────────────────────

describe('lookupFixedCost — UAE', () => {
  it('UAE→РФ: $15K → 440K₽', () => {
    expect(lookupFixedCost(FIXED_COSTS_UAE_RU, 15_000)).toBe(440_000);
  });

  it('UAE→РФ: $25K → 460K₽', () => {
    expect(lookupFixedCost(FIXED_COSTS_UAE_RU, 25_000)).toBe(460_000);
  });

  it('UAE→РФ: $35K → 510K₽', () => {
    expect(lookupFixedCost(FIXED_COSTS_UAE_RU, 35_000)).toBe(510_000);
  });

  it('UAE→РФ: $50K → 560K₽ (граница)', () => {
    expect(lookupFixedCost(FIXED_COSTS_UAE_RU, 50_000)).toBe(560_000);
  });

  it('UAE→РФ: $60K → 560K + 100K = 660K₽ (overflow)', () => {
    expect(lookupFixedCost(FIXED_COSTS_UAE_RU, 60_000)).toBe(660_000);
  });

  it('UAE→РБ: $15K → 530K₽', () => {
    expect(lookupFixedCost(FIXED_COSTS_UAE_BY, 15_000)).toBe(530_000);
  });

  it('UAE→РБ: $25K → 580K₽', () => {
    expect(lookupFixedCost(FIXED_COSTS_UAE_BY, 25_000)).toBe(580_000);
  });
});

// ─────────────────────────────────────────────
// 🧮 Тесты компонентов
// ─────────────────────────────────────────────

describe('calcUAEComponents', () => {
  it('120K AED ОАЭ→РФ: компоненты', () => {
    const c = calcUAEComponents(120_000, 'RU', 78.50);

    // priceUSD = 120000 / 3.67 = 32,697.55
    expect(c.priceUSD).toBeCloseTo(32_697.55, 0);

    // totalUSD = 32,697.55 + 3200 = 35,897.55
    expect(c.totalUSD).toBeCloseTo(35_897.55, 0);

    // baseRUB = 35,897.55 × 78.50 = 2,817,957.49
    expect(c.baseRUB).toBeCloseTo(2_817_957, -1);

    // customsRUB = baseRUB × 0.48 = 1,352,619.60
    expect(c.customsRUB).toBeCloseTo(1_352_620, -1);

    // withCustomsRUB = baseRUB × 1.48 = 4,170,577.09
    expect(c.withCustomsRUB).toBeCloseTo(4_170_577, -1);

    // fixedCosts: totalUSD = 35,897.55 → ≤$40K → 510K₽
    expect(c.fixedCosts).toBe(510_000);

    // totalRUB = 4,170,577 + 510,000 = 4,680,577
    expect(c.totalRUB).toBeCloseTo(4_680_577, -1);
  });

  it('90K AED ОАЭ→РБ: компоненты', () => {
    const c = calcUAEComponents(90_000, 'BY', 78.50);

    // priceUSD = 90000 / 3.67 = 24,523.16
    expect(c.priceUSD).toBeCloseTo(24_523.16, 0);

    // totalUSD = 24,523.16 + 3200 = 27,723.16
    expect(c.totalUSD).toBeCloseTo(27_723.16, 0);

    // fixedCosts: totalUSD = 27,723.16 → ≤$30K → 580K₽
    expect(c.fixedCosts).toBe(580_000);

    // withCustomsRUB = 27,723.16 × 78.50 × 1.30 = 2,829,148.56
    expect(c.withCustomsRUB).toBeCloseTo(2_829_149, -1);

    // totalRUB = 2,829,149 + 580,000 = 3,409,149
    expect(c.totalRUB).toBeCloseTo(3_409_149, -1);
  });
});

// ─────────────────────────────────────────────
// 🎯 Эталонные расчёты (из master-context.md)
// ─────────────────────────────────────────────

describe('calcUAE — эталонные расчёты', () => {
  it('🇦🇪 ОАЭ → 🇷🇺 РФ: 120K AED, 150лс → ~4,680,577₽', () => {
    const car: CarInput = {
      country: 'UAE',
      destination: 'RU',
      price: 120_000,
      currency: 'AED',
      year: 2025,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };

    const result = calcUAE(car, TEST_RATES, EUR_RATE);

    // Допуск ±0.5%
    expect(result.totalRUB).toBeGreaterThan(4_680_577 * 0.99);
    expect(result.totalRUB).toBeLessThan(4_680_577 * 1.01);

    // Проверяем breakdown
    expect(result.breakdown.country).toBe('UAE');
    expect(result.breakdown.destination).toBe('RU');
    expect(result.breakdown.ageCategory).toBe('under3');
    expect(result.breakdown.carPriceOriginal).toBe(120_000);
    expect(result.breakdown.carPriceCurrency).toBe('AED');
    expect(result.breakdown.fixedCosts).toBe(510_000);
    expect(result.breakdown.auctionFee).toBe(0);
    expect(result.breakdown.rateSource).toBe('bybit_p2p');
    expect(result.breakdown.usedTKS).toBe(true);
  });

  it('🇦🇪 ОАЭ → 🇧🇾 РБ: 90K AED, 150лс → ~3,246,000₽', () => {
    const car: CarInput = {
      country: 'UAE',
      destination: 'BY',
      price: 90_000,
      currency: 'AED',
      year: 2025,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };

    const result = calcUAE(car, TEST_RATES, EUR_RATE);

    // Допуск ±0.5%
    expect(result.totalRUB).toBeGreaterThan(3_409_149 * 0.99);
    expect(result.totalRUB).toBeLessThan(3_409_149 * 1.01);

    expect(result.breakdown.fixedCosts).toBe(580_000);
  });
});

// ─────────────────────────────────────────────
// ⚡ Быстрый расчёт
// ─────────────────────────────────────────────

describe('calcUAEQuick', () => {
  it('ОАЭ→РБ 90K AED: совпадает с полным расчётом', () => {
    const quick = calcUAEQuick(90_000, 'BY', 78.50);
    const car: CarInput = {
      country: 'UAE',
      destination: 'BY',
      price: 90_000,
      currency: 'AED',
      year: 2025,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };
    const full = calcUAE(car, TEST_RATES, EUR_RATE);
    expect(quick).toBe(full.totalRUB);
  });

  it('ОАЭ→РБ 90K AED: совпадает с полным расчётом', () => {
    const quick = calcUAEQuick(90_000, 'BY', 78.50);
    const car: CarInput = {
      country: 'UAE',
      destination: 'BY',
      price: 90_000,
      currency: 'AED',
      year: 2025,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };
    const full = calcUAE(car, TEST_RATES, EUR_RATE);
    expect(quick).toBe(full.totalRUB);
  });
});

// ─────────────────────────────────────────────
// 🔢 Дополнительные кейсы
// ─────────────────────────────────────────────

describe('calcUAE — дополнительные кейсы', () => {
  it('дешёвое авто 50K AED ОАЭ→РФ', () => {
    const car: CarInput = {
      country: 'UAE',
      destination: 'RU',
      price: 50_000,
      currency: 'AED',
      year: 2025,
      engineType: 'petrol',
      engineCC: 1500,
      horsePower: 120,
    };
    const result = calcUAE(car, TEST_RATES, EUR_RATE);
    // priceUSD = 50K/3.67 + 3200 = 16,823.98
    // totalRUB = 16,823.98 × 78.50 × 1.48 + 440K (≤$20K)
    // = 1,954,610 + 440,000 = 2,394,610
    expect(result.totalRUB).toBeGreaterThan(2_200_000);
    expect(result.totalRUB).toBeLessThan(2_600_000);
  });

  it('дорогое авто 250K AED ОАЭ→РФ — overflow фиксов', () => {
    const car: CarInput = {
      country: 'UAE',
      destination: 'RU',
      price: 250_000,
      currency: 'AED',
      year: 2025,
      engineType: 'petrol',
      engineCC: 3500,
      horsePower: 150,
    };
    const result = calcUAE(car, TEST_RATES, EUR_RATE);
    // priceUSD = 250K/3.67 + 3200 = 71,319.89
    // fix: 71,319 > $50K → 560K + ceil((71319-50000)/10000) × 100K = 560K + 300K = 860K
    expect(result.breakdown.fixedCosts).toBe(860_000);
  });

  it('бросает ошибку для авто 3–5 лет (не поддерживается)', () => {
    const car: CarInput = {
      country: 'UAE',
      destination: 'RU',
      price: 120_000,
      currency: 'AED',
      year: 2022, // 4 года
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };
    expect(() => calcUAE(car, TEST_RATES, EUR_RATE)).toThrow('только новые авто');
  });

  it('бросает ошибку для авто 5+ лет', () => {
    const car: CarInput = {
      country: 'UAE',
      destination: 'RU',
      price: 80_000,
      currency: 'AED',
      year: 2019, // 7 лет
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };
    expect(() => calcUAE(car, TEST_RATES, EUR_RATE)).toThrow('только новые авто');
  });
});
