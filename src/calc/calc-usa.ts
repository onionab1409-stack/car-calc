import { CarInput, ExchangeRates, CalcResult, CostBreakdown } from '../types';

/**
 * Фиксированные суммы (₽) по диапазонам цены лота
 * Применяются после конвертации в рубли
 */
const FIXED_COSTS_USA_RU: Record<string, number> = {
  '0-20000': 425_000,
  '20001-30000': 495_000,
  '30001-40000': 575_000,
};

const FIXED_COSTS_USA_BY: Record<string, number> = {
  '0-20000': 450_000,
  '20001-30000': 520_000,
  '30001-40000': 600_000,
};

/**
 * Получить фиксированную сумму по цене лота (USD)
 */
function getFixedCost(priceUSD: number, destination: 'RU' | 'BY'): number {
  const table = destination === 'RU' ? FIXED_COSTS_USA_RU : FIXED_COSTS_USA_BY;

  if (priceUSD <= 20_000) return table['0-20000'];
  if (priceUSD <= 30_000) return table['20001-30000'];
  if (priceUSD <= 40_000) return table['30001-40000'];

  // Свыше $40K: базовая ставка + 100K₽ за каждые $10K
  const base = destination === 'RU' ? 575_000 : 600_000;
  const extra = Math.ceil((priceUSD - 40_000) / 10_000) * 100_000;
  return base + extra;
}

/**
 * 🇺🇸 США → 🇧🇾 Беларусь (до 3 лет, ≤160 л.с.)
 * 
 * Формула:
 * (Лот × 1.08 + $2200 + $750) × 1.011 + (Лот × 1.08) × 0.30
 * = сумма в $ × USDT_rate + ФИКС
 */
function calcUSAtoBY(lotPrice: number, rates: ExchangeRates): { totalUSD: number; formula: string } {
  const withAuction = lotPrice * 1.08;                          // +8% аукционный сбор
  const withShipping = withAuction + 2200;                      // +$2200 морская доставка
  const withInsurance = (withAuction + 2200 + 750) * 1.011;    // +$750 + 1.1% страховка
  const customsBY = withAuction * 0.30;                         // 30% растаможка БР
  const totalUSD = withInsurance + customsBY;

  return {
    totalUSD,
    formula: `(${lotPrice} × 1.08 + $2200 + $750) × 1.011 + (${lotPrice} × 1.08) × 0.30`,
  };
}

/**
 * 🇺🇸 США → 🇷🇺 Россия (до 3 лет, ≤160 л.с.)
 * 
 * Формула:
 * (Лот × 1.08 + $2200 + $750) × 1.011 + (Лот × 1.08 + $2200) × 0.48
 * = сумма в $ × USDT_rate + ФИКС
 */
function calcUSAtoRU(lotPrice: number, rates: ExchangeRates): { totalUSD: number; formula: string } {
  const withAuction = lotPrice * 1.08;
  const withShipping = withAuction + 2200;
  const withInsurance = (withAuction + 2200 + 750) * 1.011;
  const customsRU = (withAuction + 2200) * 0.48;               // 48% растаможка РФ
  const totalUSD = withInsurance + customsRU;

  return {
    totalUSD,
    formula: `(${lotPrice} × 1.08 + $2200 + $750) × 1.011 + (${lotPrice} × 1.08 + $2200) × 0.48`,
  };
}

/**
 * Главная функция расчёта для США
 */
export function calculateUSA(input: CarInput, rates: ExchangeRates): CalcResult {
  const lotPrice = input.price;
  const destination = input.destination;

  // Выбор формулы
  let result: { totalUSD: number; formula: string };

  if (destination === 'BY') {
    result = calcUSAtoBY(lotPrice, rates);
  } else {
    result = calcUSAtoRU(lotPrice, rates);
  }

  // Конвертация в рубли
  const totalBeforeFix = result.totalUSD * rates.USDT_RUB;
  const fixedCost = getFixedCost(lotPrice, destination);
  const totalRUB = Math.round(totalBeforeFix + fixedCost);

  const breakdown: CostBreakdown = {
    country: 'USA',
    destination,
    carPriceOriginal: lotPrice,
    carPriceCurrency: 'USD',
    carPriceUSD: lotPrice,
    auctionFee: Math.round(lotPrice * 0.08),
    shipping: 2200,
    customs: destination === 'BY'
      ? Math.round(lotPrice * 1.08 * 0.30)
      : Math.round((lotPrice * 1.08 + 2200) * 0.48),
    fixedCosts: fixedCost,
    exchangeRate: rates.USDT_RUB,
    totalRUB,
    formula: result.formula,
    timestamp: new Date().toISOString(),
  };

  return { totalRUB, breakdown };
}
