// ============================================
// 🇰🇷 CAR-CALC — Расчёт Корея → РФ / РБ
// ============================================
// Подэтап: P3.2 · Таможенник
// Формулы: подтверждены в master-context.md
//
// Корея → РФ (до 3 лет):
//   totalRUB = priceKRW × KRW_RUB × 1.48 + 90,000 + 600,000
//
// Корея → РБ (до 3 лет):
//   totalRUB = priceKRW × KRW_RUB × 1.30 + 90,000 + 720,000
//
// Корея → РФ (3–5 лет):
//   totalRUB = priceKRW × KRW_RUB + 90,000 + ЕТТ_ЕАЭС + 600,000
//
// Корея → РФ (5+ лет):
//   totalRUB = priceKRW × KRW_RUB + 90,000 + ЕТТ_ЕАЭС_5+ + 600,000

import type {
  CarInput,
  CalcResult,
  CostBreakdown,
  ExchangeRates,
  AgeCategory,
} from '@/types';
import { getAgeCategory } from '@/types';
import { KOREA, calcETT } from './data/constants';

// ─────────────────────────────────────────────
// 📐 Основная функция
// ─────────────────────────────────────────────

/**
 * Рассчитывает полную стоимость доставки авто из Кореи в РФ или РБ.
 *
 * @param car     — входные данные (цена в KRW, мощность, объём, год и т.д.)
 * @param rates   — актуальные курсы валют (KRW_RUB уже включает спред ВТБ)
 * @param eurRate — курс EUR/RUB из ЦБ (нужен для ЕТТ ЕАЭС при 3–5 лет и 5+)
 * @returns CalcResult с totalRUB и полным breakdown
 */
export function calcKorea(
  car: CarInput,
  rates: ExchangeRates,
  eurRate?: number
): CalcResult {
  const priceKRW = car.price; // цена в вонах
  const dest = car.destination;
  const age = getAgeCategory(car.year);
  const krwRate = rates.KRW_RUB; // уже с учётом спреда ВТБ

  // --- 1. Цена авто в рублях ---
  const carPriceRUB = priceKRW * krwRate;

  // --- 2. Логистика (фрахт KR → Владивосток), ₽ ---
  const logisticsRUB = KOREA.LOGISTICS_RUB;

  // --- 3. Таможня + НДС (зависит от направления и возраста) ---
  let customsRUB: number;
  let customsFormula: string;
  let usedTKS = false;

  if (age === 'under3') {
    if (dest === 'RU') {
      // До 3 лет → РФ: ЕТТ ЕАЭС = MAX(цена_EUR × %, объём × мин_EUR/см³)
      if (!eurRate) {
        throw new Error('Для расчёта таможни РФ нужен курс EUR/RUB');
      }
      customsRUB = calcETT(car.engineCC || 0, eurRate, '3to5');
      customsFormula = `ЕТТ ЕАЭС: MAX(${Math.round(carPriceRUB / eurRate)}€ × %, ${car.engineCC}см³ × мин) × EUR ${eurRate}₽`;
      usedTKS = true;
    } else {
      // До 3 лет → РБ: множитель 1.30 (без изменений)
      customsRUB = carPriceRUB * (KOREA.CUSTOMS_MULTIPLIER_BY - 1);
      customsFormula = `${priceKRW.toLocaleString()}₩ × ${krwRate}₽ × (${KOREA.CUSTOMS_MULTIPLIER_BY} - 1)`;
    }
  } else if (age === '3to5') {
    // 3–5 лет — ЕТТ ЕАЭС
    if (!car.engineCC) {
      throw new Error('Для авто 3–5 лет обязателен объём двигателя (engineCC)');
    }
    if (!eurRate) {
      throw new Error('Для авто 3–5 лет нужен курс EUR/RUB');
    }
    customsRUB = calcETT(car.engineCC, eurRate, '3to5');
    customsFormula = `ЕТТ ЕАЭС: ${car.engineCC}см³ × ставка × EUR ${eurRate}₽`;
    usedTKS = true;
  } else {
    // 5+ лет — ЕТТ ЕАЭС повышенные ставки
    if (!car.engineCC) {
      throw new Error('Для авто 5+ лет обязателен объём двигателя (engineCC)');
    }
    if (!eurRate) {
      throw new Error('Для авто 5+ лет нужен курс EUR/RUB');
    }
    customsRUB = calcETT(car.engineCC, eurRate, 'over5');
    customsFormula = `ЕТТ ЕАЭС 5+: ${car.engineCC}см³ × ставка × EUR ${eurRate}₽`;
    usedTKS = true;
  }

  // --- 4. Фиксированные расходы (СБКТС + ЭПТС + брокер + маржа), ₽ ---
  const fixedCostsRUB = dest === 'RU' ? KOREA.FIXED_RU_RUB : KOREA.FIXED_BY_RUB;

  // --- 5. ИТОГО ---
  let totalRUB: number;

  if (age === 'under3' && dest === 'BY') {
    // До 3 лет → РБ: priceKRW × krwRate × 1.30 + logistics + fixed
    totalRUB = Math.round(carPriceRUB * KOREA.CUSTOMS_MULTIPLIER_BY + logisticsRUB + fixedCostsRUB);
  } else {
    // До 3 лет → РФ (ETT), 3–5 и 5+ лет: priceRUB + customs + logistics + fixed
    totalRUB = Math.round(carPriceRUB + logisticsRUB + customsRUB + fixedCostsRUB);
  }

  // --- 6. Breakdown (скрыт от клиента, для лога) ---
  const formula = (age === 'under3' && dest === 'BY')
    ? `${priceKRW.toLocaleString()}₩ × ${krwRate}₽ × ${KOREA.CUSTOMS_MULTIPLIER_BY} + ${logisticsRUB}₽ + ${fixedCostsRUB}₽ = ${totalRUB}₽`
    : `${priceKRW.toLocaleString()}₩ × ${krwRate}₽ + ${logisticsRUB}₽ + ЕТТ(${Math.round(customsRUB)}₽) + ${fixedCostsRUB}₽ = ${totalRUB}₽`;

  const breakdown: CostBreakdown = {
    country: 'Korea',
    destination: dest,
    ageCategory: age,

    carPriceOriginal: priceKRW,
    carPriceCurrency: 'KRW',
    carPriceRUB,

    auctionFee: 0, // нет аукционного сбора для Кореи
    shipping: logisticsRUB,
    insurance: 0, // включена в логистику
    customs: Math.round(customsRUB),
    utilSbor: 0, // считается отдельно (если >160лс)
    fixedCosts: fixedCostsRUB,
    margin: 0, // маржа включена в фикс

    exchangeRate: krwRate,
    rateSource: 'cbr',

    totalRUB,

    formula,
    usedTKS,
    timestamp: new Date().toISOString(),
  };

  return {
    totalRUB,
    breakdown,
  };
}

// ─────────────────────────────────────────────
// 🔍 Вспомогательные функции
// ─────────────────────────────────────────────

/**
 * Быстрый расчёт для UI — только итоговая сумма, без breakdown.
 * Только для авто до 3 лет.
 */
export function calcKoreaQuick(
  priceKRW: number,
  destination: 'RU' | 'BY',
  krwRate: number
): number {
  const multiplier = destination === 'RU'
    ? KOREA.CUSTOMS_MULTIPLIER_RU
    : KOREA.CUSTOMS_MULTIPLIER_BY;
  const fixedCosts = destination === 'RU'
    ? KOREA.FIXED_RU_RUB
    : KOREA.FIXED_BY_RUB;

  return Math.round(
    priceKRW * krwRate * multiplier + KOREA.LOGISTICS_RUB + fixedCosts
  );
}

/**
 * Разбивка компонентов в рублях (для отладки / тестов).
 * Только для авто до 3 лет.
 */
export function calcKoreaComponents(
  priceKRW: number,
  destination: 'RU' | 'BY',
  krwRate: number
) {
  const carPriceRUB = priceKRW * krwRate;
  const multiplier = destination === 'RU'
    ? KOREA.CUSTOMS_MULTIPLIER_RU
    : KOREA.CUSTOMS_MULTIPLIER_BY;
  const customsRUB = carPriceRUB * (multiplier - 1);
  const carWithCustomsRUB = carPriceRUB * multiplier;
  const logisticsRUB = KOREA.LOGISTICS_RUB;
  const fixedCostsRUB = destination === 'RU'
    ? KOREA.FIXED_RU_RUB
    : KOREA.FIXED_BY_RUB;
  const totalRUB = carWithCustomsRUB + logisticsRUB + fixedCostsRUB;

  return {
    priceKRW,
    carPriceRUB,
    customsRUB,
    carWithCustomsRUB,
    logisticsRUB,
    fixedCostsRUB,
    totalRUB,
  };
}
