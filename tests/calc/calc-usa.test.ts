// ============================================
// 🧪 Тесты: calc-usa.ts
// ============================================
// Эталонные расчёты из master-context.md
// Курсы на 27.02.2026: USDT 78.50₽

import { describe, it, expect } from 'vitest';
import { calcUSA, calcUSAQuick, calcUSAComponents } from '@/calc/calc-usa';
import { lookupFixedCost, FIXED_COSTS_USA_RU, FIXED_COSTS_USA_BY } from '@/calc/data/constants';
import type { CarInput, ExchangeRates } from '@/types';

// ─────────────────────────────────────────────
// 📐 Тестовые курсы (зафиксированные для детерминизма)
// ─────────────────────────────────────────────

const TEST_RATES: ExchangeRates = {
  USDT_RUB: 78.50,
  KRW_RUB: 0.05364,
  CNY_RUB: 11.40,
  AED_USD: 3.67,
  updatedAt: '2026-02-27T12:00:00Z',
};

// ─────────────────────────────────────────────
// 🔍 Тесты фиксов
// ─────────────────────────────────────────────

describe('lookupFixedCost', () => {
  it('USA→РФ: $15K → 425K₽', () => {
    expect(lookupFixedCost(FIXED_COSTS_USA_RU, 15_000)).toBe(425_000);
  });

  it('USA→РФ: $20K → 425K₽ (граница включительно)', () => {
    expect(lookupFixedCost(FIXED_COSTS_USA_RU, 20_000)).toBe(425_000);
  });

  it('USA→РФ: $25K → 495K₽', () => {
    expect(lookupFixedCost(FIXED_COSTS_USA_RU, 25_000)).toBe(495_000);
  });

  it('USA→РФ: $40K → 575K₽', () => {
    expect(lookupFixedCost(FIXED_COSTS_USA_RU, 40_000)).toBe(575_000);
  });

  it('USA→РФ: $50K → 575K + 100K = 675K₽ (overflow)', () => {
    expect(lookupFixedCost(FIXED_COSTS_USA_RU, 50_000)).toBe(675_000);
  });

  it('USA→РФ: $75K → 575K + 400K = 975K₽ (overflow)', () => {
    // $75K - $40K = $35K → ceil(35K/10K) = 4 блока × 100K = 400K
    expect(lookupFixedCost(FIXED_COSTS_USA_RU, 75_000)).toBe(975_000);
  });

  it('USA→РБ: $15K → 450K₽', () => {
    expect(lookupFixedCost(FIXED_COSTS_USA_BY, 15_000)).toBe(450_000);
  });
});

// ─────────────────────────────────────────────
// 🧮 Тесты компонентов (в USD)
// ─────────────────────────────────────────────

describe('calcUSAComponents', () => {
  it('$15K USA→РБ: компоненты', () => {
    const c = calcUSAComponents(15_000, 'BY');
    expect(c.auctionFee).toBeCloseTo(1200, 0);      // 15000 × 0.08
    expect(c.lotWithFee).toBeCloseTo(16200, 0);      // 15000 × 1.08
    expect(c.shipping).toBe(2950);                    // 2200 + 750
    expect(c.insurance).toBeCloseTo(210.65, 0);       // 19150 × 0.011
    expect(c.customs).toBeCloseTo(4860, 0);           // 16200 × 0.30
    expect(c.totalUSD).toBeCloseTo(24220.65, 0);
  });

  it('$25K USA→РФ: компоненты', () => {
    const c = calcUSAComponents(25_000, 'RU');
    expect(c.auctionFee).toBeCloseTo(2000, 0);       // 25000 × 0.08
    expect(c.lotWithFee).toBeCloseTo(27000, 0);       // 25000 × 1.08
    expect(c.customs).toBeCloseTo(14016, 0);          // (27000+2200) × 0.48
    expect(c.totalUSD).toBeCloseTo(44295.45, 0);
  });
});

// ─────────────────────────────────────────────
// 🎯 Эталонные расчёты (из master-context.md)
// ─────────────────────────────────────────────

describe('calcUSA — эталонные расчёты', () => {
  it('🇺🇸 USA → 🇧🇾 РБ: $15K, 150лс → ~2,351,000₽', () => {
    const car: CarInput = {
      country: 'USA',
      destination: 'BY',
      price: 15_000,
      currency: 'USD',
      year: 2024,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
      auction: 'copart',
    };

    const result = calcUSA(car, TEST_RATES);

    // Допуск ±0.5% (округления)
    expect(result.totalRUB).toBeGreaterThan(2_351_000 * 0.995);
    expect(result.totalRUB).toBeLessThan(2_351_000 * 1.005);

    // Проверяем breakdown
    expect(result.breakdown.country).toBe('USA');
    expect(result.breakdown.destination).toBe('BY');
    expect(result.breakdown.ageCategory).toBe('under3');
    expect(result.breakdown.carPriceOriginal).toBe(15_000);
    expect(result.breakdown.fixedCosts).toBe(450_000);
  });

  it('🇺🇸 USA → 🇷🇺 РФ: $25K, 150лс → ~3,972,000₽', () => {
    const car: CarInput = {
      country: 'USA',
      destination: 'RU',
      price: 25_000,
      currency: 'USD',
      year: 2024,
      engineType: 'petrol',
      engineCC: 2500,
      horsePower: 150,
      auction: 'copart',
    };

    const result = calcUSA(car, TEST_RATES);

    expect(result.totalRUB).toBeGreaterThan(3_972_000 * 0.995);
    expect(result.totalRUB).toBeLessThan(3_972_000 * 1.005);

    expect(result.breakdown.fixedCosts).toBe(495_000);
  });
});

// ─────────────────────────────────────────────
// ⚡ Быстрый расчёт
// ─────────────────────────────────────────────

describe('calcUSAQuick', () => {
  it('совпадает с полным расчётом (до 3 лет)', () => {
    const quick = calcUSAQuick(15_000, 'BY', 78.50);

    const car: CarInput = {
      country: 'USA',
      destination: 'BY',
      price: 15_000,
      currency: 'USD',
      year: 2024,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };
    const full = calcUSA(car, TEST_RATES);

    expect(quick).toBe(full.totalRUB);
  });

  it('USA→РФ $25K совпадает', () => {
    const quick = calcUSAQuick(25_000, 'RU', 78.50);

    const car: CarInput = {
      country: 'USA',
      destination: 'RU',
      price: 25_000,
      currency: 'USD',
      year: 2024,
      engineType: 'petrol',
      engineCC: 2500,
      horsePower: 150,
    };
    const full = calcUSA(car, TEST_RATES);

    expect(quick).toBe(full.totalRUB);
  });
});

// ─────────────────────────────────────────────
// 🔢 Дополнительные кейсы
// ─────────────────────────────────────────────

describe('calcUSA — дополнительные кейсы', () => {
  it('дешёвое авто $5K USA→РФ', () => {
    const car: CarInput = {
      country: 'USA',
      destination: 'RU',
      price: 5_000,
      currency: 'USD',
      year: 2024,
      engineType: 'petrol',
      engineCC: 1500,
      horsePower: 120,
    };
    const result = calcUSA(car, TEST_RATES);
    // Должен быть адекватным (>1М₽, <2М₽)
    expect(result.totalRUB).toBeGreaterThan(1_000_000);
    expect(result.totalRUB).toBeLessThan(2_000_000);
  });

  it('дорогое авто $80K USA→РФ — overflow фиксов', () => {
    const car: CarInput = {
      country: 'USA',
      destination: 'RU',
      price: 80_000,
      currency: 'USD',
      year: 2024,
      engineType: 'petrol',
      engineCC: 3000,
      horsePower: 150,
    };
    const result = calcUSA(car, TEST_RATES);

    // Фикс: $80K → 575K + ceil((80K-40K)/10K) × 100K = 575K + 400K = 975K
    expect(result.breakdown.fixedCosts).toBe(975_000);
    // Итого должен быть >10М₽
    expect(result.totalRUB).toBeGreaterThan(10_000_000);
  });

  it('авто 3–5 лет USA→РФ — ЕТТ ЕАЭС', () => {
    const car: CarInput = {
      country: 'USA',
      destination: 'RU',
      price: 15_000,
      currency: 'USD',
      year: 2022, // 4 года → 3to5
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };
    const eurRate = 84.0; // примерный курс EUR/RUB
    const result = calcUSA(car, TEST_RATES, eurRate);

    expect(result.breakdown.ageCategory).toBe('3to5');
    expect(result.breakdown.usedTKS).toBe(true);
    // Для 2000см³, 3-5 лет: 2000 × 2.7€/см³ = 5400€ × 84₽ = 453,600₽ × 1.20 = 544,320₽
    // Это ~$6,934 по USDT 78.50
    expect(result.totalRUB).toBeGreaterThan(2_000_000);
  });

  it('бросает ошибку без engineCC для 3–5 лет', () => {
    const car: CarInput = {
      country: 'USA',
      destination: 'RU',
      price: 15_000,
      currency: 'USD',
      year: 2022,
      engineType: 'petrol',
      horsePower: 150,
      // engineCC не указан!
    };

    expect(() => calcUSA(car, TEST_RATES, 84.0)).toThrow('объём двигателя');
  });

  it('бросает ошибку без eurRate для 3–5 лет', () => {
    const car: CarInput = {
      country: 'USA',
      destination: 'RU',
      price: 15_000,
      currency: 'USD',
      year: 2022,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };

    // eurRate не передан
    expect(() => calcUSA(car, TEST_RATES)).toThrow('EUR/RUB');
  });
});
