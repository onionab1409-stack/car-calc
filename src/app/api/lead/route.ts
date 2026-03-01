import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, getClientId } from '@/lib/rate-limiter';
import { saveLead } from '@/lib/db-service';
import { logInfo, logError } from '@/lib/logger';

/**
 * POST /api/lead
 *
 * Сохраняет заявку клиента.
 * P6.6 · Форма заявки
 */

const LeadBodySchema = z.object({
  name: z.string().min(1, 'Введите имя').max(100),
  phone: z.string().min(5, 'Введите телефон').max(30),
  comment: z.string().max(500).optional().default(''),
  // Данные расчёта
  country: z.string(),
  destination: z.string(),
  price: z.number(),
  year: z.number(),
  engineType: z.string(),
  horsePower: z.number(),
  totalRUB: z.number(),
  // Telegram (опционально, из WebApp)
  telegramUserId: z.number().optional(),
  telegramUsername: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const clientId = getClientId(request.headers);
    const rateCheck = checkRateLimit('/api/lead', clientId);

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Слишком много заявок, попробуйте позже' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)) } }
      );
    }

    // Parse
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    // Validate
    const parsed = LeadBodySchema.safeParse(body);
    if (!parsed.success) {
      const err = parsed.error.errors[0];
      return NextResponse.json(
        { error: `${err.path.join('.')}: ${err.message}` },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Save to DB
    const leadId = await saveLead({
      telegramUserId: String(data.telegramUserId || 0),
      username: data.telegramUsername,
      firstName: data.name,
      phone: data.phone,
      comment: `${data.comment}\n---\n${data.country}→${data.destination} | ${data.price} | ${data.year} | ${data.engineType} | ${data.horsePower}лс | ИТОГО: ${data.totalRUB}₽`,
    });

    logInfo('API/lead', `Lead saved: ${leadId} | ${data.name} | ${data.phone} | ${data.totalRUB}₽`);

    // TODO P8: уведомление в Telegram-группу

    return NextResponse.json({ success: true, leadId }, { status: 201 });

  } catch (error) {
    logError('API/lead', error);
    return NextResponse.json(
      { error: 'Ошибка сервера, попробуйте позже' },
      { status: 500 }
    );
  }
}
