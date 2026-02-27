// ============================================
// 🏦 ЦБ РФ — Курсы валют
// ============================================
// Подэтап: P4.1 · Бэкенд
//
// Источник: cbr-xml-daily.ru (JSON, без авторизации)
// ⚠️ KRW Nominal = 1000 — обязательно делить Value / Nominal
// Fallback: cbr-xml-daily.com → null (вызывающий код использует кэш)

import { logInfo, logError } from '@/lib/logger';

// ─────────────────────────────────────────────
// 📐 Типы
// ─────────────────────────────────────────────

/** Структура ответа ЦБ РФ */
interface CBRResponse {
  Date: string;
  PreviousDate: string;
  Timestamp: string;
  Valute: Record<
    string,
    {
      ID: string;
      NumCode: string;
      CharCode: string;
      Nominal: number;
      Name: string;
      Value: number;
      Previous: number;
    }
  >;
}

/** Результат парсинга ЦБ — все нужные курсы */
export interface CBRRatesResult {
  /** KRW → RUB (за 1 вону) */
  KRW_RUB: number;
  /** CNY → RUB (за 1 юань) */
  CNY_RUB: number;
  /** USD → RUB (справочно) */
  USD_RUB: number;
  /** EUR → RUB (для ЕТТ ЕАЭС при 3–5 и 5+ лет) */
  EUR_RUB: number;
  /** AED → RUB (справочно) */
  AED_RUB: number;
  /** Дата курсов ЦБ (ISO строка) */
  date: string;
}

// ─────────────────────────────────────────────
// 🌐 Endpoints
// ─────────────────────────────────────────────

const CBR_PRIMARY = 'https://www.cbr-xml-daily.ru/daily_json.js';
const CBR_FALLBACK = 'https://www.cbr-xml-daily.com/daily_json.js';

/** Таймаут запроса (мс) */
const FETCH_TIMEOUT = 10_000;

// ─────────────────────────────────────────────
// 📐 Основная функция
// ─────────────────────────────────────────────

/**
 * Получает курсы валют от ЦБ РФ.
 *
 * Порядок:
 * 1. cbr-xml-daily.ru (основной)
 * 2. cbr-xml-daily.com (зеркало)
 * 3. null → вызывающий код берёт из кэша
 *
 * @returns CBRRatesResult | null
 */
export async function fetchCBRRates(): Promise<CBRRatesResult | null> {
  // Попытка 1: основной домен
  const primary = await fetchFromURL(CBR_PRIMARY);
  if (primary) return primary;

  // Попытка 2: fallback
  logInfo('CBR', 'Основной домен не ответил, пробуем fallback...');
  const fallback = await fetchFromURL(CBR_FALLBACK);
  if (fallback) return fallback;

  // Оба упали
  logError('CBR', 'Оба домена ЦБ РФ недоступны!');
  return null;
}

// ─────────────────────────────────────────────
// 🔧 Внутренние функции
// ─────────────────────────────────────────────

/**
 * Запрашивает курсы с конкретного URL.
 * AbortController для таймаута.
 */
async function fetchFromURL(url: string): Promise<CBRRatesResult | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'car-calc/1.0',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      logError('CBR', `HTTP ${response.status} от ${url}`);
      return null;
    }

    const data: CBRResponse = await response.json();
    return parseCBRResponse(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logError('CBR', `Таймаут ${FETCH_TIMEOUT}мс для ${url}`);
    } else {
      logError('CBR', `Ошибка запроса ${url}: ${error}`);
    }
    return null;
  }
}

/**
 * Парсит ответ ЦБ РФ в наш формат.
 *
 * ⚠️ КРИТИЧНО: Value / Nominal!
 * KRW: Value=54.2461, Nominal=1000 → 0.054246 ₽ за 1 вону
 * CNY: Value=11.2394, Nominal=1    → 11.2394 ₽ за 1 юань
 */
function parseCBRResponse(data: CBRResponse): CBRRatesResult | null {
  try {
    const v = data.Valute;

    // Проверяем наличие всех нужных валют
    const required = ['KRW', 'CNY', 'USD', 'EUR', 'AED'];
    for (const code of required) {
      if (!v[code]) {
        logError('CBR', `Валюта ${code} отсутствует в ответе ЦБ`);
        return null;
      }
    }

    const result: CBRRatesResult = {
      KRW_RUB: v.KRW.Value / v.KRW.Nominal, // 54.25 / 1000 = 0.05425
      CNY_RUB: v.CNY.Value / v.CNY.Nominal,  // 11.24 / 1 = 11.24
      USD_RUB: v.USD.Value / v.USD.Nominal,  // 77.27 / 1 = 77.27
      EUR_RUB: v.EUR.Value / v.EUR.Nominal,  // ~84.0 / 1 = ~84.0
      AED_RUB: v.AED.Value / v.AED.Nominal,  // 21.04 / 1 = 21.04
      date: data.Date,
    };

    // Санитарная проверка: все курсы > 0 и конечные
    for (const [key, value] of Object.entries(result)) {
      if (key === 'date') continue;
      if (typeof value !== 'number' || !isFinite(value) || value <= 0) {
        logError('CBR', `Невалидный курс ${key} = ${value}`);
        return null;
      }
    }

    // Sanity-check диапазонов (защита от аномалий API)
    if (result.USD_RUB < 30 || result.USD_RUB > 200) {
      logError('CBR', `USD/RUB ${result.USD_RUB} вне разумного диапазона 30–200`);
      return null;
    }
    if (result.EUR_RUB < 30 || result.EUR_RUB > 250) {
      logError('CBR', `EUR/RUB ${result.EUR_RUB} вне разумного диапазона 30–250`);
      return null;
    }
    if (result.KRW_RUB < 0.01 || result.KRW_RUB > 0.5) {
      logError('CBR', `KRW/RUB ${result.KRW_RUB} вне разумного диапазона 0.01–0.5`);
      return null;
    }
    if (result.CNY_RUB < 3 || result.CNY_RUB > 40) {
      logError('CBR', `CNY/RUB ${result.CNY_RUB} вне разумного диапазона 3–40`);
      return null;
    }

    logInfo(
      'CBR',
      `Курсы ЦБ на ${result.date}: ` +
      `USD=${result.USD_RUB.toFixed(4)}, ` +
      `EUR=${result.EUR_RUB.toFixed(4)}, ` +
      `CNY=${result.CNY_RUB.toFixed(4)}, ` +
      `KRW=${result.KRW_RUB.toFixed(6)}, ` +
      `AED=${result.AED_RUB.toFixed(4)}`
    );

    return result;
  } catch (error) {
    logError('CBR', `Ошибка парсинга ответа ЦБ: ${error}`);
    return null;
  }
}
