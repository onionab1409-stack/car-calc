# 🚗 Контекст переноса — Car-Calc · Чат 8→9
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

## ✅ ЧТО СДЕЛАНО (всё запушено в GitHub · 394 теста · ~6900 строк кода + ~5200 строк тестов)

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
- P4.3 ✅ TTLCache (24 теста)
- P4.4 ✅ Prisma + SQLite — CRUD для Calculation, Lead, AdminSetting, RateCache
- P4.5 ✅ Логирование — structured JSON, полный breakdown в логах

### P5 · Дизайнер — ✅ ЗАВЕРШЁН
- 27 промптов Midjourney + 17 ULTIMATE V7 промптов
- 25 PNG-референсов + 9 HTML дизайн-файлов в `desing/`
- UI Kit, иконки, типографика, палитра gold 9 ступеней

### P6 · Фронтенд — ✅ ЗАВЕРШЁН (7/7 · 60 тестов)
- P6.1 ✅ Дизайн-токены + UI-компоненты + TelegramProvider
- P6.2 ✅ StepCountry — выбор страны (🇺🇸🇰🇷🇦🇪🇨🇳), 4 карточки 2×2, haptic (7 тестов)
- P6.3 ✅ StepCar (290 строк, 12 тестов) — цена, год, двигатель, мощность, объём
- P6.4 ✅ StepDestination (210 строк, 6 тестов) — РФ/РБ, сводка авто
- P6.5 ✅ StepLoading + StepResult (340 строк, 11 тестов) — золотой прогресс, ОДНА ЦИФРА (Playfair, count-up)
- P6.6 ✅ StepLead (260 строк, 10 тестов) — форма заявки, POST /api/lead
- P6.7 ✅ StepHistory + useHistory (400 строк, 14 тестов) — localStorage, 20 записей

### P7 · Тестировщик — 🔄 В ПРОЦЕССЕ (3 из 5 подэтапов)

**P7.1 ✅ E2E: 20 реальных автомобилей (31 тест)** — commit 980d91a
- `tests/e2e/real-cars-e2e.test.ts` (654 строки)
- 20 реальных кейсов: Camry, Mustang, Civic, BMW X5, Tesla M3, RAV4, Lexus RX, Tucson, K5, Genesis G80, Santa Fe, LC300, Patrol, BYD Han, Geely, Chery, Haval, Escalade, Li Auto L9
- Ручные расчёты по формулам → ±5% допуск
- Граничные значения (ровно $20K/$20,001, 160/161hp, 3.0/3.1L)
- Валидация breakdown полей, разумные диапазоны

**P7.2 ✅ Edge cases (50 тестов)** — commit 7d189d7
- `tests/e2e/edge-cases.test.ts` (655 строк)
- A. Экстремальные цены (7): $1, $3K, $80K overflow, $100K, 300K AED
- B. Возрастные границы (6): 2024→under3, 2023→3to5, 2021→3to5(граница), 2020→over5, 2026
- C. ЕТТ ЕАЭС границы (5): 1000→1001cc, 1800→1801cc, 3000→3001cc скачки
- D. Электромобили (6): 70hp(льгот), 177/178hp(граница), 500hp, 700hp(макс k=182.40), used
- E. Дизель (3): льготный, коммерческий, 3-5 лет
- F. Экстремальная мощность (4): 600hp+6.0L, 161hp+1.0L, 500→501hp граница
- G. Все комбо страна×возраст×направление (10): KR/CN/USA × 3-5/5+ × РФ/РБ
- H. Гибриды (2): идентичен бензину
- I. Утильсбор used vs new (2): kUsed > kNew
- J. Ошибки (5): без engineCC, без eurRate, ОАЭ старое, неизв. страна

**P7.3 ✅ Stress-test rate limiter (28 тестов)** — commit 37117b0
- `tests/e2e/rate-limiter-stress.test.ts` (423 строки)
- A. Изоляция клиентов (4): 10/50 клиентов, блокировка одного не влияет
- B. Изоляция endpoint-ов (4): calculate/rates/lead независимы
- C. Временное окно (4): fake timers, 60с сброс, постепенное освобождение
- D. Remaining counter (3): обратный отсчёт для всех endpoint-ов
- E. getClientId (6): приоритет TG > XFF > XRI > unknown
- F. Конфигурация (3): 10/30/3 лимиты
- G. Reset (1)
- H. Реальная нагрузка (3): 100 клиентов, спаммер, стабильная нагрузка

**P7.4 · Playwright тесты визарда — ⏳ СЛЕДУЮЩИЙ**
**P7.5 · Финальный прогон всех тестов — ⏳**

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
- Prisma + SQLite · Vitest (394 теста)
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
│   │       ├── constants.ts        ✅ все константы всех стран
│   │       └── util-sbor-rates.ts  ✅ утильсбор 2026
│   ├── app/
│   │   ├── layout.tsx              ✅ 3 шрифта next/font
│   │   ├── page.tsx                ✅ TelegramProvider + Calculator
│   │   ├── globals.css             ✅ btn-gold, card-gold, price-display, shimmer
│   │   └── api/
│   │       ├── calculate/route.ts  ✅ POST → {totalRUB}
│   │       ├── rates/route.ts      ✅ GET → курсы
│   │       └── lead/route.ts       ✅ POST → заявка
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
│   │       ├── index.ts             ✅ реэкспорт
│   │       ├── StepCountry.tsx      ✅
│   │       ├── StepCar.tsx          ✅
│   │       ├── StepDestination.tsx  ✅
│   │       ├── StepLoading.tsx      ✅
│   │       ├── StepResult.tsx       ✅
│   │       ├── StepLead.tsx         ✅
│   │       ├── StepHistory.tsx      ✅
│   │       └── useHistory.ts        ✅
│   └── bot/                         ⏳ placeholder (P8)
├── tests/
│   ├── calc/                        ✅ 116 тестов (6 файлов)
│   ├── lib/
│   │   ├── rates.test.ts            ✅ 36 тестов
│   │   └── cache.test.ts            ✅ 24 теста
│   ├── api/
│   │   └── calculate.test.ts        ✅ 49 тестов
│   ├── components/                  ✅ 60 тестов (6 файлов)
│   └── e2e/
│       ├── real-cars-e2e.test.ts    ✅ 31 тест (P7.1)
│       ├── edge-cases.test.ts       ✅ 50 тестов (P7.2)
│       └── rate-limiter-stress.test.ts ✅ 28 тестов (P7.3)
└── public/
```

---

## 📊 Git-история (29 коммитов)

```
37117b0 P7.3 ✅ Stress-test rate limiter — 28 тестов
7d189d7 P7.2 ✅ Edge cases — 50 тестов крайних значений
980d91a P7.1 ✅ E2E тесты — 20 реальных автомобилей + граничные значения
14093c0 docs: контекст переноса чат 7→8
bc3efc9 P6.7 ✅ История расчётов
1f082d6 P6.6 ✅ StepLead — форма заявки
7a3f7e8 P6.5 ✅ StepLoading + StepResult
84a60cf P6.4 ✅ StepDestination
8ade165 P6.3 ✅ StepCar — ввод данных авто
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

## 🎨 ДИЗАЙН-РЕШЕНИЯ (подтверждены)

- **Шрифт цены:** Playfair Display 400 (элегантный, тонкий)
- **Золотой якорь:** #C4A265 (core), палитра 9 ступеней от #FFE2A9 до #2D1C13
- **Фон приложения:** #0C0C0E (почти чёрный)
- **Фон карточек:** #141418
- **Стиль:** luxury dark gold — чёрное + золото, без ярких цветов
- **Клиент видит ТОЛЬКО итоговую цену** — никакого breakdown

---

## 📐 ОСТАВШИЕСЯ ЭТАПЫ

### P7 · 🧪 Тестировщик (осталось 2 из 5)
- **P7.4 · Playwright тесты визарда (UI flow)** ← СЛЕДУЮЩИЙ
- **P7.5 · Финальный прогон всех тестов**

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

**«Контекст перенесён. P0–P6 завершены, P7.1–P7.3 готовы (394 теста, ~12000 строк). Продолжаем с P7.4 — Playwright тесты визарда (UI flow). GitHub репо подключено. Продолжай.»**

Claude должен:
1. Клонировать репо, npm install
2. Установить Playwright: `npx playwright install --with-deps chromium`
3. Изучить компоненты визарда (Calculator.tsx, StepCountry, StepCar и т.д.)
4. Создать Playwright-конфиг и тесты UI flow
5. Тесты, пуш, СТОП
