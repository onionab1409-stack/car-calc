import { CarInput, ExchangeRates, CalcResult, CostBreakdown } from '../types';

/**
 * 🇨🇳 Китай → 🇷🇺 Россия (до 3 лет)
 * 
 * (Цена_CNY + 8000¥ + Цена × 0.025) × (CBR_rate + vtb_spread) × 1.48 + 590,000₽
 * Важно: 2.5% считается от цены авто (без 8000¥)
 */
function calcChinaToRU(priceCNY: number, cnyRate: number): { totalRUB: number; formula: string } {
  const commission = priceCNY * 0.025;          // 2.5% от цены авто
  const totalCNY = priceCNY + 8000 + commission;
  const inRUB = totalCNY * cnyRate;
  const withCustoms = inRUB * 1.48;             // +48% растаможка
  const total = Math.round(withCustoms + 590_000);

  return {
    totalRUB: total,
    formula: `(${priceCNY}¥ + 8000¥ + ${priceCNY} × 0.025) × ${cnyRate}₽ × 1.48 + 590,000₽`,
  };
}

/**
 * 🇨🇳 Китай → 🇧🇾 Беларусь (до 3 лет)
 * 
 * (Цена_CNY + 8000¥ + Цена × 0.025) × (CBR_rate + vtb_spread) × 1.30 + 720,000₽
 */
function calcChinaToBY(priceCNY: number, cnyRate: number): { totalRUB: number; formula: string } {
  const commission = priceCNY * 0.025;
  const totalCNY = priceCNY + 8000 + commission;
  const inRUB = totalCNY * cnyRate;
  const withCustoms = inRUB * 1.30;             // +30% растаможка БР
  const total = Math.round(withCustoms + 720_000);

  return {
    totalRUB: total,
    formula: `(${priceCNY}¥ + 8000¥ + ${priceCNY} × 0.025) × ${cnyRate}₽ × 1.30 + 720,000₽`,
  };
}

/**
 * Главная функция расчёта для Китая
 */
export function calculateChina(input: CarInput, rates: ExchangeRates): CalcResult {
  const priceCNY = input.price;
  const cnyRate = rates.CNY_RUB;
  const destination = input.destination;

  const result = destination === 'BY'
    ? calcChinaToBY(priceCNY, cnyRate)
    : calcChinaToRU(priceCNY, cnyRate);

  const commission = Math.round(priceCNY * 0.025);
  const totalCNY = priceCNY + 8000 + commission;

  const breakdown: CostBreakdown = {
    country: 'China',
    destination,
    carPriceOriginal: priceCNY,
    carPriceCurrency: 'CNY',
    shipping: 8000, // в юанях — доставка до порта
    customs: Math.round(totalCNY * cnyRate * (destination === 'RU' ? 0.48 : 0.30)),
    fixedCosts: destination === 'RU' ? 590_000 : 720_000,
    exchangeRate: cnyRate,
    totalRUB: result.totalRUB,
    formula: result.formula,
    timestamp: new Date().toISOString(),
  };

  return { totalRUB: result.totalRUB, breakdown };
}
