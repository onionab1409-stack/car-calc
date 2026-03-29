// ============================================
// 🧪 Тесты: master-calculator (index.ts)
// ============================================
// P3.6 + P3.7: Все 8 эталонных расчётов через единую точку входа
// + интеграция утильсбора для >160 л.с.

import { describe, it, expect } from 'vitest';
import { calculate, calculateQuick } from '@/calc';
import type { CarInput, ExchangeRates } from '@/types';

// ─────────────────────────────────────────────
// 📐 Тестовые курсы (27.02.2026)
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
// 🎯 ВСЕ 8 ЭТАЛОННЫХ РАСЧЁТОВ (master-context.md)
// ─────────────────────────────────────────────

describe('calculate — 8 эталонных расчётов (≤160лс, без доплаты утильсбора)', () => {
  it('#1 🇺🇸 USA → 🇧🇾 РБ: $15K, 150лс → ~2,351,000₽', () => {
    const car: CarInput = {
      country: 'USA', destination: 'BY', price: 15_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 150, auction: 'copart',
    };
    const r = calculate(car, TEST_RATES, EUR_RATE);
    expect(r.totalRUB).toBeGreaterThan(2_351_000 * 0.995);
    expect(r.totalRUB).toBeLessThan(2_351_000 * 1.005);
    expect(r.breakdown.utilSbor).toBe(0);
  });

  it('#2 🇺🇸 USA → 🇷🇺 РФ: $25K, 150лс → ~3,972,000₽', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 25_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2500, horsePower: 150, auction: 'copart',
    };
    const r = calculate(car, TEST_RATES, EUR_RATE);
    expect(r.totalRUB).toBeGreaterThan(4_028_587 * 0.99);
    expect(r.totalRUB).toBeLessThan(4_028_587 * 1.01);
    expect(r.breakdown.utilSbor).toBe(0);
  });

  it('#3 🇰🇷 Корея → 🇷🇺 РФ: 35M₩, 150лс → ~3,469,000₽', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 35_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, TEST_RATES, EUR_RATE);
    expect(r.totalRUB).toBeGreaterThan(3_492_720 * 0.99);
    expect(r.totalRUB).toBeLessThan(3_492_720 * 1.01);
    expect(r.breakdown.utilSbor).toBe(0);
  });

  it('#4 🇰🇷 Корея → 🇧🇾 РБ: 28M₩, 130лс → ~2,762,000₽', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'BY', price: 28_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', engineCC: 1600, horsePower: 130,
    };
    const r = calculate(car, TEST_RATES, EUR_RATE);
    expect(r.totalRUB).toBeGreaterThan(2_762_000 * 0.995);
    expect(r.totalRUB).toBeLessThan(2_762_000 * 1.005);
    expect(r.breakdown.utilSbor).toBe(0);
  });

  it('#5 🇦🇪 ОАЭ → 🇷🇺 РФ: 120K AED, 150лс → ~4,681,000₽', () => {
    const car: CarInput = {
      country: 'UAE', destination: 'RU', price: 120_000, currency: 'AED',
      year: 2025, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, TEST_RATES, EUR_RATE);
    expect(r.totalRUB).toBeGreaterThan(4_680_577 * 0.99);
    expect(r.totalRUB).toBeLessThan(4_680_577 * 1.01);
    expect(r.breakdown.utilSbor).toBe(0);
  });

  it('#6 🇦🇪 ОАЭ → 🇧🇾 РБ: 90K AED, 150лс → ~3,409,000₽', () => {
    const car: CarInput = {
      country: 'UAE', destination: 'BY', price: 90_000, currency: 'AED',
      year: 2025, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, TEST_RATES, EUR_RATE);
    expect(r.totalRUB).toBeGreaterThan(3_409_149 * 0.995);
    expect(r.totalRUB).toBeLessThan(3_409_149 * 1.005);
    expect(r.breakdown.utilSbor).toBe(0);
  });

  it('#7 🇨🇳 Китай → 🇷🇺 РФ: 180K¥, 150лс → ~3,838,000₽', () => {
    const car: CarInput = {
      country: 'China', destination: 'RU', price: 180_000, currency: 'CNY',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, TEST_RATES, EUR_RATE);
    expect(r.totalRUB).toBeGreaterThan(3_837_860 * 0.99);
    expect(r.totalRUB).toBeLessThan(3_837_860 * 1.01);
    expect(r.breakdown.utilSbor).toBe(0);
  });

  it('#8 🇨🇳 Китай → 🇧🇾 РБ: 150K¥, 120лс → ~3,117,000₽', () => {
    const car: CarInput = {
      country: 'China', destination: 'BY', price: 150_000, currency: 'CNY',
      year: 2024, engineType: 'petrol', engineCC: 1600, horsePower: 120,
    };
    const r = calculate(car, TEST_RATES, EUR_RATE);
    expect(r.totalRUB).toBeGreaterThan(3_117_000 * 0.995);
    expect(r.totalRUB).toBeLessThan(3_117_000 * 1.005);
    expect(r.breakdown.utilSbor).toBe(0);
  });
});

// ─────────────────────────────────────────────
// 🏋️ Утильсбор: авто >160 л.с.
// ─────────────────────────────────────────────

describe('calculate — с доплатой утильсбора (>160лс)', () => {
  it('USA→РФ $25K, 200лс, 2.0L → базовый + 949,400₽ утильсбор', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 25_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 200, auction: 'copart',
    };
    const r = calculate(car, TEST_RATES, EUR_RATE);

    // Утильсбор: 200лс, 2.0L → k=47.64 → 952,800₽ - 3,400₽ = 949,400₽
    expect(r.breakdown.utilSbor).toBe(949_400);

    // Базовый расчёт ~3,326K (ETT) + утильсбор 949,400
    // + 949,400 → ~4,921K
    expect(r.totalRUB).toBeGreaterThan(4_850_000);
    expect(r.totalRUB).toBeLessThan(5_000_000);
  });

  it('Корея→РФ 35M₩, 180лс, 1.5L → базовый + 896,600₽', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 35_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', engineCC: 1500, horsePower: 180,
    };
    const r = calculate(car, TEST_RATES, EUR_RATE);

    // 180лс, 1.5L → k=45.00 → 900K - 3.4K = 896,600₽
    expect(r.breakdown.utilSbor).toBe(896_600);
    expect(r.totalRUB).toBeGreaterThan(3_468_552 + 896_600 - 20_000);
  });

  it('Китай→РФ 180K¥, 150лс, 3.2L → >3.0L = коммерческий!', () => {
    const car: CarInput = {
      country: 'China', destination: 'RU', price: 180_000, currency: 'CNY',
      year: 2024, engineType: 'petrol', engineCC: 3200, horsePower: 150,
    };
    const r = calculate(car, TEST_RATES, EUR_RATE);

    // 150лс но >3.0L → коммерческий! k=129.20 → 2,584,000 - 3,400 = 2,580,600₽
    expect(r.breakdown.utilSbor).toBe(2_580_600);
  });

  it('ОАЭ→РФ 120K AED, электро 300лс → доплата электро', () => {
    const car: CarInput = {
      country: 'UAE', destination: 'RU', price: 120_000, currency: 'AED',
      year: 2025, engineType: 'electric', horsePower: 300,
    };
    const r = calculate(car, TEST_RATES, EUR_RATE);

    // 300лс электро: 30мин = 300 × 0.7355 × 0.45 = 99.29 кВт
    // Диапазон 80.92–102.97 → k=54.00 → 1,080,000 - 3,400 = 1,076,600
    expect(r.breakdown.utilSbor).toBe(1_076_600);
  });

  it('150лс, ≤3.0L → utilSbor = 0 (льготный)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 15_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, TEST_RATES, EUR_RATE);
    expect(r.breakdown.utilSbor).toBe(0);
  });
});

// ─────────────────────────────────────────────
// ⚡ Quick расчёт через роутер
// ─────────────────────────────────────────────

describe('calculateQuick — роутер', () => {
  it('USA→РБ $15K совпадает с полным (до 3 лет, ≤160лс)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'BY', price: 15_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const quick = calculateQuick(car, TEST_RATES);
    const full = calculate(car, TEST_RATES, EUR_RATE);
    expect(quick).toBe(full.totalRUB);
  });

  it('Korea→РБ 28M₩ совпадает с полным (до 3 лет, ≤160лс)', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'BY', price: 28_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const quick = calculateQuick(car, TEST_RATES);
    const full = calculate(car, TEST_RATES, EUR_RATE);
    expect(quick).toBe(full.totalRUB);
  });

  it('UAE→РБ 90K AED совпадает', () => {
    const car: CarInput = {
      country: 'UAE', destination: 'BY', price: 90_000, currency: 'AED',
      year: 2025, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const quick = calculateQuick(car, TEST_RATES);
    const full = calculate(car, TEST_RATES, EUR_RATE);
    expect(quick).toBe(full.totalRUB);
  });

  it('China→РБ 150K¥ совпадает', () => {
    const car: CarInput = {
      country: 'China', destination: 'BY', price: 150_000, currency: 'CNY',
      year: 2024, engineType: 'petrol', engineCC: 1600, horsePower: 120,
    };
    const quick = calculateQuick(car, TEST_RATES);
    const full = calculate(car, TEST_RATES, EUR_RATE);
    expect(quick).toBe(full.totalRUB);
  });
});

// ─────────────────────────────────────────────
// ❌ Ошибки
// ─────────────────────────────────────────────

describe('calculate — ошибки', () => {
  it('неизвестная страна → ошибка', () => {
    const car = {
      country: 'Japan' as any, destination: 'RU' as const, price: 1000, currency: 'JPY' as any,
      year: 2024, engineType: 'petrol' as const, horsePower: 150,
    };
    expect(() => calculate(car, TEST_RATES, EUR_RATE)).toThrow('Неизвестная страна');
  });

  it('ОАЭ 3–5 лет → ошибка', () => {
    const car: CarInput = {
      country: 'UAE', destination: 'RU', price: 100_000, currency: 'AED',
      year: 2022, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    expect(() => calculate(car, TEST_RATES, EUR_RATE)).toThrow('только новые авто');
  });
});
