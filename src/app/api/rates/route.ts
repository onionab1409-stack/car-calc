import { NextResponse } from 'next/server';

/**
 * GET /api/rates
 * 
 * Возвращает текущие курсы валют (кэшированные).
 * Используется Mini App для отображения актуальности данных.
 * 
 * Реализация: P4 · Бэкенд (подэтап 4.1)
 */
export async function GET() {
  // TODO: P4 · Бэкенд
  // 1. Проверить кэш
  // 2. Если устарел — запросить Bybit + ЦБ
  // 3. Применить коррекцию + спред
  // 4. Вернуть курсы + timestamp

  return NextResponse.json(
    { error: 'Not implemented yet. See P4 · Бэкенд.' },
    { status: 501 }
  );
}
