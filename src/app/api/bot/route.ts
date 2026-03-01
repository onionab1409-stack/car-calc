// ============================================
// 🤖 POST /api/bot — Telegram Webhook
// ============================================
// Telegram отправляет обновления сюда.
// Настройка: deploy/setup-bot.sh
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { handleWebhook } from '@/bot';

export async function POST(req: NextRequest): Promise<NextResponse | Response> {
  if (!handleWebhook) {
    return NextResponse.json(
      { error: 'Bot not configured — TELEGRAM_BOT_TOKEN missing' },
      { status: 503 }
    );
  }

  try {
    return await handleWebhook(req);
  } catch (error) {
    console.error('[API/BOT] Webhook error:', error);
    // Всегда возвращаем 200 для Telegram — иначе будет retry
    return NextResponse.json({ ok: true });
  }
}

// GET для проверки что route работает
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    bot: handleWebhook ? 'configured' : 'not configured',
  });
}
