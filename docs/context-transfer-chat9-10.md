# 🔄 Контекст переноса: Чат 9 → 10

**Проект:** car-calc — Telegram Mini App калькулятор импорта авто
**Дата:** 2026-03-01
**GitHub:** onionab1409-stack/car-calc
**Токен:** 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 (classic, write access)

```
git clone https://onionab1409-stack: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@github.com/onionab1409-stack/car-calc.git
```

---

## ✅ ВСЕ ЗАВЕРШЁННЫЕ ЭТАПЫ (P0–P7)

| Фаза | Роль | Статус |
|---|---|---|
| P0 | Мастер-план | ✅ |
| P1 | Архитектор | ✅ |
| P2 | Исследователь (формулы, ставки, ЕТТ) | ✅ |
| P3 | Таможенник (4 калькулятора + master) | ✅ 116 тестов |
| P4 | Бэкенд (API, курсы, кэш, DB, лимиты) | ✅ 109 тестов |
| P5 | Дизайнер (Midjourney + UI kit) | ✅ |
| P6 | Фронтенд (визард 7 шагов + история) | ✅ 60 тестов |
| P7 | Тестировщик (E2E, edge, stress, Playwright) | ✅ 191+82 тестов |

**Итого: 394 Vitest PASS + 82 Playwright = 476 тестов, 13,475 строк кода**

---

## 📐 СЛЕДУЮЩИЙ ЭТАП: P8 · 🚀 DevOps (5 подэтапов)

- **8.1** · GitHub Actions (CI: lint + test на push/PR)
- **8.2** · VPS: Nginx + SSL (Let's Encrypt) + PM2
- **8.3** · Deploy pipeline: git push → test → VPS pull → pm2 restart
- **8.4** · Telegram Bot setup (BotFather + webhook + команды)
- **8.5** · Мониторинг (health check, Sentry)

**Деплой:** VPS (уже настроен, есть Claude Code). PM2 + Nginx. Без Vercel.
**Workflow:** Claude Code writes code → git push → pm2 restart

---

## 📂 Структура проекта

```
car-calc/
├── src/
│   ├── app/
│   │   ├── layout.tsx              ✅ Playfair Display font
│   │   ├── page.tsx                ✅ TelegramProvider + Calculator
│   │   ├── globals.css             ✅ btn-gold, card-gold, price-display, shimmer
│   │   └── api/
│   │       ├── calculate/route.ts  ✅ POST → {totalRUB} ТОЛЬКО
│   │       ├── rates/route.ts      ✅ GET → курсы
│   │       └── lead/route.ts       ✅ POST → заявка (Zod, rate limit, DB)
│   ├── calc/
│   │   ├── constants.ts            ✅ все ставки и фиксы
│   │   ├── calc-usa.ts             ✅ USA → РФ/РБ
│   │   ├── calc-korea.ts           ✅ Корея → РФ/РБ
│   │   ├── calc-uae.ts             ✅ ОАЭ → РФ/РБ
│   │   ├── calc-china.ts           ✅ Китай → РФ/РБ
│   │   ├── util-sbor-rates.ts      ✅ утильсбор 2026
│   │   └── index.ts                ✅ master-calculator
│   ├── lib/
│   │   ├── cache.ts                ✅ TTLCache
│   │   ├── db.ts                   ✅ Prisma singleton
│   │   ├── db-service.ts           ✅ CRUD
│   │   ├── logger.ts               ✅ structured JSON
│   │   ├── rate-limiter.ts         ✅ 10/30/3 per min
│   │   ├── validation.ts           ✅ Zod schemas
│   │   └── rates/
│   │       ├── cbr.ts              ✅ ЦБ РФ (2 домена fallback)
│   │       ├── bybit.ts            ✅ Bybit P2P (медиана топ-5)
│   │       └── index.ts            ✅ единый модуль + 3 уровня fallback
│   ├── components/
│   │   ├── TelegramProvider.tsx     ✅ WebApp SDK, haptic, useTelegram()
│   │   ├── Calculator.tsx           ✅ визард 8 шагов + история
│   │   ├── ui/                      ✅ Button, Input, Card, Pill, Divider
│   │   └── wizard/
│   │       ├── StepCountry.tsx      ✅ 4 страны 2×2
│   │       ├── StepCar.tsx          ✅ цена, год, двигатель, мощность
│   │       ├── StepDestination.tsx  ✅ РФ/РБ + CTA «Рассчитать»
│   │       ├── StepLoading.tsx      ✅ gold progress + API call
│   │       ├── StepResult.tsx       ✅ ОДНА ЦЕНА (count-up)
│   │       ├── StepLead.tsx         ✅ имя, телефон → POST /api/lead
│   │       ├── StepHistory.tsx      ✅ localStorage, 20 записей
│   │       └── useHistory.ts        ✅
│   └── bot/                         ⏳ placeholder (P8.4)
├── tests/
│   ├── calc/                        ✅ 116 тестов (7 файлов)
│   ├── lib/
│   │   ├── rates.test.ts            ✅ 36 тестов
│   │   └── cache.test.ts            ✅ 24 теста
│   ├── api/
│   │   └── calculate.test.ts        ✅ 49 тестов
│   ├── components/                  ✅ 60 тестов (6 файлов)
│   ├── e2e/
│   │   ├── real-cars-e2e.test.ts    ✅ 31 тест (P7.1)
│   │   ├── edge-cases.test.ts       ✅ 50 тестов (P7.2)
│   │   └── rate-limiter-stress.test.ts ✅ 28 тестов (P7.3)
│   └── playwright/
│       ├── helpers.ts               ✅ API-моки, утилиты
│       ├── wizard-flow.spec.ts      ✅ 33 теста (P7.4)
│       ├── wizard-navigation.spec.ts ✅ 12 тестов
│       ├── wizard-validation.spec.ts ✅ 16 тестов
│       ├── wizard-history.spec.ts   ✅ 8 тестов
│       └── wizard-visual.spec.ts    ✅ 11 тестов
├── playwright.config.ts             ✅ 3 проекта (mobile/desktop)
├── vitest.config.ts                 ✅ excludes playwright/
└── prisma/schema.prisma             ✅ Calculation, Lead, AdminSetting, RateCache
```

---

## 📊 Git-история (31 коммит)

```
8857ed5 P7.5 ✅ Финальный прогон — 394 Vitest PASS, 0 TS ошибок
46a7f99 P7.4 ✅ Playwright UI тесты визарда — 82 теста
525bdae docs: контекст переноса чат 8→9
37117b0 P7.3 ✅ Stress-test rate limiter — 28 тестов
7d189d7 P7.2 ✅ Edge cases — 50 тестов крайних значений
980d91a P7.1 ✅ E2E тесты — 20 реальных автомобилей + граничные значения
14093c0 docs: контекст переноса чат 7→8
bc3efc9 P6.7 ✅ История расчётов
1f082d6 P6.6 ✅ StepLead — форма заявки
7a3f7e8 P6.5 ✅ StepLoading + StepResult
84a60cf P6.4 ✅ StepDestination
8ade165 P6.3 ✅ StepCar
ebe1f10 P6.2 ✅ StepCountry
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

## 🎨 ДИЗАЙН-РЕШЕНИЯ

- **Шрифт цены:** Playfair Display 400
- **Золотой якорь:** #C4A265 (core), палитра 9 ступеней от #FFE2A9 до #2D1C13
- **Фон приложения:** #0C0C0E (почти чёрный)
- **Фон карточек:** #141418
- **Стиль:** luxury dark gold — чёрное + золото, без ярких цветов
- **🔒 Клиент видит ТОЛЬКО итоговую цену** — никакого breakdown

---

## 💱 ФОРМУЛЫ (краткая сводка)

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

## ⚠️ Открытые вопросы

1. **ОАЭ → РБ фиксы:** точная шкала после $20K→530K₽
2. **ОС на VPS:** Ubuntu / Debian — уточнить у Антона
3. **Домен для Mini App** — нужен для SSL
4. **Telegram Bot токен** — нужен от @BotFather
5. **Playwright на VPS:** `npx playwright install --with-deps chromium` перед запуском

---

## 💬 Как начать новый чат

Загрузи этот файл в Project. Напиши:

**«Контекст перенесён. P0–P7 полностью завершены (394 Vitest + 82 Playwright = 476 тестов, 13,475 строк). Продолжаем с P8 · DevOps, подэтап 8.1 — GitHub Actions CI. GitHub репо подключено. Продолжай.»**

Claude должен:
1. Клонировать репо, npm install
2. Запустить тесты (394 должны пройти)
3. Создать .github/workflows/ci.yml (lint + test на push/PR)
4. Пуш, СТОП → ждать «продолжай»
