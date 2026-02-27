import { CarInput, ExchangeRates, CalcResult, CostBreakdown } from '../types';

const AED_TO_USD = 3.67; // фиксированный курс

/**
 * Фиксированные суммы (₽) — ОАЭ → РФ
 */
const FIXED_COSTS_UAE_RU: Record<string, number> = {
  '0-20000': 440_000,
  '20001-30000': 460_000,
  '30001-40000': 510_000,
  '40001-50000': 560_000,
};

/**
 * Фиксированные суммы (₽) — ОАЭ → РБ
 * ⚠️ После $20K шкала ступеней — пока упрощённая
 */
const FIXED_COSTS_UAE_BY: Record<string, number> = {
  '0-20000': 530_000,
  '20001-30000': 580_000,
  '30001-40000': 630_000,
  '40001-50000': 730_000,
};

function getFixedCostUAE(priceUSD: number, destination: 'RU' | 'BY'): number {
  const table = destination === 'RU' ? FIXED_COSTS_UAE_RU : FIXED_COSTS_UAE_BY;

  if (priceUSD <= 20_000) return table['0-20000'];
  if (priceUSD <= 30_000) return table['20001-30000'];
  if (priceUSD <= 40_000) return table['30001-40000'];
  if (priceUSD <= 50_000) return table['40001-50000'];

  // Свыше $50K
  const base = destination === 'RU' ? 560_000 : 730_000;
  const extra = Math.ceil((priceUSD - 50_000) / 10_000) * 100_000;
  return base + extra;
}

/**
 * 🇦🇪 ОАЭ → 🇷🇺 Россия (только новые)
 * 
 * (Цена_AED ÷ 3.67 + $1600) × USDT_rate × 1.48 + ФИКС
 */
function calcUAEtoRU(priceAED: number, usdtRate: number): { totalRUB: number; priceUSD: number; formula: string } {
  const priceUSD = priceAED / AED_TO_USD;
  const withShipping = priceUSD + 1600;
  const inRUB = withShipping * usdtRate * 1.48;
  const fixedCost = getFixedCostUAE(priceUSD, 'RU');
  const total = Math.round(inRUB + fixedCost);

  return {
    totalRUB: total,
    priceUSD,
    formula: `(${priceAED} AED ÷ 3.67 + $1600) × ${usdtRate}₽ × 1.48 + ${fixedCost}₽`,
  };
}

/**
 * 🇦🇪 ОАЭ → 🇧🇾 Беларусь (только новые)
 * 
 * (Цена_AED ÷ 3.67 + $1600) × USDT_rate × 1.30 + ФИКС
 */
function calcUAEtoBY(priceAED: number, usdtRate: number): { totalRUB: number; priceUSD: number; formula: string } {
  const priceUSD = priceAED / AED_TO_USD;
  const withShipping = priceUSD + 1600;
  const inRUB = withShipping * usdtRate * 1.30;
  const fixedCost = getFixedCostUAE(priceUSD, 'BY');
  const total = Math.round(inRUB + fixedCost);

  return {
    totalRUB: total,
    priceUSD,
    formula: `(${priceAED} AED ÷ 3.67 + $1600) × ${usdtRate}₽ × 1.30 + ${fixedCost}₽`,
  };
}

/**
 * Главная функция расчёта для ОАЭ
 */
export function calculateUAE(input: CarInput, rates: ExchangeRates): CalcResult {
  const priceAED = input.price;
  const destination = input.destination;

  const result = destination === 'BY'
    ? calcUAEtoBY(priceAED, rates.USDT_RUB)
    : calcUAEtoRU(priceAED, rates.USDT_RUB);

  const breakdown: CostBreakdown = {
    country: 'UAE',
    destination,
    carPriceOriginal: priceAED,
    carPriceCurrency: 'AED',
    carPriceUSD: result.priceUSD,
    shipping: 1600,
    customs: Math.round(result.priceUSD * rates.USDT_RUB * (destination === 'RU' ? 0.48 : 0.30)),
    fixedCosts: getFixedCostUAE(result.priceUSD, destination),
    exchangeRate: rates.USDT_RUB,
    totalRUB: result.totalRUB,
    formula: result.formula,
    timestamp: new Date().toISOString(),
  };

  return { totalRUB: result.totalRUB, breakdown };
}
