import { CarInput, ExchangeRates, CalcResult, CostBreakdown } from '../types';

/**
 * 🇰🇷 Корея → 🇷🇺 Россия (до 3 лет)
 * 
 * Формула:
 * Цена_KRW × (CBR_rate + vtb_spread) × 1.48 + 90,000₽ + 600,000₽
 */
function calcKoreaToRU(priceKRW: number, krwRate: number): { totalRUB: number; formula: string } {
  const priceRUB = priceKRW * krwRate;
  const withCustoms = priceRUB * 1.48;  // +48% растаможка
  const total = withCustoms + 90_000 + 600_000;

  return {
    totalRUB: Math.round(total),
    formula: `${priceKRW}₩ × ${krwRate}₽ × 1.48 + 90,000₽ + 600,000₽`,
  };
}

/**
 * 🇰🇷 Корея → 🇧🇾 Беларусь (до 3 лет)
 * 
 * Формула:
 * Цена_KRW × (CBR_rate + vtb_spread) × 1.30 + 90,000₽ + 720,000₽
 */
function calcKoreaToBY(priceKRW: number, krwRate: number): { totalRUB: number; formula: string } {
  const priceRUB = priceKRW * krwRate;
  const withCustoms = priceRUB * 1.30;  // +30% растаможка
  const total = withCustoms + 90_000 + 720_000;

  return {
    totalRUB: Math.round(total),
    formula: `${priceKRW}₩ × ${krwRate}₽ × 1.30 + 90,000₽ + 720,000₽`,
  };
}

/**
 * Главная функция расчёта для Кореи
 */
export function calculateKorea(input: CarInput, rates: ExchangeRates): CalcResult {
  const priceKRW = input.price;
  const krwRate = rates.KRW_RUB;
  const destination = input.destination;

  let result: { totalRUB: number; formula: string };

  if (destination === 'BY') {
    result = calcKoreaToBY(priceKRW, krwRate);
  } else {
    result = calcKoreaToRU(priceKRW, krwRate);
  }

  const breakdown: CostBreakdown = {
    country: 'Korea',
    destination,
    carPriceOriginal: priceKRW,
    carPriceCurrency: 'KRW',
    shipping: 0, // входит в фикс 600K/720K
    customs: Math.round(priceKRW * krwRate * (destination === 'RU' ? 0.48 : 0.30)),
    fixedCosts: destination === 'RU' ? 690_000 : 810_000, // 90K + 600K / 90K + 720K
    exchangeRate: krwRate,
    totalRUB: result.totalRUB,
    formula: result.formula,
    timestamp: new Date().toISOString(),
  };

  return { totalRUB: result.totalRUB, breakdown };
}
