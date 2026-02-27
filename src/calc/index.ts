// ============================================
// 🧮 CAR-CALC — Мастер-калькулятор (роутер)
// ============================================
// Подэтап: P3.6 · Таможенник
//
// Единая точка входа: calculate(car, rates, eurRate?)
// 1. Определяет страну → вызывает нужный калькулятор
// 2. Добавляет доплату утильсбора (если >160лс или >3.0L)
// 3. Возвращает CalcResult с итоговой суммой

import type { CarInput, CalcResult, ExchangeRates } from '@/types';
import { getAgeCategory } from '@/types';
import { calcUSA } from './calc-usa';
import { calcKorea } from './calc-korea';
import { calcUAE } from './calc-uae';
import { calcChina } from './calc-china';
import { calcUtilSborExtra } from './data/util-sbor-rates';

// ─────────────────────────────────────────────
// 📐 Главная функция
// ─────────────────────────────────────────────

/**
 * Рассчитывает полную стоимость доставки авто из любой страны.
 *
 * @param car     — входные данные
 * @param rates   — актуальные курсы валют
 * @param eurRate — курс EUR/RUB (нужен для ЕТТ ЕАЭС при 3–5 и 5+ лет)
 * @returns CalcResult с totalRUB и breakdown
 */
export function calculate(
  car: CarInput,
  rates: ExchangeRates,
  eurRate?: number
): CalcResult {
  // --- 1. Базовый расчёт по стране ---
  let result: CalcResult;

  switch (car.country) {
    case 'USA':
      result = calcUSA(car, rates, eurRate);
      break;
    case 'Korea':
      result = calcKorea(car, rates, eurRate);
      break;
    case 'UAE':
      result = calcUAE(car, rates);
      break;
    case 'China':
      result = calcChina(car, rates, eurRate);
      break;
    default:
      throw new Error(`Неизвестная страна: ${(car as any).country}`);
  }

  // --- 2. Доплата утильсбора (если нужна) ---
  const age = getAgeCategory(car.year);
  const utilExtra = calcUtilSborExtra(
    car.horsePower,
    car.engineCC,
    car.engineType,
    age
  );

  if (utilExtra > 0) {
    result.totalRUB += utilExtra;
    result.breakdown.utilSbor = utilExtra;
    result.breakdown.totalRUB = result.totalRUB;
    result.breakdown.formula += ` + утильсбор ${utilExtra.toLocaleString()}₽`;
  }

  return result;
}

// ─────────────────────────────────────────────
// 🔍 Быстрый расчёт (без breakdown)
// ─────────────────────────────────────────────

import { calcUSAQuick } from './calc-usa';
import { calcKoreaQuick } from './calc-korea';
import { calcUAEQuick } from './calc-uae';
import { calcChinaQuick } from './calc-china';

/**
 * Быстрый расчёт — только итоговая сумма.
 * Для предварительной оценки на фронтенде. Только до 3 лет.
 * НЕ включает доплату утильсбора.
 */
export function calculateQuick(
  car: CarInput,
  rates: ExchangeRates
): number {
  switch (car.country) {
    case 'USA':
      return calcUSAQuick(car.price, car.destination, rates.USDT_RUB);
    case 'Korea':
      return calcKoreaQuick(car.price, car.destination, rates.KRW_RUB);
    case 'UAE':
      return calcUAEQuick(car.price, car.destination, rates.USDT_RUB);
    case 'China':
      return calcChinaQuick(car.price, car.destination, rates.CNY_RUB);
    default:
      throw new Error(`Неизвестная страна: ${(car as any).country}`);
  }
}

// ─────────────────────────────────────────────
// 📦 Реэкспорт для удобства
// ─────────────────────────────────────────────

export { calcUSA, calcUSAQuick } from './calc-usa';
export { calcKorea, calcKoreaQuick } from './calc-korea';
export { calcUAE, calcUAEQuick } from './calc-uae';
export { calcChina, calcChinaQuick } from './calc-china';
export { calcUtilSbor, calcUtilSborExtra, isPreferentialUtilSbor } from './data/util-sbor-rates';
