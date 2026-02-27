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

    // totalUSD = 32,697.55 + 1600 = 34,297.55
    expect(c.totalUSD).toBeCloseTo(34_297.55, 0);

    // baseRUB = 34,297.55 × 78.50 = 2,692,357.68
    expect(c.baseRUB).toBeCloseTo(2_692_358, -1);

    // customsRUB = baseRUB × 0.48 = 1,292,331.68
    expect(c.customsRUB).toBeCloseTo(1_292_332, -1);

    // withCustomsRUB = baseRUB × 1.48 = 3,984,689.36
    expect(c.withCustomsRUB).toBeCloseTo(3_984_689, -1);

    // fixedCosts: totalUSD = 34,297.55 → ≤$40K → 510K₽
    expect(c.fixedCosts).toBe(510_000);

    // totalRUB = 3,984,689 + 510,000 = 4,494,689
    expect(c.totalRUB).toBeCloseTo(4_494_689, -1);
  });

  it('90K AED ОАЭ→РБ: компоненты', () => {
    const c = calcUAEComponents(90_000, 'BY', 78.50);

    // priceUSD = 90000 / 3.67 = 24,523.16
    expect(c.priceUSD).toBeCloseTo(24_523.16, 0);

    // totalUSD = 24,523.16 + 1600 = 26,123.16
    expect(c.totalUSD).toBeCloseTo(26_123.16, 0);

    // fixedCosts: totalUSD = 26,123.16 → ≤$30K → 580K₽
    expect(c.fixedCosts).toBe(580_000);

    // withCustomsRUB = 26,123.1608 × 78.50 × 1.30 = 2,665,868.56
    expect(c.withCustomsRUB).toBeCloseTo(2_665_869, -1);

    // totalRUB = 2,665,869 + 580,000 = 3,245,869
    expect(c.totalRUB).toBeCloseTo(3_245_869, -1);
  });
});

// ─────────────────────────────────────────────
// 🎯 Эталонные расчёты (из master-context.md)
// ─────────────────────────────────────────────

describe('calcUAE — эталонные расчёты', () => {
  it('🇦🇪 ОАЭ → 🇷🇺 РФ: 120K AED, 150лс → ~4,495,000₽', () => {
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

    const result = calcUAE(car, TEST_RATES);

    // Допуск ±0.5%
    expect(result.totalRUB).toBeGreaterThan(4_495_000 * 0.995);
    expect(result.totalRUB).toBeLessThan(4_495_000 * 1.005);

    // Проверяем breakdown
    expect(result.breakdown.country).toBe('UAE');
    expect(result.breakdown.destination).toBe('RU');
    expect(result.breakdown.ageCategory).toBe('under3');
    expect(result.breakdown.carPriceOriginal).toBe(120_000);
    expect(result.breakdown.carPriceCurrency).toBe('AED');
    expect(result.breakdown.fixedCosts).toBe(510_000);
    expect(result.breakdown.auctionFee).toBe(0);
    expect(result.breakdown.rateSource).toBe('bybit_p2p');
    expect(result.breakdown.usedTKS).toBe(false);
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

    const result = calcUAE(car, TEST_RATES);

    // Допуск ±0.5%
    expect(result.totalRUB).toBeGreaterThan(3_246_000 * 0.995);
    expect(result.totalRUB).toBeLessThan(3_246_000 * 1.005);

    expect(result.breakdown.fixedCosts).toBe(580_000);
  });
});

// ─────────────────────────────────────────────
// ⚡ Быстрый расчёт
// ─────────────────────────────────────────────

describe('calcUAEQuick', () => {
  it('ОАЭ→РФ 120K AED: совпадает с полным расчётом', () => {
    const quick = calcUAEQuick(120_000, 'RU', 78.50);
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
    const full = calcUAE(car, TEST_RATES);
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
    const full = calcUAE(car, TEST_RATES);
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
    const result = calcUAE(car, TEST_RATES);
    // priceUSD = 50K/3.67 + 1600 = 15,222.07
    // totalRUB = 15,222.07 × 78.50 × 1.48 + 440K (≤$20K)
    // = 1,767,796 + 440,000 = 2,207,796
    expect(result.totalRUB).toBeGreaterThan(2_100_000);
    expect(result.totalRUB).toBeLessThan(2_300_000);
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
    const result = calcUAE(car, TEST_RATES);
    // priceUSD = 250K/3.67 + 1600 = 69,727.52
    // fix: 69,727 > $50K → 560K + ceil((69727-50000)/10000) × 100K = 560K + 200K = 760K
    expect(result.breakdown.fixedCosts).toBe(760_000);
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
    expect(() => calcUAE(car, TEST_RATES)).toThrow('только новые авто');
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
    expect(() => calcUAE(car, TEST_RATES)).toThrow('только новые авто');
  });
});
