import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/calculate
 * 
 * Принимает данные об авто → возвращает ТОЛЬКО итоговую цену в рублях.
 * Полный breakdown логируется на сервере, клиент его НЕ видит.
 * 
 * Реализация: P4 · Бэкенд (подэтап 4.2)
 */
export async function POST(request: NextRequest) {
  // TODO: P4 · Бэкенд
  // 1. Валидация через Zod
  // 2. Получение курсов (с кэшем)
  // 3. Расчёт через master-calculator
  // 4. Логирование breakdown
  // 5. Возврат только totalRUB

  return NextResponse.json(
    { error: 'Not implemented yet. See P4 · Бэкенд.' },
    { status: 501 }
  );
}
