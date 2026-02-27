# 🔎 P2 · Исследование API курсов валют
## Подэтап 2.1 · 27 февраля 2026

---

## 1. ЦБ РФ (cbr-xml-daily.ru)

### Endpoint
```
GET https://www.cbr-xml-daily.ru/daily_json.js
```

### Аутентификация
**Не требуется.** Публичный API.

### Rate Limits
- Не более 5 запросов/сек
- Не более 120 запросов/мин
- Не более 10,000 запросов/сутки
- **Наш план:** 1 запрос/час (TTL кэша) = ~24 запроса/сутки ✅

### Формат ответа (JSON)
```json
{
  "Date": "2026-02-28T11:30:00+03:00",
  "PreviousDate": "2026-02-27T11:30:00+03:00",
  "Timestamp": "2026-02-27T18:00:00+03:00",
  "Valute": {
    "KRW": {
      "ID": "R01815",
      "NumCode": "410",
      "CharCode": "KRW",
      "Nominal": 1000,
      "Name": "Вон",
      "Value": 54.2461,
      "Previous": 53.7322
    },
    "CNY": {
      "ID": "R01375",
      "NumCode": "156",
      "CharCode": "CNY",
      "Nominal": 1,
      "Name": "Юань",
      "Value": 11.2394,
      "Previous": 11.2487
    },
    "USD": {
      "ID": "R01235",
      "NumCode": "840",
      "CharCode": "USD",
      "Nominal": 1,
      "Name": "Доллар США",
      "Value": 77.2736,
      "Previous": 77.1218
    },
    "AED": {
      "ID": "R01230",
      "NumCode": "784",
      "CharCode": "AED",
      "Nominal": 1,
      "Name": "Дирхам ОАЭ",
      "Value": 21.0411,
      "Previous": 20.9998
    }
  }
}
```

### ⚠️ ВАЖНО: Nominal у KRW = 1000
KRW Value = 54.2461 — это за **1000** вон.
Чтобы получить курс за 1 KRW: `Value / Nominal = 54.2461 / 1000 = 0.05425 ₽`

### Код извлечения (TypeScript)
```typescript
interface CBRResponse {
  Date: string;
  Valute: Record<string, {
    CharCode: string;
    Nominal: number;
    Value: number;
    Previous: number;
  }>;
}

async function getCBRRates(): Promise<{ KRW_RUB: number; CNY_RUB: number }> {
  const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
  const data: CBRResponse = await res.json();

  const krw = data.Valute.KRW;
  const cny = data.Valute.CNY;

  return {
    KRW_RUB: krw.Value / krw.Nominal,  // 54.2461 / 1000 = 0.05425
    CNY_RUB: cny.Value / cny.Nominal,  // 11.2394 / 1 = 11.2394
  };
}
```

### Fallback
- Альтернативный домен: `https://www.cbr-xml-daily.com/daily_json.js`
- Прямой ЦБ (XML): `https://www.cbr.ru/scripts/XML_daily.asp`
- Последний кэш из БД (RateCache)

### Реальные курсы на 27.02.2026
| Валюта | Nominal | Value | За 1 ед. |
|--------|---------|-------|----------|
| USD | 1 | 77.2736 | 77.2736 ₽ |
| CNY | 1 | 11.2394 | 11.2394 ₽ |
| KRW | 1000 | 54.2461 | 0.05425 ₽ |
| AED | 1 | 21.0411 | 21.0411 ₽ |

---

## 2. Bybit P2P API

### Endpoint
```
POST https://api2.bybit.com/fiat/otc/item/online
Content-Type: application/json
```

### Аутентификация
**Не требуется!** Публичный endpoint (OTC/P2P marketplace).

### Параметры запроса
```json
{
  "userId": "",
  "tokenId": "USDT",
  "currencyId": "RUB",
  "payment": [],
  "side": "1",
  "size": "10",
  "page": "1"
}
```

| Параметр | Описание |
|----------|----------|
| tokenId | Криптовалюта: "USDT" |
| currencyId | Фиат: "RUB" |
| side | "1" = покупка USDT (нам нужен этот, чтобы знать за сколько рублей продают USDT) |
| size | Количество объявлений (1–20) |
| page | Страница |

### Формат ответа
```json
{
  "ret_code": 0,
  "ret_msg": "SUCCESS",
  "result": {
    "count": 917,
    "items": [
      {
        "id": "2027402128148025344",
        "nickName": "arbitrashnocard",
        "tokenId": "USDT",
        "currencyId": "RUB",
        "side": 1,
        "price": "77.00",
        "lastQuantity": "9",
        "minAmount": "500.00",
        "maxAmount": "693.00",
        "payments": ["14"],
        "isOnline": true
      }
    ]
  }
}
```

### Реальные цены на 27.02.2026
```
Топ-5 цен покупки USDT за RUB:
  77.00₽ — arbitrashnocard
  77.10₽ — vanvokk
  77.19₽ — Crypt0PRO
  77.20₽ — cash_chicago_ny
  77.25₽ — SwapEx
```

### Алгоритм получения курса
```typescript
async function getBybitUSDTRate(): Promise<number> {
  const res = await fetch('https://api2.bybit.com/fiat/otc/item/online', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: '',
      tokenId: 'USDT',
      currencyId: 'RUB',
      payment: [],
      side: '1',
      size: '10',
      page: '1',
    }),
  });

  const data = await res.json();
  const items = data.result.items;

  // Берём топ-5 по цене, фильтруем мелкие объявления (< 50K₽)
  const validPrices = items
    .filter((item: any) => parseFloat(item.maxAmount) >= 50000)
    .slice(0, 5)
    .map((item: any) => parseFloat(item.price));

  // Медиана (устойчива к выбросам)
  const sorted = validPrices.sort((a: number, b: number) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];

  return median;
}
```

### ⚠️ Важные нюансы
1. **Фильтрация мелких объявлений** — цены в объявлениях до 1000₽ часто нерелевантны (арбитражники, мошенники)
2. **Медиана вместо среднего** — устойчива к выбросам
3. **side=1 (покупка)** — это цены, по которым люди ПОКУПАЮТ USDT за рубли, т.е. цена продажи USDT
4. **Коррекция MoscaEx** — добавляется из админки: `finalRate = bybitMedian + correction`

### Rate Limits
- Документация не указывает лимиты для этого endpoint
- Рекомендация: не более 1 запроса в минуту
- **Наш план:** 1 запрос/час ✅

### Fallback
1. Попробовать `api2.bybit.com` → если не работает
2. Попробовать `api.bybit.com` → если не работает
3. Использовать последний кэш из БД (RateCache)
4. Если кэш старше 24ч → уведомить админа через Telegram

---

## 3. Итоговая формула курсов

```typescript
// USDT/RUB (для USA и UAE)
USDT_RUB = getBybitMedian() + adminSettings.usdtCorrection
// Пример: 77.19 + 1.50 = 78.69₽

// KRW/RUB (для Кореи)
KRW_RUB = getCBR('KRW').Value / getCBR('KRW').Nominal + adminSettings.vtbSpreadKRW
// Пример: 54.2461 / 1000 + 0.00050 = 0.05475₽

// CNY/RUB (для Китая)
CNY_RUB = getCBR('CNY').Value / getCBR('CNY').Nominal + adminSettings.vtbSpreadCNY
// Пример: 11.2394 / 1 + 0.30 = 11.5394₽
```

---

## 4. Рекомендации для реализации (P4)

| Параметр | Значение |
|----------|----------|
| TTL кэша Bybit | 1 час |
| TTL кэша ЦБ | 1 час |
| Fallback Bybit | api.bybit.com → кэш БД → алерт |
| Fallback ЦБ | cbr-xml-daily.com → cbr.ru XML → кэш БД |
| Минимальный maxAmount для фильтрации | 50,000₽ |
| Метод агрегации | Медиана топ-5 |
| Хранение | RateCache (Prisma) + TTLCache (in-memory) |
