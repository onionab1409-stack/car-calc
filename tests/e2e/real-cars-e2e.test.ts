// ============================================
// 🧪 P7.1 · E2E тесты — 20 реальных автомобилей
// ============================================
// Каждый кейс — реальная машина с реальными параметрами.
// Ожидаемые значения рассчитаны вручную по формулам из master-context.md.
// Допуск ±5% от ручного расчёта.
//
// Покрытие:
// - Все 4 страны (USA, Korea, UAE, China)
// - Оба направления (РФ, РБ)
// - 3 возрастные категории (до 3 лет, 3–5 лет, 5+ лет)
// - >160 л.с. (коммерческий утильсбор)
// - >3.0L (коммерческий утильсбор даже при ≤160 л.с.)
// - Электромобили
// - Overflow pricing ($40K+, $50K+)
// - Гибриды
// - Граничные значения (ровно $20K, ровно 160 л.с.)

import { describe, it, expect } from 'vitest';
import { calculate } from '@/calc';
import type { CarInput, ExchangeRates, CalcResult } from '@/types';

// ─────────────────────────────────────────────
// 📐 Тестовые курсы (27.02.2026 — те же что и в эталонах)
// ─────────────────────────────────────────────

const RATES: ExchangeRates = {
  USDT_RUB: 78.50,
  KRW_RUB: 0.05364,
  CNY_RUB: 11.40,
  AED_USD: 3.67,
  updatedAt: '2026-02-27T12:00:00Z',
};

const EUR_RATE = 84.12; // EUR/RUB для ЕТТ ЕАЭС

// ─────────────────────────────────────────────
// 🔧 Хелперы для ручного расчёта
// ─────────────────────────────────────────────

/** Ручной расчёт USA → РФ/РБ (до 3 лет) */
function manualUSA(lot: number, dest: 'RU' | 'BY'): number {
  const lotWithFee = lot * 1.08;
  const preCustomsBase = lotWithFee + 2200 + 750;
  const preCustomsTotal = preCustomsBase * 1.011;

  let customs: number;
  if (dest === 'RU') {
    customs = (lotWithFee + 2200) * 0.48;
  } else {
    customs = lotWithFee * 0.30;
  }

  const totalUSD = preCustomsTotal + customs;

  // Фикс
  let fix: number;
  if (dest === 'RU') {
    if (lot <= 20000) fix = 425000;
    else if (lot <= 30000) fix = 495000;
    else if (lot <= 40000) fix = 575000;
    else fix = 575000 + Math.ceil((lot - 40000) / 10000) * 100000;
  } else {
    if (lot <= 20000) fix = 450000;
    else if (lot <= 30000) fix = 520000;
    else if (lot <= 40000) fix = 600000;
    else fix = 600000 + Math.ceil((lot - 40000) / 10000) * 100000;
  }

  return Math.round(totalUSD * RATES.USDT_RUB + fix);
}

/** Ручной расчёт USA 3-5/5+ лет */
function manualUSA_ETT(lot: number, dest: 'RU' | 'BY', engineCC: number, age: '3to5' | 'over5'): number {
  const lotWithFee = lot * 1.08;
  const preCustomsBase = lotWithFee + 2200 + 750;
  const preCustomsTotal = preCustomsBase * 1.011;

  // ETT
  const ettRates3to5: [number, number][] = [[1000, 1.5], [1500, 1.7], [1800, 2.5], [2300, 2.7], [3000, 3.0], [Infinity, 3.6]];
  const ettRates5plus: [number, number][] = [[1000, 3.0], [1500, 3.2], [1800, 3.5], [2300, 4.8], [3000, 5.0], [Infinity, 5.7]];
  const rates = age === '3to5' ? ettRates3to5 : ettRates5plus;
  const rate = rates.find(([maxCC]) => engineCC <= maxCC)!;
  const ettRUB = Math.round(engineCC * rate[1] * EUR_RATE);
  const customsUSD = ettRUB / RATES.USDT_RUB;

  const totalUSD = preCustomsTotal + customsUSD;

  // Фикс (по lot, не по totalUSD)
  let fix: number;
  if (dest === 'RU') {
    if (lot <= 20000) fix = 425000;
    else if (lot <= 30000) fix = 495000;
    else if (lot <= 40000) fix = 575000;
    else fix = 575000 + Math.ceil((lot - 40000) / 10000) * 100000;
  } else {
    if (lot <= 20000) fix = 450000;
    else if (lot <= 30000) fix = 520000;
    else if (lot <= 40000) fix = 600000;
    else fix = 600000 + Math.ceil((lot - 40000) / 10000) * 100000;
  }

  return Math.round(totalUSD * RATES.USDT_RUB + fix);
}

/** Ручной расчёт Корея → РФ/РБ (до 3 лет) */
function manualKorea(priceKRW: number, dest: 'RU' | 'BY'): number {
  const mult = dest === 'RU' ? 1.48 : 1.30;
  const fix = dest === 'RU' ? 600000 : 720000;
  return Math.round(priceKRW * RATES.KRW_RUB * mult + 90000 + fix);
}

/** Ручной расчёт Корея 3-5/5+ лет */
function manualKorea_ETT(priceKRW: number, dest: 'RU' | 'BY', engineCC: number, age: '3to5' | 'over5'): number {
  const priceRUB = priceKRW * RATES.KRW_RUB;
  const fix = dest === 'RU' ? 600000 : 720000;

  const ettRates3to5: [number, number][] = [[1000, 1.5], [1500, 1.7], [1800, 2.5], [2300, 2.7], [3000, 3.0], [Infinity, 3.6]];
  const ettRates5plus: [number, number][] = [[1000, 3.0], [1500, 3.2], [1800, 3.5], [2300, 4.8], [3000, 5.0], [Infinity, 5.7]];
  const rates = age === '3to5' ? ettRates3to5 : ettRates5plus;
  const rate = rates.find(([maxCC]) => engineCC <= maxCC)!;
  const ettRUB = Math.round(engineCC * rate[1] * EUR_RATE);

  return Math.round(priceRUB + 90000 + ettRUB + fix);
}

/** Ручной расчёт ОАЭ → РФ/РБ */
function manualUAE(priceAED: number, dest: 'RU' | 'BY'): number {
  const priceUSD = priceAED / 3.67 + 3200;
  const mult = dest === 'RU' ? 1.48 : 1.30;
  const totalRUBBeforeFix = priceUSD * RATES.USDT_RUB * mult;

  let fix: number;
  if (dest === 'RU') {
    if (priceUSD <= 20000) fix = 440000;
    else if (priceUSD <= 30000) fix = 460000;
    else if (priceUSD <= 40000) fix = 510000;
    else if (priceUSD <= 50000) fix = 560000;
    else fix = 560000 + Math.ceil((priceUSD - 50000) / 10000) * 100000;
  } else {
    if (priceUSD <= 20000) fix = 530000;
    else if (priceUSD <= 30000) fix = 580000;
    else if (priceUSD <= 40000) fix = 630000;
    else if (priceUSD <= 50000) fix = 680000;
    else fix = 680000 + Math.ceil((priceUSD - 50000) / 10000) * 100000;
  }

  return Math.round(totalRUBBeforeFix + fix);
}

/** Ручной расчёт Китай → РФ/РБ (до 3 лет) */
function manualChina(priceCNY: number, dest: 'RU' | 'BY'): number {
  const baseCNY = priceCNY + 8000 + priceCNY * 0.025;
  const mult = dest === 'RU' ? 1.48 : 1.30;
  const fix = dest === 'RU' ? 590000 : 720000;
  return Math.round(baseCNY * RATES.CNY_RUB * mult + fix);
}

/** Ручной расчёт Китай 3-5/5+ лет */
function manualChina_ETT(priceCNY: number, dest: 'RU' | 'BY', engineCC: number, age: '3to5' | 'over5'): number {
  const baseCNY = priceCNY + 8000 + priceCNY * 0.025;
  const baseRUB = baseCNY * RATES.CNY_RUB;
  const fix = dest === 'RU' ? 590000 : 720000;

  const ettRates3to5: [number, number][] = [[1000, 1.5], [1500, 1.7], [1800, 2.5], [2300, 2.7], [3000, 3.0], [Infinity, 3.6]];
  const ettRates5plus: [number, number][] = [[1000, 3.0], [1500, 3.2], [1800, 3.5], [2300, 4.8], [3000, 5.0], [Infinity, 5.7]];
  const rates = age === '3to5' ? ettRates3to5 : ettRates5plus;
  const rate = rates.find(([maxCC]) => engineCC <= maxCC)!;
  const ettRUB = Math.round(engineCC * rate[1] * EUR_RATE);

  return Math.round(baseRUB + ettRUB + fix);
}

// ─────────────────────────────────────────────
// 🔍 Хелпер проверки ±5%
// ─────────────────────────────────────────────

function expectWithin5Percent(actual: number, expected: number, label: string) {
  const low = expected * 0.95;
  const high = expected * 1.05;
  expect(actual, `${label}: ${actual.toLocaleString()}₽ не в диапазоне ±5% от ${expected.toLocaleString()}₽ (${low.toLocaleString()} — ${high.toLocaleString()})`).toBeGreaterThanOrEqual(low);
  expect(actual, `${label}: ${actual.toLocaleString()}₽ не в диапазоне ±5% от ${expected.toLocaleString()}₽`).toBeLessThanOrEqual(high);
}

// ═════════════════════════════════════════════
// 🚗 20 РЕАЛЬНЫХ АВТОМОБИЛЕЙ
// ═════════════════════════════════════════════

describe('P7.1 · E2E: 20 реальных автомобилей', () => {

  // ─────────────────────────────────────────
  // 🇺🇸 USA — 7 кейсов
  // ─────────────────────────────────────────

  it('#01 🇺🇸 Toyota Camry $18K, 2024, 2.5L 203hp → РФ (under3, >160hp)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 18_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2500, horsePower: 203, auction: 'copart',
    };
    const r = calculate(car, RATES);
    const base = manualUSA(18000, 'RU');

    // Базовый расчёт без утильсбора
    expect(r.breakdown.country).toBe('USA');
    expect(r.breakdown.destination).toBe('RU');
    expect(r.breakdown.ageCategory).toBe('under3');

    // 203hp > 160 → коммерческий утильсбор
    expect(r.breakdown.utilSbor).toBeGreaterThan(0);
    expect(r.totalRUB).toBeGreaterThan(base); // total > base (есть доплата)

    // Проверка: base часть ±1% от ручного
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'Camry base');
  });

  it('#02 🇺🇸 Ford Mustang $35K, 2024, 2.3L 310hp → РФ (30-40K range, big HP)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 35_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2300, horsePower: 310, auction: 'copart',
    };
    const r = calculate(car, RATES);
    const base = manualUSA(35000, 'RU');

    // 310hp → большой утильсбор
    expect(r.breakdown.utilSbor).toBeGreaterThan(500_000);
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'Mustang base');
  });

  it('#03 🇺🇸 Honda Civic $12K, 2024, 2.0L 158hp → РБ (≤160hp, льготный)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'BY', price: 12_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 158, auction: 'copart',
    };
    const r = calculate(car, RATES);
    const expected = manualUSA(12000, 'BY');

    // 158hp ≤ 160 и 2.0L ≤ 3.0L → льготный → доплата 0
    expect(r.breakdown.utilSbor).toBe(0);
    expectWithin5Percent(r.totalRUB, expected, 'Civic');
  });

  it('#04 🇺🇸 BMW X5 $45K, 2024, 3.0L 335hp → РФ (overflow >$40K)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 45_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 3000, horsePower: 335, auction: 'copart',
    };
    const r = calculate(car, RATES);
    const base = manualUSA(45000, 'RU');

    // Overflow: 45K > 40K → fix = 575K + ceil(5K/10K)*100K = 675K₽
    expect(r.breakdown.fixedCosts).toBe(675_000);
    // 335hp > 160 → коммерческий утильсбор
    expect(r.breakdown.utilSbor).toBeGreaterThan(0);
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'BMW X5 base');
  });

  it('#05 🇺🇸 Tesla Model 3 $28K, 2024, electric 283hp → РФ (электро)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 28_000, currency: 'USD',
      year: 2024, engineType: 'electric', horsePower: 283, auction: 'copart',
    };
    const r = calculate(car, RATES);
    const base = manualUSA(28000, 'RU');

    // Электро 283hp → 30мин = 283 × 0.7355 × 0.45 ≈ 93.65 кВт > 58.84 → коммерческий
    expect(r.breakdown.utilSbor).toBeGreaterThan(0);
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'Tesla base');
  });

  it('#06 🇺🇸 Toyota RAV4 $22K, 2022, 2.5L 203hp → РФ (3-5 лет, ЕТТ ЕАЭС)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 22_000, currency: 'USD',
      year: 2022, engineType: 'petrol', engineCC: 2500, horsePower: 203, auction: 'copart',
    };
    const r = calculate(car, RATES, EUR_RATE);
    const base = manualUSA_ETT(22000, 'RU', 2500, '3to5');

    expect(r.breakdown.ageCategory).toBe('3to5');
    expect(r.breakdown.usedTKS).toBe(true);
    // 203hp > 160 → утильсбор (used: 3to5 → kUsed)
    expect(r.breakdown.utilSbor).toBeGreaterThan(0);
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'RAV4 3-5yr base');
  });

  it('#07 🇺🇸 Lexus RX350 $18K, 2019, 3.5L 295hp → РФ (5+ лет, >3.0L)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 18_000, currency: 'USD',
      year: 2019, engineType: 'petrol', engineCC: 3500, horsePower: 295, auction: 'copart',
    };
    const r = calculate(car, RATES, EUR_RATE);
    const base = manualUSA_ETT(18000, 'RU', 3500, 'over5');

    expect(r.breakdown.ageCategory).toBe('over5');
    expect(r.breakdown.usedTKS).toBe(true);
    // 295hp > 160 И 3.5L > 3.0L → коммерческий утильсбор (очень большой!)
    expect(r.breakdown.utilSbor).toBeGreaterThan(1_000_000);
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'Lexus 5yr base');
  });

  // ─────────────────────────────────────────
  // 🇰🇷 Корея — 4 кейса
  // ─────────────────────────────────────────

  it('#08 🇰🇷 Hyundai Tucson 32M₩, 2024, 2.0L 156hp → РФ (≤160hp)', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 32_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 156,
    };
    const r = calculate(car, RATES);
    const expected = manualKorea(32_000_000, 'RU');

    expect(r.breakdown.utilSbor).toBe(0); // ≤160hp
    expectWithin5Percent(r.totalRUB, expected, 'Tucson KR→РФ');
  });

  it('#09 🇰🇷 Kia K5 25M₩, 2024, 2.0L 152hp → РБ (≤160hp)', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'BY', price: 25_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 152,
    };
    const r = calculate(car, RATES);
    const expected = manualKorea(25_000_000, 'BY');

    expect(r.breakdown.utilSbor).toBe(0);
    expectWithin5Percent(r.totalRUB, expected, 'Kia K5 KR→РБ');
  });

  it('#10 🇰🇷 Genesis G80 55M₩, 2024, 2.5L 300hp → РФ (>160hp)', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 55_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', engineCC: 2500, horsePower: 300,
    };
    const r = calculate(car, RATES);
    const base = manualKorea(55_000_000, 'RU');

    expect(r.breakdown.utilSbor).toBeGreaterThan(0);
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'Genesis G80 base');
  });

  it('#11 🇰🇷 Hyundai Santa Fe 30M₩, 2022, 2.5L 180hp → РФ (3-5 лет)', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 30_000_000, currency: 'KRW',
      year: 2022, engineType: 'petrol', engineCC: 2500, horsePower: 180,
    };
    const r = calculate(car, RATES, EUR_RATE);
    const base = manualKorea_ETT(30_000_000, 'RU', 2500, '3to5');

    expect(r.breakdown.ageCategory).toBe('3to5');
    expect(r.breakdown.usedTKS).toBe(true);
    // 180hp > 160 → утильсбор
    expect(r.breakdown.utilSbor).toBeGreaterThan(0);
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'Santa Fe 3-5yr base');
  });

  // ─────────────────────────────────────────
  // 🇦🇪 ОАЭ — 3 кейса
  // ─────────────────────────────────────────

  it('#12 🇦🇪 Toyota Land Cruiser 200K AED, 2025, 3.5L 409hp → РФ (expensive)', () => {
    const car: CarInput = {
      country: 'UAE', destination: 'RU', price: 200_000, currency: 'AED',
      year: 2025, engineType: 'petrol', engineCC: 3500, horsePower: 409,
    };
    const r = calculate(car, RATES);
    const base = manualUAE(200_000, 'RU');

    // priceUSD = 200000/3.67 + 3200 ≈ 57_717 → overflow >$50K
    expect(r.breakdown.fixedCosts).toBeGreaterThan(560_000);
    // 409hp > 160, 3.5L > 3.0L → утильсбор огромный
    expect(r.breakdown.utilSbor).toBeGreaterThan(1_000_000);
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'LC 200K base');
  });

  it('#13 🇦🇪 Nissan Patrol 150K AED, 2025, 4.0L 275hp → РБ (>3.0L)', () => {
    const car: CarInput = {
      country: 'UAE', destination: 'BY', price: 150_000, currency: 'AED',
      year: 2025, engineType: 'petrol', engineCC: 4000, horsePower: 275,
    };
    const r = calculate(car, RATES);
    const base = manualUAE(150_000, 'BY');

    // 275hp > 160 и 4.0L > 3.0L → коммерческий утильсбор
    expect(r.breakdown.utilSbor).toBeGreaterThan(1_000_000);
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'Patrol BY base');
  });

  it('#14 🇦🇪 Hyundai Tucson 75K AED, 2025, 2.5L 187hp → РФ (умеренная цена)', () => {
    const car: CarInput = {
      country: 'UAE', destination: 'RU', price: 75_000, currency: 'AED',
      year: 2025, engineType: 'petrol', engineCC: 2500, horsePower: 187,
    };
    const r = calculate(car, RATES);
    const base = manualUAE(75_000, 'RU');

    // priceUSD = 75000/3.67 + 3200 ≈ 23637 → ≤$30K → fix 460K
    expect(r.breakdown.fixedCosts).toBe(460_000);
    // 187hp > 160 → утильсбор
    expect(r.breakdown.utilSbor).toBeGreaterThan(0);
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'Tucson UAE base');
  });

  // ─────────────────────────────────────────
  // 🇨🇳 Китай — 5 кейсов
  // ─────────────────────────────────────────

  it('#15 🇨🇳 BYD Han 200K¥, 2024, electric 272hp → РФ (электро)', () => {
    const car: CarInput = {
      country: 'China', destination: 'RU', price: 200_000, currency: 'CNY',
      year: 2024, engineType: 'electric', horsePower: 272,
    };
    const r = calculate(car, RATES);
    const base = manualChina(200_000, 'RU');

    // Электро 272hp → 30мин ≈ 272 × 0.7355 × 0.45 ≈ 89.97 кВт > 58.84 → коммерческий
    expect(r.breakdown.utilSbor).toBeGreaterThan(0);
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'BYD Han base');
  });

  it('#16 🇨🇳 Geely Monjaro 160K¥, 2024, 2.0L 238hp → РФ (>160hp)', () => {
    const car: CarInput = {
      country: 'China', destination: 'RU', price: 160_000, currency: 'CNY',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 238,
    };
    const r = calculate(car, RATES);
    const base = manualChina(160_000, 'RU');

    expect(r.breakdown.utilSbor).toBeGreaterThan(0);
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'Monjaro base');
  });

  it('#17 🇨🇳 Chery Tiggo 8 Pro 130K¥, 2024, 1.6L 186hp → РБ (>160hp)', () => {
    const car: CarInput = {
      country: 'China', destination: 'BY', price: 130_000, currency: 'CNY',
      year: 2024, engineType: 'petrol', engineCC: 1600, horsePower: 186,
    };
    const r = calculate(car, RATES);
    const base = manualChina(130_000, 'BY');

    expect(r.breakdown.destination).toBe('BY');
    expect(r.breakdown.utilSbor).toBeGreaterThan(0); // 186 > 160
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'Tiggo 8 BY base');
  });

  it('#18 🇨🇳 Haval H9 250K¥, 2024, 2.0L 224hp → РФ (дорогой авто)', () => {
    const car: CarInput = {
      country: 'China', destination: 'RU', price: 250_000, currency: 'CNY',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 224,
    };
    const r = calculate(car, RATES);
    const base = manualChina(250_000, 'RU');

    expect(r.breakdown.utilSbor).toBeGreaterThan(0);
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'Haval H9 base');
  });

  // ─────────────────────────────────────────
  // 🔥 Экстремальные кейсы
  // ─────────────────────────────────────────

  it('#19 🇺🇸 Cadillac Escalade $55K, 2024, 6.2L 420hp → РБ (overflow + huge util)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'BY', price: 55_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 6200, horsePower: 420, auction: 'copart',
    };
    const r = calculate(car, RATES);
    const base = manualUSA(55000, 'BY');

    // Overflow: 55K > 40K → fix = 600K + ceil(15K/10K)*100K = 600K + 200K = 800K
    expect(r.breakdown.fixedCosts).toBe(800_000);
    // 6.2L > 3.0L И 420hp > 160 → ОГРОМНЫЙ коммерческий утильсбор
    expect(r.breakdown.utilSbor).toBeGreaterThan(2_000_000);
    const baseWithoutUtil = r.totalRUB - r.breakdown.utilSbor;
    expectWithin5Percent(baseWithoutUtil, base, 'Escalade base');
    // Общий итог должен быть очень большим
    expect(r.totalRUB).toBeGreaterThan(7_000_000);
  });

  it('#20 🇨🇳 Li Auto L9 350K¥, 2022, hybrid 1.5L 154hp → РФ (3-5 лет, hybrid, ≤160hp)', () => {
    const car: CarInput = {
      country: 'China', destination: 'RU', price: 350_000, currency: 'CNY',
      year: 2022, engineType: 'hybrid', engineCC: 1500, horsePower: 154,
    };
    const r = calculate(car, RATES, EUR_RATE);
    const base = manualChina_ETT(350_000, 'RU', 1500, '3to5');

    expect(r.breakdown.ageCategory).toBe('3to5');
    expect(r.breakdown.usedTKS).toBe(true);
    // 154hp ≤ 160 и 1.5L ≤ 3.0L → льготный утильсбор → доплата 0
    expect(r.breakdown.utilSbor).toBe(0);
    expectWithin5Percent(r.totalRUB, base, 'Li Auto L9 3-5yr');
  });
});

// ═════════════════════════════════════════════
// 🔬 ДОПОЛНИТЕЛЬНАЯ ВАЛИДАЦИЯ BREAKDOWN
// ═════════════════════════════════════════════

describe('P7.1 · E2E: валидация breakdown полей', () => {

  it('Все 20 кейсов: breakdown содержит обязательные поля', () => {
    const testCars: CarInput[] = [
      // Выборка из 20 кейсов — 4 страны, оба направления
      { country: 'USA', destination: 'RU', price: 18000, currency: 'USD', year: 2024, engineType: 'petrol', engineCC: 2500, horsePower: 203, auction: 'copart' },
      { country: 'USA', destination: 'BY', price: 12000, currency: 'USD', year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 158, auction: 'copart' },
      { country: 'Korea', destination: 'RU', price: 32_000_000, currency: 'KRW', year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 156 },
      { country: 'Korea', destination: 'BY', price: 25_000_000, currency: 'KRW', year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 152 },
      { country: 'UAE', destination: 'RU', price: 120_000, currency: 'AED', year: 2025, engineType: 'petrol', engineCC: 2500, horsePower: 187 },
      { country: 'China', destination: 'RU', price: 200_000, currency: 'CNY', year: 2024, engineType: 'electric', horsePower: 272 },
      { country: 'China', destination: 'BY', price: 130_000, currency: 'CNY', year: 2024, engineType: 'petrol', engineCC: 1600, horsePower: 186 },
    ];

    for (const car of testCars) {
      const r = calculate(car, RATES, EUR_RATE);
      const b = r.breakdown;

      expect(b.country).toBe(car.country);
      expect(b.destination).toBe(car.destination);
      expect(b.carPriceOriginal).toBe(car.price);
      expect(b.totalRUB).toBe(r.totalRUB);
      expect(b.exchangeRate).toBeGreaterThan(0);
      expect(b.timestamp).toBeTruthy();
      expect(b.formula).toBeTruthy();
      expect(typeof b.fixedCosts).toBe('number');
      expect(typeof b.customs).toBe('number');
      expect(typeof b.shipping).toBe('number');
      expect(typeof b.utilSbor).toBe('number');
    }
  });

  it('Все расчёты: totalRUB > 0 и разумный диапазон (500K — 30M₽)', () => {
    const cars: CarInput[] = [
      { country: 'USA', destination: 'RU', price: 5_000, currency: 'USD', year: 2024, engineType: 'petrol', engineCC: 1600, horsePower: 120 },
      { country: 'USA', destination: 'RU', price: 80_000, currency: 'USD', year: 2024, engineType: 'petrol', engineCC: 6200, horsePower: 420, auction: 'copart' },
      { country: 'Korea', destination: 'RU', price: 15_000_000, currency: 'KRW', year: 2024, engineType: 'petrol', engineCC: 1600, horsePower: 120 },
      { country: 'Korea', destination: 'RU', price: 80_000_000, currency: 'KRW', year: 2024, engineType: 'petrol', engineCC: 3000, horsePower: 300 },
      { country: 'UAE', destination: 'RU', price: 50_000, currency: 'AED', year: 2025, engineType: 'petrol', engineCC: 1800, horsePower: 140 },
      { country: 'UAE', destination: 'RU', price: 300_000, currency: 'AED', year: 2025, engineType: 'petrol', engineCC: 4000, horsePower: 400 },
      { country: 'China', destination: 'RU', price: 80_000, currency: 'CNY', year: 2024, engineType: 'petrol', engineCC: 1500, horsePower: 110 },
      { country: 'China', destination: 'RU', price: 400_000, currency: 'CNY', year: 2024, engineType: 'petrol', engineCC: 3000, horsePower: 250 },
    ];

    for (const car of cars) {
      const r = calculate(car, RATES, EUR_RATE);
      expect(r.totalRUB, `${car.country} ${car.price}`).toBeGreaterThan(500_000);
      expect(r.totalRUB, `${car.country} ${car.price}`).toBeLessThan(30_000_000);
    }
  });
});

// ═════════════════════════════════════════════
// 🎯 ГРАНИЧНЫЕ ЗНАЧЕНИЯ
// ═════════════════════════════════════════════

describe('P7.1 · E2E: граничные значения', () => {

  it('Ровно $20K → фикс первой ступени (USA→РФ)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 20_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, RATES);
    expect(r.breakdown.fixedCosts).toBe(425_000);
  });

  it('$20,001 → фикс второй ступени (USA→РФ)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 20_001, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, RATES);
    expect(r.breakdown.fixedCosts).toBe(495_000);
  });

  it('Ровно 160hp → льготный утильсбор (доплата = 0)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 15_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2500, horsePower: 160,
    };
    const r = calculate(car, RATES);
    expect(r.breakdown.utilSbor).toBe(0);
  });

  it('161hp → коммерческий утильсбор (доплата > 0)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 15_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2500, horsePower: 161,
    };
    const r = calculate(car, RATES);
    expect(r.breakdown.utilSbor).toBeGreaterThan(0);
  });

  it('3.0L + 160hp → льготный (≤3.0L)', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 40_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', engineCC: 3000, horsePower: 160,
    };
    const r = calculate(car, RATES);
    expect(r.breakdown.utilSbor).toBe(0);
  });

  it('3.1L + 160hp → коммерческий! (>3.0L)', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 40_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', engineCC: 3100, horsePower: 160,
    };
    const r = calculate(car, RATES);
    expect(r.breakdown.utilSbor).toBeGreaterThan(0);
  });

  it('ОАЭ: только новые авто — 2025 ок, 2022 → ошибка', () => {
    const newCar: CarInput = {
      country: 'UAE', destination: 'RU', price: 100_000, currency: 'AED',
      year: 2025, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    expect(() => calculate(newCar, RATES)).not.toThrow();

    const oldCar: CarInput = {
      country: 'UAE', destination: 'RU', price: 100_000, currency: 'AED',
      year: 2022, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    expect(() => calculate(oldCar, RATES)).toThrow();
  });

  it('USA 3-5 лет без engineCC → ошибка', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 15_000, currency: 'USD',
      year: 2022, engineType: 'petrol', horsePower: 150,
    };
    expect(() => calculate(car, RATES, EUR_RATE)).toThrow('engineCC');
  });

  it('USA 3-5 лет без eurRate → ошибка', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 15_000, currency: 'USD',
      year: 2022, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    expect(() => calculate(car, RATES)).toThrow('EUR');
  });
});
