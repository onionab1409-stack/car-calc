// ============================================
// 🤖 Telegram Bot — Grammy.js
// ============================================
// Режимы:
//   1. Webhook (prod): POST /api/bot
//   2. Polling (dev):  npm run bot
//
// Пользовательские: /start /calc /help
// Админские: /stats /rates /set_correction /set_spread_krw /set_spread_cny
// ============================================

import { Bot, webhookCallback } from 'grammy';
import { registerUserCommands } from './commands';
import { registerAdminCommands } from './admin';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN) {
  // В CI/build процессе токена нет — не падаем
  if (process.env.NODE_ENV === 'production' || process.env.CI) {
    console.warn('[BOT] TELEGRAM_BOT_TOKEN not set — bot disabled');
  }
}

// ─── Создание бота (только если есть токен) ───
export const bot = BOT_TOKEN ? new Bot(BOT_TOKEN) : null;

if (bot) {
  registerUserCommands(bot);
  registerAdminCommands(bot);

  bot.catch((err) => {
    console.error('[BOT] Error:', err.message);
  });
}

// ─── Webhook handler для Next.js API route ───
export const handleWebhook = bot ? webhookCallback(bot, 'std/http') : null;

// ─── Polling (для разработки): npm run bot ───
const isDirectRun = typeof require !== 'undefined' && require.main === module;
if (isDirectRun && bot) {
  console.info('[BOT] Starting in polling mode...');
  bot.start({
    onStart: () => console.info('[BOT] ✅ Bot started (polling)'),
  });
}
