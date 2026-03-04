// ============================================
// 🇦🇪 CAR-CALC — Расчёт ОАЭ → РФ / РБ
// ============================================
// Подэтап: P3.3 · Таможенник
// Формулы: подтверждены в master-context.md
//
// ОАЭ → РФ (только новые авто):
//   priceUSD = priceAED / 3.67 + 1700
//   totalRUB = priceUSD × USDT_rate × 1.48 + fix(priceUSD)
//
// ОАЭ → РБ (только новые авто):
//   priceUSD = priceAED / 3.67 + 1700
//   totalRUB = priceUSD × USDT_rate × 1.30 + fix(priceUSD)
//
// ⚠️ ОАЭ — ТОЛЬКО новые авто (до 3 лет). 3–5 и 5+ не поддерживаются.

import type {
  CarInput,
  CalcResult,
  CostBreakdown,
  ExchangeRates,
} from '@/types';
import { getAgeCategory } from '@/types';
import {
  UAE,
  lookupFixedCost,
  FIXED_COSTS_UAE_RU,
  FIXED_COSTS_UAE_BY,
} from './data/constants';

// ─────────────────────────────────────────────
// 📐 Основная функция
// ─────────────────────────────────────────────

/**
 * Рассчитывает полную стоимость доставки авто из ОАЭ в РФ или РБ.
 * ⚠️ Только новые авто (до 3 лет).
 *
 * @param car   — входные данные (цена в AED, мощность, год и т.д.)
 * @param rates — актуальные курсы валют (USDT_RUB)
 * @returns CalcResult с totalRUB и полным breakdown
 */
export function calcUAE(
  car: CarInput,
  rates: ExchangeRates
): CalcResult {
  const priceAED = car.price;
  const dest = car.destination;
  const age = getAgeCategory(car.year);

  // ⚠️ ОАЭ — только новые авто
  if (age !== 'under3') {
    throw new Error('ОАЭ: поддерживаются только новые авто (до 3 лет)');
  }

  const usdtRate = rates.USDT_RUB;

  // --- 1. Конвертация AED → USD ---
  const priceUSD = priceAED / UAE.AED_USD_RATE;

  // --- 2. Доставка (морская, в USD) ---
  const shippingUSD = UAE.SHIPPING_USD;

  // --- 3. Полная сумма в USD (для таможни и фикса) ---
  const totalUSD = priceUSD + shippingUSD;

  // --- 4. Таможня через множитель ---
  const multiplier = dest === 'RU'
    ? UAE.CUSTOMS_MULTIPLIER_RU
    : UAE.CUSTOMS_MULTIPLIER_BY;

  const totalWithCustomsRUB = totalUSD * usdtRate * multiplier;
  const customsRUB = totalUSD * usdtRate * (multiplier - 1);

  // --- 5. Фиксированные расходы (по таблице, ключ = totalUSD) ---
  const fixTable = dest === 'RU' ? FIXED_COSTS_UAE_RU : FIXED_COSTS_UAE_BY;
  const fixedCosts = lookupFixedCost(fixTable, totalUSD);

  // --- 6. ИТОГО ---
  const totalRUB = Math.round(totalWithCustomsRUB + fixedCosts);

  // --- 7. Breakdown ---
  const formula = `(${priceAED.toLocaleString()} AED ÷ ${UAE.AED_USD_RATE} + $${shippingUSD}) × ${usdtRate}₽ × ${multiplier} + ${fixedCosts}₽ = ${totalRUB}₽`;

  const breakdown: CostBreakdown = {
    country: 'UAE',
    destination: dest,
    ageCategory: age,

    carPriceOriginal: priceAED,
    carPriceCurrency: 'AED',
    carPriceUSD: priceUSD,
    carPriceRUB: priceUSD * usdtRate,

    auctionFee: 0,
    shipping: Math.round(shippingUSD * usdtRate),
    insurance: 0,
    customs: Math.round(customsRUB),
    utilSbor: 0, // считается отдельно (если >160лс)
    fixedCosts,
    margin: 0,

    exchangeRate: usdtRate,
    rateSource: 'bybit_p2p',

    totalRUB,

    formula,
    usedTKS: false,
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
 */
export function calcUAEQuick(
  priceAED: number,
  destination: 'RU' | 'BY',
  usdtRate: number
): number {
  const totalUSD = priceAED / UAE.AED_USD_RATE + UAE.SHIPPING_USD;

  const multiplier = destination === 'RU'
    ? UAE.CUSTOMS_MULTIPLIER_RU
    : UAE.CUSTOMS_MULTIPLIER_BY;

  const fixTable = destination === 'RU' ? FIXED_COSTS_UAE_RU : FIXED_COSTS_UAE_BY;
  const fixedCosts = lookupFixedCost(fixTable, totalUSD);

  return Math.round(totalUSD * usdtRate * multiplier + fixedCosts);
}

/**
 * Разбивка компонентов (для отладки / тестов).
 */
export function calcUAEComponents(
  priceAED: number,
  destination: 'RU' | 'BY',
  usdtRate: number
) {
  const priceUSD = priceAED / UAE.AED_USD_RATE;
  const shippingUSD = UAE.SHIPPING_USD;
  const totalUSD = priceUSD + shippingUSD;

  const multiplier = destination === 'RU'
    ? UAE.CUSTOMS_MULTIPLIER_RU
    : UAE.CUSTOMS_MULTIPLIER_BY;

  const baseRUB = totalUSD * usdtRate;
  const customsRUB = baseRUB * (multiplier - 1);
  const withCustomsRUB = baseRUB * multiplier;

  const fixTable = destination === 'RU' ? FIXED_COSTS_UAE_RU : FIXED_COSTS_UAE_BY;
  const fixedCosts = lookupFixedCost(fixTable, totalUSD);

  const totalRUB = withCustomsRUB + fixedCosts;

  return {
    priceAED,
    priceUSD,
    shippingUSD,
    totalUSD,
    baseRUB,
    customsRUB,
    withCustomsRUB,
    fixedCosts,
    totalRUB,
  };
}
