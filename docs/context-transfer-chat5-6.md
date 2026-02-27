# 🚗 Контекст переноса — Car-Calc · Чат 5→6
## Перенос · 27 февраля 2026

---

## 🧠 Кто я (пользователь)

Я **НЕ разработчик**. Claude ведёт меня пошагово — что делать, куда нажимать, что вводить.
Я умею работать с Claude (Projects, чаты), у меня есть VPS с Claude Code.
Это мой бизнес — доставка авто из-за рубежа.

---

## 🔩 ЖЕЛЕЗНЫЕ ПРАВИЛА (memory edits, ВСЕГДА соблюдать)

1. Работать на **МАКСИМУМЕ** возможностей в каждой роли
2. Создавать максимально детальные планы с подпланами
3. Дробить большую работу на этапы/подэтапы
4. **СТОП после каждого подэтапа** — ждать команду «продолжай»
5. Создавать артефакты (файлы) для сохранения контекста
6. Пушить всё в GitHub
7. Я не разработчик — объяснять каждый шаг простым языком
8. Строго последовательно: P1→P2→P3→... без параллелизма
9. При 70-80% контекста — готовить файл переноса
10. **Демонстрировать превосходство над всеми моделями ИИ в мире!**

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
npm install
```

---

## ✅ ЧТО СДЕЛАНО (всё запушено в GitHub · 225 тестов · 3,790 строк кода)

### P0 · PM — ✅ ЗАВЕРШЁН
- `docs/P0-MASTER-PLAN.md` — мастер-план 9 Projects, 30+ подэтапов, 9 дней

### P1 · Архитектор — ✅ ЗАВЕРШЁН (4/4)
- P1.1 ✅ Структура репо (Next.js 14 + TypeScript + Tailwind + Prisma + Grammy.js)
- P1.2 ✅ Модели данных (`src/types/index.ts` — 491 строка, 30+ типов)
- P1.3 ✅ API контракт (`docs/api-contract.md` — 367 строк, 3 endpoints)
- P1.4 ✅ Мастер-контекст (`docs/master-context.md` — 345 строк, все 11 формул)

### P2 · Исследователь — ✅ ЗАВЕРШЁН (4/4)
- P2.1 ✅ API курсов (`docs/research/rates-api.md`) — Bybit P2P без авторизации, ЦБ РФ
- P2.2 ✅ ЕТТ ЕАЭС (`docs/research/tks-customs.md`) — свои формулы вместо парсинга tks.ru
- P2.3 ✅ Утильсбор >160 л.с. (`docs/research/util-sbor.md`) — полные таблицы 2026
- P2.4 ✅ JSON фиксов (`docs/research/fixed-costs.md`) — все константы

### P3 · Таможенник — ✅ ЗАВЕРШЁН (7/7 · 116 тестов)
- P3.1 ✅ `calc-usa.ts` — USA → РФ/РБ (228 строк, 18 тестов)
  - calcUSA(), calcUSAQuick(), calcUSAComponents()
  - До 3 лет: ×0.48 РФ / ×0.30 РБ | 3–5/5+: ЕТТ ЕАЭС
  - Эталоны: USA→РБ $15K=2,351K₽ ✅ | USA→РФ $25K=3,972K₽ ✅
- P3.2 ✅ `calc-korea.ts` — Корея → РФ/РБ (207 строк, 14 тестов)
  - priceKRW × KRW_RUB × 1.48/1.30 + 90K + fix
  - Эталоны: KR→РФ 35M₩=3,469K₽ ✅ | KR→РБ 28M₩=2,762K₽ ✅
- P3.3 ✅ `calc-uae.ts` — ОАЭ → РФ/РБ (179 строк, 17 тестов)
  - (AED/3.67 + $1600) × USDT × 1.48/1.30 + fix(priceUSD)
  - ⚠️ Только новые авто (до 1 года)
  - Эталоны: UAE→РФ 120K AED=4,495K₽ ✅ | UAE→РБ 90K AED=3,246K₽ ✅
- P3.4 ✅ `calc-china.ts` — Китай → РФ/РБ (216 строк, 15 тестов)
  - (price + 8000¥ + price×0.025) × CNY × 1.48/1.30 + fix
  - ⚠️ 2.5% от ЦЕНЫ (без 8000¥)
  - Эталоны: CN→РФ 180K¥=3,838K₽ ✅ | CN→РБ 150K¥=3,117K₽ ✅
- P3.5 ✅ `util-sbor-rates.ts` — утильсбор 2026 (264 строки, 33 теста)
  - ≤160лс И ≤3.0L → льготный (в ФИКСе) | Иначе → коммерческий
  - Электро: 30мин = пиковая × 0.7355 × 0.45
- P3.6 ✅ `calc/index.ts` — мастер-калькулятор (115 строк, 19 тестов)
  - calculate(car, rates, eurRate?) — единая точка входа
  - Роутер по стране + автоматическая доплата утильсбора
- P3.7 ✅ Все 8 эталонов через calculate() ± 0.5%

### P4 · Бэкенд — ✅ ЗАВЕРШЁН (5/5 · 109 тестов)

**P4.1 ✅ Модуль курсов валют (36 тестов)**
- `src/lib/rates/cbr.ts` (200 строк) — ЦБ РФ API
  - Endpoint: cbr-xml-daily.ru + fallback cbr-xml-daily.com
  - ⚠️ KRW Nominal=1000 — делит Value/Nominal
  - Sanity-checks: USD 30–200₽, EUR 30–250₽, KRW 0.01–0.5₽, CNY 3–40₽
  - AbortController таймаут 10 сек
- `src/lib/rates/bybit.ts` (249 строк) — Bybit P2P USDT/RUB
  - POST api2.bybit.com/fiat/otc/item/online (БЕЗ авторизации!)
  - Фильтрация: maxAmount >= 50,000₽
  - Медиана топ-5 (устойчива к выбросам)
  - Fallback: api.bybit.com
  - Sanity-check медианы 50–200₽
- `src/lib/rates/index.ts` (276 строк) — единый модуль
  - `getExchangeRates()` → ExchangeRates (USDT_RUB, KRW_RUB, CNY_RUB, AED_USD)
  - `getEURRate()` → EUR/RUB для ЕТТ ЕАЭС (3–5 лет)
  - `setAdminConfig()` — коррекция MoscaEx, спреды ВТБ
  - TTL-кэш 1 час → stale fallback → hardcoded fallback (3 уровня)
  - Promise.all — параллельные запросы к обоим API
  - Дефолтные коррекции: USDT +1.50₽, KRW +0.00050₽, CNY +0.30₽

**P4.2 ✅ API routes + validation + rate limiter (49 тестов)**
- `src/app/api/calculate/route.ts` (176 строк) — POST /api/calculate
  - Pipeline: rate limit → JSON → Zod → бизнес-валидация → курсы → EUR (если 3–5) → calculate() → лог → DB save → {totalRUB}
  - Клиент получает ТОЛЬКО `{totalRUB: 3972193}` — breakdown на сервере
  - Structured JSON log (для grep/jq)
  - Async DB save (не блокирует ответ)
- `src/app/api/rates/route.ts` (62 строки) — GET /api/rates
  - Курсы из кэша, Cache-Control: 5 мин
- `src/lib/validation.ts` (98 строк) — Zod-схемы
  - CalcRequestSchema: country, destination, price (max 100M для KRW), year, engineType, horsePower
  - validateBusinessRules(): ОАЭ только новые авто (≤1 год)
  - toCarInput(): маппинг API → CarInput (добавляет currency)
  - LeadRequestSchema (для будущего /api/lead)
- `src/lib/rate-limiter.ts` (163 строки) — in-memory
  - /api/calculate 10/мин, /api/rates 30/мин, /api/lead 3/мин
  - getClientId: Telegram > X-Forwarded-For > X-Real-Ip > unknown
  - Автоочистка каждые 5 мин

**P4.3 ✅ TTLCache доработка (24 теста)**
- `src/lib/cache.ts` (194 строки) — расширенный TTLCache
  - get/set/delete/has/clear/size/ttl/cleanup/stats/destroy
  - Hit/miss счётчики, hitRate%, evictions
  - Автоочистка expired (опциональный интервал)
  - TTL константы: RATES=1ч, PARSE=24ч, API_CLIENT=5м

**P4.4 ✅ Prisma + SQLite**
- `src/lib/db-service.ts` (283 строки) — полный CRUD
  - saveCalculation(): car + result + rates + breakdown JSON
  - saveLead(), updateLeadStatus(), getRecentLeads()
  - getAdminSetting(), setAdminSetting(), getAllAdminSettings() (upsert)
  - saveRateToDb(), getRateFromDb() — кэш курсов в БД
  - getStats(): totalCalculations, totalLeads, todayCalculations
  - Всё fail-safe: catch → logError → return null/false/[]
- `prisma/schema.prisma`: Calculation, Lead, AdminSetting, RateCache
- `src/lib/db.ts`: Prisma singleton

**P4.5 ✅ Серверное логирование**
- `src/lib/logger.ts` (100 строк)
  - logInfo/logError/logWarn/logDebug (debug только в development)
  - logCalculation(breakdown): формула + ключевые цифры
  - logCalcEntry(): структурированный JSON ([CALC_LOG] {...})

---

## 💱 ФОРМУЛЫ (краткая сводка — все подтверждены ✅)

### USA → РФ (до 3 лет, ≤160лс)
```
(lot×1.08 + 2200 + 750)×1.011 + (lot×1.08 + 2200)×0.48 = $ × USDT_rate + ФИКС
Фиксы: ≤$20K→425K₽ | ≤$30K→495K₽ | ≤$40K→575K₽ | далее +100K/$10K
```

### USA → РБ (до 3 лет, ≤160лс)
```
(lot×1.08 + 2200 + 750)×1.011 + (lot×1.08)×0.30 = $ × USDT_rate + ФИКС
Фиксы: ≤$20K→450K₽ | ≤$30K→520K₽ | ≤$40K→600K₽ | далее +100K/$10K
```

### Корея → РФ/РБ (до 3 лет): priceKRW × KRW_RUB × 1.48/1.30 + 90K + 600K/720K
### ОАЭ → РФ/РБ (новые): (AED/3.67+$1600) × USDT × 1.48/1.30 + fix
### Китай → РФ/РБ (до 3 лет): (price+8000+price×0.025) × CNY × 1.48/1.30 + 590K/720K
### 3–5/5+ лет: базовая часть + ЕТТ ЕАЭС вместо множителя
### >160лс: + коммерческий утильсбор из таблицы

---

## 💱 Курсы валют

- **USDT/RUB** (США, ОАЭ): Bybit P2P медиана + коррекция MoscaEx (дефолт +1.50₽)
- **KRW/RUB** (Корея): ЦБ РФ + спред ВТБ (дефолт +0.00050₽)
- **CNY/RUB** (Китай): ЦБ РФ + спред ВТБ (дефолт +0.30₽)
- **EUR/RUB** (ЕТТ ЕАЭС): ЦБ РФ (без коррекции)
- **AED/USD**: фиксированный 3.67

---

## 📊 Эталонные расчёты (курсы: USDT 78.50₽, CNY 11.40₽, KRW 0.05364₽)

| # | Направление | Авто | Итого | Статус |
|---|---|---|---|---|
| 1 | 🇺🇸 USA → РБ | $15K, 150лс | **2,351,000₽** | ✅ тест |
| 2 | 🇺🇸 USA → РФ | $25K, 150лс | **3,972,193₽** | ✅ тест |
| 3 | 🇰🇷 Корея → РФ | 35M₩, 150лс | **3,469,000₽** | ✅ тест |
| 4 | 🇰🇷 Корея → РБ | 28M₩, 130лс | **2,762,496₽** | ✅ тест |
| 5 | 🇦🇪 ОАЭ → РФ | 120K AED, 150лс | **4,495,000₽** | ✅ тест |
| 6 | 🇦🇪 ОАЭ → РБ | 90K AED, 150лс | **3,246,000₽** | ✅ тест |
| 7 | 🇨🇳 Китай → РФ | 180K¥, 150лс | **3,838,000₽** | ✅ тест |
| 8 | 🇨🇳 Китай → РБ | 150K¥, 120лс | **3,117,000₽** | ✅ тест |

---

## 🔧 Стек

- Next.js 14 · TypeScript · Tailwind
- Grammy.js (Telegram Bot)
- Prisma + SQLite · Vitest (225 тестов)
- VPS: PM2 + Nginx + SSL (**НЕ Vercel**)
- GitHub для бэкапа

---

## 📁 Структура репо (полная, актуальная)

```
car-calc/
├── .env.example
├── .gitignore
├── package.json, tsconfig.json, tailwind.config.ts
├── postcss.config.js, next.config.js, vitest.config.ts
├── prisma/schema.prisma              ✅ Calculation, Lead, AdminSetting, RateCache
├── docs/
│   ├── P0-MASTER-PLAN.md             ✅ мастер-план
│   ├── api-contract.md               ✅ 3 endpoints, Zod, rate limits
│   ├── master-context.md             ✅ все 11 формул
│   └── research/
│       ├── rates-api.md              ✅ Bybit P2P + ЦБ РФ спецификация
│       ├── tks-customs.md            ✅ ЕТТ ЕАЭС ставки
│       ├── util-sbor.md              ✅ утильсбор 2026 таблицы
│       └── fixed-costs.md            ✅ JSON всех констант
├── src/
│   ├── types/index.ts                ✅ 491 строка, 30+ типов
│   ├── calc/
│   │   ├── index.ts                  ✅ мастер-калькулятор (P3.6)
│   │   ├── calc-usa.ts               ✅ (P3.1, 228 строк)
│   │   ├── calc-korea.ts             ✅ (P3.2, 207 строк)
│   │   ├── calc-uae.ts               ✅ (P3.3, 179 строк)
│   │   ├── calc-china.ts             ✅ (P3.4, 216 строк)
│   │   └── data/
│   │       ├── constants.ts          ✅ ВСЕ константы всех стран (250 строк)
│   │       └── util-sbor-rates.ts    ✅ утильсбор 2026 (264 строки)
│   ├── app/
│   │   ├── layout.tsx, page.tsx, globals.css
│   │   └── api/
│   │       ├── calculate/route.ts    ✅ POST → {totalRUB} + DB + structured log
│   │       ├── rates/route.ts        ✅ GET → курсы (кэш)
│   │       └── lead/route.ts         ⏳ placeholder (P5+)
│   ├── lib/
│   │   ├── cache.ts                  ✅ TTLCache (stats, cleanup, ttl)
│   │   ├── db.ts                     ✅ Prisma singleton
│   │   ├── db-service.ts             ✅ CRUD: Calc, Lead, Admin, RateCache
│   │   ├── logger.ts                 ✅ logInfo/Error/Warn/Debug + structured
│   │   ├── rate-limiter.ts           ✅ 10/30/3 per min, auto-cleanup
│   │   ├── validation.ts             ✅ Zod schemas + business rules + toCarInput
│   │   └── rates/
│   │       ├── cbr.ts                ✅ ЦБ РФ (2 домена, Nominal, sanity)
│   │       ├── bybit.ts              ✅ Bybit P2P (медиана, фильтрация)
│   │       └── index.ts              ✅ Единый (коррекции, кэш, stale, hardcoded)
│   ├── bot/
│   │   ├── index.ts                  ⏳ placeholder
│   │   ├── commands.ts               ⏳ placeholder
│   │   └── admin.ts                  ⏳ placeholder
│   └── components/
│       ├── TelegramProvider.tsx       ⏳ placeholder
│       ├── wizard/                    ⏳
│       ├── result/                    ⏳
│       └── ui/                        ⏳
├── tests/
│   ├── calc/
│   │   ├── calc-usa.test.ts          ✅ 18 тестов
│   │   ├── calc-korea.test.ts        ✅ 14 тестов
│   │   ├── calc-uae.test.ts          ✅ 17 тестов
│   │   ├── calc-china.test.ts        ✅ 15 тестов
│   │   ├── util-sbor.test.ts         ✅ 33 теста
│   │   └── master-calculator.test.ts ✅ 19 тестов
│   ├── lib/
│   │   ├── rates.test.ts             ✅ 36 тестов
│   │   └── cache.test.ts             ✅ 24 теста
│   └── api/
│       └── calculate.test.ts         ✅ 49 тестов
└── public/
```

---

## 📊 Git-история (20 коммитов)

```
199c9d1 P4.3+P4.4+P4.5 ✅ Кэш + Prisma/SQLite + логирование
7283dc7 P4.2 ✅ API routes + validation + rate limiter
2a932d9 P4.1 ✅ Модуль курсов валют (Bybit P2P + ЦБ РФ + кэш)
dbe4fa5 docs: контекст переноса чат 4→5
17c0beb P3.6+P3.7: master-calculator + все 8 эталонных расчётов ✅
c452430 P3.5: util-sbor-rates.ts — утилизационный сбор 2026 + 33 теста
9121af0 P3.4: calc-china.ts — Китай → РФ/РБ + 15 тестов
565b929 P3.3: calc-uae.ts — ОАЭ → РФ/РБ + 17 тестов
89d589f P3.2: calc-korea.ts — Корея → РФ/РБ + 14 тестов
1f7b963 Context transfer chat3→chat4
72787d1 P2.3+P2.4: research docs
91f1afa P3.1: calc-usa.ts + constants.ts + tests (18/18)
6a8ce3d Context transfer — P2.2 done
d238ee0 P2.2: Ставки ЕТТ ЕАЭС
a59bbea P2.1: Исследование API курсов валют
ee2d545 P1.4: Мастер-контекст
78656fc P1.3: API контракт
46be4d0 P1.2: Модели данных
006de98 P1.1: Структура репо
c5f6dd8 P0: Мастер-план
```

---

## 📐 ОСТАВШИЕСЯ ЭТАПЫ

### P5 · 🎨 Дизайнер (4 подэтапа) ← СЛЕДУЮЩИЙ
- **P5.1** · Референсы из Midjourney → 3 концепта
- **P5.2** · UI Kit (цвета, шрифты, кнопки, карточки)
- **P5.3** · Прототип экранов (визард + результат)
- **P5.4** · Дизайн Telegram Bot интерфейса

### P6 · 📱 Фронтенд (7 подэтапов)
- 6.1 · TelegramProvider + WebApp SDK
- 6.2 · Визард Step 1: выбор страны (🇺🇸🇰🇷🇦🇪🇨🇳)
- 6.3 · Визард Step 2: ввод данных авто (цена, год, двигатель, мощность)
- 6.4 · Визард Step 3: направление (РФ/РБ)
- 6.5 · Экран результата: ОДНА ЦИФРА + кнопка «Оставить заявку»
- 6.6 · Форма заявки → /api/lead
- 6.7 · История расчётов (localStorage, 20 записей)

### P7 · 🧪 Тестировщик (5 подэтапов)
- 7.1 · E2E: 20 реальных кейсов, сравнение с tks.ru, допуск ±5%
- 7.2 · Edge cases: >$40K, >160лс, электро, юрлицо
- 7.3 · API: stress-test rate limiter
- 7.4 · UI: Playwright тесты визарда
- 7.5 · Финальный прогон всех тестов

### P8 · 🚀 DevOps (5 подэтапов)
- 8.1 · GitHub Actions (CI: lint + test)
- 8.2 · VPS: Nginx + SSL (Let's Encrypt) + PM2
- 8.3 · Deploy pipeline: git push → test → VPS pull → pm2 restart
- 8.4 · Telegram Bot setup (BotFather + webhook)
- 8.5 · Мониторинг (health check, Sentry)

---

## ⚠️ Открытые вопросы

1. **ОАЭ → РБ фиксы:** точная шкала после $20K→530K₽
2. **ОС на VPS:** Ubuntu / Debian — уточнить
3. **Домен для Mini App** — нужен
4. **Telegram Bot токен** — нужен от @BotFather
5. **Midjourney референсы для дизайна** — пользователь скинет

---

## 💬 Как начать новый чат

Загрузи этот файл в Project. Напиши:

**«Контекст перенесён. P0–P4 завершены (225 тестов, 3790 строк кода). Продолжаем с P5 · Дизайнер. У меня есть референсы из Midjourney. GitHub репо подключено. Продолжай.»**

Claude должен:
1. Клонировать репо, npm install
2. Изучить текущую структуру (src/components — пока пустые)
3. Спросить про референсы дизайна / дождаться от пользователя
4. Начать с P5.1 — 3 концепта на основе референсов
5. СТОП → ждать «продолжай»
