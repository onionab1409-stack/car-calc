import { describe, it, expect } from 'vitest';
import { calculateTotal } from '../src/calc';
import { CarInput, ExchangeRates } from '../src/types';

// Курсы на 27.02.2026 (из контекста)
const RATES: ExchangeRates = {
  USDT_RUB: 78.50,
  KRW_RUB: 0.05364,
  CNY_RUB: 11.40,
  AED_USD: 3.67,
};

// Допуск ±5% (формулы подтверждены, но округления могут давать разницу)
function expectInRange(actual: number, expected: number, tolerancePercent = 5) {
  const min = expected * (1 - tolerancePercent / 100);
  const max = expected * (1 + tolerancePercent / 100);
  expect(actual).toBeGreaterThanOrEqual(min);
  expect(actual).toBeLessThanOrEqual(max);
}

describe('🇺🇸 USA', () => {
  it('USA → РБ: $15K, 150лс → ~2,351,000₽', () => {
    const input: CarInput = {
      country: 'USA', destination: 'BY',
      price: 15_000, currency: 'USD',
      year: 2024, engineType: 'petrol', horsePower: 150,
    };
    const result = calculateTotal(input, RATES);
    expectInRange(result.totalRUB, 2_351_000);
    console.log(`USA→BY $15K: ${result.totalRUB.toLocaleString()}₽`);
  });

  it('USA → РФ: $25K, 150лс → ~3,972,000₽', () => {
    const input: CarInput = {
      country: 'USA', destination: 'RU',
      price: 25_000, currency: 'USD',
      year: 2024, engineType: 'petrol', horsePower: 150,
    };
    const result = calculateTotal(input, RATES);
    expectInRange(result.totalRUB, 3_972_000);
    console.log(`USA→RU $25K: ${result.totalRUB.toLocaleString()}₽`);
  });
});

describe('🇰🇷 Korea', () => {
  it('Korea → РФ: 35M₩, 150лс → ~3,469,000₽', () => {
    const input: CarInput = {
      country: 'Korea', destination: 'RU',
      price: 35_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', horsePower: 150,
    };
    const result = calculateTotal(input, RATES);
    expectInRange(result.totalRUB, 3_469_000);
    console.log(`Korea→RU 35M₩: ${result.totalRUB.toLocaleString()}₽`);
  });

  it('Korea → РБ: 28M₩, 130лс → ~2,762,000₽', () => {
    const input: CarInput = {
      country: 'Korea', destination: 'BY',
      price: 28_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', horsePower: 130,
    };
    const result = calculateTotal(input, RATES);
    expectInRange(result.totalRUB, 2_762_000);
    console.log(`Korea→BY 28M₩: ${result.totalRUB.toLocaleString()}₽`);
  });
});

describe('🇦🇪 UAE', () => {
  it('UAE → РФ: 120K AED, 150лс → ~4,495,000₽', () => {
    const input: CarInput = {
      country: 'UAE', destination: 'RU',
      price: 120_000, currency: 'AED',
      year: 2025, engineType: 'petrol', horsePower: 150,
    };
    const result = calculateTotal(input, RATES);
    expectInRange(result.totalRUB, 4_495_000);
    console.log(`UAE→RU 120K AED: ${result.totalRUB.toLocaleString()}₽`);
  });

  it('UAE → РБ: 90K AED, 150лс → ~3,246,000₽', () => {
    const input: CarInput = {
      country: 'UAE', destination: 'BY',
      price: 90_000, currency: 'AED',
      year: 2025, engineType: 'petrol', horsePower: 150,
    };
    const result = calculateTotal(input, RATES);
    expectInRange(result.totalRUB, 3_246_000);
    console.log(`UAE→BY 90K AED: ${result.totalRUB.toLocaleString()}₽`);
  });
});

describe('🇨🇳 China', () => {
  it('China → РФ: 180K¥, 150лс → ~3,838,000₽', () => {
    const input: CarInput = {
      country: 'China', destination: 'RU',
      price: 180_000, currency: 'CNY',
      year: 2024, engineType: 'petrol', horsePower: 150,
    };
    const result = calculateTotal(input, RATES);
    expectInRange(result.totalRUB, 3_838_000);
    console.log(`China→RU 180K¥: ${result.totalRUB.toLocaleString()}₽`);
  });

  it('China → РБ: 150K¥, 120лс → ~3,117,000₽', () => {
    const input: CarInput = {
      country: 'China', destination: 'BY',
      price: 150_000, currency: 'CNY',
      year: 2024, engineType: 'petrol', horsePower: 120,
    };
    const result = calculateTotal(input, RATES);
    expectInRange(result.totalRUB, 3_117_000);
    console.log(`China→BY 150K¥: ${result.totalRUB.toLocaleString()}₽`);
  });
});
