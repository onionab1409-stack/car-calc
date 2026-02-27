// ============================================
// 🧮 POST /api/calculate
// ============================================
// Подэтап: P4.2 · Бэкенд
//
// Принимает данные авто → возвращает ТОЛЬКО { totalRUB }.
// Полный breakdown логируется на сервере (клиент его НЕ видит).
//
// Pipeline:
//   1. Rate limit
//   2. Zod-валидация
//   3. Бизнес-валидация
//   4. Курсы валют (кэш 1ч)
//   5. EUR/RUB (если 3-5 или 5+ лет)
//   6. calculate() → CalcResult
//   7. Лог breakdown
//   8. Ответ: { totalRUB }

import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import {
  CalcRequestSchema,
  validateBusinessRules,
  toCarInput,
} from '@/lib/validation';
import { checkRateLimit, getClientId } from '@/lib/rate-limiter';
import { getExchangeRates, getEURRate } from '@/lib/rates';
import { calculate } from '@/calc';
import { getAgeCategory } from '@/types';
import { logCalculation, logError, logInfo, logCalcEntry } from '@/lib/logger';
import { saveCalculation } from '@/lib/db-service';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // ─── 1. Rate Limit ───
    const clientId = getClientId(request.headers);
    const rateCheck = checkRateLimit('/api/calculate', clientId);

    if (!rateCheck.allowed) {
      logInfo('API/calc', `Rate limit: ${clientId}`);
      return NextResponse.json(
        {
          error: 'Too many requests',
          details: 'Rate limit: 10 requests per minute',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // ─── 2. Парсинг JSON ───
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON', details: 'Request body must be valid JSON' },
        { status: 400 }
      );
    }

    // ─── 3. Zod-валидация ───
    const parsed = CalcRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: `${firstError.path.join('.')}: ${firstError.message}`,
        },
        { status: 400 }
      );
    }
    const data = parsed.data;

    // ─── 4. Бизнес-валидация ───
    const bizError = validateBusinessRules(data);
    if (bizError) {
      return NextResponse.json(
        { error: 'Validation failed', details: bizError },
        { status: 400 }
      );
    }

    // ─── 5. Курсы валют ───
    const rates = await getExchangeRates();

    // EUR/RUB — нужен для ЕТТ ЕАЭС (3-5 и 5+ лет)
    const carInput = toCarInput(data);
    const age = getAgeCategory(carInput.year);
    let eurRate: number | undefined;

    if (age === '3to5' || age === 'over5') {
      const eur = await getEURRate();
      if (!eur) {
        return NextResponse.json(
          {
            error: 'Calculation failed',
            details: 'EUR/RUB rate unavailable (required for 3-5 year old cars)',
          },
          { status: 503 }
        );
      }
      eurRate = eur;
    }

    // ─── 6. Расчёт ───
    const result = calculate(carInput, rates, eurRate);

    // ─── 7. Лог breakdown (серверный) ───
    logCalculation(result.breakdown);

    // Структурированный лог (для grep/jq)
    logCalcEntry({
      timestamp: new Date().toISOString(),
      country: data.country,
      destination: data.destination,
      price: data.price,
      currency: carInput.currency,
      year: data.year,
      horsePower: data.horsePower,
      totalRUB: Math.round(result.totalRUB),
      formula: result.breakdown.formula || '',
      durationMs: Date.now() - startTime,
      clientId,
      make: data.make,
      model: data.model,
    });

    // Сохраняем в БД (async, не блокируем ответ)
    saveCalculation({
      car: carInput,
      result,
      rates,
      telegramUserId: clientId.startsWith('tg:') ? clientId.slice(3) : undefined,
    }).catch((err) => logError('API/calc', `DB save failed: ${err}`));

    // ─── 8. Ответ: ТОЛЬКО totalRUB ───
    return NextResponse.json(
      { totalRUB: Math.round(result.totalRUB) },
      {
        status: 200,
        headers: {
          'X-RateLimit-Remaining': String(rateCheck.remaining),
          'Cache-Control': 'no-store',
        },
      }
    );

  } catch (error) {
    logError('API/calc', error);

    // Zod errors (маловероятно, т.к. safeParse, но на всякий случай)
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors[0]?.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Calculation failed',
        details: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
