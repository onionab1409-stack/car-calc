// ============================================
// 💱 GET /api/rates
// ============================================
// Подэтап: P4.2 · Бэкенд
//
// Возвращает текущие курсы валют (кэшированные).
// Для UI: показать актуальность данных.
// Без аутентификации, rate limit 30/мин.

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientId } from '@/lib/rate-limiter';
import { getExchangeRates } from '@/lib/rates';
import { logError, logInfo } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    // Rate limit
    const clientId = getClientId(request.headers);
    const rateCheck = checkRateLimit('/api/rates', clientId);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many requests', details: 'Rate limit: 30 requests per minute' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)) },
        }
      );
    }

    const rates = await getExchangeRates();

    logInfo('API/rates', `Курсы отданы: USDT=${rates.USDT_RUB}, KRW=${rates.KRW_RUB}, CNY=${rates.CNY_RUB}`);

    return NextResponse.json(
      {
        USDT_RUB: rates.USDT_RUB,
        KRW_RUB: rates.KRW_RUB,
        CNY_RUB: rates.CNY_RUB,
        AED_USD: rates.AED_USD,
        updatedAt: rates.updatedAt,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 мин клиентский кэш
          'X-RateLimit-Remaining': String(rateCheck.remaining),
        },
      }
    );
  } catch (error) {
    logError('API/rates', error);

    return NextResponse.json(
      {
        error: 'Rates temporarily unavailable',
        details: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 503 }
    );
  }
}
