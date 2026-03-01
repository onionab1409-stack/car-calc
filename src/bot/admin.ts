// ============================================
// 🔐 Админ-команды бота
// ============================================
// Доступны ТОЛЬКО для TELEGRAM_ADMIN_CHAT_ID
//
// /stats               — Статистика расчётов и заявок
// /rates               — Текущие курсы валют
// /set_correction 1.50 — Коррекция USDT к MoscaEx (±₽)
// /set_spread_krw 0.00050 — Спред ВТБ для KRW
// /set_spread_cny 0.30    — Спред ВТБ для CNY
// ============================================

import { Bot } from 'grammy';
import { getStats, setAdminSetting, getAllAdminSettings } from '@/lib/db-service';
import { getExchangeRates, getEURRate, setAdminConfig, getAdminConfig } from '@/lib/rates';

const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

/** Проверка: является ли отправитель админом */
function isAdmin(chatId: number | undefined): boolean {
  if (!ADMIN_CHAT_ID || !chatId) return false;
  return chatId.toString() === ADMIN_CHAT_ID;
}

export function registerAdminCommands(bot: Bot): void {
  // ─── /stats — Статистика ───
  bot.command('stats', async (ctx) => {
    if (!isAdmin(ctx.chat?.id)) {
      return ctx.reply('⛔ Команда доступна только администратору.');
    }

    try {
      const stats = await getStats();
      await ctx.reply(
        `📊 *Статистика Car\\-Calc*\n\n` +
        `🧮 Расчётов всего: *${stats.totalCalculations}*\n` +
        `📅 Расчётов сегодня: *${stats.todayCalculations}*\n` +
        `📞 Заявок всего: *${stats.totalLeads}*`,
        { parse_mode: 'MarkdownV2' }
      );
    } catch (error) {
      await ctx.reply('❌ Ошибка получения статистики. Проверь логи.');
    }
  });

  // ─── /rates — Текущие курсы ───
  bot.command('rates', async (ctx) => {
    if (!isAdmin(ctx.chat?.id)) {
      return ctx.reply('⛔ Команда доступна только администратору.');
    }

    try {
      const rates = await getExchangeRates();
      const eurRate = await getEURRate();
      const config = getAdminConfig();

      await ctx.reply(
        `💱 *Текущие курсы*\n\n` +
        `USDT/RUB: *${rates.USDT_RUB.toFixed(2)}₽*\n` +
        `  └ коррекция MoscaEx: ${config.usdtCorrection >= 0 ? '+' : ''}${config.usdtCorrection.toFixed(2)}₽\n\n` +
        `KRW/RUB: *${rates.KRW_RUB.toFixed(5)}₽*\n` +
        `  └ спред ВТБ: +${config.vtbSpreadKRW.toFixed(5)}₽\n\n` +
        `CNY/RUB: *${rates.CNY_RUB.toFixed(2)}₽*\n` +
        `  └ спред ВТБ: +${config.vtbSpreadCNY.toFixed(2)}₽\n\n` +
        `EUR/RUB: *${eurRate ? eurRate.toFixed(2) : 'н/д'}₽* (ЦБ РФ)\n\n` +
        `⏱ Обновлено: ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}`,
        { parse_mode: 'Markdown' }
      );
    } catch (error) {
      await ctx.reply('❌ Ошибка получения курсов. Проверь логи.');
    }
  });

  // ─── /set_correction <value> — Коррекция USDT ───
  bot.command('set_correction', async (ctx) => {
    if (!isAdmin(ctx.chat?.id)) {
      return ctx.reply('⛔ Команда доступна только администратору.');
    }

    const value = parseFloat(ctx.match?.trim() || '');
    if (isNaN(value) || value < -10 || value > 10) {
      return ctx.reply(
        '❓ Использование: /set_correction <число>\n' +
        'Пример: /set_correction 1.50\n' +
        'Диапазон: от -10 до +10₽'
      );
    }

    try {
      setAdminConfig({ usdtCorrection: value });
      await setAdminSetting('usdt_correction', value.toString());
      await ctx.reply(`✅ Коррекция USDT установлена: ${value >= 0 ? '+' : ''}${value.toFixed(2)}₽`);
    } catch (error) {
      await ctx.reply('❌ Ошибка сохранения. Проверь логи.');
    }
  });

  // ─── /set_spread_krw <value> — Спред KRW ───
  bot.command('set_spread_krw', async (ctx) => {
    if (!isAdmin(ctx.chat?.id)) {
      return ctx.reply('⛔ Команда доступна только администратору.');
    }

    const value = parseFloat(ctx.match?.trim() || '');
    if (isNaN(value) || value < 0 || value > 0.01) {
      return ctx.reply(
        '❓ Использование: /set_spread_krw <число>\n' +
        'Пример: /set_spread_krw 0.00050\n' +
        'Диапазон: от 0 до 0.01₽'
      );
    }

    try {
      setAdminConfig({ vtbSpreadKRW: value });
      await setAdminSetting('vtb_spread_krw', value.toString());
      await ctx.reply(`✅ Спред KRW установлен: +${value.toFixed(5)}₽`);
    } catch (error) {
      await ctx.reply('❌ Ошибка сохранения. Проверь логи.');
    }
  });

  // ─── /set_spread_cny <value> — Спред CNY ───
  bot.command('set_spread_cny', async (ctx) => {
    if (!isAdmin(ctx.chat?.id)) {
      return ctx.reply('⛔ Команда доступна только администратору.');
    }

    const value = parseFloat(ctx.match?.trim() || '');
    if (isNaN(value) || value < 0 || value > 5) {
      return ctx.reply(
        '❓ Использование: /set_spread_cny <число>\n' +
        'Пример: /set_spread_cny 0.30\n' +
        'Диапазон: от 0 до 5₽'
      );
    }

    try {
      setAdminConfig({ vtbSpreadCNY: value });
      await setAdminSetting('vtb_spread_cny', value.toString());
      await ctx.reply(`✅ Спред CNY установлен: +${value.toFixed(2)}₽`);
    } catch (error) {
      await ctx.reply('❌ Ошибка сохранения. Проверь логи.');
    }
  });
}
