# 🚗 Car-Calc — Telegram Mini App

Калькулятор полной стоимости доставки автомобилей из USA / Кореи / ОАЭ / Китая → Россия / Беларусь.

## Страны и направления
- 🇺🇸 США (Copart, IAAI) → РФ / РБ
- 🇰🇷 Корея → РФ / РБ
- 🇦🇪 ОАЭ (только новые) → РФ / РБ
- 🇨🇳 Китай → РФ / РБ

## Стек
- Next.js 14 · TypeScript · Tailwind
- Grammy.js (Telegram Bot)
- Prisma + SQLite
- PM2 + Nginx (VPS deploy)

## Структура
```
src/
├── calc/        — модули расчётов (USA, Korea, UAE, China)
├── agents/      — AI-агенты (парсер, таможня, маршруты)
├── api/         — API routes
├── bot/         — Telegram bot (Grammy.js)
├── lib/         — утилиты (курсы валют, кэш)
├── types/       — TypeScript типы
└── components/  — React компоненты (Mini App UI)
```

## Деплой
```
Claude → git push → GitHub → VPS: git pull → pm2 restart
```
