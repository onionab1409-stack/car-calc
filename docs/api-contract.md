# 🌐 API Контракт — Car-Calc
## Версия 1.0 · P1.3 · Архитектор

---

## 📌 Общие правила

- **Base URL:** `https://{domain}/api`
- **Формат:** JSON
- **Кодировка:** UTF-8
- **Аутентификация:** Telegram WebApp initData (HMAC-SHA256)
- **Rate limit:** 10 запросов/минуту на пользователя
- **Клиент видит ТОЛЬКО totalRUB** — никаких breakdown, статей расходов, формул

---

## 1️⃣ POST /api/calculate

### Назначение
Рассчитать полную стоимость доставки автомобиля. Возвращает **ТОЛЬКО итоговую цену в рублях**.

### Запрос

```
POST /api/calculate
Content-Type: application/json
X-Telegram-Init-Data: <initData>  // опционально, для привязки к пользователю
```

#### Body (CalcRequest)

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| country | `"USA" \| "Korea" \| "UAE" \| "China"` | ✅ | Страна отправления |
| destination | `"RU" \| "BY"` | ✅ | Страна назначения |
| price | `number` | ✅ | Цена авто в валюте страны (>0) |
| year | `number` | ✅ | Год выпуска (2000–текущий+1) |
| engineType | `"petrol" \| "diesel" \| "electric" \| "hybrid"` | ✅ | Тип двигателя |
| horsePower | `number` | ✅ | Мощность л.с. (1–2000) |
| engineCC | `number` | ❌ | Объём двигателя см³ (для ТКС) |
| auction | `"copart" \| "iaai" \| "manheim" \| "other"` | ❌ | Аукцион (только USA) |
| isLegalEntity | `boolean` | ❌ | Юрлицо (default: false) |
| make | `string` | ❌ | Марка (для лога) |
| model | `string` | ❌ | Модель (для лога) |

#### Пример запроса

```json
{
  "country": "USA",
  "destination": "RU",
  "price": 25000,
  "year": 2024,
  "engineType": "petrol",
  "horsePower": 150,
  "auction": "copart",
  "make": "Toyota",
  "model": "Camry"
}
```

### Ответ — Успех (200)

```json
{
  "totalRUB": 3972193
}
```

**Только одно число. Больше ничего.**

### Ответ — Ошибка валидации (400)

```json
{
  "error": "Validation failed",
  "details": "price must be greater than 0"
}
```

### Ответ — Ошибка сервера (500)

```json
{
  "error": "Calculation failed",
  "details": "Exchange rates unavailable"
}
```

### Ответ — Rate limit (429)

```json
{
  "error": "Too many requests",
  "details": "Rate limit: 10 requests per minute"
}
```

### Внутренняя логика (скрыта от клиента)

```
1. Zod-валидация входных данных
2. Получение курсов валют (с кэшем TTL 1ч)
3. Определение возрастной категории (under3 / 3to5 / over5)
4. Выбор формулы по country + destination + ageCategory
5. Расчёт через calc-{country}.ts
6. Если >160 л.с. → доплата утильсбора
7. Если 3-5 лет → парсинг tks.ru (или fallback)
8. Формирование CostBreakdown (полная смета)
9. Логирование breakdown в БД (Prisma)
10. Возврат клиенту: { totalRUB }
```

### Валидация (Zod-схема)

```typescript
const CalcRequestSchema = z.object({
  country: z.enum(['USA', 'Korea', 'UAE', 'China']),
  destination: z.enum(['RU', 'BY']),
  price: z.number().positive().max(10_000_000),
  year: z.number().int().min(2000).max(new Date().getFullYear() + 1),
  engineType: z.enum(['petrol', 'diesel', 'electric', 'hybrid']),
  horsePower: z.number().positive().max(2000),
  engineCC: z.number().positive().max(20000).optional(),
  auction: z.enum(['copart', 'iaai', 'manheim', 'other']).optional(),
  isLegalEntity: z.boolean().optional().default(false),
  make: z.string().max(50).optional(),
  model: z.string().max(50).optional(),
});
```

### Бизнес-валидация

| Правило | Ошибка |
|---------|--------|
| UAE → только year ≥ текущий-1 | "UAE accepts only new cars (less than 1 year old)" |
| price > 0 | "Price must be greater than 0" |
| USA без auction → default "other" | — (не ошибка) |
| electric → engineCC игнорируется | — (не ошибка) |

---

## 2️⃣ GET /api/rates

### Назначение
Получить текущие курсы валют (кэшированные). Для отображения актуальности данных в UI.

### Запрос

```
GET /api/rates
```

Без параметров. Без аутентификации.

### Ответ — Успех (200)

```json
{
  "USDT_RUB": 78.50,
  "KRW_RUB": 0.05364,
  "CNY_RUB": 11.40,
  "updatedAt": "2026-02-27T14:30:00.000Z"
}
```

### Ответ — Ошибка (503)

```json
{
  "error": "Rates temporarily unavailable",
  "details": "Bybit API timeout"
}
```

### Внутренняя логика

```
1. Проверить кэш (TTL 1 час)
2. Если кэш валиден → вернуть из кэша
3. Если устарел:
   a. Запросить Bybit P2P API → USDT/RUB
   b. Применить коррекцию MoscaEx (из AdminSettings)
   c. Запросить ЦБ РФ API → KRW/RUB, CNY/RUB
   d. Применить спред ВТБ (из AdminSettings)
   e. Сохранить в кэш + БД (RateCache)
4. Вернуть курсы + timestamp
```

### Кэширование

| Источник | TTL | Fallback |
|----------|-----|----------|
| Bybit P2P | 1 час | Последний кэш из БД |
| ЦБ РФ | 1 час | Последний кэш из БД |
| tks.ru | 24 часа | Свои формулы ЕТТ ЕАЭС |

---

## 3️⃣ POST /api/lead

### Назначение
Сохранить заявку клиента. Отправить уведомление в Telegram-группу.

### Запрос

```
POST /api/lead
Content-Type: application/json
X-Telegram-Init-Data: <initData>  // обязательно
```

#### Body (LeadRequest)

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| telegramUserId | `number` | ✅ | Telegram ID пользователя |
| username | `string` | ❌ | Username Telegram |
| firstName | `string` | ❌ | Имя |
| phone | `string` | ❌ | Телефон (если указал) |
| comment | `string` | ❌ | Комментарий от клиента |
| calcRequest | `CalcRequest` | ✅ | Входные данные расчёта |
| totalRUB | `number` | ✅ | Итоговая цена (для проверки) |

#### Пример запроса

```json
{
  "telegramUserId": 123456789,
  "username": "john_doe",
  "firstName": "Иван",
  "phone": "+79001234567",
  "comment": "Хочу Toyota Camry 2024 из США",
  "calcRequest": {
    "country": "USA",
    "destination": "RU",
    "price": 25000,
    "year": 2024,
    "engineType": "petrol",
    "horsePower": 150
  },
  "totalRUB": 3972193
}
```

### Ответ — Успех (201)

```json
{
  "success": true,
  "leadId": "clx1abc2def3ghi"
}
```

### Ответ — Ошибка (400)

```json
{
  "error": "Validation failed",
  "details": "telegramUserId is required"
}
```

### Внутренняя логика

```
1. Валидация Telegram initData (HMAC-SHA256)
2. Zod-валидация тела запроса
3. Пересчёт totalRUB на сервере (для защиты от подмены)
4. Сохранить Calculation в БД
5. Сохранить Lead в БД (связь с Calculation)
6. Отправить уведомление в Telegram-группу:
   ──────────────────────────
   🚗 Новая заявка!
   👤 @john_doe (Иван)
   📱 +79001234567

   🇺🇸 USA → 🇷🇺 РФ
   Toyota Camry 2024
   $25,000 · 150 л.с.

   💰 Итого: 3 972 193 ₽

   💬 "Хочу Toyota Camry 2024 из США"
   ──────────────────────────
7. Вернуть { success: true, leadId }
```

---

## 🔒 Безопасность

### Telegram initData валидация

```typescript
// Проверка подлинности данных от Telegram WebApp
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

function validateTelegramInitData(initData: string, botToken: string): boolean {
  // 1. Парсим initData как URLSearchParams
  // 2. Извлекаем hash
  // 3. Сортируем остальные параметры
  // 4. Создаём HMAC-SHA256 с секретным ключом бота
  // 5. Сравниваем хэши
}
```

### Rate Limiting

| Endpoint | Лимит | Окно |
|----------|-------|------|
| POST /api/calculate | 10 запросов | 1 минута |
| GET /api/rates | 30 запросов | 1 минута |
| POST /api/lead | 3 запроса | 1 минута |

Реализация: In-memory Map по IP/telegramUserId.

### Защита от подмены

- Клиент отправляет totalRUB — но сервер **пересчитывает** его заново
- Если расхождение > 1% → ошибка (возможна подмена)
- Breakdown всегда формируется на сервере

---

## 📊 HTTP-коды

| Код | Когда |
|-----|-------|
| 200 | Успешный расчёт / получение курсов |
| 201 | Заявка создана |
| 400 | Ошибка валидации входных данных |
| 401 | Невалидный Telegram initData |
| 429 | Rate limit превышен |
| 500 | Внутренняя ошибка сервера |
| 503 | Внешние API недоступны (Bybit, ЦБ) |

---

## 🔄 Диаграмма потока данных

```
Клиент (Mini App)
    │
    ├── POST /api/calculate ──→ Zod ──→ Rates (cache) ──→ calc-*.ts ──→ { totalRUB }
    │                                                          │
    │                                                     [CostBreakdown]
    │                                                          │
    │                                                     БД: Calculation
    │
    ├── GET /api/rates ──→ Cache ──→ Bybit / ЦБ ──→ { rates }
    │
    └── POST /api/lead ──→ Zod ──→ Пересчёт ──→ БД: Lead ──→ Telegram уведомление
```

---

## 📁 Файлы реализации

| Endpoint | Файл | Project |
|----------|------|---------|
| POST /api/calculate | `src/app/api/calculate/route.ts` | P4 (4.2) |
| GET /api/rates | `src/app/api/rates/route.ts` | P4 (4.1) |
| POST /api/lead | `src/app/api/lead/route.ts` | P4 (4.4) |
| Zod-схемы | `src/lib/validation.ts` | P4 (4.2) |
| Rate limiter | `src/lib/rate-limiter.ts` | P4 (4.2) |
| Telegram валидация | `src/lib/telegram-auth.ts` | P4 (4.2) |
