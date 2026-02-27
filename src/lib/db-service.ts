// ============================================
// 🗄️ Database Service (Prisma + SQLite)
// ============================================
// Подэтап: P4.4 · Бэкенд
//
// CRUD для:
//   - Calculation: сохранение расчётов (серверный лог)
//   - Lead: заявки клиентов
//   - AdminSetting: настройки (коррекции, спреды)
//   - RateCache: кэш курсов в БД (fallback)
//
// Используется логгером (P4.5) и API routes.

import { db } from '@/lib/db';
import type { CarInput, CalcResult, ExchangeRates } from '@/types';
import { COUNTRY_CURRENCY } from '@/types';
import { logError, logInfo } from '@/lib/logger';

// ─────────────────────────────────────────────
// 🧮 Calculations (серверный лог расчётов)
// ─────────────────────────────────────────────

export interface SaveCalcInput {
  car: CarInput;
  result: CalcResult;
  rates: ExchangeRates;
  telegramUserId?: string;
}

/**
 * Сохраняет расчёт в БД.
 * Вызывается ПОСЛЕ успешного расчёта в API route.
 * Клиент этого не видит — только серверный лог.
 */
export async function saveCalculation(input: SaveCalcInput): Promise<string | null> {
  try {
    // Определяем какой курс использовался
    const rateMap: Record<string, number> = {
      USD: input.rates.USDT_RUB,
      KRW: input.rates.KRW_RUB,
      AED: input.rates.USDT_RUB, // AED конвертируется через USD
      CNY: input.rates.CNY_RUB,
    };
    const currency = COUNTRY_CURRENCY[input.car.country];

    const calc = await db.calculation.create({
      data: {
        country: input.car.country,
        destination: input.car.destination,
        carPrice: input.car.price,
        currency,
        year: input.car.year,
        engineType: input.car.engineType,
        horsePower: input.car.horsePower,
        totalRUB: input.result.totalRUB,
        breakdown: JSON.stringify(input.result.breakdown),
        formula: input.result.breakdown.formula || '',
        exchangeRate: rateMap[currency] || 0,
        telegramUserId: input.telegramUserId || null,
      },
    });

    logInfo('DB', `Calculation saved: ${calc.id} (${input.car.country}→${input.car.destination} = ${Math.round(input.result.totalRUB)}₽)`);
    return calc.id;
  } catch (error) {
    logError('DB', `Failed to save calculation: ${error}`);
    return null; // Не роняем API если БД недоступна
  }
}

/**
 * Получить последние N расчётов (для админки).
 */
export async function getRecentCalculations(limit: number = 20) {
  try {
    return await db.calculation.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } catch (error) {
    logError('DB', `Failed to get calculations: ${error}`);
    return [];
  }
}

// ─────────────────────────────────────────────
// 📞 Leads (заявки клиентов)
// ─────────────────────────────────────────────

export interface SaveLeadInput {
  telegramUserId: string;
  username?: string;
  firstName?: string;
  phone?: string;
  comment?: string;
  calculationId: string;
}

/**
 * Сохраняет заявку клиента.
 */
export async function saveLead(input: SaveLeadInput): Promise<string | null> {
  try {
    const lead = await db.lead.create({
      data: {
        telegramUserId: input.telegramUserId,
        username: input.username || null,
        firstName: input.firstName || null,
        phone: input.phone || null,
        comment: input.comment || null,
        calculationId: input.calculationId,
        status: 'new',
      },
    });

    logInfo('DB', `Lead saved: ${lead.id} (tg:${input.telegramUserId})`);
    return lead.id;
  } catch (error) {
    logError('DB', `Failed to save lead: ${error}`);
    return null;
  }
}

/**
 * Обновить статус заявки.
 */
export async function updateLeadStatus(leadId: string, status: string): Promise<boolean> {
  try {
    await db.lead.update({
      where: { id: leadId },
      data: { status },
    });
    return true;
  } catch (error) {
    logError('DB', `Failed to update lead ${leadId}: ${error}`);
    return false;
  }
}

/**
 * Получить последние заявки (для админки).
 */
export async function getRecentLeads(limit: number = 20) {
  try {
    return await db.lead.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { calculation: true },
    });
  } catch (error) {
    logError('DB', `Failed to get leads: ${error}`);
    return [];
  }
}

// ─────────────────────────────────────────────
// ⚙️ AdminSettings (настройки)
// ─────────────────────────────────────────────

/**
 * Получить настройку по ключу.
 */
export async function getAdminSetting(key: string): Promise<string | null> {
  try {
    const setting = await db.adminSetting.findUnique({ where: { key } });
    return setting?.value ?? null;
  } catch (error) {
    logError('DB', `Failed to get admin setting ${key}: ${error}`);
    return null;
  }
}

/**
 * Установить/обновить настройку (upsert).
 */
export async function setAdminSetting(key: string, value: string): Promise<boolean> {
  try {
    await db.adminSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    logInfo('DB', `Admin setting ${key} = ${value}`);
    return true;
  } catch (error) {
    logError('DB', `Failed to set admin setting ${key}: ${error}`);
    return false;
  }
}

/**
 * Получить все настройки (для загрузки при старте).
 */
export async function getAllAdminSettings(): Promise<Record<string, string>> {
  try {
    const settings = await db.adminSetting.findMany();
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  } catch (error) {
    logError('DB', `Failed to get all admin settings: ${error}`);
    return {};
  }
}

// ─────────────────────────────────────────────
// 💱 RateCache (кэш курсов в БД — fallback)
// ─────────────────────────────────────────────

/**
 * Сохранить курс в БД (для stale fallback).
 */
export async function saveRateToDb(
  source: string,
  currency: string,
  rate: number
): Promise<boolean> {
  try {
    await db.rateCache.upsert({
      where: { id: `${source}:${currency}` },
      update: { rate, updatedAt: new Date() },
      create: { id: `${source}:${currency}`, source, currency, rate },
    });
    return true;
  } catch (error) {
    logError('DB', `Failed to save rate ${source}:${currency}: ${error}`);
    return false;
  }
}

/**
 * Получить последний курс из БД (stale fallback).
 */
export async function getRateFromDb(
  source: string,
  currency: string
): Promise<{ rate: number; updatedAt: Date } | null> {
  try {
    const entry = await db.rateCache.findUnique({
      where: { id: `${source}:${currency}` },
    });
    if (!entry) return null;
    return { rate: entry.rate, updatedAt: entry.updatedAt };
  } catch (error) {
    logError('DB', `Failed to get rate ${source}:${currency}: ${error}`);
    return null;
  }
}

// ─────────────────────────────────────────────
// 📊 Статистика (для админки)
// ─────────────────────────────────────────────

/**
 * Общая статистика.
 */
export async function getStats(): Promise<{
  totalCalculations: number;
  totalLeads: number;
  todayCalculations: number;
}> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalCalc, totalLeads, todayCalc] = await Promise.all([
      db.calculation.count(),
      db.lead.count(),
      db.calculation.count({ where: { createdAt: { gte: today } } }),
    ]);

    return {
      totalCalculations: totalCalc,
      totalLeads: totalLeads,
      todayCalculations: todayCalc,
    };
  } catch (error) {
    logError('DB', `Failed to get stats: ${error}`);
    return { totalCalculations: 0, totalLeads: 0, todayCalculations: 0 };
  }
}
