// ============================================
// 🧪 P7.2 · Edge Cases — крайние значения
// ============================================
// Тестирует экстремальные и граничные ситуации,
// которые не покрыты стандартными 20 кейсами.
//
// Категории:
// A. Экстремальные цены (дёшево / дорого / множественный overflow)
// B. Все возрастные границы (2024→under3, 2023→3to5, 2021→3to5, 2020→over5)
// C. Все границы ЕТТ ЕАЭС (объёмы 1000/1500/1800/2300/3000)
// D. Электро: льготный (≤80лс), средний, максимальный
// E. Дизель
// F. Экстремальная мощность (>500лс)
// G. Все страны × 3-5 / 5+ лет × РБ (комбинации)

import { describe, it, expect } from 'vitest';
import { calculate, calcUtilSborExtra } from '@/calc';
import type { CarInput, ExchangeRates } from '@/types';

const RATES: ExchangeRates = {
  USDT_RUB: 78.50,
  KRW_RUB: 0.05364,
  CNY_RUB: 11.40,
  AED_USD: 3.67,
  updatedAt: '2026-02-27T12:00:00Z',
};

const EUR_RATE = 84.12;

// ═══════════════════════════════════════════
// A. ЭКСТРЕМАЛЬНЫЕ ЦЕНЫ
// ═══════════════════════════════════════════

describe('P7.2-A · Экстремальные цены', () => {

  it('USA $3K → самое дешёвое авто, fix ≤$20K = 425K₽', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 3_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 1600, horsePower: 120,
    };
    const r = calculate(car, RATES);
    expect(r.breakdown.fixedCosts).toBe(425_000);
    expect(r.totalRUB).toBeGreaterThan(700_000);
    expect(r.totalRUB).toBeLessThan(1_200_000);
    expect(r.breakdown.utilSbor).toBe(0);
  });

  it('USA $80K → двойной overflow ($80K - $40K = $40K → 4 блока × $100K)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 80_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 3000, horsePower: 150,
    };
    const r = calculate(car, RATES);
    // fix = 575K + ceil(40K/10K)*100K = 575K + 400K = 975K₽
    expect(r.breakdown.fixedCosts).toBe(975_000);
    expect(r.breakdown.utilSbor).toBe(0); // 150hp ≤ 160 и 3.0L ≤ 3.0L
  });

  it('USA $100K → тройной overflow', () => {
    const car: CarInput = {
      country: 'USA', destination: 'BY', price: 100_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, RATES);
    // BY: fix = 600K + ceil(60K/10K)*100K = 600K + 600K = 1,200K₽
    expect(r.breakdown.fixedCosts).toBe(1_200_000);
  });

  it('Корея 10M₩ → дешёвое авто (~536K₽ + 90K + 600K)', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 10_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', engineCC: 1400, horsePower: 100,
    };
    const r = calculate(car, RATES);
    const expected = Math.round(10_000_000 * 0.05364 * 1.48 + 90_000 + 600_000);
    expect(Math.abs(r.totalRUB - expected)).toBeLessThan(expected * 0.01);
  });

  it('Китай 50K¥ → дешёвое авто', () => {
    const car: CarInput = {
      country: 'China', destination: 'RU', price: 50_000, currency: 'CNY',
      year: 2024, engineType: 'petrol', engineCC: 1500, horsePower: 110,
    };
    const r = calculate(car, RATES);
    const baseCNY = 50_000 + 8000 + 50_000 * 0.025;
    const expected = Math.round(baseCNY * 11.40 * 1.48 + 590_000);
    expect(Math.abs(r.totalRUB - expected)).toBeLessThan(expected * 0.01);
  });

  it('ОАЭ 300K AED → дорогое авто, большой overflow', () => {
    const car: CarInput = {
      country: 'UAE', destination: 'RU', price: 300_000, currency: 'AED',
      year: 2025, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, RATES);
    // priceUSD = 300000/3.67 + 1600 ≈ 83,370
    // overflow: 83370 > 50K → fix = 560K + ceil(33370/10K)*100K = 560K + 400K = 960K₽
    expect(r.breakdown.fixedCosts).toBe(960_000);
    expect(r.breakdown.utilSbor).toBe(0); // 150hp ≤ 160 и 2.0L ≤ 3.0L
  });

  it('USA $1 → минимальная цена, не крашится', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 1, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 1000, horsePower: 70,
    };
    const r = calculate(car, RATES);
    expect(r.totalRUB).toBeGreaterThan(400_000); // фикс один 425K
  });
});

// ═══════════════════════════════════════════
// B. ВСЕ ВОЗРАСТНЫЕ ГРАНИЦЫ
// ═══════════════════════════════════════════
// 2026 - year: <3 = under3, 3-5 = 3to5, >5 = over5
// 2024 (age 2) = under3
// 2023 (age 3) = 3to5
// 2021 (age 5) = 3to5
// 2020 (age 6) = over5

describe('P7.2-B · Возрастные границы', () => {

  it('2024 (age 2) = under3 → множитель 1.48', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 30_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, RATES);
    expect(r.breakdown.ageCategory).toBe('under3');
    expect(r.breakdown.usedTKS).toBe(false);
  });

  it('2023 (age 3) = 3to5 → ЕТТ ЕАЭС', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 30_000_000, currency: 'KRW',
      year: 2023, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, RATES, EUR_RATE);
    expect(r.breakdown.ageCategory).toBe('3to5');
    expect(r.breakdown.usedTKS).toBe(true);
  });

  it('2021 (age 5) = 3to5 (граница)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 15_000, currency: 'USD',
      year: 2021, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, RATES, EUR_RATE);
    expect(r.breakdown.ageCategory).toBe('3to5');
  });

  it('2020 (age 6) = over5 → ЕТТ повышенные ставки', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 10_000, currency: 'USD',
      year: 2020, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, RATES, EUR_RATE);
    expect(r.breakdown.ageCategory).toBe('over5');
    expect(r.breakdown.usedTKS).toBe(true);
  });

  it('2026 (age 0) = under3', () => {
    const car: CarInput = {
      country: 'UAE', destination: 'RU', price: 100_000, currency: 'AED',
      year: 2026, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, RATES);
    expect(r.breakdown.ageCategory).toBe('under3');
  });

  it('over5 дороже чем 3to5 (ставки выше)', () => {
    const base = {
      country: 'USA' as const, destination: 'RU' as const, price: 12_000, currency: 'USD' as const,
      engineType: 'petrol' as const, engineCC: 2000, horsePower: 150,
    };
    const r3to5 = calculate({ ...base, year: 2023 }, RATES, EUR_RATE);
    const rOver5 = calculate({ ...base, year: 2020 }, RATES, EUR_RATE);
    // over5 ETT rates > 3to5 → customs higher → total higher
    expect(rOver5.totalRUB).toBeGreaterThan(r3to5.totalRUB);
  });
});

// ═══════════════════════════════════════════
// C. ВСЕ ГРАНИЦЫ ЕТТ ЕАЭС
// ═══════════════════════════════════════════
// 3-5 лет: 1.5/1.7/2.5/2.7/3.0/3.6 €/см³
// Границы объёмов: 1000/1500/1800/2300/3000/Inf

describe('P7.2-C · Границы ЕТТ ЕАЭС', () => {

  const baseCar = (cc: number): CarInput => ({
    country: 'USA', destination: 'RU', price: 10_000, currency: 'USD',
    year: 2023, engineType: 'petrol', engineCC: cc, horsePower: 150,
  });

  it('≤1000cc → 1.5 €/см³', () => {
    const r = calculate(baseCar(1000), RATES, EUR_RATE);
    // ETT = 1000 × 1.5 × 84.12 × 1.2 = 151,416₽
    expect(r.breakdown.usedTKS).toBe(true);
    const ettExpected = Math.round(1000 * 1.5 * EUR_RATE * 1.2);
    expect(r.breakdown.customs).toBeGreaterThan(ettExpected * 0.95);
    expect(r.breakdown.customs).toBeLessThan(ettExpected * 1.05);
  });

  it('1001cc → 1.7 €/см³ (переход)', () => {
    const r1000 = calculate(baseCar(1000), RATES, EUR_RATE);
    const r1001 = calculate(baseCar(1001), RATES, EUR_RATE);
    // 1001cc → ставка 1.7 vs 1000cc → 1.5 → таможня выше
    expect(r1001.breakdown.customs).toBeGreaterThan(r1000.breakdown.customs);
  });

  it('1500cc → 1.7 €/см³', () => {
    const r = calculate(baseCar(1500), RATES, EUR_RATE);
    const ettExpected = Math.round(1500 * 1.7 * EUR_RATE * 1.2);
    expect(Math.abs(r.breakdown.customs - ettExpected)).toBeLessThan(ettExpected * 0.05);
  });

  it('1801cc → 2.5 €/см³ (переход)', () => {
    const r1800 = calculate(baseCar(1800), RATES, EUR_RATE);
    const r1801 = calculate(baseCar(1801), RATES, EUR_RATE);
    expect(r1801.breakdown.customs).toBeGreaterThan(r1800.breakdown.customs);
  });

  it('2300cc → 2.7 €/см³ → 3000cc → 3.0 €/см³ → 3001cc → 3.6 €/см³', () => {
    const r2300 = calculate(baseCar(2300), RATES, EUR_RATE);
    const r3000 = calculate(baseCar(3000), RATES, EUR_RATE);
    const r3001 = calculate(baseCar(3001), RATES, EUR_RATE);

    // Каждый следующий дороже
    expect(r3000.totalRUB).toBeGreaterThan(r2300.totalRUB);
    expect(r3001.totalRUB).toBeGreaterThan(r3000.totalRUB);

    // 3001 → скачок на 3.6 (было 3.0)
    const diff = r3001.breakdown.customs - r3000.breakdown.customs;
    expect(diff).toBeGreaterThan(10_000); // заметный скачок
  });

  it('5+ лет: ставки выше чем 3-5', () => {
    // 2000cc: 3to5 = 2.5, over5 = 4.8 → почти вдвое
    const car3to5: CarInput = {
      country: 'Korea', destination: 'RU', price: 20_000_000, currency: 'KRW',
      year: 2023, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const car5plus: CarInput = { ...car3to5, year: 2020 };

    const r3to5 = calculate(car3to5, RATES, EUR_RATE);
    const r5plus = calculate(car5plus, RATES, EUR_RATE);

    // ETT 5+ = 2000 × 4.8 × 84.12 × 1.2 vs 3-5 = 2000 × 2.5 × 84.12 × 1.2
    expect(r5plus.breakdown.customs).toBeGreaterThan(r3to5.breakdown.customs * 1.5);
  });
});

// ═══════════════════════════════════════════
// D. ЭЛЕКТРОМОБИЛИ — граничные значения
// ═══════════════════════════════════════════

describe('P7.2-D · Электромобили', () => {

  it('Электро 70hp → 30мин ≈ 23.17 кВт ≤ 58.84 → ЛЬГОТНЫЙ (доплата 0)', () => {
    // 70 × 0.7355 × 0.45 = 23.17 кВт — в первом диапазоне
    const car: CarInput = {
      country: 'China', destination: 'RU', price: 100_000, currency: 'CNY',
      year: 2024, engineType: 'electric', horsePower: 70,
    };
    const r = calculate(car, RATES);
    expect(r.breakdown.utilSbor).toBe(0);
  });

  it('Электро 178hp → 30мин ≈ 58.93 кВт > 58.84 → КОММЕРЧЕСКИЙ!', () => {
    // 178 × 0.7355 × 0.45 = 58.93 → ЧУТЬ больше 58.84
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 20_000, currency: 'USD',
      year: 2024, engineType: 'electric', horsePower: 178,
    };
    const r = calculate(car, RATES);
    expect(r.breakdown.utilSbor).toBeGreaterThan(0);
  });

  it('Электро 177hp → 30мин ≈ 58.60 кВт ≤ 58.84 → льготный', () => {
    // 177 × 0.7355 × 0.45 = 58.60 → ≤ 58.84 → льготный
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 30_000_000, currency: 'KRW',
      year: 2024, engineType: 'electric', horsePower: 177,
    };
    const r = calculate(car, RATES);
    expect(r.breakdown.utilSbor).toBe(0);
  });

  it('Электро 500hp → максимальный утильсбор', () => {
    // 500 × 0.7355 × 0.45 = 165.49 кВт → диапазон 147.10-169.16 → kNew=68.40
    const car: CarInput = {
      country: 'UAE', destination: 'RU', price: 200_000, currency: 'AED',
      year: 2025, engineType: 'electric', horsePower: 500,
    };
    const r = calculate(car, RATES);
    // 500 × 0.7355 × 0.45 = 165.49 → k=68.40 → 1,368,000₽ - 3,400 = 1,364,600₽
    expect(r.breakdown.utilSbor).toBe(1_364_600);
  });

  it('Электро 700hp → >280лс в 30мин → максимальный k=182.40', () => {
    // 700 × 0.7355 × 0.45 = 231.68 кВт → >205.94 → kNew=182.40
    const car: CarInput = {
      country: 'China', destination: 'RU', price: 300_000, currency: 'CNY',
      year: 2024, engineType: 'electric', horsePower: 700,
    };
    const r = calculate(car, RATES);
    // k=182.40 → 3,648,000₽ - 3,400 = 3,644,600₽
    expect(r.breakdown.utilSbor).toBe(3_644_600);
  });

  it('Электро: used (3-5 лет) → kUsed коэффициенты', () => {
    // 300hp, 30мин ≈ 99.29кВт, диапазон 80.91-102.97 → kUsed=100.44
    const extra = calcUtilSborExtra(300, undefined, 'electric', '3to5');
    // 20000 × 100.44 = 2,008,800 - 5,200(used) = 2,003,600
    expect(extra).toBe(2_003_600);
  });
});

// ═══════════════════════════════════════════
// E. ДИЗЕЛЬ
// ═══════════════════════════════════════════

describe('P7.2-E · Дизель', () => {

  it('Дизель 2.0L 150hp ≤160 → льготный (как бензин)', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 35_000_000, currency: 'KRW',
      year: 2024, engineType: 'diesel', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, RATES);
    expect(r.breakdown.utilSbor).toBe(0);
    // Формула идентична бензину
    const expected = Math.round(35_000_000 * 0.05364 * 1.48 + 90_000 + 600_000);
    expect(Math.abs(r.totalRUB - expected)).toBeLessThan(expected * 0.01);
  });

  it('Дизель 3.0L 249hp → коммерческий утильсбор (>160hp)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 30_000, currency: 'USD',
      year: 2024, engineType: 'diesel', engineCC: 3000, horsePower: 249,
    };
    const r = calculate(car, RATES);
    // 249hp в диапазоне 2001-3000cc, 220-250hp → kNew=120.12
    // 20000 × 120.12 = 2,402,400 - 3,400 = 2,399,000
    expect(r.breakdown.utilSbor).toBe(2_399_000);
  });

  it('Дизель 3-5 лет → ЕТТ ЕАЭС работает', () => {
    const car: CarInput = {
      country: 'China', destination: 'RU', price: 200_000, currency: 'CNY',
      year: 2023, engineType: 'diesel', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, RATES, EUR_RATE);
    expect(r.breakdown.ageCategory).toBe('3to5');
    expect(r.breakdown.usedTKS).toBe(true);
  });
});

// ═══════════════════════════════════════════
// F. ЭКСТРЕМАЛЬНАЯ МОЩНОСТЬ
// ═══════════════════════════════════════════

describe('P7.2-F · Экстремальная мощность', () => {

  it('600hp + 6.0L → максимальная строка таблицы (>500hp, >3500cc)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 60_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 6000, horsePower: 600,
    };
    const r = calculate(car, RATES);
    // >3500cc, >500hp → kNew=192.00
    // 20000 × 192 = 3,840,000 - 3,400 = 3,836,600₽
    expect(r.breakdown.utilSbor).toBe(3_836_600);
  });

  it('161hp + маленький двигатель 1.0L → коммерческий ≤1000cc', () => {
    // Необычная комбинация: турбо 1.0L с >160hp
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 25_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', engineCC: 1000, horsePower: 161,
    };
    const r = calculate(car, RATES);
    // 161hp > 160, ≤1000cc → диапазон 160-190 → kNew=15.36
    // 20000 × 15.36 = 307,200 - 3,400 = 303,800
    expect(r.breakdown.utilSbor).toBe(303_800);
  });

  it('500hp ровно → попадает в диапазон ≤500 (не >500)', () => {
    // Проверяем граничное значение 500hp
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 50_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 500,
    };
    const r = calculate(car, RATES);
    // 2000cc, ≤500hp → kNew=140.40
    // 20000 × 140.40 = 2,808,000 - 3,400 = 2,804,600
    expect(r.breakdown.utilSbor).toBe(2_804_600);
  });

  it('501hp → следующий диапазон (>500)', () => {
    const car: CarInput = {
      country: 'USA', destination: 'RU', price: 50_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 501,
    };
    const r = calculate(car, RATES);
    // 2000cc, >500hp → kNew=160.08
    // 20000 × 160.08 = 3,201,600 - 3,400 = 3,198,200
    expect(r.breakdown.utilSbor).toBe(3_198_200);
  });
});

// ═══════════════════════════════════════════
// G. ВСЕ КОМБИНАЦИИ СТРАНА × ВОЗРАСТ × НАПРАВЛЕНИЕ
// ═══════════════════════════════════════════

describe('P7.2-G · Все комбинации 3-5/5+ лет × направление', () => {

  it('Корея 3-5 лет → РБ', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'BY', price: 25_000_000, currency: 'KRW',
      year: 2023, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, RATES, EUR_RATE);
    expect(r.breakdown.ageCategory).toBe('3to5');
    expect(r.breakdown.destination).toBe('BY');
    // priceRUB + 90K + ETT + 720K (BY)
    const priceRUB = 25_000_000 * 0.05364;
    const ett = Math.round(2000 * 2.5 * EUR_RATE * 1.2);
    const expected = Math.round(priceRUB + 90_000 + ett + 720_000);
    expect(Math.abs(r.totalRUB - expected)).toBeLessThan(expected * 0.02);
  });

  it('Корея 5+ лет → РФ', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 20_000_000, currency: 'KRW',
      year: 2020, engineType: 'petrol', engineCC: 1800, horsePower: 150,
    };
    const r = calculate(car, RATES, EUR_RATE);
    expect(r.breakdown.ageCategory).toBe('over5');
    // ETT 5+ для 1800cc = 3.5 €/см³
    const ett = Math.round(1800 * 3.5 * EUR_RATE * 1.2);
    const priceRUB = 20_000_000 * 0.05364;
    const expected = Math.round(priceRUB + 90_000 + ett + 600_000);
    expect(Math.abs(r.totalRUB - expected)).toBeLessThan(expected * 0.02);
  });

  it('Корея 5+ лет → РБ', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'BY', price: 18_000_000, currency: 'KRW',
      year: 2020, engineType: 'petrol', engineCC: 1500, horsePower: 140,
    };
    const r = calculate(car, RATES, EUR_RATE);
    expect(r.breakdown.ageCategory).toBe('over5');
    expect(r.breakdown.destination).toBe('BY');
    // 1500cc → ETT 5+ = 3.2 €/см³
    const ett = Math.round(1500 * 3.2 * EUR_RATE * 1.2);
    const priceRUB = 18_000_000 * 0.05364;
    const expected = Math.round(priceRUB + 90_000 + ett + 720_000);
    expect(Math.abs(r.totalRUB - expected)).toBeLessThan(expected * 0.02);
  });

  it('USA 3-5 лет → РБ', () => {
    const car: CarInput = {
      country: 'USA', destination: 'BY', price: 15_000, currency: 'USD',
      year: 2023, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const r = calculate(car, RATES, EUR_RATE);
    expect(r.breakdown.ageCategory).toBe('3to5');
    expect(r.breakdown.destination).toBe('BY');
    expect(r.breakdown.fixedCosts).toBe(450_000); // BY ≤$20K
  });

  it('USA 5+ лет → РБ', () => {
    const car: CarInput = {
      country: 'USA', destination: 'BY', price: 8_000, currency: 'USD',
      year: 2019, engineType: 'petrol', engineCC: 1600, horsePower: 120,
    };
    const r = calculate(car, RATES, EUR_RATE);
    expect(r.breakdown.ageCategory).toBe('over5');
    expect(r.breakdown.destination).toBe('BY');
  });

  it('Китай 3-5 лет → РФ', () => {
    const car: CarInput = {
      country: 'China', destination: 'RU', price: 150_000, currency: 'CNY',
      year: 2023, engineType: 'petrol', engineCC: 1800, horsePower: 150,
    };
    const r = calculate(car, RATES, EUR_RATE);
    expect(r.breakdown.ageCategory).toBe('3to5');
    // baseCNY × cnyRate + ETT + 590K
    const baseCNY = 150_000 + 8000 + 150_000 * 0.025;
    const baseRUB = baseCNY * 11.40;
    const ett = Math.round(1800 * 2.5 * EUR_RATE * 1.2);
    const expected = Math.round(baseRUB + ett + 590_000);
    expect(Math.abs(r.totalRUB - expected)).toBeLessThan(expected * 0.02);
  });

  it('Китай 3-5 лет → РБ', () => {
    const car: CarInput = {
      country: 'China', destination: 'BY', price: 120_000, currency: 'CNY',
      year: 2023, engineType: 'petrol', engineCC: 1500, horsePower: 130,
    };
    const r = calculate(car, RATES, EUR_RATE);
    expect(r.breakdown.ageCategory).toBe('3to5');
    expect(r.breakdown.destination).toBe('BY');
    const baseCNY = 120_000 + 8000 + 120_000 * 0.025;
    const baseRUB = baseCNY * 11.40;
    const ett = Math.round(1500 * 1.7 * EUR_RATE * 1.2);
    const expected = Math.round(baseRUB + ett + 720_000);
    expect(Math.abs(r.totalRUB - expected)).toBeLessThan(expected * 0.02);
  });

  it('Китай 5+ лет → РФ', () => {
    const car: CarInput = {
      country: 'China', destination: 'RU', price: 100_000, currency: 'CNY',
      year: 2019, engineType: 'petrol', engineCC: 2300, horsePower: 150,
    };
    const r = calculate(car, RATES, EUR_RATE);
    expect(r.breakdown.ageCategory).toBe('over5');
    // ETT 5+ для 2300cc = 4.8 €/см³
    const baseCNY = 100_000 + 8000 + 100_000 * 0.025;
    const baseRUB = baseCNY * 11.40;
    const ett = Math.round(2300 * 4.8 * EUR_RATE * 1.2);
    const expected = Math.round(baseRUB + ett + 590_000);
    expect(Math.abs(r.totalRUB - expected)).toBeLessThan(expected * 0.02);
  });

  it('Китай 5+ лет → РБ', () => {
    const car: CarInput = {
      country: 'China', destination: 'BY', price: 80_000, currency: 'CNY',
      year: 2020, engineType: 'petrol', engineCC: 1600, horsePower: 140,
    };
    const r = calculate(car, RATES, EUR_RATE);
    expect(r.breakdown.ageCategory).toBe('over5');
    expect(r.breakdown.destination).toBe('BY');
    expect(r.breakdown.fixedCosts).toBe(720_000);
  });
});

// ═══════════════════════════════════════════
// H. ГИБРИДЫ
// ═══════════════════════════════════════════

describe('P7.2-H · Гибриды', () => {

  it('Гибрид считается как ДВС (по объёму + мощности)', () => {
    const carPetrol: CarInput = {
      country: 'Korea', destination: 'RU', price: 40_000_000, currency: 'KRW',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    const carHybrid: CarInput = { ...carPetrol, engineType: 'hybrid' };

    const rPetrol = calculate(carPetrol, RATES);
    const rHybrid = calculate(carHybrid, RATES);

    // Формулы для гибрида = формулы для бензина
    expect(rHybrid.totalRUB).toBe(rPetrol.totalRUB);
  });

  it('Гибрид 200hp + 2.5L → коммерческий утильсбор (как ДВС)', () => {
    const car: CarInput = {
      country: 'China', destination: 'RU', price: 250_000, currency: 'CNY',
      year: 2024, engineType: 'hybrid', engineCC: 2500, horsePower: 200,
    };
    const r = calculate(car, RATES);
    // 200hp > 160, 2.5L → 2001-3000cc диапазон, 190-220hp → kNew=118.20
    // 20000 × 118.20 = 2,364,000 - 3,400 = 2,360,600
    expect(r.breakdown.utilSbor).toBe(2_360_600);
  });
});

// ═══════════════════════════════════════════
// I. УТИЛЬСБОР: USED (3-5 / 5+) vs NEW
// ═══════════════════════════════════════════

describe('P7.2-I · Утильсбор: used дороже чем new', () => {

  it('200hp 2.0L: used (3to5) kUsed=79.20 > new kNew=47.64', () => {
    const carNew: CarInput = {
      country: 'USA', destination: 'RU', price: 20_000, currency: 'USD',
      year: 2024, engineType: 'petrol', engineCC: 2000, horsePower: 200,
    };
    const carUsed: CarInput = { ...carNew, year: 2023 };

    const rNew = calculate(carNew, RATES, EUR_RATE);
    const rUsed = calculate(carUsed, RATES, EUR_RATE);

    // kUsed > kNew → утильсбор выше для used
    expect(rUsed.breakdown.utilSbor).toBeGreaterThan(rNew.breakdown.utilSbor);

    // Точные значения
    // new: 20000 × 47.64 = 952,800 - 3,400 = 949,400
    expect(rNew.breakdown.utilSbor).toBe(949_400);
    // used: 20000 × 79.20 = 1,584,000 - 5,200 = 1,578,800
    expect(rUsed.breakdown.utilSbor).toBe(1_578_800);
  });

  it('over5 утильсбор ещё больше', () => {
    const carOver5: CarInput = {
      country: 'USA', destination: 'RU', price: 10_000, currency: 'USD',
      year: 2020, engineType: 'petrol', engineCC: 2000, horsePower: 200,
    };
    const r = calculate(carOver5, RATES, EUR_RATE);
    // over5: kUsed=79.20 → 20000 × 79.20 - 5200 = 1,578,800
    expect(r.breakdown.utilSbor).toBe(1_578_800);
  });
});

// ═══════════════════════════════════════════
// J. ОШИБКИ И НЕВАЛИДНЫЕ ДАННЫЕ
// ═══════════════════════════════════════════

describe('P7.2-J · Ошибки и невалидные данные', () => {

  it('Korea 3-5 лет без engineCC → ошибка', () => {
    const car: CarInput = {
      country: 'Korea', destination: 'RU', price: 30_000_000, currency: 'KRW',
      year: 2023, engineType: 'petrol', horsePower: 150,
    };
    expect(() => calculate(car, RATES, EUR_RATE)).toThrow('engineCC');
  });

  it('China 5+ лет без eurRate → ошибка', () => {
    const car: CarInput = {
      country: 'China', destination: 'RU', price: 100_000, currency: 'CNY',
      year: 2019, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    expect(() => calculate(car, RATES)).toThrow('EUR');
  });

  it('Неизвестная страна → ошибка', () => {
    const car = {
      country: 'Japan', destination: 'RU', price: 1000, currency: 'JPY',
      year: 2024, engineType: 'petrol' as const, horsePower: 150,
    } as any;
    expect(() => calculate(car, RATES)).toThrow('Неизвестная страна');
  });

  it('ОАЭ 3-5 лет → ошибка (только новые)', () => {
    const car: CarInput = {
      country: 'UAE', destination: 'RU', price: 100_000, currency: 'AED',
      year: 2023, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    expect(() => calculate(car, RATES)).toThrow('только новые');
  });

  it('ОАЭ 5+ лет → ошибка (только новые)', () => {
    const car: CarInput = {
      country: 'UAE', destination: 'RU', price: 100_000, currency: 'AED',
      year: 2019, engineType: 'petrol', engineCC: 2000, horsePower: 150,
    };
    expect(() => calculate(car, RATES)).toThrow('только новые');
  });
});
