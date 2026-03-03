// ============================================
// 🏦 ЦБ РФ — Курсы валют
// ============================================
// Подэтап: P4.1 · Бэкенд
//
// Источники (по приоритету):
//   1. Официальный API ЦБ РФ (cbr.ru/scripts/XML_daily.asp) — XML
//   2. Зеркало cbr-xml-daily.ru (JSON) — fallback
//   3. Зеркало cbr-xml-daily.com (JSON) — fallback 2
//
// ⚠️ KRW Nominal = 1000 — обязательно делить Value / Nominal
// ⚠️ XML ЦБ: десятичный разделитель — запятая (11,2394)

import { logInfo, logError } from '@/lib/logger';

// ─────────────────────────────────────────────
// 📐 Типы
// ─────────────────────────────────────────────

/** Структура ответа JSON-зеркала ЦБ РФ */
interface CBRJsonResponse {
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
  /** Источник данных */
  source: 'cbr-official' | 'cbr-xml-daily';
}

// ─────────────────────────────────────────────
// 🌐 Endpoints
// ─────────────────────────────────────────────

/** Официальный API ЦБ РФ (XML) */
const CBR_OFFICIAL = 'https://www.cbr.ru/scripts/XML_daily.asp';

/** JSON-зеркала (fallback) */
const CBR_JSON_PRIMARY = 'https://www.cbr-xml-daily.ru/daily_json.js';
const CBR_JSON_FALLBACK = 'https://www.cbr-xml-daily.com/daily_json.js';

/** Таймаут запроса (мс) */
const FETCH_TIMEOUT = 10_000;

// ─────────────────────────────────────────────
// 📐 Основная функция
// ─────────────────────────────────────────────

/**
 * Получает курсы валют от ЦБ РФ.
 *
 * Порядок:
 * 1. Официальный cbr.ru (XML) — самый точный
 * 2. cbr-xml-daily.ru (JSON) — зеркало
 * 3. cbr-xml-daily.com (JSON) — зеркало 2
 * 4. null → вызывающий код берёт из кэша
 */
export async function fetchCBRRates(): Promise<CBRRatesResult | null> {
  // Попытка 1: официальный ЦБ РФ (XML)
  const official = await fetchOfficialCBR();
  if (official) return official;

  // Попытка 2: JSON-зеркало (основное)
  logInfo('CBR', 'Официальный cbr.ru не ответил, пробуем cbr-xml-daily.ru...');
  const jsonPrimary = await fetchJsonMirror(CBR_JSON_PRIMARY);
  if (jsonPrimary) return jsonPrimary;

  // Попытка 3: JSON-зеркало (fallback)
  logInfo('CBR', 'cbr-xml-daily.ru не ответил, пробуем .com...');
  const jsonFallback = await fetchJsonMirror(CBR_JSON_FALLBACK);
  if (jsonFallback) return jsonFallback;

  // Все источники упали
  logError('CBR', 'Все 3 источника ЦБ РФ недоступны!');
  return null;
}

// ─────────────────────────────────────────────
// 🏛️ Официальный API ЦБ РФ (XML)
// ─────────────────────────────────────────────

/**
 * Запрашивает курсы с официального cbr.ru (XML формат).
 *
 * XML формат:
 * <Valute ID="R01375">
 *   <CharCode>CNY</CharCode>
 *   <Nominal>1</Nominal>
 *   <Value>11,2394</Value>
 * </Valute>
 *
 * ⚠️ Десятичный разделитель — ЗАПЯТАЯ (11,2394 → 11.2394)
 */
async function fetchOfficialCBR(): Promise<CBRRatesResult | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(CBR_OFFICIAL, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/xml',
        'User-Agent': 'car-calc/1.0',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) {
      logError('CBR', `Официальный ЦБ: HTTP ${response.status}`);
      return null;
    }

    const xml = await response.text();
    return parseOfficialXML(xml);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      logError('CBR', `Официальный ЦБ: таймаут ${FETCH_TIMEOUT}мс`);
    } else {
      logError('CBR', `Официальный ЦБ: ошибка запроса: ${error}`);
    }
    return null;
  }
}

/**
 * Парсит XML ответ официального ЦБ РФ.
 *
 * Извлекает <Valute> блоки через regex (формат стабильный с 2000-х годов).
 * Не требует XML-парсер библиотеку.
 */
function parseOfficialXML(xml: string): CBRRatesResult | null {
  try {
    // Извлекаем дату: <ValCurs Date="03.03.2026" ...>
    const dateMatch = xml.match(/ValCurs\s+Date="(\d{2})\.(\d{2})\.(\d{4})"/);
    const dateStr = dateMatch
      ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}T00:00:00+03:00`
      : new Date().toISOString();

    // Парсим каждую <Valute> ... </Valute>
    const valuteRegex = /<Valute[^>]*>[\s\S]*?<CharCode>(\w+)<\/CharCode>[\s\S]*?<Nominal>(\d+)<\/Nominal>[\s\S]*?<Value>([\d,]+)<\/Value>[\s\S]*?<\/Valute>/g;

    const currencies: Record<string, { nominal: number; value: number }> = {};
    let match;

    while ((match = valuteRegex.exec(xml)) !== null) {
      const charCode = match[1];
      const nominal = parseInt(match[2], 10);
      // ⚠️ Замена запятой на точку: "11,2394" → 11.2394
      const value = parseFloat(match[3].replace(',', '.'));

      if (charCode && nominal > 0 && isFinite(value) && value > 0) {
        currencies[charCode] = { nominal, value };
      }
    }

    // Проверяем наличие всех нужных валют
    const required = ['KRW', 'CNY', 'USD', 'EUR', 'AED'];
    for (const code of required) {
      if (!currencies[code]) {
        logError('CBR', `Официальный XML: валюта ${code} не найдена`);
        return null;
      }
    }

    const result: CBRRatesResult = {
      KRW_RUB: currencies.KRW.value / currencies.KRW.nominal,
      CNY_RUB: currencies.CNY.value / currencies.CNY.nominal,
      USD_RUB: currencies.USD.value / currencies.USD.nominal,
      EUR_RUB: currencies.EUR.value / currencies.EUR.nominal,
      AED_RUB: currencies.AED.value / currencies.AED.nominal,
      date: dateStr,
      source: 'cbr-official',
    };

    // Валидация
    const valid = validateRates(result);
    if (!valid) return null;

    logInfo(
      'CBR',
      `✅ Официальный ЦБ на ${dateStr}: ` +
      `USD=${result.USD_RUB.toFixed(4)}, ` +
      `EUR=${result.EUR_RUB.toFixed(4)}, ` +
      `CNY=${result.CNY_RUB.toFixed(4)}, ` +
      `KRW=${result.KRW_RUB.toFixed(6)}, ` +
      `AED=${result.AED_RUB.toFixed(4)}`
    );

    return result;
  } catch (error) {
    logError('CBR', `Ошибка парсинга XML ЦБ: ${error}`);
    return null;
  }
}

// ─────────────────────────────────────────────
// 🔄 JSON-зеркала (fallback)
// ─────────────────────────────────────────────

/**
 * Запрашивает курсы с JSON-зеркала cbr-xml-daily.
 */
async function fetchJsonMirror(url: string): Promise<CBRRatesResult | null> {
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

    const data: CBRJsonResponse = await response.json();
    return parseJsonResponse(data);
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
 * Парсит JSON ответ зеркала ЦБ РФ.
 */
function parseJsonResponse(data: CBRJsonResponse): CBRRatesResult | null {
  try {
    const v = data.Valute;

    const required = ['KRW', 'CNY', 'USD', 'EUR', 'AED'];
    for (const code of required) {
      if (!v[code]) {
        logError('CBR', `JSON: валюта ${code} отсутствует`);
        return null;
      }
    }

    const result: CBRRatesResult = {
      KRW_RUB: v.KRW.Value / v.KRW.Nominal,
      CNY_RUB: v.CNY.Value / v.CNY.Nominal,
      USD_RUB: v.USD.Value / v.USD.Nominal,
      EUR_RUB: v.EUR.Value / v.EUR.Nominal,
      AED_RUB: v.AED.Value / v.AED.Nominal,
      date: data.Date,
      source: 'cbr-xml-daily',
    };

    const valid = validateRates(result);
    if (!valid) return null;

    logInfo(
      'CBR',
      `Зеркало ЦБ на ${result.date}: ` +
      `USD=${result.USD_RUB.toFixed(4)}, ` +
      `EUR=${result.EUR_RUB.toFixed(4)}, ` +
      `CNY=${result.CNY_RUB.toFixed(4)}, ` +
      `KRW=${result.KRW_RUB.toFixed(6)}, ` +
      `AED=${result.AED_RUB.toFixed(4)}`
    );

    return result;
  } catch (error) {
    logError('CBR', `Ошибка парсинга JSON ЦБ: ${error}`);
    return null;
  }
}

// ─────────────────────────────────────────────
// ✅ Общая валидация
// ─────────────────────────────────────────────

function validateRates(result: CBRRatesResult): boolean {
  // Все курсы > 0 и конечные
  for (const [key, value] of Object.entries(result)) {
    if (key === 'date' || key === 'source') continue;
    if (typeof value !== 'number' || !isFinite(value) || value <= 0) {
      logError('CBR', `Невалидный курс ${key} = ${value}`);
      return false;
    }
  }

  // Sanity-check диапазонов
  if (result.USD_RUB < 30 || result.USD_RUB > 200) {
    logError('CBR', `USD/RUB ${result.USD_RUB} вне диапазона 30–200`);
    return false;
  }
  if (result.EUR_RUB < 30 || result.EUR_RUB > 250) {
    logError('CBR', `EUR/RUB ${result.EUR_RUB} вне диапазона 30–250`);
    return false;
  }
  if (result.KRW_RUB < 0.01 || result.KRW_RUB > 0.5) {
    logError('CBR', `KRW/RUB ${result.KRW_RUB} вне диапазона 0.01–0.5`);
    return false;
  }
  if (result.CNY_RUB < 3 || result.CNY_RUB > 40) {
    logError('CBR', `CNY/RUB ${result.CNY_RUB} вне диапазона 3–40`);
    return false;
  }

  return true;
}
