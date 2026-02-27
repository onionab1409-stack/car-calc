# 🚗 Car-Calc — Telegram Mini App

Калькулятор полной стоимости доставки автомобилей из USA / Кореи / ОАЭ / Китая → Россия / Беларусь.

## Направления
- 🇺🇸 США (Copart, IAAI) → РФ / РБ
- 🇰🇷 Корея → РФ / РБ
- 🇦🇪 ОАЭ (только новые) → РФ / РБ
- 🇨🇳 Китай → РФ / РБ

## Стек
- Next.js 14 · TypeScript · Tailwind CSS
- Grammy.js (Telegram Bot)
- Prisma + SQLite (база данных)
- Vitest (тесты)
- PM2 + Nginx (деплой на VPS)

## Структура
```
src/
├── app/              ← Next.js 14 App Router + API routes
├── calc/             ← модули расчётов (USA, Korea, UAE, China)
├── lib/              ← утилиты (курсы валют, кэш, логирование)
│   └── rates/        ← Bybit P2P API + ЦБ РФ
├── bot/              ← Telegram bot (Grammy.js) + админ-команды
├── components/       ← React компоненты (Mini App UI)
│   ├── wizard/       ← визард ввода данных
│   ├── result/       ← экран результата
│   └── ui/           ← базовые UI компоненты
└── types/            ← TypeScript типы
```

## Архитектура разработки
9 Claude Projects (P0–P8), 30 чатов, 9 дней. Подробнее: `docs/P0-MASTER-PLAN.md`

## Деплой
```
git push → GitHub → VPS: git pull → pm2 restart → Live
```
