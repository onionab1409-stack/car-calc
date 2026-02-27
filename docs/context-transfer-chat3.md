# 🚗 Контекст переноса — Car-Calc · Чат 3→4
## Перенос · 27 февраля 2026

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
npm install
```

---

## ✅ ЧТО СДЕЛАНО (всё запушено в GitHub)

### P0 · PM — ✅ ЗАВЕРШЁН
- `docs/P0-MASTER-PLAN.md`

### P1 · Архитектор — ✅ ЗАВЕРШЁН (все 4 подэтапа)
- P1.1 ✅ Структура репо (Next.js 14 + TypeScript + Tailwind + Prisma + Grammy.js)
- P1.2 ✅ Модели данных (`src/types/index.ts` — 491 строка, 30+ типов)
- P1.3 ✅ API контракт (`docs/api-contract.md`)
- P1.4 ✅ Мастер-контекст (`docs/master-context.md`)

### P2 · Исследователь — ✅ ЗАВЕРШЁН (все 4 подэтапа)
- P2.1 ✅ API курсов (`docs/research/rates-api.md`) — Bybit P2P без авторизации, ЦБ РФ
- P2.2 ✅ ЕТТ ЕАЭС (`docs/research/tks-customs.md`) — свои формулы вместо парсинга tks.ru
- P2.3 ✅ Утильсбор >160 л.с. (`docs/research/util-sbor.md`) — полные таблицы 2026, постановление №1713
- P2.4 ✅ JSON фиксов (`docs/research/fixed-costs.md`) — все константы в одном файле

### P3 · Таможенник — 🔄 В ПРОЦЕССЕ (1 из 7 подэтапов)

**P3.1 · calc-usa.ts — ✅ ЗАВЕРШЁН**
- `src/calc/data/constants.ts` — ВСЕ константы для всех 4 стран:
  - Коэффициенты (USA, Korea, UAE, China)
  - Таблицы ФИКСов (USA_RU, USA_BY, UAE_RU, UAE_BY) с overflow-логикой
  - Ставки ЕТТ ЕАЭС (3-5 лет, 5+ лет)
  - Функции: `lookupFixedCost()`, `calcETT()`
- `src/calc/calc-usa.ts` — калькулятор USA:
  - `calcUSA(car, rates, eurRate?)` → CalcResult (totalRUB + breakdown)
  - `calcUSAQuick(lotUSD, dest, usdtRate)` → number
  - `calcUSAComponents(lotUSD, dest)` → разбивка в USD
  - До 3 лет: ×0.48 РФ / ×0.30 РБ
  - 3-5 и 5+ лет: ЕТТ ЕАЭС
- `tests/calc/calc-usa.test.ts` — **18 тестов, все прошли ✅**
  - Эталоны: USA→РБ $15K = 2,351K₽ ✅ | USA→РФ $25K = 3,972K₽ ✅

**P3.2 · calc-korea.ts — ⏳ СЛЕДУЮЩИЙ**
**P3.3 · calc-uae.ts — ⏳**
**P3.4 · calc-china.ts — ⏳**
**P3.5 · util-sbor.ts — ⏳ (таблицы утильсбора для >160 л.с.)**
**P3.6 · master-calculator.ts — ⏳ (роутер по странам)**
**P3.7 · Тесты для всех формул — ⏳**

---

## 💱 ФОРМУЛЫ (краткая сводка)

### USA → РФ (до 3 лет, ≤160 л.с.)
```
dollarPart = (lot × 1.08 + 2200 + 750) × 1.011 + (lot × 1.08 + 2200) × 0.48
totalRUB = dollarPart × USDT_rate + ФИКС
Фиксы: ≤$20K→425K₽ | ≤$30K→495K₽ | ≤$40K→575K₽ | далее +100K₽/$10K
```

### USA → РБ (до 3 лет, ≤160 л.с.)
```
dollarPart = (lot × 1.08 + 2200 + 750) × 1.011 + (lot × 1.08) × 0.30
totalRUB = dollarPart × USDT_rate + ФИКС
Фиксы: ≤$20K→450K₽ | ≤$30K→520K₽ | ≤$40K→600K₽ | далее +100K₽/$10K
```

### USA → РФ (3–5 лет): базовая часть + ЕТТ ЕАЭС вместо ×0.48

### Корея → РФ (до 3 лет)
```
totalRUB = priceKRW × (CBR_rate + vtb_spread) × 1.48 + 90,000₽ + 600,000₽
```

### Корея → РБ (до 3 лет)
```
totalRUB = priceKRW × (CBR_rate + vtb_spread) × 1.30 + 90,000₽ + 720,000₽
```

### Корея → РФ (3–5 лет): priceRUB + 90K + ЕТТ_ЕАЭС + 600K

### ОАЭ → РФ (только новые)
```
priceUSD = priceAED / 3.67 + 1600
totalRUB = priceUSD × USDT_rate × 1.48 + ФИКС
Фиксы: ≤$20K→440K₽ | ≤$30K→460K₽ | ≤$40K→510K₽ | ≤$50K→560K₽ | далее +100K₽/$10K
```

### ОАЭ → РБ (только новые)
```
priceUSD = priceAED / 3.67 + 1600
totalRUB = priceUSD × USDT_rate × 1.30 + ФИКС
Фиксы: ≤$20K→530K₽ | далее ⚠️ УТОЧНИТЬ (экстраполяция: +50K до $50K, потом +100K/$10K)
```

### Китай → РФ (до 3 лет)
```
baseCNY = priceCNY + 8000 + priceCNY × 0.025
totalRUB = baseCNY × (CBR_rate + vtb_spread) × 1.48 + 590,000₽
```
**Важно:** 2.5% считается от цены авто (без 8000¥)

### Китай → РБ (до 3 лет)
```
baseCNY = priceCNY + 8000 + priceCNY × 0.025
totalRUB = baseCNY × (CBR_rate + vtb_spread) × 1.30 + 720,000₽
```

### Китай → РФ (3–5 лет): baseCNY × курс + ЕТТ_ЕАЭС + 590K

### >160 л.с. → + коммерческий утильсбор из таблицы (P2.3)

---

## 🏛️ УТИЛЬСБОР — ключевые правила

- Базовая ставка = 20 000₽ × коэффициент
- **Льготный** (≤160 л.с. И объём ≤3.0L): 3 400₽ (до 3 лет) / 5 200₽ (3+ лет) — уже ВКЛЮЧЁН в ФИКС
- **Коммерческий** (>160 л.с. ИЛИ объём >3.0L ИЛИ электро >80 л.с.): от 307K₽ до 4.5М₽
- Доплата = коммерческий − льготный
- Полные таблицы в `docs/research/util-sbor.md`
- Диапазоны объёма: ≤1.0L | 1.0-2.0L | 2.0-3.0L | 3.0-3.5L | >3.5L
- Диапазоны мощности: шаг ~30 л.с. (≤160, 160-190, 190-220, ..., >500)

---

## 📊 Эталонные расчёты (курсы 27.02.2026: USDT 78.50₽, CNY 11.40₽, KRW 0.05364₽)

| # | Направление | Авто | Итого |
|---|---|---|---|
| 1 | 🇺🇸 USA → РБ | $15K, 150лс | **2 351 000 ₽** ✅ тест прошёл |
| 2 | 🇺🇸 USA → РФ | $25K, 150лс | **3 972 000 ₽** ✅ тест прошёл |
| 3 | 🇰🇷 Корея → РФ | 35M₩, 150лс | **3 469 000 ₽** |
| 4 | 🇰🇷 Корея → РБ | 28M₩, 130лс | **2 762 000 ₽** |
| 5 | 🇦🇪 ОАЭ → РФ | 120K AED, 150лс | **4 495 000 ₽** |
| 6 | 🇦🇪 ОАЭ → РБ | 90K AED, 150лс | **3 246 000 ₽** |
| 7 | 🇨🇳 Китай → РФ | 180K¥, 150лс | **3 838 000 ₽** |
| 8 | 🇨🇳 Китай → РБ | 150K¥, 120лс | **3 117 000 ₽** |

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
├── docs/
│   ├── P0-MASTER-PLAN.md
│   ├── api-contract.md
│   ├── master-context.md
│   └── research/
│       ├── rates-api.md          (P2.1)
│       ├── tks-customs.md        (P2.2)
│       ├── util-sbor.md          (P2.3)
│       └── fixed-costs.md        (P2.4)
├── src/
│   ├── types/
│   │   └── index.ts              (491 строк, 30+ типов)
│   ├── calc/
│   │   ├── index.ts              (placeholder — P3.6)
│   │   ├── calc-usa.ts           ✅ ГОТОВ
│   │   └── data/
│   │       └── constants.ts      ✅ ВСЕ константы для всех стран
│   ├── app/api/                  (placeholders)
│   ├── lib/
│   │   ├── cache.ts              (TTLCache — работает!)
│   │   ├── db.ts, logger.ts
│   │   └── rates/                (placeholders)
│   ├── bot/                      (placeholders)
│   └── components/               (placeholders)
├── tests/
│   └── calc/
│       └── calc-usa.test.ts      ✅ 18 тестов passed
└── prisma/schema.prisma
```

---

## 📐 ОСТАВШИЕСЯ ЭТАПЫ

### P3 · Таможенник (осталось 6 из 7):
- **P3.2 · calc-korea.ts** ← СЛЕДУЮЩИЙ
- P3.3 · calc-uae.ts
- P3.4 · calc-china.ts
- P3.5 · util-sbor.ts (таблицы коммерческого утильсбора для >160 л.с.)
- P3.6 · master-calculator.ts (роутер)
- P3.7 · Тесты всех 8 эталонных расчётов

### P4 · Бэкенд (5 подэтапов):
- 4.1 Модуль курсов (Bybit + ЦБ + кэш)
- 4.2 API route POST /api/calculate
- 4.3 Кэш с TTL
- 4.4 Prisma + SQLite
- 4.5 Серверное логирование breakdown

### P5 · Дизайнер (4 подэтапа)
### P6 · Фронтенд (7 подэтапов)
### P7 · Тестировщик (5 подэтапов)
### P8 · DevOps (5 подэтапов)

---

## ⚠️ Открытые вопросы

1. **ОАЭ → РБ фиксы:** точная шкала после $20K→530K₽
2. **ОС на VPS:** Ubuntu / Debian
3. **Домен для Mini App**
4. **Telegram Bot токен**
5. **Midjourney референсы для дизайна**

---

## 💬 Как начать новый чат

Загрузи этот файл в Project. Напиши:

**«Контекст перенесён. Продолжаем с подэтапа P3.2 — calc-korea.ts (Корея → РФ/РБ). GitHub репо подключено. Продолжай.»**

Claude должен:
1. Клонировать репо: `git clone ...`
2. Посмотреть существующие файлы (constants.ts, calc-usa.ts, types)
3. Создать calc-korea.ts по аналогии с calc-usa.ts
4. Написать тесты с эталонами (Корея→РФ 35M₩=3,469K₽ / Корея→РБ 28M₩=2,762K₽)
5. Запустить тесты, запушить в GitHub
6. СТОП → ждать «продолжай»
