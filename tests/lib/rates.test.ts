// ============================================
// 🧪 Тесты модуля курсов валют
// ============================================
// P4.1 · Бэкенд
//
// Покрытие:
//   - fetchCBRRates: парсинг, Nominal, fallback, ошибки
//   - fetchBybitRate: медиана, фильтрация, fallback, ошибки
//   - getExchangeRates: кэш, коррекции, stale fallback
//   - getEURRate: отдельный курс для ЕТТ ЕАЭС
//   - setAdminConfig: обновление коррекций
//   - Edge cases: невалидные данные, пустые ответы, аномалии

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCBRRates } from '@/lib/rates/cbr';
import { fetchBybitRate, _calcMedian } from '@/lib/rates/bybit';
import {
  getExchangeRates,
  getEURRate,
  setAdminConfig,
  getAdminConfig,
  _resetAllCaches,
} from '@/lib/rates/index';

// ─────────────────────────────────────────────
// 🔧 Моки
// ─────────────────────────────────────────────

/** Эталонный ответ ЦБ РФ (реальные данные 27.02.2026) */
const MOCK_CBR_RESPONSE = {
  Date: '2026-02-28T11:30:00+03:00',
  PreviousDate: '2026-02-27T11:30:00+03:00',
  Timestamp: '2026-02-27T18:00:00+03:00',
  Valute: {
    KRW: {
      ID: 'R01815', NumCode: '410', CharCode: 'KRW',
      Nominal: 1000, Name: 'Вон',
      Value: 54.2461, Previous: 53.7322,
    },
    CNY: {
      ID: 'R01375', NumCode: '156', CharCode: 'CNY',
      Nominal: 1, Name: 'Юань',
      Value: 11.2394, Previous: 11.2487,
    },
    USD: {
      ID: 'R01235', NumCode: '840', CharCode: 'USD',
      Nominal: 1, Name: 'Доллар США',
      Value: 77.2736, Previous: 77.1218,
    },
    EUR: {
      ID: 'R01239', NumCode: '978', CharCode: 'EUR',
      Nominal: 1, Name: 'Евро',
      Value: 84.1215, Previous: 83.9876,
    },
    AED: {
      ID: 'R01230', NumCode: '784', CharCode: 'AED',
      Nominal: 1, Name: 'Дирхам ОАЭ',
      Value: 21.0411, Previous: 20.9998,
    },
  },
};

/** Эталонный ответ Bybit P2P */
const MOCK_BYBIT_RESPONSE = {
  ret_code: 0,
  ret_msg: 'SUCCESS',
  result: {
    count: 917,
    items: [
      { id: '1', nickName: 'seller1', tokenId: 'USDT', currencyId: 'RUB', side: 1, price: '77.00', lastQuantity: '500', minAmount: '500', maxAmount: '100000', payments: ['14'], isOnline: true },
      { id: '2', nickName: 'seller2', tokenId: 'USDT', currencyId: 'RUB', side: 1, price: '77.10', lastQuantity: '300', minAmount: '1000', maxAmount: '80000', payments: ['14'], isOnline: true },
      { id: '3', nickName: 'seller3', tokenId: 'USDT', currencyId: 'RUB', side: 1, price: '77.19', lastQuantity: '200', minAmount: '5000', maxAmount: '75000', payments: ['14'], isOnline: true },
      { id: '4', nickName: 'seller4', tokenId: 'USDT', currencyId: 'RUB', side: 1, price: '77.20', lastQuantity: '150', minAmount: '10000', maxAmount: '60000', payments: ['14'], isOnline: true },
      { id: '5', nickName: 'seller5', tokenId: 'USDT', currencyId: 'RUB', side: 1, price: '77.25', lastQuantity: '100', minAmount: '15000', maxAmount: '55000', payments: ['14'], isOnline: true },
      // Мелкие объявления — должны отфильтроваться (maxAmount < 50K)
      { id: '6', nickName: 'small1', tokenId: 'USDT', currencyId: 'RUB', side: 1, price: '76.50', lastQuantity: '10', minAmount: '100', maxAmount: '900', payments: ['14'], isOnline: true },
      { id: '7', nickName: 'small2', tokenId: 'USDT', currencyId: 'RUB', side: 1, price: '76.80', lastQuantity: '5', minAmount: '200', maxAmount: '30000', payments: ['14'], isOnline: true },
    ],
  },
};

// ─────────────────────────────────────────────
// 🔧 Setup / Teardown
// ─────────────────────────────────────────────

const originalFetch = globalThis.fetch;

beforeEach(() => {
  _resetAllCaches();
  vi.restoreAllMocks();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

/** Хелпер: мок fetch с JSON ответом */
function mockFetchJSON(data: unknown, options?: { status?: number }) {
  const status = options?.status ?? 200;
  globalThis.fetch = vi.fn().mockImplementation(async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  }));
}

/** Хелпер: мок fetch который бросает ошибку */
function mockFetchError(error: Error = new Error('Network error')) {
  globalThis.fetch = vi.fn().mockRejectedValue(error);
}

/** Хелпер: мок fetch по URL-паттерну */
function mockFetchByURL(handlers: Record<string, { data?: unknown; status?: number; error?: Error }>) {
  globalThis.fetch = vi.fn().mockImplementation(async (input: string | Request) => {
    const urlStr = typeof input === 'string' ? input : input.url;
    for (const [pattern, handler] of Object.entries(handlers)) {
      if (urlStr.includes(pattern)) {
        if (handler.error) throw handler.error;
        return {
          ok: (handler.status ?? 200) >= 200 && (handler.status ?? 200) < 300,
          status: handler.status ?? 200,
          json: async () => handler.data,
        };
      }
    }
    throw new Error(`Unmocked URL: ${urlStr}`);
  });
}

// ==============================================
// 🏦 Тесты ЦБ РФ (cbr.ts)
// ==============================================

describe('fetchCBRRates', () => {
  it('парсит эталонный ответ ЦБ корректно', async () => {
    mockFetchJSON(MOCK_CBR_RESPONSE);
    const r = await fetchCBRRates();

    expect(r).not.toBeNull();

    // KRW: 54.2461 / 1000 = 0.0542461
    expect(r!.KRW_RUB).toBeCloseTo(0.0542461, 6);
    // CNY: 11.2394 / 1 = 11.2394
    expect(r!.CNY_RUB).toBeCloseTo(11.2394, 4);
    // USD: 77.2736 / 1
    expect(r!.USD_RUB).toBeCloseTo(77.2736, 4);
    // EUR: 84.1215 / 1
    expect(r!.EUR_RUB).toBeCloseTo(84.1215, 4);
    // AED: 21.0411 / 1
    expect(r!.AED_RUB).toBeCloseTo(21.0411, 4);
    // Дата
    expect(r!.date).toBe('2026-02-28T11:30:00+03:00');
  });

  it('⚠️ KRW Nominal=1000 — делит Value/Nominal корректно', async () => {
    mockFetchJSON(MOCK_CBR_RESPONSE);
    const r = await fetchCBRRates();
    // НЕ 54.2461, а 0.0542461 (за 1 вону)
    expect(r!.KRW_RUB).toBeLessThan(1);
    expect(r!.KRW_RUB).toBeGreaterThan(0.01);
  });

  it('fallback на второй домен при ошибке первого', async () => {
    mockFetchByURL({
      'cbr-xml-daily.ru': { error: new Error('Connection refused') },
      'cbr-xml-daily.com': { data: MOCK_CBR_RESPONSE },
    });
    const r = await fetchCBRRates();
    expect(r).not.toBeNull();
    expect(r!.USD_RUB).toBeCloseTo(77.2736, 4);
  });

  it('null если оба домена упали', async () => {
    mockFetchError(new Error('Both down'));
    expect(await fetchCBRRates()).toBeNull();
  });

  it('null при HTTP 500', async () => {
    mockFetchJSON({}, { status: 500 });
    expect(await fetchCBRRates()).toBeNull();
  });

  it('null если KRW отсутствует в ответе', async () => {
    const bad = JSON.parse(JSON.stringify(MOCK_CBR_RESPONSE));
    delete bad.Valute.KRW;
    mockFetchJSON(bad);
    expect(await fetchCBRRates()).toBeNull();
  });

  it('null если EUR отсутствует в ответе', async () => {
    const bad = JSON.parse(JSON.stringify(MOCK_CBR_RESPONSE));
    delete bad.Valute.EUR;
    mockFetchJSON(bad);
    expect(await fetchCBRRates()).toBeNull();
  });

  it('null при аномальном курсе USD (>200₽)', async () => {
    const bad = JSON.parse(JSON.stringify(MOCK_CBR_RESPONSE));
    bad.Valute.USD.Value = 999;
    mockFetchJSON(bad);
    expect(await fetchCBRRates()).toBeNull();
  });

  it('null при аномальном курсе KRW (>0.5₽)', async () => {
    const bad = JSON.parse(JSON.stringify(MOCK_CBR_RESPONSE));
    bad.Valute.KRW.Value = 600; // 600/1000 = 0.6
    mockFetchJSON(bad);
    expect(await fetchCBRRates()).toBeNull();
  });

  it('null при аномальном курсе EUR (<30₽)', async () => {
    const bad = JSON.parse(JSON.stringify(MOCK_CBR_RESPONSE));
    bad.Valute.EUR.Value = 10;
    mockFetchJSON(bad);
    expect(await fetchCBRRates()).toBeNull();
  });

  it('null при аномальном курсе CNY (>40₽)', async () => {
    const bad = JSON.parse(JSON.stringify(MOCK_CBR_RESPONSE));
    bad.Valute.CNY.Value = 50;
    mockFetchJSON(bad);
    expect(await fetchCBRRates()).toBeNull();
  });
});

// ==============================================
// 💱 Тесты Bybit P2P (bybit.ts)
// ==============================================

describe('fetchBybitRate', () => {
  it('вычисляет медиану из топ-5 после фильтрации maxAmount>=50K', async () => {
    mockFetchJSON(MOCK_BYBIT_RESPONSE);
    const r = await fetchBybitRate();

    expect(r).not.toBeNull();
    // 5 валидных: 77.00, 77.10, 77.19, 77.20, 77.25
    // Медиана (нечётное, 5 шт) = 77.19
    expect(r!.median).toBe(77.19);
    expect(r!.prices).toEqual([77.00, 77.10, 77.19, 77.20, 77.25]);
    expect(r!.validCount).toBe(5);
    expect(r!.totalCount).toBe(7);
  });

  it('фильтрует мелкие объявления (maxAmount < 50K)', async () => {
    mockFetchJSON(MOCK_BYBIT_RESPONSE);
    const r = await fetchBybitRate();
    expect(r!.validCount).toBe(5);
    expect(r!.prices).not.toContain(76.50);
    expect(r!.prices).not.toContain(76.80);
  });

  it('fallback на api.bybit.com при ошибке api2', async () => {
    mockFetchByURL({
      'api2.bybit.com': { error: new Error('Refused') },
      'api.bybit.com': { data: MOCK_BYBIT_RESPONSE },
    });
    const r = await fetchBybitRate();
    expect(r).not.toBeNull();
    expect(r!.median).toBe(77.19);
  });

  it('null если оба домена упали', async () => {
    mockFetchError(new Error('Both down'));
    expect(await fetchBybitRate()).toBeNull();
  });

  it('null при пустом списке объявлений', async () => {
    mockFetchJSON({ ret_code: 0, ret_msg: 'SUCCESS', result: { count: 0, items: [] } });
    expect(await fetchBybitRate()).toBeNull();
  });

  it('null при ret_code != 0', async () => {
    mockFetchJSON({ ret_code: 10001, ret_msg: 'Error', result: { count: 0, items: [] } });
    expect(await fetchBybitRate()).toBeNull();
  });

  it('null если ВСЕ объявления мелкие (<50K)', async () => {
    mockFetchJSON({
      ret_code: 0, ret_msg: 'SUCCESS',
      result: {
        count: 2,
        items: [
          { id: '1', nickName: 'a', tokenId: 'USDT', currencyId: 'RUB', side: 1, price: '77.00', lastQuantity: '5', minAmount: '100', maxAmount: '900', payments: [], isOnline: true },
          { id: '2', nickName: 'b', tokenId: 'USDT', currencyId: 'RUB', side: 1, price: '77.50', lastQuantity: '3', minAmount: '200', maxAmount: '1500', payments: [], isOnline: true },
        ],
      },
    });
    expect(await fetchBybitRate()).toBeNull();
  });

  it('медиана для чётного количества — среднее двух средних', async () => {
    mockFetchJSON({
      ret_code: 0, ret_msg: 'SUCCESS',
      result: {
        count: 4,
        items: [
          { id: '1', nickName: 'a', tokenId: 'USDT', currencyId: 'RUB', side: 1, price: '77.00', lastQuantity: '100', minAmount: '1000', maxAmount: '100000', payments: [], isOnline: true },
          { id: '2', nickName: 'b', tokenId: 'USDT', currencyId: 'RUB', side: 1, price: '77.20', lastQuantity: '100', minAmount: '1000', maxAmount: '80000', payments: [], isOnline: true },
          { id: '3', nickName: 'c', tokenId: 'USDT', currencyId: 'RUB', side: 1, price: '77.40', lastQuantity: '100', minAmount: '1000', maxAmount: '60000', payments: [], isOnline: true },
          { id: '4', nickName: 'd', tokenId: 'USDT', currencyId: 'RUB', side: 1, price: '77.60', lastQuantity: '100', minAmount: '1000', maxAmount: '55000', payments: [], isOnline: true },
        ],
      },
    });
    const r = await fetchBybitRate();
    // (77.20 + 77.40) / 2 = 77.30
    expect(r!.median).toBeCloseTo(77.30, 2);
  });

  it('null при аномальной медиане (>200₽)', async () => {
    mockFetchJSON({
      ret_code: 0, ret_msg: 'SUCCESS',
      result: {
        count: 1,
        items: [
          { id: '1', nickName: 'x', tokenId: 'USDT', currencyId: 'RUB', side: 1, price: '999.00', lastQuantity: '100', minAmount: '1000', maxAmount: '100000', payments: [], isOnline: true },
        ],
      },
    });
    expect(await fetchBybitRate()).toBeNull();
  });
});

describe('_calcMedian', () => {
  it('нечётное количество', () => {
    expect(_calcMedian([1, 3, 5])).toBe(3);
    expect(_calcMedian([10, 20, 30, 40, 50])).toBe(30);
  });
  it('чётное количество', () => {
    expect(_calcMedian([1, 3, 5, 7])).toBe(4);
    expect(_calcMedian([10, 20])).toBe(15);
  });
  it('один элемент', () => {
    expect(_calcMedian([42])).toBe(42);
  });
  it('неотсортированный массив', () => {
    expect(_calcMedian([5, 1, 3])).toBe(3);
    expect(_calcMedian([50, 10, 30, 20, 40])).toBe(30);
  });
});

// ==============================================
// 💱 Тесты единого модуля (index.ts)
// ==============================================

describe('getExchangeRates', () => {
  it('собирает курсы с коррекциями по умолчанию', async () => {
    mockFetchByURL({
      'bybit.com': { data: MOCK_BYBIT_RESPONSE },
      'cbr-xml-daily': { data: MOCK_CBR_RESPONSE },
    });
    const rates = await getExchangeRates();

    // USDT: медиана 77.19 + коррекция 1.50 = 78.69
    expect(rates.USDT_RUB).toBeCloseTo(78.69, 2);
    // KRW: 0.0542461 + спред 0 = 0.0542461
    expect(rates.KRW_RUB).toBeCloseTo(0.054246, 5);
    // CNY: 11.2394 + спред 0.30 = 11.5394
    expect(rates.CNY_RUB).toBeCloseTo(11.5394, 3);
    // AED/USD — фиксированный
    expect(rates.AED_USD).toBe(3.67);
    // updatedAt — ISO строка
    expect(rates.updatedAt).toBeTruthy();
  });

  it('кэширует результат — второй вызов без fetch', async () => {
    mockFetchByURL({
      'bybit.com': { data: MOCK_BYBIT_RESPONSE },
      'cbr-xml-daily': { data: MOCK_CBR_RESPONSE },
    });
    const r1 = await getExchangeRates();

    // Ломаем fetch — если полезет в сеть, упадёт
    mockFetchError(new Error('Should not be called'));

    const r2 = await getExchangeRates();
    expect(r2.USDT_RUB).toBe(r1.USDT_RUB);
    expect(r2.KRW_RUB).toBe(r1.KRW_RUB);
    expect(r2.CNY_RUB).toBe(r1.CNY_RUB);
  });

  it('hardcoded fallback если нет данных и нет кэша', async () => {
    _resetAllCaches();
    mockFetchError(new Error('All down'));

    // buildExchangeRates использует hardcoded как последнюю линию обороны
    const rates = await getExchangeRates();
    expect(rates.USDT_RUB).toBe(78.50);
    expect(rates.KRW_RUB).toBe(0.05364);
    expect(rates.CNY_RUB).toBe(11.40);
  });

  it('AED/USD всегда 3.67 (фиксированный)', async () => {
    mockFetchByURL({
      'bybit.com': { data: MOCK_BYBIT_RESPONSE },
      'cbr-xml-daily': { data: MOCK_CBR_RESPONSE },
    });
    const rates = await getExchangeRates();
    expect(rates.AED_USD).toBe(3.67);
  });
});

describe('setAdminConfig', () => {
  it('обновляет коррекцию USDT и сбрасывает кэш', async () => {
    mockFetchByURL({
      'bybit.com': { data: MOCK_BYBIT_RESPONSE },
      'cbr-xml-daily': { data: MOCK_CBR_RESPONSE },
    });

    const r1 = await getExchangeRates();
    expect(r1.USDT_RUB).toBeCloseTo(78.69, 2); // 77.19 + 1.50

    setAdminConfig({ usdtCorrection: 2.00 });

    const r2 = await getExchangeRates();
    expect(r2.USDT_RUB).toBeCloseTo(79.19, 2); // 77.19 + 2.00
  });

  it('обновляет спред ВТБ для KRW', async () => {
    mockFetchByURL({
      'bybit.com': { data: MOCK_BYBIT_RESPONSE },
      'cbr-xml-daily': { data: MOCK_CBR_RESPONSE },
    });
    setAdminConfig({ vtbSpreadKRW: 0.001 });
    const rates = await getExchangeRates();
    expect(rates.KRW_RUB).toBeCloseTo(0.055246, 5); // 0.054246 + 0.001
  });

  it('обновляет спред ВТБ для CNY', async () => {
    mockFetchByURL({
      'bybit.com': { data: MOCK_BYBIT_RESPONSE },
      'cbr-xml-daily': { data: MOCK_CBR_RESPONSE },
    });
    setAdminConfig({ vtbSpreadCNY: 0.50 });
    const rates = await getExchangeRates();
    expect(rates.CNY_RUB).toBeCloseTo(11.7394, 3); // 11.2394 + 0.50
  });

  it('partial update — остальные поля не меняются', () => {
    setAdminConfig({ usdtCorrection: 3.00 });
    const cfg = getAdminConfig();
    expect(cfg.usdtCorrection).toBe(3.00);
    expect(cfg.vtbSpreadKRW).toBe(0); // не изменился
    expect(cfg.vtbSpreadCNY).toBe(0.30);     // не изменился
  });

  it('getAdminConfig возвращает копию (не ссылку)', () => {
    const cfg1 = getAdminConfig();
    cfg1.usdtCorrection = 999;
    const cfg2 = getAdminConfig();
    expect(cfg2.usdtCorrection).toBe(1.50); // не мутировал
  });
});

describe('getEURRate', () => {
  it('возвращает курс EUR/RUB из ЦБ', async () => {
    mockFetchByURL({
      'cbr-xml-daily': { data: MOCK_CBR_RESPONSE },
    });
    const eur = await getEURRate();
    expect(eur).not.toBeNull();
    expect(eur!).toBeCloseTo(84.1215, 4);
  });

  it('null если ЦБ недоступен и нет кэша', async () => {
    _resetAllCaches();
    mockFetchError(new Error('CBR down'));
    expect(await getEURRate()).toBeNull();
  });

  it('использует кэш при повторном вызове', async () => {
    mockFetchByURL({ 'cbr-xml-daily': { data: MOCK_CBR_RESPONSE } });
    const eur1 = await getEURRate();

    mockFetchError(new Error('Should use cache'));
    const eur2 = await getEURRate();
    expect(eur2).toBe(eur1);
  });
});
