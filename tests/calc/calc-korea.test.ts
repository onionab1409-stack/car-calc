// ============================================
// 🧪 Тесты: calc-korea.ts
// ============================================
// Эталонные расчёты из master-context.md
// Курсы на 27.02.2026: KRW_RUB 0.05364₽ (ЦБ + спред ВТБ)

import { describe, it, expect } from 'vitest';
import { calcKorea, calcKoreaQuick, calcKoreaComponents } from '@/calc/calc-korea';
import { KOREA } from '@/calc/data/constants';
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
// 🔍 Тесты констант
// ─────────────────────────────────────────────

describe('KOREA constants', () => {
  it('множители и фиксы корректны', () => {
    expect(KOREA.CUSTOMS_MULTIPLIER_RU).toBe(1.48);
    expect(KOREA.CUSTOMS_MULTIPLIER_BY).toBe(1.30);
    expect(KOREA.LOGISTICS_RUB).toBe(90_000);
    expect(KOREA.FIXED_RU_RUB).toBe(600_000);
    expect(KOREA.FIXED_BY_RUB).toBe(720_000);
  });
});

// ─────────────────────────────────────────────
// 🧮 Тесты компонентов (в рублях)
// ─────────────────────────────────────────────

describe('calcKoreaComponents', () => {
  it('35M₩ Корея→РФ: компоненты', () => {
    const c = calcKoreaComponents(35_000_000, 'RU', 0.05364);

    // Цена в рублях: 35M × 0.05364 = 1,877,400₽
    expect(c.carPriceRUB).toBeCloseTo(1_877_400, -1);

    // Таможня: 1,877,400 × (1.48 - 1) = 1,877,400 × 0.48 = 901,152₽
    expect(c.customsRUB).toBeCloseTo(901_152, -1);

    // Цена × множитель: 1,877,400 × 1.48 = 2,778,552₽
    expect(c.carWithCustomsRUB).toBeCloseTo(2_778_552, -1);

    // Логистика: 90,000₽
    expect(c.logisticsRUB).toBe(90_000);

    // Фикс РФ: 600,000₽
    expect(c.fixedCostsRUB).toBe(600_000);

    // Итого: 2,778,552 + 90,000 + 600,000 = 3,468,552₽
    expect(c.totalRUB).toBeCloseTo(3_468_552, -1);
  });

  it('28M₩ Корея→РБ: компоненты', () => {
    const c = calcKoreaComponents(28_000_000, 'BY', 0.05364);

    // Цена в рублях: 28M × 0.05364 = 1,501,920₽
    expect(c.carPriceRUB).toBeCloseTo(1_501_920, -1);

    // Таможня: 1,501,920 × (1.30 - 1) = 1,501,920 × 0.30 = 450,576₽
    expect(c.customsRUB).toBeCloseTo(450_576, -1);

    // Цена × множитель: 1,501,920 × 1.30 = 1,952,496₽
    expect(c.carWithCustomsRUB).toBeCloseTo(1_952_496, -1);

    // Итого: 1,952,496 + 90,000 + 720,000 = 2,762,496₽
    expect(c.totalRUB).toBeCloseTo(2_762_496, -1);
  });
});

// ─────────────────────────────────────────────
// 🎯 Эталонные расчёты (из master-context.md)
// ─────────────────────────────────────────────

describe('calcKorea — эталонные расчёты', () => {
  it('🇰🇷 Корея → 🇷🇺 РФ: 35M₩, 150лс → ~3,469,000₽', () => {
    const car: CarInput = {
      country: 'Korea',
      destination: 'RU',
      price: 35_000_000,
      currency: 'KRW',
      year: 2024,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };

    const result = calcKorea(car, TEST_RATES);

    // Допуск ±0.5% (округления)
    expect(result.totalRUB).toBeGreaterThan(3_469_000 * 0.995);
    expect(result.totalRUB).toBeLessThan(3_469_000 * 1.005);

    // Проверяем breakdown
    expect(result.breakdown.country).toBe('Korea');
    expect(result.breakdown.destination).toBe('RU');
    expect(result.breakdown.ageCategory).toBe('under3');
    expect(result.breakdown.carPriceOriginal).toBe(35_000_000);
    expect(result.breakdown.carPriceCurrency).toBe('KRW');
    expect(result.breakdown.fixedCosts).toBe(600_000);
    expect(result.breakdown.shipping).toBe(90_000);
    expect(result.breakdown.auctionFee).toBe(0);
    expect(result.breakdown.rateSource).toBe('cbr');
  });

  it('🇰🇷 Корея → 🇧🇾 РБ: 28M₩, 130лс → ~2,762,000₽', () => {
    const car: CarInput = {
      country: 'Korea',
      destination: 'BY',
      price: 28_000_000,
      currency: 'KRW',
      year: 2024,
      engineType: 'petrol',
      engineCC: 1600,
      horsePower: 130,
    };

    const result = calcKorea(car, TEST_RATES);

    // Допуск ±0.5%
    expect(result.totalRUB).toBeGreaterThan(2_762_000 * 0.995);
    expect(result.totalRUB).toBeLessThan(2_762_000 * 1.005);

    // Проверяем breakdown
    expect(result.breakdown.country).toBe('Korea');
    expect(result.breakdown.destination).toBe('BY');
    expect(result.breakdown.fixedCosts).toBe(720_000);
  });
});

// ─────────────────────────────────────────────
// ⚡ Быстрый расчёт
// ─────────────────────────────────────────────

describe('calcKoreaQuick', () => {
  it('Корея→РФ 35M₩: совпадает с полным расчётом (до 3 лет)', () => {
    const quick = calcKoreaQuick(35_000_000, 'RU', 0.05364);

    const car: CarInput = {
      country: 'Korea',
      destination: 'RU',
      price: 35_000_000,
      currency: 'KRW',
      year: 2024,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };
    const full = calcKorea(car, TEST_RATES);

    expect(quick).toBe(full.totalRUB);
  });

  it('Корея→РБ 28M₩: совпадает с полным расчётом (до 3 лет)', () => {
    const quick = calcKoreaQuick(28_000_000, 'BY', 0.05364);

    const car: CarInput = {
      country: 'Korea',
      destination: 'BY',
      price: 28_000_000,
      currency: 'KRW',
      year: 2024,
      engineType: 'petrol',
      engineCC: 1600,
      horsePower: 130,
    };
    const full = calcKorea(car, TEST_RATES);

    expect(quick).toBe(full.totalRUB);
  });
});

// ─────────────────────────────────────────────
// 🔢 Дополнительные кейсы
// ─────────────────────────────────────────────

describe('calcKorea — дополнительные кейсы', () => {
  it('дешёвое авто 15M₩ Корея→РФ', () => {
    const car: CarInput = {
      country: 'Korea',
      destination: 'RU',
      price: 15_000_000,
      currency: 'KRW',
      year: 2024,
      engineType: 'petrol',
      engineCC: 1600,
      horsePower: 120,
    };
    const result = calcKorea(car, TEST_RATES);
    // 15M × 0.05364 × 1.48 + 90K + 600K = 1,190,808 + 690,000 = 1,880,808₽
    expect(result.totalRUB).toBeGreaterThan(1_800_000);
    expect(result.totalRUB).toBeLessThan(2_000_000);
  });

  it('дорогое авто 60M₩ Корея→РФ', () => {
    const car: CarInput = {
      country: 'Korea',
      destination: 'RU',
      price: 60_000_000,
      currency: 'KRW',
      year: 2024,
      engineType: 'petrol',
      engineCC: 3000,
      horsePower: 150,
    };
    const result = calcKorea(car, TEST_RATES);
    // 60M × 0.05364 × 1.48 + 90K + 600K = 4,763,232 + 690,000 = 5,453,232₽
    expect(result.totalRUB).toBeGreaterThan(5_300_000);
    expect(result.totalRUB).toBeLessThan(5_600_000);
  });

  it('авто 3–5 лет Корея→РФ — ЕТТ ЕАЭС', () => {
    const car: CarInput = {
      country: 'Korea',
      destination: 'RU',
      price: 30_000_000,
      currency: 'KRW',
      year: 2022, // 4 года → 3to5
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };
    const eurRate = 84.0;
    const result = calcKorea(car, TEST_RATES, eurRate);

    expect(result.breakdown.ageCategory).toBe('3to5');
    expect(result.breakdown.usedTKS).toBe(true);

    // carPriceRUB = 30M × 0.05364 = 1,609,200₽
    // ЕТТ: 2000см³ × 2.7€/см³ = 5400€ × 84₽ = 453,600₽ × 1.20 = 544,320₽
    // total = 1,609,200 + 90,000 + 544,320 + 600,000 = 2,843,520₽
    expect(result.totalRUB).toBeGreaterThan(2_800_000);
    expect(result.totalRUB).toBeLessThan(2_900_000);
  });

  it('авто 3–5 лет Корея→РБ — ЕТТ ЕАЭС', () => {
    const car: CarInput = {
      country: 'Korea',
      destination: 'BY',
      price: 25_000_000,
      currency: 'KRW',
      year: 2022,
      engineType: 'petrol',
      engineCC: 1800,
      horsePower: 130,
    };
    const eurRate = 84.0;
    const result = calcKorea(car, TEST_RATES, eurRate);

    expect(result.breakdown.ageCategory).toBe('3to5');
    // carPriceRUB = 25M × 0.05364 = 1,341,000₽
    // ЕТТ: 1800см³ × 2.5€/см³ = 4500€ × 84₽ = 378,000₽ × 1.20 = 453,600₽
    // total = 1,341,000 + 90,000 + 453,600 + 720,000 = 2,604,600₽
    expect(result.totalRUB).toBeGreaterThan(2_550_000);
    expect(result.totalRUB).toBeLessThan(2_650_000);

    expect(result.breakdown.fixedCosts).toBe(720_000);
  });

  it('бросает ошибку без engineCC для 3–5 лет', () => {
    const car: CarInput = {
      country: 'Korea',
      destination: 'RU',
      price: 30_000_000,
      currency: 'KRW',
      year: 2022,
      engineType: 'petrol',
      horsePower: 150,
    };
    expect(() => calcKorea(car, TEST_RATES, 84.0)).toThrow('объём двигателя');
  });

  it('бросает ошибку без eurRate для 3–5 лет', () => {
    const car: CarInput = {
      country: 'Korea',
      destination: 'RU',
      price: 30_000_000,
      currency: 'KRW',
      year: 2022,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };
    expect(() => calcKorea(car, TEST_RATES)).toThrow('EUR/RUB');
  });

  it('авто 5+ лет Корея→РФ — ЕТТ 5+ ставки', () => {
    const car: CarInput = {
      country: 'Korea',
      destination: 'RU',
      price: 20_000_000,
      currency: 'KRW',
      year: 2019, // 7 лет → over5
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    };
    const eurRate = 84.0;
    const result = calcKorea(car, TEST_RATES, eurRate);

    expect(result.breakdown.ageCategory).toBe('over5');
    expect(result.breakdown.usedTKS).toBe(true);

    // ЕТТ 5+: 2000см³ × 4.8€/см³ = 9600€ × 84₽ = 806,400₽ × 1.20 = 967,680₽
    // carPriceRUB = 20M × 0.05364 = 1,072,800₽
    // total = 1,072,800 + 90,000 + 967,680 + 600,000 = 2,730,480₽
    expect(result.totalRUB).toBeGreaterThan(2_680_000);
    expect(result.totalRUB).toBeLessThan(2_780_000);
  });
});
