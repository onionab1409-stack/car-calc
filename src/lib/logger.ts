/* eslint-disable no-console */
// ============================================
// 📋 Серверное логирование
// ============================================
// Подэтап: P4.5 · Бэкенд
//
// Логирует полный breakdown каждого расчёта.
// Клиент видит ТОЛЬКО totalRUB — breakdown остаётся на сервере.
//
// Два уровня:
//   1. Console (всегда) — для мониторинга в реальном времени
//   2. БД (для расчётов) — через db-service.saveCalculation()
//
// logCalculation() — вызывается в API route ПОСЛЕ успешного расчёта

import type { CostBreakdown, CarInput, CalcResult, ExchangeRates } from '@/types';

// ─────────────────────────────────────────────
// 📐 Базовые логгеры (console)
// ─────────────────────────────────────────────

/** Уровни логирования */
type LogLevel = 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';

/** Форматирование timestamp */
function ts(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

export function logInfo(context: string, message: string): void {
  console.log(`[${ts()}][INFO][${context}] ${message}`);
}

export function logError(context: string, error: unknown): void {
  const msg = error instanceof Error ? error.message : String(error);
  console.error(`[${ts()}][ERROR][${context}] ${msg}`);
}

export function logWarn(context: string, message: string): void {
  console.warn(`[${ts()}][WARN][${context}] ${message}`);
}

export function logDebug(context: string, message: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${ts()}][DEBUG][${context}] ${message}`);
  }
}

// ─────────────────────────────────────────────
// 🧮 Логирование расчёта (console)
// ─────────────────────────────────────────────

/**
 * Логирует полный breakdown расчёта в console.
 * Вызывается из API route.
 * Для записи в БД используется отдельно db-service.saveCalculation().
 */
export function logCalculation(breakdown: CostBreakdown): void {
  const parts = [
    `${breakdown.country}→${breakdown.destination}`,
    `total=${Math.round(breakdown.totalRUB).toLocaleString()}₽`,
    `formula="${breakdown.formula}"`,
  ];

  if (breakdown.utilSbor && breakdown.utilSbor > 0) {
    parts.push(`utilSbor=+${breakdown.utilSbor.toLocaleString()}₽`);
  }

  logInfo('CALC', parts.join(' | '));

  // Детальный breakdown в debug
  logDebug('CALC/BREAKDOWN', JSON.stringify(breakdown, null, 2));
}

// ─────────────────────────────────────────────
// 📊 Структурированный лог для аналитики
// ─────────────────────────────────────────────

export interface CalcLogEntry {
  timestamp: string;
  country: string;
  destination: string;
  price: number;
  currency: string;
  year: number;
  horsePower: number;
  totalRUB: number;
  formula: string;
  durationMs: number;
  clientId: string;
  make?: string;
  model?: string;
}

/**
 * Логирует структурированную запись расчёта.
 * Формат: JSON в одну строку — удобен для grep/jq.
 */
export function logCalcEntry(entry: CalcLogEntry): void {
  console.log(`[CALC_LOG] ${JSON.stringify(entry)}`);
}
