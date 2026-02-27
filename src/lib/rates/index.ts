/**
 * Единый модуль курсов валют
 *
 * Объединяет Bybit P2P (USDT/RUB) + ЦБ РФ (KRW, CNY).
 * Применяет коррекцию MoscaEx + спред ВТБ.
 * Кэширует результат с TTL.
 *
 * Реализация: P4 · Бэкенд (подэтап 4.1)
 */

import type { ExchangeRates } from '@/types';

// TODO: P4
export async function getExchangeRates(): Promise<ExchangeRates> {
  throw new Error('Not implemented. See P4 · Бэкенд.');
}
