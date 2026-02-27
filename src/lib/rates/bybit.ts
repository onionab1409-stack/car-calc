// ============================================
// 💱 Bybit P2P — Курс USDT/RUB
// ============================================
// Подэтап: P4.1 · Бэкенд
//
// Получает медианную цену USDT/RUB с Bybit P2P маркетплейса.
// Алгоритм:
//   1. POST запрос к публичному API (без авторизации!)
//   2. Фильтрация: только объявления с maxAmount >= 50,000₽
//   3. Берём топ-5 по цене
//   4. Медиана (устойчива к выбросам)
//
// Fallback: api2.bybit.com → api.bybit.com → null (кэш)

import { logInfo, logError } from '@/lib/logger';

// ─────────────────────────────────────────────
// 📐 Типы
// ─────────────────────────────────────────────

/** Одно объявление Bybit P2P */
interface BybitP2PItem {
  id: string;
  nickName: string;
  tokenId: string;
  currencyId: string;
  side: number;
  price: string;
  lastQuantity: string;
  minAmount: string;
  maxAmount: string;
  payments: string[];
  isOnline: boolean;
}

/** Ответ Bybit P2P API */
interface BybitP2PResponse {
  ret_code: number;
  ret_msg: string;
  result: {
    count: number;
    items: BybitP2PItem[];
  };
}

/** Результат: медиана + мета-данные */
export interface BybitRateResult {
  /** Медианная цена USDT в рублях */
  median: number;
  /** Все цены, использованные для расчёта (после фильтрации) */
  prices: number[];
  /** Сколько объявлений прошло фильтр */
  validCount: number;
  /** Общее количество объявлений в ответе */
  totalCount: number;
  /** Временная метка */
  fetchedAt: string;
}

// ─────────────────────────────────────────────
// 🌐 Endpoints & Конфиг
// ─────────────────────────────────────────────

const BYBIT_PRIMARY = 'https://api2.bybit.com/fiat/otc/item/online';
const BYBIT_FALLBACK = 'https://api.bybit.com/fiat/otc/item/online';

/** Таймаут запроса (мс) */
const FETCH_TIMEOUT = 15_000;

/** Минимальный maxAmount для фильтрации (₽) — отсекаем мелкие/фейковые */
const MIN_MAX_AMOUNT = 50_000;

/** Сколько объявлений запрашивать */
const REQUEST_SIZE = 20;

/** Сколько лучших цен брать для медианы */
const TOP_N = 5;

/** Тело запроса к Bybit P2P */
const REQUEST_BODY = JSON.stringify({
  userId: '',
  tokenId: 'USDT',
  currencyId: 'RUB',
  payment: [],
  side: '1',     // 1 = покупка USDT (цена продажи USDT за RUB)
  size: String(REQUEST_SIZE),
  page: '1',
});

// ─────────────────────────────────────────────
// 📐 Основная функция
// ─────────────────────────────────────────────

/**
 * Получает курс USDT/RUB с Bybit P2P.
 *
 * Порядок:
 * 1. api2.bybit.com (основной)
 * 2. api.bybit.com (fallback)
 * 3. null → вызывающий код берёт из кэша
 *
 * @returns BybitRateResult | null
 */
export async function fetchBybitRate(): Promise<BybitRateResult | null> {
  // Попытка 1: основной домен
  const primary = await fetchFromURL(BYBIT_PRIMARY);
  if (primary) return primary;

  // Попытка 2: fallback
  logInfo('BYBIT', 'api2.bybit.com не ответил, пробуем api.bybit.com...');
  const fallback = await fetchFromURL(BYBIT_FALLBACK);
  if (fallback) return fallback;

  // Оба упали
  logError('BYBIT', 'Оба домена Bybit P2P недоступны!');
  return null;
}

// ─────────────────────────────────────────────
// 🔧 Внутренние функции
// ─────────────────────────────────────────────

/**
 * Запрашивает данные P2P с конкретного URL.
 */
async function fetchFromURL(url: string): Promise<BybitRateResult | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'car-calc/1.0',
      },
      body: REQUEST_BODY,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      logError('BYBIT', `HTTP ${response.status} от ${url}`);
      return null;
    }

    const data: BybitP2PResponse = await response.json();

    if (data.ret_code !== 0) {
      logError('BYBIT', `API error: ${data.ret_msg} (code ${data.ret_code})`);
      return null;
    }

    return parseBybitResponse(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logError('BYBIT', `Таймаут ${FETCH_TIMEOUT}мс для ${url}`);
    } else {
      logError('BYBIT', `Ошибка запроса ${url}: ${error}`);
    }
    return null;
  }
}

/**
 * Парсит ответ Bybit P2P.
 *
 * Алгоритм:
 * 1. Фильтруем: maxAmount >= 50,000₽ (отсекаем мелочь и мошенников)
 * 2. Берём топ-5 по цене (уже отсортированы Bybit по возрастанию)
 * 3. Считаем медиану — устойчива к выбросам
 */
function parseBybitResponse(data: BybitP2PResponse): BybitRateResult | null {
  try {
    const items = data.result.items;

    if (!items || items.length === 0) {
      logError('BYBIT', 'Пустой список объявлений');
      return null;
    }

    // Фильтрация: maxAmount >= MIN_MAX_AMOUNT
    const validItems = items.filter(
      (item) => parseFloat(item.maxAmount) >= MIN_MAX_AMOUNT
    );

    if (validItems.length === 0) {
      logError('BYBIT', `Нет объявлений с maxAmount >= ${MIN_MAX_AMOUNT}₽`);
      return null;
    }

    // Берём топ-N цен (Bybit уже сортирует по цене ASC)
    const topPrices = validItems
      .slice(0, TOP_N)
      .map((item) => parseFloat(item.price));

    // Проверяем, что цены — валидные числа
    if (topPrices.some((p) => !isFinite(p) || p <= 0)) {
      logError('BYBIT', `Невалидные цены: ${topPrices.join(', ')}`);
      return null;
    }

    // Медиана
    const median = calcMedian(topPrices);

    // Sanity-check: USDT/RUB должен быть в разумном диапазоне
    if (median < 50 || median > 200) {
      logError('BYBIT', `Медиана ${median}₽ вне разумного диапазона 50–200`);
      return null;
    }

    const result: BybitRateResult = {
      median,
      prices: topPrices,
      validCount: validItems.length,
      totalCount: items.length,
      fetchedAt: new Date().toISOString(),
    };

    logInfo(
      'BYBIT',
      `USDT/RUB медиана: ${median.toFixed(2)}₽ ` +
      `(цены: ${topPrices.map(p => p.toFixed(2)).join(', ')}₽) ` +
      `[${validItems.length}/${items.length} объявлений]`
    );

    return result;
  } catch (error) {
    logError('BYBIT', `Ошибка парсинга ответа Bybit: ${error}`);
    return null;
  }
}

/**
 * Вычисляет медиану массива чисел.
 * Медиана устойчива к выбросам, в отличие от среднего.
 */
function calcMedian(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

// Экспортируем для тестов
export { calcMedian as _calcMedian };
