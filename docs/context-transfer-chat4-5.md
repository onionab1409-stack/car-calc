# 🚗 Контекст переноса — Car-Calc · Чат 4→5
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
### P1 · Архитектор — ✅ ЗАВЕРШЁН (4/4)
### P2 · Исследователь — ✅ ЗАВЕРШЁН (4/4)
### P3 · Таможенник — ✅ ЗАВЕРШЁН (7/7) · 116 тестов passed

**P3.1** ✅ calc-usa.ts — USA → РФ/РБ (18 тестов)
- calcUSA(), calcUSAQuick(), calcUSAComponents()
- До 3 лет: ×0.48 РФ / ×0.30 РБ | 3-5/5+: ЕТТ ЕАЭС
- Эталоны: USA→РБ $15K=2,351K₽ ✅ | USA→РФ $25K=3,972K₽ ✅

**P3.2** ✅ calc-korea.ts — Корея → РФ/РБ (14 тестов)
- calcKorea(), calcKoreaQuick(), calcKoreaComponents()
- До 3 лет: priceKRW × KRW_RUB × 1.48/1.30 + 90K + fix
- Эталоны: KR→РФ 35M₩=3,469K₽ ✅ | KR→РБ 28M₩=2,762K₽ ✅

**P3.3** ✅ calc-uae.ts — ОАЭ → РФ/РБ (17 тестов)
- calcUAE(), calcUAEQuick(), calcUAEComponents()
- (AED/3.67 + $1600) × USDT_rate × 1.48/1.30 + fix(priceUSD)
- ⚠️ Только новые авто (до 3 лет)
- Эталоны: UAE→РФ 120K AED=4,495K₽ ✅ | UAE→РБ 90K AED=3,246K₽ ✅

**P3.4** ✅ calc-china.ts — Китай → РФ/РБ (15 тестов)
- calcChina(), calcChinaQuick(), calcChinaComponents()
- (priceCNY + 8000 + price×0.025) × CNY_RUB × 1.48/1.30 + fix
- ⚠️ 2.5% от ЦЕНЫ авто (без 8000¥)
- Эталоны: CN→РФ 180K¥=3,838K₽ ✅ | CN→РБ 150K¥=3,117K₽ ✅

**P3.5** ✅ util-sbor-rates.ts — утильсбор 2026 (33 теста)
- Полные таблицы: 5 диапазонов объёма × 13 мощности + электро
- calcUtilSbor(), calcUtilSborExtra(), isPreferentialUtilSbor()
- ≤160лс И ≤3.0L → льготный (3,400/5,200₽, в ФИКСе)
- >3.0L → коммерческий ДАЖЕ для ≤160лс
- Электро: 30мин = пиковая × 0.7355 × 0.45

**P3.6** ✅ index.ts — мастер-калькулятор (19 тестов)
- calculate(car, rates, eurRate?) — единая точка входа
- Роутер по стране + автоматическая доплата утильсбора
- calculateQuick() — быстрый расчёт для UI
- Реэкспорт всех модулей

**P3.7** ✅ Все 8 эталонов через calculate() ± 0.5%

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
### 3-5/5+ лет: базовая часть + ЕТТ ЕАЭС вместо множителя
### >160лс: + коммерческий утильсбор из таблицы

---

## 💱 Курсы валют

### USDT/RUB (США, ОАЭ): Bybit P2P + коррекция MoscaEx
### KRW, CNY/RUB (Корея, Китай): ЦБ РФ + спред ВТБ

---

## 🔧 Стек

- Next.js 14 · TypeScript · Tailwind
- Grammy.js (Telegram Bot)
- Prisma + SQLite · Vitest
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
│       ├── rates-api.md
│       ├── tks-customs.md
│       ├── util-sbor.md
│       └── fixed-costs.md
├── src/
│   ├── types/index.ts                    (491 строк, 30+ типов)
│   ├── calc/
│   │   ├── index.ts                      ✅ мастер-калькулятор (P3.6)
│   │   ├── calc-usa.ts                   ✅ (P3.1)
│   │   ├── calc-korea.ts                 ✅ (P3.2)
│   │   ├── calc-uae.ts                   ✅ (P3.3)
│   │   ├── calc-china.ts                 ✅ (P3.4)
│   │   └── data/
│   │       ├── constants.ts              ✅ все константы всех стран
│   │       └── util-sbor-rates.ts        ✅ утильсбор 2026 (P3.5)
│   ├── app/api/                          (placeholders)
│   ├── lib/
│   │   ├── cache.ts                      (TTLCache — работает!)
│   │   ├── db.ts, logger.ts
│   │   └── rates/                        (placeholders)
│   ├── bot/                              (placeholders)
│   └── components/                       (placeholders)
├── tests/calc/
│   ├── calc-usa.test.ts                  ✅ 18 тестов
│   ├── calc-korea.test.ts                ✅ 14 тестов
│   ├── calc-uae.test.ts                  ✅ 17 тестов
│   ├── calc-china.test.ts                ✅ 15 тестов
│   ├── util-sbor.test.ts                 ✅ 33 теста
│   └── master-calculator.test.ts         ✅ 19 тестов (8 эталонов)
└── prisma/schema.prisma
```

---

## 📐 ОСТАВШИЕСЯ ЭТАПЫ

### P4 · Бэкенд (5 подэтапов) ← СЛЕДУЮЩИЙ
- **4.1 Модуль курсов** (Bybit P2P + ЦБ РФ + кэш)
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

**«Контекст перенесён. P0–P3 завершены (116 тестов). Продолжаем с P4 · Бэкенд, подэтап 4.1 — модуль курсов валют (Bybit P2P API + ЦБ РФ + кэш). GitHub репо подключено. Продолжай.»**

Claude должен:
1. Клонировать репо, npm install
2. Посмотреть docs/research/rates-api.md (там исследование Bybit и ЦБ)
3. Посмотреть src/lib/rates/ (placeholders)
4. Реализовать bybit.ts, cbr.ts, index.ts
5. Тесты, пуш, СТОП
