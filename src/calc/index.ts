import { CarInput, ExchangeRates, CalcResult } from '../types';
import { calculateUSA } from './calc-usa';
import { calculateKorea } from './calc-korea';
import { calculateUAE } from './calc-uae';
import { calculateChina } from './calc-china';

/**
 * Мастер-калькулятор: определяет страну → вызывает нужный модуль
 */
export function calculateTotal(input: CarInput, rates: ExchangeRates): CalcResult {
  switch (input.country) {
    case 'USA':
      return calculateUSA(input, rates);
    case 'Korea':
      return calculateKorea(input, rates);
    case 'UAE':
      return calculateUAE(input, rates);
    case 'China':
      return calculateChina(input, rates);
    default:
      throw new Error(`Unsupported country: ${input.country}`);
  }
}

export { calculateUSA, calculateKorea, calculateUAE, calculateChina };
