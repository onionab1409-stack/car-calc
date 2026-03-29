// ============================================
// 🇺🇸 CAR-CALC — Расчёт USA → РФ / РБ
// ============================================
// Подэтап: P3.1 · Таможенник
// Формулы: подтверждены в P2.4 · master-context.md
//
// USA → РФ (до 3 лет):
//   dollarPart = (lot×1.08 + 2200 + 750)×1.011 + (lot×1.08 + 2200)×0.48
//   total = dollarPart × USDT_rate + fix(lot)
//
// USA → РБ (до 3 лет):
//   dollarPart = (lot×1.08 + 2200 + 750)×1.011 + (lot×1.08)×0.30
//   total = dollarPart × USDT_rate + fix(lot)
//
// USA → РФ (3–5 лет):
//   базовая часть + ЕТТ ЕАЭС вместо 0.48

import type {
  CarInput,
  CalcResult,
  CostBreakdown,
  ExchangeRates,
  AgeCategory,
} from '@/types';
import { getAgeCategory } from '@/types';
import {
  USA,
  lookupFixedCost,
  FIXED_COSTS_USA_RU,
  FIXED_COSTS_USA_BY,
  calcETT,
  calcETTUnder3,
} from './data/constants';

// ─────────────────────────────────────────────
// 📐 Основная функция
// ─────────────────────────────────────────────

/**
 * Рассчитывает полную стоимость доставки авто из USA в РФ или РБ.
 *
 * @param car     — входные данные (цена лота в USD, мощность, объём, год и т.д.)
 * @param rates   — актуальные курсы валют
 * @param eurRate — курс EUR/RUB из ЦБ (нужен для ЕТТ ЕАЭС при 3–5 лет)
 * @returns CalcResult с totalRUB и полным breakdown
 */
export function calcUSA(
  car: CarInput,
  rates: ExchangeRates,
  eurRate?: number
): CalcResult {
  const lot = car.price; // цена лота в USD
  const dest = car.destination;
  const age = getAgeCategory(car.year);

  // --- 1. Аукционный сбор (8%) ---
  const auctionFee = lot * USA.AUCTION_FEE_RATE;
  const lotWithFee = lot + auctionFee; // lot × 1.08

  // --- 2. Доставка ---
  const oceanShipping = USA.OCEAN_SHIPPING_USD;
  const inlandShipping = USA.INLAND_SHIPPING_USD;

  // --- 3. Базовая сумма до таможни (в USD) ---
  //   = (lot×1.08 + ocean + inland) × (1 + insurance)
  const preCustomsBase = lotWithFee + oceanShipping + inlandShipping;
  const insurance = preCustomsBase * USA.INSURANCE_RATE;
  const preCustomsTotal = preCustomsBase + insurance;
  // Эквивалент: preCustomsBase × 1.011

  // --- 4. Таможня (зависит от направления и возраста) ---
  let customsUSD: number;
  let customsFormula: string;
  let usedTKS = false;

  if (age === 'under3') {
    // До 3 лет — фиксированный множитель
    if (dest === 'RU') {
      // РФ: ЕТТ ЕАЭС = MAX(цена_EUR × %, объём × мин_EUR/см³)
      if (!eurRate) {
        throw new Error('Для расчёта таможни РФ нужен курс EUR/RUB');
      }
      // Таможенная стоимость = (лот + аукционный сбор + морская доставка) в рублях
      const customsBaseRUB = (lotWithFee + oceanShipping) * rates.USDT_RUB;
      const ettRUB = calcETTUnder3(customsBaseRUB, car.engineCC || 0, eurRate);
      customsUSD = ettRUB / rates.USDT_RUB; // для единообразия в формуле
      customsFormula = `ЕТТ ЕАЭС: MAX(${Math.round(customsBaseRUB / eurRate)}€ × %, ${car.engineCC}см³ × мин) × EUR ${eurRate}₽`;
      usedTKS = true;
    } else {
      // РБ: база для 30% = lot×1.08 (без доставки!)
      customsUSD = lotWithFee * USA.CUSTOMS_RATE_BY;
      customsFormula = `${lot}×1.08 × ${USA.CUSTOMS_RATE_BY}`;
    }
  } else if (age === '3to5') {
    // 3–5 лет — ЕТТ ЕАЭС (в рублях!)
    if (!car.engineCC) {
      throw new Error('Для авто 3–5 лет обязателен объём двигателя (engineCC)');
    }
    if (!eurRate) {
      throw new Error('Для авто 3–5 лет нужен курс EUR/RUB');
    }
    // ЕТТ считается в рублях, переведём обратно в USD для breakdown
    const ettRUB = calcETT(car.engineCC, eurRate, '3to5');
    customsUSD = ettRUB / rates.USDT_RUB; // для единообразия
    customsFormula = `ЕТТ ЕАЭС: ${car.engineCC}см³ × ставка × EUR ${eurRate}₽`;
    usedTKS = true;
  } else {
    // over5 — ЕТТ 5+
    if (!car.engineCC) {
      throw new Error('Для авто 5+ лет обязателен объём двигателя (engineCC)');
    }
    if (!eurRate) {
      throw new Error('Для авто 5+ лет нужен курс EUR/RUB');
    }
    const ettRUB = calcETT(car.engineCC, eurRate, 'over5');
    customsUSD = ettRUB / rates.USDT_RUB;
    customsFormula = `ЕТТ ЕАЭС 5+: ${car.engineCC}см³ × ставка × EUR ${eurRate}₽`;
    usedTKS = true;
  }

  // --- 5. Итого в USD ---
  const totalUSD = preCustomsTotal + customsUSD;

  // --- 6. Конвертация в рубли ---
  const usdtRate = rates.USDT_RUB;
  const totalBeforeFixRUB = totalUSD * usdtRate;

  // --- 7. Фиксированные расходы (в рублях) ---
  const fixTable = dest === 'RU' ? FIXED_COSTS_USA_RU : FIXED_COSTS_USA_BY;
  const fixedCosts = lookupFixedCost(fixTable, lot);

  // --- 8. ИТОГО ---
  const totalRUB = Math.round(totalBeforeFixRUB + fixedCosts);

  // --- 9. Breakdown (скрыт от клиента, для лога) ---
  const formula = dest === 'RU'
    ? `(${lot}×1.08 + ${oceanShipping} + ${inlandShipping})×1.011 + ${customsFormula} = $${totalUSD.toFixed(0)} × ${usdtRate}₽ + ${fixedCosts}₽`
    : `(${lot}×1.08 + ${oceanShipping} + ${inlandShipping})×1.011 + ${customsFormula} = $${totalUSD.toFixed(0)} × ${usdtRate}₽ + ${fixedCosts}₽`;

  const breakdown: CostBreakdown = {
    country: 'USA',
    destination: dest,
    ageCategory: age,

    carPriceOriginal: lot,
    carPriceCurrency: 'USD',
    carPriceUSD: lot,
    carPriceRUB: lot * usdtRate,

    auctionFee: Math.round(auctionFee * usdtRate),
    shipping: Math.round((oceanShipping + inlandShipping) * usdtRate),
    insurance: Math.round(insurance * usdtRate),
    customs: Math.round(customsUSD * usdtRate),
    utilSbor: 0, // утильсбор считается отдельно (если >160лс)
    fixedCosts,
    margin: 0, // маржа включена в фикс

    exchangeRate: usdtRate,
    rateSource: 'bybit_p2p',

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
 * Для предварительной оценки на фронтенде.
 */
export function calcUSAQuick(
  lotUSD: number,
  destination: 'RU' | 'BY',
  usdtRate: number
): number {
  const lotWithFee = lotUSD * (1 + USA.AUCTION_FEE_RATE);
  const preCustoms = (lotWithFee + USA.OCEAN_SHIPPING_USD + USA.INLAND_SHIPPING_USD)
    * (1 + USA.INSURANCE_RATE);

  let customs: number;
  if (destination === 'RU') {
    customs = (lotWithFee + USA.OCEAN_SHIPPING_USD) * USA.CUSTOMS_RATE_RU;
  } else {
    customs = lotWithFee * USA.CUSTOMS_RATE_BY;
  }

  const totalUSD = preCustoms + customs;
  const fixTable = destination === 'RU' ? FIXED_COSTS_USA_RU : FIXED_COSTS_USA_BY;
  const fixedCosts = lookupFixedCost(fixTable, lotUSD);

  return Math.round(totalUSD * usdtRate + fixedCosts);
}

/**
 * Разбивка компонентов в USD (для отладки / тестов).
 */
export function calcUSAComponents(lotUSD: number, destination: 'RU' | 'BY') {
  const auctionFee = lotUSD * USA.AUCTION_FEE_RATE;
  const lotWithFee = lotUSD + auctionFee;
  const shipping = USA.OCEAN_SHIPPING_USD + USA.INLAND_SHIPPING_USD;
  const preCustomsBase = lotWithFee + shipping;
  const insurance = preCustomsBase * USA.INSURANCE_RATE;
  const preCustomsTotal = preCustomsBase + insurance;

  let customs: number;
  if (destination === 'RU') {
    customs = (lotWithFee + USA.OCEAN_SHIPPING_USD) * USA.CUSTOMS_RATE_RU;
  } else {
    customs = lotWithFee * USA.CUSTOMS_RATE_BY;
  }

  const totalUSD = preCustomsTotal + customs;

  return {
    lotUSD,
    auctionFee,
    lotWithFee,
    shipping,
    insurance,
    preCustomsTotal,
    customs,
    totalUSD,
  };
}
