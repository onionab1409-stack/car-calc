// ============================================
// ✅ Валидация запросов (Zod)
// ============================================
// Подэтап: P4.2 · Бэкенд
//
// Zod-схемы для всех API endpoints.
// Маппинг из API request → CarInput (добавление currency).

import { z } from 'zod';
import type { CarInput } from '@/types';
import { COUNTRY_CURRENCY } from '@/types';

// ─────────────────────────────────────────────
// 📐 Схема POST /api/calculate
// ─────────────────────────────────────────────

export const CalcRequestSchema = z.object({
  country: z.enum(['USA', 'Korea', 'UAE', 'China']),
  destination: z.enum(['RU', 'BY']),
  price: z.number().positive('Цена должна быть > 0').max(100_000_000, 'Цена слишком большая'),
  year: z.number().int().min(2000, 'Год < 2000').max(
    new Date().getFullYear() + 1,
    'Год выпуска из будущего'
  ),
  month: z.number().int().min(1).max(12).optional(),
  engineType: z.enum(['petrol', 'diesel', 'electric', 'hybrid']),
  horsePower: z.number().positive('Мощность должна быть > 0').max(2000, 'Мощность > 2000 л.с.'),
  engineCC: z.number().positive().max(20000).optional(),
  auction: z.enum(['copart', 'iaai', 'manheim', 'other']).optional(),
  isLegalEntity: z.boolean().optional().default(false),
  make: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
});

export type CalcRequest = z.infer<typeof CalcRequestSchema>;

// ─────────────────────────────────────────────
// 📐 Бизнес-валидация (после Zod)
// ─────────────────────────────────────────────

/**
 * Дополнительная бизнес-валидация.
 * Возвращает строку с ошибкой или null если всё ОК.
 */
export function validateBusinessRules(data: CalcRequest): string | null {
  // ОАЭ — только новые авто (до 1 года)
  if (data.country === 'UAE') {
    const currentYear = new Date().getFullYear();
    if (data.year < currentYear - 1) {
      return 'ОАЭ: принимаются только новые автомобили (не старше 1 года)';
    }
  }

  // Электро — engineCC не используется, но не ошибка
  // USA без auction — default 'other', уже обработано Zod optional

  return null;
}

// ─────────────────────────────────────────────
// 🔄 Маппинг CalcRequest → CarInput
// ─────────────────────────────────────────────

/**
 * Конвертирует валидированный API-запрос в CarInput для калькулятора.
 * Добавляет currency из маппинга COUNTRY_CURRENCY.
 */
export function toCarInput(data: CalcRequest): CarInput {
  return {
    country: data.country,
    destination: data.destination,
    price: data.price,
    currency: COUNTRY_CURRENCY[data.country],
    year: data.year,
    month: data.month,
    engineType: data.engineType,
    horsePower: data.horsePower,
    engineCC: data.engineCC,
    auction: data.auction,
    isLegalEntity: data.isLegalEntity,
    make: data.make,
    model: data.model,
  };
}

// ─────────────────────────────────────────────
// 📐 Схема POST /api/lead
// ─────────────────────────────────────────────

export const LeadRequestSchema = z.object({
  telegramUserId: z.number().int().positive(),
  username: z.string().max(100).optional(),
  firstName: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  comment: z.string().max(500).optional(),
  calcRequest: CalcRequestSchema,
  totalRUB: z.number().positive(),
});

export type LeadRequest = z.infer<typeof LeadRequestSchema>;
