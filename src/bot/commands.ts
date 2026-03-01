// ============================================
// 💬 Пользовательские команды бота
// /start — Приветствие + кнопка Mini App
// /calc  — Открыть калькулятор
// /help  — Помощь
// ============================================

import { Bot, InlineKeyboard } from 'grammy';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.americanautohouse.com';

/** Inline-кнопка «Открыть калькулятор» (Mini App) */
function calcKeyboard(): InlineKeyboard {
  return new InlineKeyboard().webApp('🚗 Открыть калькулятор', APP_URL);
}

export function registerUserCommands(bot: Bot): void {
  // ─── /start ───
  bot.command('start', async (ctx) => {
    const name = ctx.from?.first_name || 'друг';
    await ctx.reply(
      `Привет, ${name}! 👋\n\n` +
      `Я помогу рассчитать стоимость доставки автомобиля из:\n` +
      `🇺🇸 США · 🇰🇷 Кореи · 🇦🇪 ОАЭ · 🇨🇳 Китая\n\n` +
      `Нажми кнопку ниже — и через 10 секунд узнаешь итоговую цену «под ключ» в рублях.`,
      { reply_markup: calcKeyboard() }
    );
  });

  // ─── /calc ───
  bot.command('calc', async (ctx) => {
    await ctx.reply(
      '🚗 Рассчитать стоимость доставки авто:',
      { reply_markup: calcKeyboard() }
    );
  });

  // ─── /help ───
  bot.command('help', async (ctx) => {
    await ctx.reply(
      `📖 *Как пользоваться:*\n\n` +
      `1️⃣ Нажми /calc или кнопку «Открыть калькулятор»\n` +
      `2️⃣ Выбери страну (🇺🇸🇰🇷🇦🇪🇨🇳)\n` +
      `3️⃣ Введи данные авто (цена, год, двигатель, мощность)\n` +
      `4️⃣ Выбери направление (Россия / Беларусь)\n` +
      `5️⃣ Получи итоговую стоимость «под ключ»\n\n` +
      `💰 Курсы обновляются в реальном времени\n` +
      `📞 Есть вопросы? Оставь заявку в калькуляторе — мы перезвоним!`,
      { parse_mode: 'Markdown' }
    );
  });
}
