// ============================================
// 💱 Единый модуль курсов валют
// ============================================
// Подэтап: P4.1 · Бэкенд
//
// Объединяет:
//   - Bybit P2P (USDT/RUB) — для США и ОАЭ
//   - ЦБ РФ (KRW, CNY, EUR) — для Кореи, Китая, ЕТТ ЕАЭС
//
// Применяет:
//   - Коррекция MoscaEx (±₽ к USDT)
//   - Спред ВТБ (±₽ к KRW, CNY)
//
// Кэширует:
//   - In-memory TTLCache (TTL = 1 час)
//   - Fallback: последний успешный результат (stale cache)

import type { ExchangeRates } from '@/types';
import { TTLCache } from '@/lib/cache';
import { logInfo, logError } from '@/lib/logger';
import { fetchCBRRates, type CBRRatesResult } from './cbr';
import { fetchBybitRate, type BybitRateResult } from './bybit';

// ─────────────────────────────────────────────
// 📐 Конфиг
// ─────────────────────────────────────────────

/** TTL кэша курсов — 1 час */
const RATES_TTL_MS = 60 * 60 * 1000;

/** Фиксированный курс AED/USD (привязка дирхама) */
const AED_USD_FIXED = 3.67;

// ─────────────────────────────────────────────
// 💾 Кэши
// ─────────────────────────────────────────────

/** Основной кэш с TTL */
const ratesCache = new TTLCache<ExchangeRates>();

/** Stale-кэш: ВСЕГДА хранит последний успешный результат (без TTL) */
let lastKnownRates: ExchangeRates | null = null;

/** Кэш сырых данных ЦБ (для eurRate) */
const cbrCache = new TTLCache<CBRRatesResult>();

/** Stale-кэш ЦБ */
let lastKnownCBR: CBRRatesResult | null = null;

/** Stale-кэш Bybit */
let lastKnownBybit: BybitRateResult | null = null;

// ─────────────────────────────────────────────
// 📐 Дефолтные настройки админки
// ─────────────────────────────────────────────

/** Настройки коррекций (будут перезаписываться из БД/админки) */
interface RatesAdminConfig {
  /** Коррекция USDT к MoscaEx (±₽) */
  usdtCorrection: number;
  /** Спред ВТБ для KRW (±₽ за 1 вону) */
  vtbSpreadKRW: number;
  /** Спред ВТБ для CNY (±₽ за 1 юань) */
  vtbSpreadCNY: number;
}

/** Дефолтные значения — перезаписываются через setAdminConfig() */
let adminConfig: RatesAdminConfig = {
  usdtCorrection: 1.50,   // Bybit 77.00 + 1.50 = 78.50 (≈ MoscaEx)
  vtbSpreadKRW: 0.00050,  // ЦБ 0.05425 + 0.00050 = 0.05475
  vtbSpreadCNY: 0.30,     // ЦБ 11.24 + 0.30 = 11.54
};

/**
 * Обновляет коррекции из админки (Telegram Bot команды).
 * Вызывается при: /set_correction, /set_vtb_spread
 */
export function setAdminConfig(config: Partial<RatesAdminConfig>): void {
  adminConfig = { ...adminConfig, ...config };
  // Сбрасываем кэш — курсы нужно пересчитать с новыми коррекциями
  ratesCache.clear();
  logInfo('RATES', `Админ-конфиг обновлён: ${JSON.stringify(adminConfig)}`);
}

/** Возвращает текущий конфиг (для отображения в админке) */
export function getAdminConfig(): RatesAdminConfig {
  return { ...adminConfig };
}

// ─────────────────────────────────────────────
// 📐 Основная функция
// ─────────────────────────────────────────────

/**
 * Возвращает актуальные курсы валют с коррекциями.
 *
 * Порядок:
 * 1. In-memory кэш (TTL 1 час) → если есть, мгновенно
 * 2. Параллельный запрос: Bybit + ЦБ → обновляем кэш
 * 3. Частичный fallback: если один источник упал, второй работает
 * 4. Полный fallback: stale-кэш (последний успешный)
 * 5. Ошибка: если вообще никогда не было данных
 *
 * @returns ExchangeRates
 * @throws Error если нет данных и нет кэша
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  // 1. Проверяем TTL-кэш
  const cached = ratesCache.get('rates');
  if (cached) {
    return cached;
  }

  // 2. Запрашиваем оба источника ПАРАЛЛЕЛЬНО
  logInfo('RATES', 'Кэш устарел, запрашиваем свежие курсы...');

  const [bybitResult, cbrResult] = await Promise.all([
    fetchBybitRate(),
    fetchCBRRates(),
  ]);

  // Обновляем stale-кэши
  if (bybitResult) lastKnownBybit = bybitResult;
  if (cbrResult) lastKnownCBR = cbrResult;

  // Кэшируем сырые данные ЦБ (для eurRate)
  if (cbrResult) {
    cbrCache.set('cbr', cbrResult, RATES_TTL_MS);
  }

  // 3. Собираем курсы с fallback на stale-данные
  const bybit = bybitResult || lastKnownBybit;
  const cbr = cbrResult || lastKnownCBR;

  if (!bybit && !cbr) {
    // 4. Полный fallback: stale ExchangeRates
    if (lastKnownRates) {
      logError('RATES', 'Оба источника недоступны! Используем stale-кэш.');
      return lastKnownRates;
    }
    // 5. Никогда не было данных — hardcoded fallback (последняя линия обороны)
    logError('RATES', 'Оба источника недоступны, кэш пуст! Используем hardcoded курсы.');
  }

  // Собираем ExchangeRates
  const rates = buildExchangeRates(bybit, cbr);

  // Сохраняем в оба кэша
  ratesCache.set('rates', rates, RATES_TTL_MS);
  lastKnownRates = rates;

  return rates;
}

/**
 * Возвращает курс EUR/RUB из ЦБ (нужен для ЕТТ ЕАЭС при 3–5 лет).
 * Отдельная функция, т.к. eurRate — опциональный параметр calculate().
 *
 * @returns number | null
 */
export async function getEURRate(): Promise<number | null> {
  // Сначала из кэша
  const cached = cbrCache.get('cbr');
  if (cached) return cached.EUR_RUB;

  // Запрашиваем ЦБ
  const cbr = await fetchCBRRates();
  if (cbr) {
    cbrCache.set('cbr', cbr, RATES_TTL_MS);
    lastKnownCBR = cbr;
    return cbr.EUR_RUB;
  }

  // Stale fallback
  if (lastKnownCBR) return lastKnownCBR.EUR_RUB;

  return null;
}

// ─────────────────────────────────────────────
// 🔧 Внутренние функции
// ─────────────────────────────────────────────

/**
 * Собирает ExchangeRates из сырых данных + коррекции.
 *
 * Если один из источников null — используем stale или дефолт.
 */
function buildExchangeRates(
  bybit: BybitRateResult | null,
  cbr: CBRRatesResult | null
): ExchangeRates {
  // USDT/RUB = Bybit медиана + коррекция MoscaEx
  let USDT_RUB: number;
  if (bybit) {
    USDT_RUB = bybit.median + adminConfig.usdtCorrection;
  } else if (lastKnownBybit) {
    USDT_RUB = lastKnownBybit.median + adminConfig.usdtCorrection;
    logError('RATES', 'Bybit недоступен, используем stale USDT курс');
  } else {
    // Hardcoded fallback — только если вообще никогда не было данных
    USDT_RUB = 78.50;
    logError('RATES', 'Bybit: нет данных, используем hardcoded 78.50₽');
  }

  // KRW/RUB = ЦБ + спред ВТБ
  let KRW_RUB: number;
  if (cbr) {
    KRW_RUB = cbr.KRW_RUB + adminConfig.vtbSpreadKRW;
  } else if (lastKnownCBR) {
    KRW_RUB = lastKnownCBR.KRW_RUB + adminConfig.vtbSpreadKRW;
    logError('RATES', 'ЦБ недоступен, используем stale KRW курс');
  } else {
    KRW_RUB = 0.05364;
    logError('RATES', 'ЦБ: нет данных KRW, используем hardcoded 0.05364');
  }

  // CNY/RUB = ЦБ + спред ВТБ
  let CNY_RUB: number;
  if (cbr) {
    CNY_RUB = cbr.CNY_RUB + adminConfig.vtbSpreadCNY;
  } else if (lastKnownCBR) {
    CNY_RUB = lastKnownCBR.CNY_RUB + adminConfig.vtbSpreadCNY;
    logError('RATES', 'ЦБ недоступен, используем stale CNY курс');
  } else {
    CNY_RUB = 11.40;
    logError('RATES', 'ЦБ: нет данных CNY, используем hardcoded 11.40');
  }

  const rates: ExchangeRates = {
    USDT_RUB: round(USDT_RUB, 2),
    KRW_RUB: round(KRW_RUB, 6),
    CNY_RUB: round(CNY_RUB, 4),
    AED_USD: AED_USD_FIXED,
    updatedAt: new Date().toISOString(),
  };

  logInfo(
    'RATES',
    `Итоговые курсы: ` +
    `USDT=${rates.USDT_RUB}₽ (${bybit ? 'fresh' : 'stale'}), ` +
    `KRW=${rates.KRW_RUB}₽ (${cbr ? 'fresh' : 'stale'}), ` +
    `CNY=${rates.CNY_RUB}₽ (${cbr ? 'fresh' : 'stale'})`
  );

  return rates;
}

/** Округление до N знаков */
function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// ─────────────────────────────────────────────
// 🧹 Утилиты (для тестов и отладки)
// ─────────────────────────────────────────────

/** Сбрасывает все кэши (для тестов) */
export function _resetAllCaches(): void {
  ratesCache.clear();
  cbrCache.clear();
  lastKnownRates = null;
  lastKnownCBR = null;
  lastKnownBybit = null;
  // Сбрасываем конфиг к дефолту
  adminConfig = {
    usdtCorrection: 1.50,
    vtbSpreadKRW: 0.00050,
    vtbSpreadCNY: 0.30,
  };
}

// Реэкспорт для удобства
export { fetchCBRRates, type CBRRatesResult } from './cbr';
export { fetchBybitRate, type BybitRateResult } from './bybit';
