# 🚗 Контекст переноса — Car-Calc · Чат 7→8
## Перенос · 1 марта 2026

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

## ✅ ЧТО СДЕЛАНО (всё запушено в GitHub · 285 тестов · ~7500 строк кода)

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
- P3.2 ✅ `calc-korea.ts` — Корея → РФ/РБ (207 строк, 14 тестов)
- P3.3 ✅ `calc-uae.ts` — ОАЭ → РФ/РБ (179 строк, 17 тестов)
- P3.4 ✅ `calc-china.ts` — Китай → РФ/РБ (216 строк, 15 тестов)
- P3.5 ✅ `util-sbor-rates.ts` — утильсбор 2026 (264 строки, 33 теста)
- P3.6 ✅ `calc/index.ts` — мастер-калькулятор (115 строк, 19 тестов)
- P3.7 ✅ Все 8 эталонов через calculate() ± 0.5%

### P4 · Бэкенд — ✅ ЗАВЕРШЁН (5/5 · 109 тестов)
- P4.1 ✅ Модуль курсов (Bybit P2P + ЦБ РФ + кэш, 36 тестов)
  - `src/lib/rates/cbr.ts` — ЦБ РФ API (2 домена fallback, KRW Nominal=1000, sanity-checks)
  - `src/lib/rates/bybit.ts` — Bybit P2P USDT/RUB (медиана топ-5, фильтрация maxAmount≥50K)
  - `src/lib/rates/index.ts` — единый модуль (коррекция MoscaEx, спред ВТБ, 3 уровня fallback)
- P4.2 ✅ API routes + validation + rate limiter (49 тестов)
  - `POST /api/calculate` → `{totalRUB}` (ТОЛЬКО число клиенту, breakdown на сервере)
  - `GET /api/rates` → курсы из кэша
  - `POST /api/lead` → заявка (Zod, rate limit 3/мин, saveLead в Prisma)
  - Zod-валидация, rate limiting (10/мин calculate, 30/мин rates, 3/мин lead)
- P4.3 ✅ TTLCache (24 теста) — stats, cleanup, auto-expire
- P4.4 ✅ Prisma + SQLite — CRUD для Calculation, Lead, AdminSetting, RateCache
- P4.5 ✅ Логирование — structured JSON, полный breakdown в логах

### P5 · Дизайнер — ✅ ЗАВЕРШЁН
- 27 промптов Midjourney + 17 ULTIMATE V7 промптов
- 25 PNG-референсов + 9 HTML дизайн-файлов в `desing/`
- UI Kit, иконки, типографика, палитра gold 9 ступеней

### P6 · Фронтенд — ✅ ЗАВЕРШЁН (7/7 · 60 тестов)

**P6.1 ✅ Дизайн-токены + UI-компоненты + TelegramProvider**
- `src/styles/design-tokens.ts` — все токены (gold 50–900, bg, neutral, fonts, spacing)
- `tailwind.config.ts` — gold палитра, анимации (fade-in, slide-up, count-up, gold-pulse, shimmer)
- `src/app/globals.css` — .btn-gold, .card-gold, .input-gold, .pill-gold, .price-display, .shimmer
- `src/app/layout.tsx` — 3 шрифта next/font (Playfair Display, DM Sans, JetBrains Mono)
- `src/components/TelegramProvider.tsx` — WebApp SDK, haptic, useTelegram()
- `src/components/ui/` — Button (primary/ghost/danger+loading), Input (gold focus), Card (selected/glow), Pill, Divider

**P6.2 ✅ StepCountry** — выбор страны (🇺🇸🇰🇷🇦🇪🇨🇳), 4 карточки 2×2, gold border selected, haptic (7 тестов)

**P6.3 ✅ StepCar** (290 строк, 12 тестов) — ввод данных авто:
- Цена (авто-валюта, форматирование пробелами, подсказки по стране)
- Год (6 пресетов + ручной, UAE ≤1 года, предупреждение 3+ лет)
- Тип двигателя (4 pills: ⛽🛢️⚡🔋)
- Мощность (предупреждение >160 л.с.)
- Объём двигателя (появляется для 3+ лет или >160 л.с., скрыт для электро)

**P6.4 ✅ StepDestination** (210 строк, 6 тестов) — выбор РФ/РБ:
- Сводка авто, 2 карточки с флагами, подсказки (×1.48/×1.30)

**P6.5 ✅ StepLoading + StepResult** (340 строк, 11 тестов):
- StepLoading: золотой SVG круговой прогресс, 5 этапов, реальный fetch POST /api/calculate
- StepResult: ОГРОМНАЯ ЦЕНА (Playfair, gold glow blur 60px), count-up ease-out cubic 1.4с
  - Сводка параметров, CTA «Оставить заявку», «Рассчитать другой»
  - **НИКАКОГО breakdown — клиент видит ТОЛЬКО totalRUB**

**P6.6 ✅ StepLead** (260 строк, 10 тестов) — форма заявки:
- Имя (авто из Telegram), телефон, комментарий (опц.)
- POST /api/lead → экран успеха (золотой SVG чекмарк)
- Карточка расчёта сверху, 4 состояния (form/sending/success/error)

**P6.7 ✅ StepHistory + useHistory** (400 строк, 14 тестов) — история:
- localStorage, макс 20 записей LIFO
- Карточки: флаг, маршрут, параметры, дата, цена
- Клик → пересчёт (handleHistorySelect → loading)
- Удаление, очистка, empty state
- Статистика (кол-во расчётов, средняя цена, стран)
- HistoryButton — плавающая кнопка на экране country

**Calculator.tsx** — главный визард (8 шагов):
`country → car → destination → loading → result → lead → history → error`
- Автосохранение в историю при result (savedToHistoryRef, один раз)

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
| 1 | 🇺🇸 USA → РБ | $15K, 150лс | **2,351,000₽** | ✅ |
| 2 | 🇺🇸 USA → РФ | $25K, 150лс | **3,972,193₽** | ✅ |
| 3 | 🇰🇷 Корея → РФ | 35M₩, 150лс | **3,469,000₽** | ✅ |
| 4 | 🇰🇷 Корея → РБ | 28M₩, 130лс | **2,762,496₽** | ✅ |
| 5 | 🇦🇪 ОАЭ → РФ | 120K AED, 150лс | **4,495,000₽** | ✅ |
| 6 | 🇦🇪 ОАЭ → РБ | 90K AED, 150лс | **3,246,000₽** | ✅ |
| 7 | 🇨🇳 Китай → РФ | 180K¥, 150лс | **3,838,000₽** | ✅ |
| 8 | 🇨🇳 Китай → РБ | 150K¥, 120лс | **3,117,000₽** | ✅ |

---

## 🔧 Стек

- Next.js 14 · TypeScript · Tailwind
- Grammy.js (Telegram Bot)
- Prisma + SQLite · Vitest (285 тестов)
- VPS: PM2 + Nginx + SSL (**НЕ Vercel**)
- GitHub для бэкапа

---

## 📁 Структура репо (полная, актуальная)

```
car-calc/
├── .env.example, .gitignore
├── package.json, tsconfig.json
├── tailwind.config.ts              ✅ gold палитра + анимации
├── postcss.config.js, next.config.js, vitest.config.ts
├── prisma/schema.prisma            ✅ Calculation, Lead, AdminSetting, RateCache
├── desing/                         ✅ 25 PNG референсов + 9 HTML дизайн-файлов
├── docs/
│   ├── P0-MASTER-PLAN.md           ✅
│   ├── api-contract.md             ✅ 3 endpoints
│   ├── master-context.md           ✅ все 11 формул
│   ├── p5-midjourney-prompts.html  ✅ 27 промптов
│   ├── p5-ultimate-prompts.html    ✅ 17 ULTIMATE промптов V7
│   └── research/                   ✅ 4 research docs
├── src/
│   ├── types/index.ts              ✅ 491 строка, 30+ типов
│   ├── styles/design-tokens.ts     ✅ все токены
│   ├── calc/
│   │   ├── index.ts                ✅ мастер-калькулятор
│   │   ├── calc-usa.ts             ✅
│   │   ├── calc-korea.ts           ✅
│   │   ├── calc-uae.ts             ✅
│   │   ├── calc-china.ts           ✅
│   │   └── data/
│   │       ├── constants.ts        ✅ все константы
│   │       └── util-sbor-rates.ts  ✅ утильсбор 2026
│   ├── app/
│   │   ├── layout.tsx              ✅ 3 шрифта next/font
│   │   ├── page.tsx                ✅ TelegramProvider + Calculator
│   │   ├── globals.css             ✅ btn-gold, card-gold, price-display, shimmer
│   │   └── api/
│   │       ├── calculate/route.ts  ✅ POST → {totalRUB}
│   │       ├── rates/route.ts      ✅ GET → курсы
│   │       └── lead/route.ts       ✅ POST → заявка (Zod, rate limit, DB)
│   ├── lib/
│   │   ├── cache.ts                ✅ TTLCache
│   │   ├── db.ts                   ✅ Prisma singleton
│   │   ├── db-service.ts           ✅ CRUD
│   │   ├── logger.ts               ✅ structured JSON
│   │   ├── rate-limiter.ts         ✅ 10/30/3 per min
│   │   ├── validation.ts           ✅ Zod schemas
│   │   └── rates/
│   │       ├── cbr.ts              ✅ ЦБ РФ
│   │       ├── bybit.ts            ✅ Bybit P2P
│   │       └── index.ts            ✅ единый модуль + 3 уровня fallback
│   ├── components/
│   │   ├── TelegramProvider.tsx     ✅ WebApp SDK, haptic, useTelegram()
│   │   ├── Calculator.tsx           ✅ визард 8 шагов + история
│   │   ├── ui/                      ✅ Button, Input, Card, Pill, Divider
│   │   └── wizard/
│   │       ├── index.ts             ✅ реэкспорт всех
│   │       ├── StepCountry.tsx      ✅ P6.2
│   │       ├── StepCar.tsx          ✅ P6.3
│   │       ├── StepDestination.tsx  ✅ P6.4
│   │       ├── StepLoading.tsx      ✅ P6.5
│   │       ├── StepResult.tsx       ✅ P6.5
│   │       ├── StepLead.tsx         ✅ P6.6
│   │       ├── StepHistory.tsx      ✅ P6.7
│   │       └── useHistory.ts        ✅ P6.7
│   └── bot/                         ⏳ placeholder (P8)
├── tests/
│   ├── calc/                        ✅ 116 тестов (6 файлов)
│   ├── lib/
│   │   ├── rates.test.ts            ✅ 36 тестов
│   │   └── cache.test.ts            ✅ 24 тестов
│   ├── api/
│   │   └── calculate.test.ts        ✅ 49 тестов
│   └── components/
│       ├── step-country.test.ts     ✅ 7 тестов
│       ├── step-car.test.ts         ✅ 12 тестов
│       ├── step-destination.test.ts ✅ 6 тестов
│       ├── step-result.test.ts      ✅ 11 тестов
│       ├── step-lead.test.ts        ✅ 10 тестов
│       └── step-history.test.ts     ✅ 14 тестов
└── public/
```

---

## 📊 Git-история (26 коммитов)

```
bc3efc9 P6.7 ✅ История расчётов — localStorage + StepHistory
1f082d6 P6.6 ✅ StepLead — форма заявки + lead API
7a3f7e8 P6.5 ✅ StepLoading + StepResult
84a60cf P6.4 ✅ StepDestination — выбор направления
8ade165 P6.3 ✅ StepCar — ввод данных авто
(prev)  P6.2 ✅ StepCountry — выбор страны
5f21ffb P6.1 ✅ Дизайн-токены + UI-компоненты + TelegramProvider
f5a8b56 Add files via upload (desing/)
f063666 P5.1: ULTIMATE Midjourney V7 промпты
9b11331 P5.1: Midjourney V7 промпты
199c9d1 P4.3+P4.4+P4.5 ✅ Кэш + Prisma/SQLite + логирование
7283dc7 P4.2 ✅ API routes + validation + rate limiter
2a932d9 P4.1 ✅ Модуль курсов валют
17c0beb P3.6+P3.7: master-calculator + все 8 эталонов ✅
c452430 P3.5: util-sbor-rates.ts
9121af0 P3.4: calc-china.ts
565b929 P3.3: calc-uae.ts
89d589f P3.2: calc-korea.ts
91f1afa P3.1: calc-usa.ts + constants.ts + tests
...
c5f6dd8 P0: Мастер-план
```

---

## 📐 ОСТАВШИЕСЯ ЭТАПЫ

### P7 · 🧪 Тестировщик (5 подэтапов) ← СЛЕДУЮЩИЙ
- **7.1** · E2E: 20 реальных кейсов, сравнение с ручными расчётами, допуск ±5%
- **7.2** · Edge cases: >$40K, >160лс, электро, 3-5 лет, 5+ лет
- **7.3** · API: stress-test rate limiter
- **7.4** · Playwright тесты визарда (UI flow)
- **7.5** · Финальный прогон всех тестов

### P8 · 🚀 DevOps (5 подэтапов)
- **8.1** · GitHub Actions (CI: lint + test)
- **8.2** · VPS: Nginx + SSL (Let's Encrypt) + PM2
- **8.3** · Deploy pipeline: git push → test → VPS pull → pm2 restart
- **8.4** · Telegram Bot setup (BotFather + webhook + команды)
- **8.5** · Мониторинг (health check, Sentry)

---

## ⚠️ Открытые вопросы

1. **ОАЭ → РБ фиксы:** точная шкала после $20K→530K₽
2. **ОС на VPS:** Ubuntu / Debian — уточнить
3. **Домен для Mini App** — нужен
4. **Telegram Bot токен** — нужен от @BotFather

---

## 💬 Как начать новый чат

Загрузи этот файл в Project. Напиши:

**«Контекст перенесён. P0–P6 завершены (285 тестов, ~7500 строк). Продолжаем с P7 · Тестировщик, подэтап 7.1 — E2E тесты 20 реальных кейсов. GitHub репо подключено. Продолжай.»**

Claude должен:
1. Клонировать репо, npm install
2. Запустить текущие тесты (285 должны пройти)
3. Изучить calc/*.ts и tests/ — понять что уже покрыто
4. Создать tests/e2e/ с 20 реальными кейсами
5. Запустить, починить если нужно, пуш
6. СТОП → ждать «продолжай»
