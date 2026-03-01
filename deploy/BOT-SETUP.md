# 🤖 Настройка Telegram Bot

## Шаг 1 · Создай бота в @BotFather

1. Открой Telegram, найди **@BotFather**
2. Отправь `/newbot`
3. Введи имя: `American Auto House Calculator`
4. Введи username: `americanautohouse_bot` (или свой)
5. Скопируй **токен** (длинная строка типа `1234567890:ABCdefGh...`)

---

## Шаг 2 · Настрой Mini App в BotFather

Отправь @BotFather команды:

```
/mybots → выбери бота → Bot Settings → Menu Button → Configure
```

- **URL:** `https://app.americanautohouse.com`
- **Название кнопки:** `🚗 Калькулятор`

Это добавит кнопку калькулятора в профиле бота.

---

## Шаг 3 · Добавь токен на сервер

SSH на VPS:
```bash
cd /var/www/car-calc
nano .env.local
```

Добавь:
```
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGhIJKlmnOPQRsTUVwxyz
NEXT_PUBLIC_BOT_USERNAME=americanautohouse_bot
TELEGRAM_ADMIN_CHAT_ID=123456789
```

> Свой chat_id узнаешь: отправь /start боту @userinfobot

---

## Шаг 4 · Запусти setup-bot.sh

```bash
cd /var/www/car-calc
chmod +x deploy/setup-bot.sh
./deploy/setup-bot.sh
```

Скрипт автоматически:
- Проверит токен
- Установит webhook на `https://app.americanautohouse.com/api/bot`
- Настроит меню команд (/start, /calc, /help)
- Установит описание бота

---

## Шаг 5 · Пересобери и перезапусти

```bash
npm run build
pm2 restart car-calc
```

---

## Проверка

1. Открой бота в Telegram
2. Нажми `/start` — должно появиться приветствие с кнопкой калькулятора
3. Нажми кнопку — должен открыться Mini App

---

## Админ-команды (только для ADMIN_CHAT_ID)

| Команда | Что делает |
|---------|-----------|
| `/stats` | Статистика расчётов и заявок |
| `/rates` | Текущие курсы валют + коррекции |
| `/set_correction 1.50` | Коррекция USDT к MoscaEx (+₽) |
| `/set_spread_krw 0.00050` | Спред ВТБ для KRW |
| `/set_spread_cny 0.30` | Спред ВТБ для CNY |
