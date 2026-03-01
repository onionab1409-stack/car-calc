# 🚗 Контекст переноса — Car-Calc · Чат 6→7
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

## ✅ ЧТО СДЕЛАНО (всё запушено в GitHub · 225 тестов · ~5000 строк кода)

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
  - Zod-валидация, rate limiting (10/мин calculate, 30/мин rates)
- P4.3 ✅ TTLCache (24 теста) — stats, cleanup, auto-expire
- P4.4 ✅ Prisma + SQLite — CRUD для Calculation, Lead, AdminSetting, RateCache
- P4.5 ✅ Логирование — structured JSON, полный breakdown в логах

### P5 · Дизайнер — ✅ ЗАВЕРШЁН
- P5.1 ✅ 27 промптов Midjourney + 17 ULTIMATE V7 промптов (docs/p5-midjourney-prompts.html, docs/p5-ultimate-prompts.html)
- 25 Midjourney-референсов загружены в `desing/` (ref-01 — ref-28)
- 9 HTML-файлов дизайн-системы создано в Cowork и загружено в `desing/`:
  - `ui-kit-car-calc-v6.html` — кнопки, инпуты, карточки, pills, toggle, radio (ФИНАЛЬНЫЙ)
  - `ui-kit-components.html` — inputs, cards, tall cards, badges, dots/bars, palette, spacing
  - `icons-v2.html` — 56 SVG иконок (pixel-perfect, 3D gold on dark)
  - `typography-design-system.html` — шкала, палитра, контраст WCAG AA, сравнение serif-шрифтов
  - `design-system-v2.html` — gold палитра (9 ступеней), 5 вариантов шрифта цены
  - (ещё: ui-kit-car-calc.html, ui-kit-catalog.html, result-screen-v1.html, ref-viewer.html)

### P6 · Фронтенд — 🔄 В ПРОЦЕССЕ (1 из 7 подэтапов)

**P6.1 ✅ Дизайн-токены + UI-компоненты + TelegramProvider** (commit 5f21ffb)

Объединены 5 финальных дизайн-файлов в единую систему:

- `src/styles/design-tokens.ts` — все токены:
  - colors.bg (app, elevated, card, cardHover, input)
  - colors.gold (50–900, 9 ступеней, якорь #C4A265)
  - colors.neutral (50–900), colors.text, colors.border
  - fonts (serif/sans/mono), fontSizes, spacing, radius, shadows, transitions
  - components (button, card, input, pill — готовые стили)

- `tailwind.config.ts` — обновлён:
  - Цвета: bg-*, gold-*, neutral-*, success/error/warning
  - Шрифты: font-serif (Playfair), font-sans (DM Sans), font-mono (JetBrains Mono)
  - Анимации: fade-in, slide-up, count-up, gold-pulse, shimmer

- `src/app/globals.css` — компонентные классы:
  - `.btn-gold` — золотой градиент (135deg, D4B876→C4A265→A08050)
  - `.btn-ghost` — прозрачная с золотым бордером
  - `.card-gold` — карточка с золотым бордером, hover, shadow
  - `.input-gold` — input с золотым focus ring
  - `.pill-gold` — badge
  - `.price-display` — Playfair 48px, цвет #FFE2A9, text-shadow
  - `.divider-gold` — градиентный разделитель
  - `.shimmer` — skeleton loading
  - `.text-gold-gradient` — градиентный текст
  - `.glow-gold`, `.safe-top`, `.safe-bottom`

- `src/app/layout.tsx` — 3 шрифта через next/font (Playfair Display, DM Sans, JetBrains Mono)

- `src/components/TelegramProvider.tsx` — полная интеграция:
  - WebApp.ready(), expand(), setHeaderColor('#0C0C0E')
  - MainButton (цвет gold #C4A265), BackButton, HapticFeedback
  - useTelegram() хук — webApp, user, isReady, isTelegram, haptic
  - Dev-режим (работает без Telegram)

- `src/components/ui/` — React-компоненты:
  - `Button.tsx` — primary (золотой градиент), ghost, danger + loading spinner
  - `Input.tsx` — forwardRef, label, error, suffix, gold focus
  - `Card.tsx` — selected, onClick, glow, hover effects
  - `Pill.tsx` — gold/success/error/neutral, sm/md sizes
  - `Divider.tsx` — золотой градиент
  - `index.ts` — реэкспорт всех

- `src/components/Calculator.tsx` — визард-оболочка:
  - WizardStep: 'country' | 'car' | 'destination' | 'loading' | 'result' | 'lead'
  - WizardState: country, destination, price, year, engineType, horsePower, engineVolume
  - useState для шага и данных
  - Placeholder UI (будет заменён экранами P6.2–P6.7)

**P6.2 · Экран выбора страны — ⏳ СЛЕДУЮЩИЙ**

---

## 🎨 ДИЗАЙН-РЕШЕНИЯ (подтверждены)

- **Шрифт цены:** Playfair Display 400 (элегантный, тонкий)
- **Золотой якорь:** #C4A265 (core), палитра 9 ступеней от #FFE2A9 до #2D1C13
- **Фон приложения:** #0C0C0E (почти чёрный)
- **Фон карточек:** #141418
- **Бордеры:** золотые rgba(196,162,101,0.14), hover 0.25, active solid #C4A265
- **Стиль:** luxury dark gold — чёрное + золото, без ярких цветов
- **Клиент видит ТОЛЬКО итоговую цену** — никакого breakdown

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

## 📁 Структура репо (полная, актуальная после P6.1)

```
car-calc/
├── .env.example
├── .gitignore
├── package.json, tsconfig.json
├── tailwind.config.ts              ✅ gold палитра + анимации
├── postcss.config.js, next.config.js, vitest.config.ts
├── prisma/schema.prisma            ✅ Calculation, Lead, AdminSetting, RateCache
├── desing/                         ✅ 25 PNG референсов + 9 HTML дизайн-файлов
│   ├── ref-01-splash.png ... ref-28-animation.png
│   ├── Style ref.png
│   ├── ui-kit-car-calc-v6.html     ✅ ФИНАЛЬНЫЙ UI Kit
│   ├── ui-kit-components.html      ✅ доп. компоненты
│   ├── icons-v2.html               ✅ 56 SVG иконок
│   ├── typography-design-system.html ✅ типографика + палитра
│   ├── design-system-v2.html       ✅ gold палитра + шрифты цены
│   ├── ui-kit-car-calc.html        (v1, для справки)
│   ├── ui-kit-catalog.html         (каталог, для справки)
│   ├── result-screen-v1.html       (прототип экрана результата)
│   └── ref-viewer.html             (просмотр референсов)
├── docs/
│   ├── P0-MASTER-PLAN.md           ✅ мастер-план
│   ├── api-contract.md             ✅ 3 endpoints
│   ├── master-context.md           ✅ все 11 формул
│   ├── p5-midjourney-prompts.html  ✅ 27 промптов
│   ├── p5-ultimate-prompts.html    ✅ 17 ULTIMATE промптов V7
│   └── research/
│       ├── rates-api.md            ✅ Bybit P2P + ЦБ РФ
│       ├── tks-customs.md          ✅ ЕТТ ЕАЭС ставки
│       ├── util-sbor.md            ✅ утильсбор 2026
│       └── fixed-costs.md          ✅ JSON всех констант
├── src/
│   ├── types/index.ts              ✅ 491 строка, 30+ типов
│   ├── styles/
│   │   └── design-tokens.ts        ✅ ВСЕ токены (P6.1)
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
│   │   ├── layout.tsx              ✅ 3 шрифта next/font (P6.1)
│   │   ├── page.tsx                ✅ TelegramProvider + Calculator
│   │   ├── globals.css             ✅ btn-gold, card-gold, price-display, shimmer
│   │   └── api/
│   │       ├── calculate/route.ts  ✅ POST → {totalRUB}
│   │       ├── rates/route.ts      ✅ GET → курсы
│   │       └── lead/route.ts       ⏳ placeholder
│   ├── lib/
│   │   ├── cache.ts                ✅ TTLCache (stats, cleanup)
│   │   ├── db.ts                   ✅ Prisma singleton
│   │   ├── db-service.ts           ✅ CRUD: Calc, Lead, Admin, RateCache
│   │   ├── logger.ts              ✅ structured JSON logging
│   │   ├── rate-limiter.ts         ✅ 10/30/3 per min
│   │   ├── validation.ts           ✅ Zod schemas + business rules
│   │   └── rates/
│   │       ├── cbr.ts              ✅ ЦБ РФ
│   │       ├── bybit.ts            ✅ Bybit P2P
│   │       └── index.ts            ✅ единый модуль + 3 уровня fallback
│   ├── components/
│   │   ├── TelegramProvider.tsx     ✅ WebApp SDK, haptic, useTelegram() (P6.1)
│   │   ├── Calculator.tsx           ✅ визард-оболочка, WizardStep/WizardState (P6.1)
│   │   ├── ui/                      ✅ (P6.1)
│   │   │   ├── Button.tsx           ✅ primary/ghost/danger + loading
│   │   │   ├── Input.tsx            ✅ gold focus, label, error, suffix
│   │   │   ├── Card.tsx             ✅ selected, onClick, glow, hover
│   │   │   ├── Pill.tsx             ✅ gold/success/error/neutral
│   │   │   ├── Divider.tsx          ✅ золотой градиент
│   │   │   └── index.ts            ✅ реэкспорт
│   │   ├── wizard/                  ⏳ (P6.2–P6.4)
│   │   └── result/                  ⏳ (P6.5)
│   └── bot/                         ⏳ placeholder (P8)
├── tests/
│   ├── calc/
│   │   ├── calc-usa.test.ts         ✅ 18 тестов
│   │   ├── calc-korea.test.ts       ✅ 14 тестов
│   │   ├── calc-uae.test.ts         ✅ 17 тестов
│   │   ├── calc-china.test.ts       ✅ 15 тестов
│   │   ├── util-sbor.test.ts        ✅ 33 теста
│   │   └── master-calculator.test.ts ✅ 19 тестов
│   ├── lib/
│   │   ├── rates.test.ts            ✅ 36 тестов
│   │   └── cache.test.ts            ✅ 24 теста
│   └── api/
│       └── calculate.test.ts        ✅ 49 тестов
└── public/
```

---

## 📊 Git-история (22 коммита)

```
5f21ffb P6.1 ✅ Дизайн-токены + UI-компоненты + TelegramProvider
f5a8b56 Add files via upload (desing/ — 25 PNG + 9 HTML)
f063666 P5.1: ULTIMATE Midjourney V7 промпты — 17 промптов
9b11331 P5.1: Midjourney V7 промпты — 27 промптов
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

### P6 · 📱 Фронтенд (осталось 6 из 7 подэтапов) ← ПРОДОЛЖАЕМ
- **P6.2 · Визард: выбор страны (🇺🇸🇰🇷🇦🇪🇨🇳)** ← СЛЕДУЮЩИЙ
  - 4 карточки стран (Card компонент), по стилю ref-05-country-list.png
  - Заголовок "Откуда везём?"
  - Tap → haptic → setState({country}) → next step
- **P6.3 · Визард: ввод данных авто**
  - Цена (Input с suffix валюты), год (slider/select), двигатель (pills), мощность
  - По стилю ref-07-input-form.png + ref-08-price-input.png + ref-09-engine-type.png
- **P6.4 · Визард: направление (РФ/РБ)**
  - 2 карточки (Россия/Беларусь), по стилю ref-06-destination.png
- **P6.5 · Экран результата: ОДНА ЦИФРА**
  - price-display (Playfair 48px #FFE2A9), count-up анимация
  - Кнопка "Оставить заявку"
  - По стилю ref-12-result-minimal.png + ref-13-result-gradient.png
- **P6.6 · Форма заявки**
  - Имя, телефон → POST /api/lead → успех
  - По стилю ref-16-lead-form.png + ref-17-lead-success.png
- **P6.7 · История расчётов**
  - localStorage, 20 записей
  - По стилю ref-18-history.png

### P7 · 🧪 Тестировщик (5 подэтапов)
- 7.1 · E2E: 20 реальных кейсов
- 7.2 · Edge cases: >$40K, >160лс, электро
- 7.3 · API stress-test
- 7.4 · Playwright тесты визарда
- 7.5 · Финальный прогон

### P8 · 🚀 DevOps (5 подэтапов)
- 8.1 · GitHub Actions (CI)
- 8.2 · VPS: Nginx + SSL + PM2
- 8.3 · Deploy pipeline
- 8.4 · Telegram Bot setup
- 8.5 · Мониторинг

---

## 🎨 Референсы для экранов (в desing/)

| Экран | Референс | Ключевые элементы |
|---|---|---|
| Выбор страны | ref-05-country-list.png | 4 карточки 2×2, золотые бордеры, иконки карт |
| Направление РФ/РБ | ref-06-destination.png | 2 карточки с флагами, золотая CTA внизу |
| Ввод данных | ref-07-input-form.png | Форма с секциями, pills типов двигателя |
| Ввод цены | ref-08-price-input.png | Большая цена золотом, numpad-стиль |
| Тип двигателя | ref-09-engine-type.png | Горизонтальные pills, slider года |
| Загрузка (круг) | ref-10-loading-circle.png | Золотой progress ring 67%, авто снизу |
| Загрузка (бар) | ref-11-loading-bar.png | Прогресс-бар, процент, данные авто |
| Результат мин | ref-12-result-minimal.png | ОГРОМНАЯ цена, золотые частицы |
| Результат градиент | ref-13-result-gradient.png | Цена со свечением, данные внизу |
| Результат карточка | ref-14-result-card.png | Credit-card стиль, specs внизу |
| Lead форма | ref-16-lead-form.png | Карточка сверху, 3 поля, orange CTA |
| Lead успех | ref-17-lead-success.png | Золотой чекмарк, 2 пункта |
| История | ref-18-history.png | Список карточек расчётов |
| Сравнение | ref-19-compare.png | 2 авто side-by-side, gauges |
| Style ref | Style ref.png | Общий стиль — тёмное + золото + авто |
| Mood | ref-25-mood.png | Автомобиль с gold light trails |

---

## ⚠️ Открытые вопросы

1. **ОАЭ → РБ фиксы:** точная шкала после $20K→530K₽
2. **ОС на VPS:** Ubuntu / Debian — уточнить
3. **Домен для Mini App** — нужен
4. **Telegram Bot токен** — нужен от @BotFather

---

## 💬 Как начать новый чат

Загрузи этот файл в Project. Напиши:

**«Контекст перенесён. P0–P5 завершены, P6.1 готов (дизайн-токены, UI-компоненты, TelegramProvider). Продолжаем с P6.2 — экран выбора страны (🇺🇸🇰🇷🇦🇪🇨🇳). Референс: ref-05-country-list.png. GitHub репо подключено. Продолжай.»**

Claude должен:
1. Клонировать репо, npm install
2. Посмотреть Calculator.tsx (визард-оболочка), ui/ компоненты, design-tokens.ts
3. Посмотреть desing/ref-05-country-list.png (референс)
4. Создать src/components/wizard/StepCountry.tsx
5. Подключить к Calculator.tsx
6. Тесты, пуш, СТОП
