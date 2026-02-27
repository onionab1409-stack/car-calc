import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/lead
 * 
 * Сохраняет заявку клиента.
 * Отправляет уведомление в Telegram-группу.
 * 
 * Реализация: P4 · Бэкенд (подэтап 4.4)
 */
export async function POST(request: NextRequest) {
  // TODO: P4 · Бэкенд
  // 1. Валидация через Zod
  // 2. Сохранить в БД (Prisma)
  // 3. Уведомить в Telegram-группу
  // 4. Вернуть leadId

  return NextResponse.json(
    { error: 'Not implemented yet. See P4 · Бэкенд.' },
    { status: 501 }
  );
}
