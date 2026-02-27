# 🚗 Контекст переноса — Car-Calc
## Перенос из чата · 27 февраля 2026

---

## 🧠 Кто я (пользователь)

Я **НЕ разработчик**. Claude ведёт меня пошагово — что делать, куда нажимать, что вводить.
Я умею работать с Claude (Projects, чаты), у меня есть VPS с Claude Code.
Это мой бизнес — доставка авто из-за рубежа.

---

## 🔩 ЖЕЛЕЗНЫЕ ПРАВИЛА (memory edits, всегда соблюдать)

1. Работать на МАКСИМУМЕ возможностей в каждой роли
2. Создавать максимально детальные планы с подпланами
3. Дробить большую работу на этапы/подэтапы
4. **СТОП после каждого подэтапа** — ждать команду «продолжай»
5. Создавать артефакты (файлы) для сохранения контекста
6. Пушить всё в GitHub
7. Я не разработчик — объяснять каждый шаг простым языком
8. Строго последовательно: P1→P2→P3→... без параллелизма
9. При 70-80% контекста — готовить файл переноса

---

## 📦 GitHub репо

- **Репо:** github.com/onionab1409-stack/car-calc
- **Токен:** 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 (classic, write access)
- **Ветка:** main
- **Клонирование:**
```bash
git clone https://onionab1409-stack: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@github.com/onionab1409-stack/car-calc.git
cd car-calc
git config user.email "claude@anthropic.com"
git config user.name "Claude"
```

---

## ✅ ЧТО СДЕЛАНО (всё запушено в GitHub)

### P0 · PM — ✅ ЗАВЕРШЁН
- `docs/P0-MASTER-PLAN.md` — мастер-план 9 Projects, 30+ подэтапов, 9 дней

### P1 · Архитектор — ✅ ЗАВЕРШЁН (все 4 подэтапа)

**P1.1 · Структура репо** ✅
- Next.js 14 App Router + TypeScript + Tailwind
- 3 API routes: `/api/calculate`, `/api/rates`, `/api/lead`
- Prisma schema: Calculation, Lead, AdminSetting, RateCache
- Telegram Bot каркас: commands.ts, admin.ts, index.ts
- Модули: rates (bybit.ts, cbr.ts, index.ts), cache.ts, db.ts, logger.ts
- Конфиги: tsconfig, tailwind, postcss, vitest, next.config, .env.example
- Placeholder-файлы для всех будущих модулей

**P1.2 · Модели данных** ✅
- `src/types/index.ts` — 491 строка, 30+ типов
- CarInput, CalcResult, CostBreakdown, ExchangeRates
- FixedCostsTable, UtilSborEntry, AdminSettings
- TelegramUser, Lead, API request/response типы
- Маппинги: COUNTRY_CURRENCY, COUNTRY_FLAG, COUNTRY_NAME_RU

**P1.3 · API контракт** ✅
- `docs/api-contract.md` — 367 строк
- POST /api/calculate → { totalRUB } (ТОЛЬКО число клиенту)
- GET /api/rates → курсы валют (кэш)
- POST /api/lead → заявка + Telegram уведомление
- Zod-схемы, rate limiting, Telegram initData HMAC-SHA256
- Защита от подмены totalRUB (пересчёт на сервере)

**P1.4 · Мастер-контекст** ✅
- `docs/master-context.md` — 345 строк
- Все 11 формул (4 страны × РФ/РБ × до3лет/3-5лет)
- Таблицы фиксов (USA, UAE → РФ/РБ)
- Курсы валют: Bybit P2P, ЦБ РФ, спреды
- 8 эталонных расчётов (все подтверждены, Δ ≤ 0.02%)

### P2 · Исследователь — 🔄 В ПРОЦЕССЕ (1 из 4 подэтапов)

**P2.1 · API курсов валют** ✅
- `docs/research/rates-api.md` — 266 строк
- **ЦБ РФ:** `GET https://www.cbr-xml-daily.ru/daily_json.js` — без авторизации, JSON
  - ⚠️ KRW Nominal = 1000 — нужно делить Value/Nominal!
  - Реальные курсы: USD 77.27₽, CNY 11.24₽, KRW 0.05425₽, AED 21.04₽
- **Bybit P2P:** `POST https://api2.bybit.com/fiat/otc/item/online` — **БЕЗ авторизации!**
  - Реальные цены: 77.00–77.25₽ за USDT
  - Алгоритм: фильтрация maxAmount >= 50K₽, медиана топ-5
- Формулы: USDT_RUB = bybit_median + correction, KRW_RUB = cbr/nominal + spread

**P2.2 · Парсинг tks.ru / ставки ЕТТ ЕАЭС** ✅
- `docs/research/tks-customs.md` — 249 строк
- **КЛЮЧЕВОЕ РЕШЕНИЕ: НЕ парсим tks.ru — реализуем свои формулы ЕТТ ЕАЭС!**
- Единые ставки 3-5 лет: 1.5–3.6 €/см³ (по диапазонам объёма)
- Единые ставки 5+ лет: 3.0–5.7 €/см³
- Ставки до 3 лет: 48–54% от стоимости (но не менее X €/см³)
- Электромобили: 15%
- Утильсбор: ≤160лс = 3,400/5,200₽ (включён в ФИКС), >160лс = КОММЕРЧЕСКИЙ (огромный!)
- С 1.12.2025 льгота >160лс отменена
- Таможенные сборы 2026: 1,067–30,000₽
- Акцизы: 0–1,740₽/л.с. (только юрлица)
- Нужен курс EUR/RUB из ЦБ РФ (уже есть в cbr-xml-daily)

**P2.3 · Таблица утильсбора >160 л.с.** ⏳ ← СЛЕДУЮЩИЙ ПОДЭТАП
**P2.4 · JSON с фиксированными суммами** ⏳

---

## 📐 ПОЛНАЯ АРХИТЕКТУРА (напоминание)

### Оставшиеся этапы:

**P2 · Исследователь** (осталось 3 подэтапа):
- 2.2 Парсинг tks.ru / формулы ЕТТ ЕАЭС
- 2.3 Таблица утильсбора >160 л.с.
- 2.4 JSON с фиксированными суммами

**P3 · Таможенник** (7 подэтапов):
- 3.1 calc-usa.ts (USA → РФ/РБ)
- 3.2 calc-korea.ts (Корея → РФ/РБ)
- 3.3 calc-uae.ts (ОАЭ → РФ/РБ)
- 3.4 calc-china.ts (Китай → РФ/РБ)
- 3.5 tks-parser.ts (для 3-5 лет и >160 л.с.)
- 3.6 master-calculator.ts (роутер)
- 3.7 Тесты для всех 8 формул

**P4 · Бэкенд** (5 подэтапов):
- 4.1 Модуль курсов (Bybit + ЦБ + кэш)
- 4.2 API route POST /api/calculate
- 4.3 Кэш с TTL
- 4.4 Prisma + SQLite
- 4.5 Серверное логирование breakdown

**P5 · Дизайнер** (4 подэтапа)
**P6 · Фронтенд** (7 подэтапов)
**P7 · Тестировщик** (5 подэтапов)
**P8 · DevOps** (5 подэтапов)

---

## 💱 ФОРМУЛЫ (краткая сводка)

### USA → РФ (до 3 лет, ≤160 л.с.)
```
(Лот × 1.08 + $2200 + $750) × 1.011 + (Лот × 1.08 + $2200) × 0.48 = $ × USDT_rate + ФИКС
Фиксы: ≤$20K→425K₽ | ≤$30K→495K₽ | ≤$40K→575K₽ | далее +100K₽/$10K
```

### USA → РБ (до 3 лет, ≤160 л.с.)
```
(Лот × 1.08 + $2200 + $750) × 1.011 + (Лот × 1.08) × 0.30 = $ × USDT_rate + ФИКС
Фиксы: ≤$20K→450K₽ | ≤$30K→520K₽ | ≤$40K→600K₽ | далее +100K₽/$10K
```

### USA → РФ (3–5 лет): базовая + ТКС вместо 48%

### Корея → РФ (до 3 лет)
```
Цена_KRW × (CBR_rate + vtb_spread) × 1.48 + 90,000₽ + 600,000₽
```

### Корея → РБ (до 3 лет)
```
Цена_KRW × (CBR_rate + vtb_spread) × 1.30 + 90,000₽ + 720,000₽
```

### Корея → РФ (3–5 лет): Цена_в_₽ + 90K + ТКС + 600K

### ОАЭ → РФ (только новые)
```
(Цена_AED ÷ 3.67 + $1600) × USDT_rate × 1.48 + ФИКС
Фиксы: ≤$20K→440K₽ | ≤$30K→460K₽ | ≤$40K→510K₽ | ≤$50K→560K₽ | далее +100K₽/$10K
```

### ОАЭ → РБ (только новые)
```
(Цена_AED ÷ 3.67 + $1600) × USDT_rate × 1.30 + ФИКС
Фиксы: ≤$20K→530K₽ | далее ⚠️ УТОЧНИТЬ
```

### Китай → РФ (до 3 лет)
```
(Цена_CNY + 8000¥ + Цена × 0.025) × (CBR_rate + vtb_spread) × 1.48 + 590,000₽
```

### Китай → РБ (до 3 лет)
```
(Цена_CNY + 8000¥ + Цена × 0.025) × (CBR_rate + vtb_spread) × 1.30 + 720,000₽
```

### Китай → РФ (3–5 лет): (Цена + 8000¥ + 2.5%) × курс + ТКС + 590K

### >160 л.с. → + утильсбор из таблицы

---

## 🔧 Стек

- Next.js 14 · TypeScript · Tailwind
- Grammy.js (Telegram Bot)
- Prisma + SQLite
- Vitest (тесты)
- VPS: PM2 + Nginx + SSL (НЕ Vercel)
- GitHub для бэкапа

---

## 📁 Структура репо (текущая)

```
car-calc/
├── .env.example
├── .gitignore
├── README.md
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.js
├── vitest.config.ts
├── docs/
│   ├── P0-MASTER-PLAN.md
│   ├── api-contract.md
│   ├── master-context.md
│   └── research/
│       ├── rates-api.md
│       └── tks-customs.md
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── calculate/route.ts   (placeholder)
│   │       ├── rates/route.ts       (placeholder)
│   │       └── lead/route.ts        (placeholder)
│   ├── calc/
│   │   ├── index.ts                 (placeholder)
│   │   └── data/
│   ├── lib/
│   │   ├── cache.ts                 (TTLCache — работает!)
│   │   ├── db.ts                    (Prisma singleton)
│   │   ├── logger.ts
│   │   └── rates/
│   │       ├── bybit.ts             (placeholder)
│   │       ├── cbr.ts               (placeholder)
│   │       └── index.ts             (placeholder)
│   ├── bot/
│   │   ├── index.ts                 (placeholder)
│   │   ├── commands.ts              (placeholder)
│   │   └── admin.ts                 (placeholder)
│   ├── components/
│   │   ├── TelegramProvider.tsx      (placeholder)
│   │   ├── wizard/
│   │   ├── result/
│   │   └── ui/
│   └── types/
│       └── index.ts                 (491 строк, 30+ типов)
├── tests/
│   ├── calc/
│   ├── api/
│   └── fixtures/
└── public/
```

---

## ⚠️ Открытые вопросы

1. ОАЭ → РБ: точная шкала фиксов после $20K→530K₽
2. ОС на VPS: Ubuntu? Debian?
3. Домен для Mini App?
4. Telegram Bot токен?
5. Midjourney референсы для дизайна?

---

## 💬 Как начать новый чат

Загрузи этот файл в Project. Напиши:

**«Контекст перенесён. Продолжаем с подэтапа P2.3 — таблица утилизационного сбора для авто >160 л.с. GitHub репо подключено. Продолжай.»**
