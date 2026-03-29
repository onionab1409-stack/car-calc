// ============================================
// 🇨🇳 CAR-CALC — Расчёт Китай → РФ / РБ
// ============================================
// Подэтап: P3.4 · Таможенник
// Формулы: подтверждены в master-context.md
//
// Китай → РФ (до 3 лет):
//   baseCNY = priceCNY + 8000 + priceCNY × 0.025
//   totalRUB = baseCNY × CNY_RUB × 1.48 + 590,000
//   ⚠️ 2.5% считается от цены авто (без 8000¥)
//
// Китай → РБ (до 3 лет):
//   baseCNY = priceCNY + 8000 + priceCNY × 0.025
//   totalRUB = baseCNY × CNY_RUB × 1.30 + 720,000
//
// Китай → РФ (3–5 лет):
//   totalRUB = baseCNY × CNY_RUB + ЕТТ_ЕАЭС + 590,000
//
// Китай → РФ (5+ лет):
//   totalRUB = baseCNY × CNY_RUB + ЕТТ_ЕАЭС_5+ + 590,000

import type {
  CarInput,
  CalcResult,
  CostBreakdown,
  ExchangeRates,
} from '@/types';
import { getAgeCategory } from '@/types';
import { CHINA, calcETT } from './data/constants';

// ─────────────────────────────────────────────
// 📐 Основная функция
// ─────────────────────────────────────────────

/**
 * Рассчитывает полную стоимость доставки авто из Китая в РФ или РБ.
 *
 * @param car     — входные данные (цена в CNY, мощность, объём, год и т.д.)
 * @param rates   — актуальные курсы валют (CNY_RUB уже включает спред ВТБ)
 * @param eurRate — курс EUR/RUB из ЦБ (нужен для ЕТТ ЕАЭС при 3–5 и 5+ лет)
 * @returns CalcResult с totalRUB и полным breakdown
 */
export function calcChina(
  car: CarInput,
  rates: ExchangeRates,
  eurRate?: number
): CalcResult {
  const priceCNY = car.price;
  const dest = car.destination;
  const age = getAgeCategory(car.year);
  const cnyRate = rates.CNY_RUB;

  // --- 1. Логистика в юанях ---
  const logisticsCNY = CHINA.LOGISTICS_CNY;

  // --- 2. Страховка 2.5% от ЦЕНЫ авто (не от цены+логистика!) ---
  const insuranceCNY = priceCNY * CHINA.INSURANCE_RATE;

  // --- 3. Базовая сумма в юанях ---
  const baseCNY = priceCNY + logisticsCNY + insuranceCNY;

  // --- 4. Базовая сумма в рублях ---
  const baseRUB = baseCNY * cnyRate;

  // --- 5. Таможня (зависит от направления и возраста) ---
  let customsRUB: number;
  let customsFormula: string;
  let usedTKS = false;

  if (age === 'under3') {
    if (dest === 'RU') {
      // РФ: ЕТТ ЕАЭС = MAX(цена_EUR × %, объём × мин_EUR/см³)
      if (!eurRate) {
        throw new Error('Для расчёта таможни РФ нужен курс EUR/RUB');
      }
      customsRUB = calcETT(car.engineCC || 0, eurRate, '3to5');
      customsFormula = `ЕТТ ЕАЭС: MAX(${Math.round(baseRUB / eurRate)}€ × %, ${car.engineCC}см³ × мин) × EUR`;
      usedTKS = true;
    } else {
      // РБ: множитель 1.30
      customsRUB = baseRUB * (CHINA.CUSTOMS_MULTIPLIER_BY - 1);
      customsFormula = `${baseCNY.toFixed(0)}¥ × ${cnyRate}₽ × (${CHINA.CUSTOMS_MULTIPLIER_BY} - 1)`;
    }
  } else if (age === '3to5') {
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

  // --- 6. Фиксированные расходы, ₽ ---
  const fixedCostsRUB = dest === 'RU' ? CHINA.FIXED_RU_RUB : CHINA.FIXED_BY_RUB;

  // --- 7. ИТОГО ---
  let totalRUB: number;

  if (age === 'under3' && dest === 'BY') {
    // До 3 лет → РБ: baseRUB × 1.30 + fixed
    totalRUB = Math.round(baseRUB * CHINA.CUSTOMS_MULTIPLIER_BY + fixedCostsRUB);
  } else {
    // До 3 лет → РФ (ETT), 3–5, 5+: baseRUB + customs + fixed
    totalRUB = Math.round(baseRUB + customsRUB + fixedCostsRUB);
  }

  // --- 8. Breakdown ---
  const formula = (age === 'under3' && dest === 'BY')
    ? `(${priceCNY.toLocaleString()}¥ + ${logisticsCNY}¥ + ${priceCNY}×${CHINA.INSURANCE_RATE}) × ${cnyRate}₽ × ${CHINA.CUSTOMS_MULTIPLIER_BY} + ${fixedCostsRUB}₽ = ${totalRUB}₽`
    : `(${priceCNY.toLocaleString()}¥ + ${logisticsCNY}¥ + 2.5%) × ${cnyRate}₽ + ЕТТ(${Math.round(customsRUB)}₽) + ${fixedCostsRUB}₽ = ${totalRUB}₽`;

  const breakdown: CostBreakdown = {
    country: 'China',
    destination: dest,
    ageCategory: age,

    carPriceOriginal: priceCNY,
    carPriceCurrency: 'CNY',
    carPriceRUB: priceCNY * cnyRate,

    auctionFee: 0,
    shipping: Math.round(logisticsCNY * cnyRate),
    insurance: Math.round(insuranceCNY * cnyRate),
    customs: Math.round(customsRUB),
    utilSbor: 0,
    fixedCosts: fixedCostsRUB,
    margin: 0,

    exchangeRate: cnyRate,
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
 * Быстрый расчёт для UI — только итоговая сумма.
 * Только для авто до 3 лет.
 */
export function calcChinaQuick(
  priceCNY: number,
  destination: 'RU' | 'BY',
  cnyRate: number
): number {
  const baseCNY = priceCNY + CHINA.LOGISTICS_CNY + priceCNY * CHINA.INSURANCE_RATE;

  const multiplier = destination === 'RU'
    ? CHINA.CUSTOMS_MULTIPLIER_RU
    : CHINA.CUSTOMS_MULTIPLIER_BY;

  const fixedCosts = destination === 'RU'
    ? CHINA.FIXED_RU_RUB
    : CHINA.FIXED_BY_RUB;

  return Math.round(baseCNY * cnyRate * multiplier + fixedCosts);
}

/**
 * Разбивка компонентов (для отладки / тестов).
 * Только для авто до 3 лет.
 */
export function calcChinaComponents(
  priceCNY: number,
  destination: 'RU' | 'BY',
  cnyRate: number
) {
  const logisticsCNY = CHINA.LOGISTICS_CNY;
  const insuranceCNY = priceCNY * CHINA.INSURANCE_RATE;
  const baseCNY = priceCNY + logisticsCNY + insuranceCNY;

  const multiplier = destination === 'RU'
    ? CHINA.CUSTOMS_MULTIPLIER_RU
    : CHINA.CUSTOMS_MULTIPLIER_BY;

  const baseRUB = baseCNY * cnyRate;
  const customsRUB = baseRUB * (multiplier - 1);
  const withCustomsRUB = baseRUB * multiplier;

  const fixedCosts = destination === 'RU'
    ? CHINA.FIXED_RU_RUB
    : CHINA.FIXED_BY_RUB;

  const totalRUB = withCustomsRUB + fixedCosts;

  return {
    priceCNY,
    logisticsCNY,
    insuranceCNY,
    baseCNY,
    baseRUB,
    customsRUB,
    withCustomsRUB,
    fixedCosts,
    totalRUB,
  };
}
