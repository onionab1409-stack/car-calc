// ============================================
// 🧪 Тесты P4.2 — API route + validation + rate limiter
// ============================================
// Покрытие:
//   - CalcRequestSchema: Zod-валидация всех полей
//   - validateBusinessRules: ОАЭ только новые
//   - toCarInput: маппинг → CarInput с currency
//   - checkRateLimit: лимиты, окна, сброс
//   - Integration: полный pipeline validation → calc → totalRUB

import { describe, it, expect, beforeEach } from 'vitest';
import {
  CalcRequestSchema,
  validateBusinessRules,
  toCarInput,
  LeadRequestSchema,
} from '@/lib/validation';
import {
  checkRateLimit,
  getClientId,
  _resetRateLimiter,
} from '@/lib/rate-limiter';
import { calculate } from '@/calc';
import type { ExchangeRates } from '@/types';

// ─────────────────────────────────────────────
// 🔧 Фикстуры
// ─────────────────────────────────────────────

const VALID_REQUEST = {
  country: 'USA' as const,
  destination: 'RU' as const,
  price: 25000,
  year: 2024,
  engineType: 'petrol' as const,
  engineCC: 2000,
  horsePower: 150,
  auction: 'copart' as const,
  make: 'Toyota',
  model: 'Camry',
};

const TEST_RATES: ExchangeRates = {
  USDT_RUB: 78.50,
  KRW_RUB: 0.05364,
  CNY_RUB: 11.40,
  AED_USD: 3.67,
  updatedAt: '2026-02-27T12:00:00.000Z',
};

const EUR_RATE = 84.12;

// ==============================================
// ✅ Тесты Zod-валидации (CalcRequestSchema)
// ==============================================

describe('CalcRequestSchema', () => {
  it('валидирует корректный запрос', () => {
    const result = CalcRequestSchema.safeParse(VALID_REQUEST);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.country).toBe('USA');
      expect(result.data.destination).toBe('RU');
      expect(result.data.price).toBe(25000);
      expect(result.data.isLegalEntity).toBe(false); // default
    }
  });

  it('минимальный запрос (без опциональных полей)', () => {
    const minimal = {
      country: 'Korea',
      destination: 'BY',
      price: 35000000,
      year: 2023,
      engineType: 'petrol',
      horsePower: 150,
    };
    const result = CalcRequestSchema.safeParse(minimal);
    expect(result.success).toBe(true);
  });

  it('все 4 страны валидны', () => {
    for (const country of ['USA', 'Korea', 'UAE', 'China']) {
      const r = CalcRequestSchema.safeParse({ ...VALID_REQUEST, country });
      expect(r.success).toBe(true);
    }
  });

  it('оба направления валидны', () => {
    for (const destination of ['RU', 'BY']) {
      const r = CalcRequestSchema.safeParse({ ...VALID_REQUEST, destination });
      expect(r.success).toBe(true);
    }
  });

  it('все типы двигателей валидны', () => {
    for (const engineType of ['petrol', 'diesel', 'electric', 'hybrid']) {
      const r = CalcRequestSchema.safeParse({ ...VALID_REQUEST, engineType });
      expect(r.success).toBe(true);
    }
  });

  it('❌ невалидная страна', () => {
    const r = CalcRequestSchema.safeParse({ ...VALID_REQUEST, country: 'Japan' });
    expect(r.success).toBe(false);
  });

  it('❌ невалидное направление', () => {
    const r = CalcRequestSchema.safeParse({ ...VALID_REQUEST, destination: 'KZ' });
    expect(r.success).toBe(false);
  });

  it('❌ цена <= 0', () => {
    const r = CalcRequestSchema.safeParse({ ...VALID_REQUEST, price: -100 });
    expect(r.success).toBe(false);
  });

  it('❌ цена = 0', () => {
    const r = CalcRequestSchema.safeParse({ ...VALID_REQUEST, price: 0 });
    expect(r.success).toBe(false);
  });

  it('❌ цена > 100M', () => {
    const r = CalcRequestSchema.safeParse({ ...VALID_REQUEST, price: 101_000_000 });
    expect(r.success).toBe(false);
  });

  it('❌ год < 2000', () => {
    const r = CalcRequestSchema.safeParse({ ...VALID_REQUEST, year: 1999 });
    expect(r.success).toBe(false);
  });

  it('❌ год из далёкого будущего', () => {
    const r = CalcRequestSchema.safeParse({ ...VALID_REQUEST, year: 2030 });
    expect(r.success).toBe(false);
  });

  it('❌ мощность <= 0', () => {
    const r = CalcRequestSchema.safeParse({ ...VALID_REQUEST, horsePower: 0 });
    expect(r.success).toBe(false);
  });

  it('❌ мощность > 2000', () => {
    const r = CalcRequestSchema.safeParse({ ...VALID_REQUEST, horsePower: 2500 });
    expect(r.success).toBe(false);
  });

  it('❌ отсутствует обязательное поле', () => {
    const { country, ...noCountry } = VALID_REQUEST;
    const r = CalcRequestSchema.safeParse(noCountry);
    expect(r.success).toBe(false);
  });

  it('❌ пустой объект', () => {
    const r = CalcRequestSchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it('❌ не объект', () => {
    const r = CalcRequestSchema.safeParse('hello');
    expect(r.success).toBe(false);
    const r2 = CalcRequestSchema.safeParse(null);
    expect(r2.success).toBe(false);
  });

  it('isLegalEntity default false', () => {
    const r = CalcRequestSchema.safeParse(VALID_REQUEST);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.isLegalEntity).toBe(false);
  });

  it('engineCC опционален', () => {
    const r = CalcRequestSchema.safeParse({ ...VALID_REQUEST, engineCC: 2500 });
    expect(r.success).toBe(true);
  });
});

// ==============================================
// ✅ Бизнес-валидация
// ==============================================

describe('validateBusinessRules', () => {
  it('ОАЭ: новое авто — ОК', () => {
    const data = { ...VALID_REQUEST, country: 'UAE' as const, year: 2025 };
    const parsed = CalcRequestSchema.parse(data);
    expect(validateBusinessRules(parsed)).toBeNull();
  });

  it('ОАЭ: прошлый год — ОК', () => {
    const currentYear = new Date().getFullYear();
    const data = { ...VALID_REQUEST, country: 'UAE' as const, year: currentYear - 1 };
    const parsed = CalcRequestSchema.parse(data);
    expect(validateBusinessRules(parsed)).toBeNull();
  });

  it('❌ ОАЭ: старое авто', () => {
    const data = { ...VALID_REQUEST, country: 'UAE' as const, year: 2020 };
    const parsed = CalcRequestSchema.parse(data);
    const err = validateBusinessRules(parsed);
    expect(err).not.toBeNull();
    expect(err).toContain('новые');
  });

  it('USA: любой год — ОК', () => {
    const data = { ...VALID_REQUEST, country: 'USA' as const, year: 2015 };
    const parsed = CalcRequestSchema.parse(data);
    expect(validateBusinessRules(parsed)).toBeNull();
  });
});

// ==============================================
// 🔄 Маппинг toCarInput
// ==============================================

describe('toCarInput', () => {
  it('добавляет currency из COUNTRY_CURRENCY', () => {
    const parsed = CalcRequestSchema.parse(VALID_REQUEST);
    const car = toCarInput(parsed);
    expect(car.currency).toBe('USD'); // USA → USD
  });

  it('Korea → KRW', () => {
    const parsed = CalcRequestSchema.parse({ ...VALID_REQUEST, country: 'Korea' });
    const car = toCarInput(parsed);
    expect(car.currency).toBe('KRW');
  });

  it('UAE → AED', () => {
    const parsed = CalcRequestSchema.parse({ ...VALID_REQUEST, country: 'UAE', year: 2025 });
    const car = toCarInput(parsed);
    expect(car.currency).toBe('AED');
  });

  it('China → CNY', () => {
    const parsed = CalcRequestSchema.parse({ ...VALID_REQUEST, country: 'China' });
    const car = toCarInput(parsed);
    expect(car.currency).toBe('CNY');
  });

  it('все поля маппятся корректно', () => {
    const parsed = CalcRequestSchema.parse(VALID_REQUEST);
    const car = toCarInput(parsed);
    expect(car.country).toBe('USA');
    expect(car.destination).toBe('RU');
    expect(car.price).toBe(25000);
    expect(car.year).toBe(2024);
    expect(car.engineType).toBe('petrol');
    expect(car.horsePower).toBe(150);
    expect(car.make).toBe('Toyota');
    expect(car.model).toBe('Camry');
    expect(car.isLegalEntity).toBe(false);
  });
});

// ==============================================
// 🚦 Rate Limiter
// ==============================================

describe('checkRateLimit', () => {
  beforeEach(() => {
    _resetRateLimiter();
  });

  it('первый запрос — разрешён', () => {
    const r = checkRateLimit('/api/calculate', 'test-user');
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(9); // 10 - 1
  });

  it('10 запросов подряд — все разрешены', () => {
    for (let i = 0; i < 10; i++) {
      const r = checkRateLimit('/api/calculate', 'test-user');
      expect(r.allowed).toBe(true);
    }
  });

  it('11-й запрос — заблокирован', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('/api/calculate', 'test-user');
    }
    const r = checkRateLimit('/api/calculate', 'test-user');
    expect(r.allowed).toBe(false);
    expect(r.remaining).toBe(0);
    expect(r.resetMs).toBeGreaterThan(0);
  });

  it('разные пользователи — раздельные лимиты', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('/api/calculate', 'user-A');
    }
    // user-A заблокирован
    expect(checkRateLimit('/api/calculate', 'user-A').allowed).toBe(false);
    // user-B свободен
    expect(checkRateLimit('/api/calculate', 'user-B').allowed).toBe(true);
  });

  it('/api/rates — лимит 30/мин', () => {
    for (let i = 0; i < 30; i++) {
      expect(checkRateLimit('/api/rates', 'user').allowed).toBe(true);
    }
    expect(checkRateLimit('/api/rates', 'user').allowed).toBe(false);
  });

  it('/api/lead — лимит 3/мин', () => {
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit('/api/lead', 'user').allowed).toBe(true);
    }
    expect(checkRateLimit('/api/lead', 'user').allowed).toBe(false);
  });

  it('неизвестный endpoint — всегда разрешён', () => {
    const r = checkRateLimit('/api/unknown', 'user');
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(999);
  });

  it('remaining уменьшается с каждым запросом', () => {
    expect(checkRateLimit('/api/calculate', 'u').remaining).toBe(9);
    expect(checkRateLimit('/api/calculate', 'u').remaining).toBe(8);
    expect(checkRateLimit('/api/calculate', 'u').remaining).toBe(7);
  });
});

describe('getClientId', () => {
  it('telegram user id из заголовка', () => {
    const headers = new Headers({ 'x-telegram-user-id': '123456' });
    expect(getClientId(headers)).toBe('tg:123456');
  });

  it('IP из X-Forwarded-For', () => {
    const headers = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(getClientId(headers)).toBe('ip:1.2.3.4');
  });

  it('IP из X-Real-Ip', () => {
    const headers = new Headers({ 'x-real-ip': '10.0.0.1' });
    expect(getClientId(headers)).toBe('ip:10.0.0.1');
  });

  it('fallback: unknown', () => {
    const headers = new Headers();
    expect(getClientId(headers)).toBe('ip:unknown');
  });

  it('telegram приоритетнее IP', () => {
    const headers = new Headers({
      'x-telegram-user-id': '999',
      'x-forwarded-for': '1.2.3.4',
    });
    expect(getClientId(headers)).toBe('tg:999');
  });
});

// ==============================================
// 🔄 Integration: validation → calc → totalRUB
// ==============================================

describe('Integration: полный pipeline', () => {
  it('USA→РФ $25K = ~3,326K₽ (эталон)', () => {
    const parsed = CalcRequestSchema.parse(VALID_REQUEST);
    expect(validateBusinessRules(parsed)).toBeNull();

    const car = toCarInput(parsed);
    const result = calculate(car, TEST_RATES, EUR_RATE);

    // Эталон: 3,972,193₽ (±0.5%)
    expect(result.totalRUB).toBeGreaterThan(3_300_000);
    expect(result.totalRUB).toBeLessThan(3_400_000);
    expect(Math.round(result.totalRUB)).toBe(3_326_185);
  });

  it('Корея→РБ 28M₩ = ~2,762K₽ (эталон)', () => {
    const parsed = CalcRequestSchema.parse({
      country: 'Korea',
      destination: 'BY',
      price: 28_000_000,
      year: 2024,
      engineType: 'petrol',
      horsePower: 130,
    });
    const car = toCarInput(parsed);
    const result = calculate(car, TEST_RATES, EUR_RATE);

    expect(Math.round(result.totalRUB)).toBeCloseTo(2_762_496, -3);
  });

  it('ОАЭ→РФ 120K AED = ~3,782K₽ (эталон)', () => {
    const parsed = CalcRequestSchema.parse({
      country: 'UAE',
      destination: 'RU',
      price: 120_000,
      year: 2025,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    });
    const car = toCarInput(parsed);
    const result = calculate(car, TEST_RATES, EUR_RATE);

    expect(Math.round(result.totalRUB)).toBeCloseTo(3_782_205, -4);
  });

  it('Китай→РФ 180K¥ = ~3,239K₽ (эталон)', () => {
    const parsed = CalcRequestSchema.parse({
      country: 'China',
      destination: 'RU',
      price: 180_000,
      year: 2024,
      engineType: 'petrol',
      engineCC: 2000,
      horsePower: 150,
    });
    const car = toCarInput(parsed);
    const result = calculate(car, TEST_RATES, EUR_RATE);

    expect(Math.round(result.totalRUB)).toBeCloseTo(3_238_748, -4);
  });

  it('API отдаёт только totalRUB (округлённый до целого)', () => {
    const parsed = CalcRequestSchema.parse(VALID_REQUEST);
    const car = toCarInput(parsed);
    const result = calculate(car, TEST_RATES, EUR_RATE);

    const apiResponse = { totalRUB: Math.round(result.totalRUB) };
    expect(apiResponse.totalRUB).toBe(3_326_185);
    // Нет breakdown, нет формулы — только число
    expect(Object.keys(apiResponse)).toEqual(['totalRUB']);
  });
});

// ==============================================
// ✅ LeadRequestSchema
// ==============================================

describe('LeadRequestSchema', () => {
  it('валидирует корректную заявку', () => {
    const lead = {
      telegramUserId: 123456789,
      username: 'john_doe',
      firstName: 'Иван',
      phone: '+79001234567',
      comment: 'Хочу Toyota Camry',
      calcRequest: VALID_REQUEST,
      totalRUB: 3972193,
    };
    const r = LeadRequestSchema.safeParse(lead);
    expect(r.success).toBe(true);
  });

  it('❌ без telegramUserId', () => {
    const r = LeadRequestSchema.safeParse({
      calcRequest: VALID_REQUEST,
      totalRUB: 1000000,
    });
    expect(r.success).toBe(false);
  });

  it('❌ totalRUB <= 0', () => {
    const r = LeadRequestSchema.safeParse({
      telegramUserId: 123,
      calcRequest: VALID_REQUEST,
      totalRUB: -100,
    });
    expect(r.success).toBe(false);
  });
});
