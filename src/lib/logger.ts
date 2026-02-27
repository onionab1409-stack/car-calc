/**
 * Серверное логирование
 *
 * Логирует полный breakdown каждого расчёта.
 * Клиент видит ТОЛЬКО totalRUB — breakdown остаётся на сервере.
 *
 * Реализация: P4 · Бэкенд (подэтап 4.5)
 */

import type { CostBreakdown } from '@/types';

export function logCalculation(breakdown: CostBreakdown): void {
  // TODO: P4 — сохранять в БД через Prisma
  console.log('[CALC]', JSON.stringify(breakdown, null, 2));
}

export function logError(context: string, error: unknown): void {
  console.error(`[ERROR][${context}]`, error);
}

export function logInfo(context: string, message: string): void {
  console.log(`[INFO][${context}]`, message);
}
