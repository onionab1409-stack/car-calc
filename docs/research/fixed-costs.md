# P2.4 · JSON с фиксированными суммами
## Исследование · 27 февраля 2026

---

## 📌 Назначение

Единый источник ВСЕХ числовых констант калькулятора.
Этот файл → превращается в `src/calc/data/constants.ts` на этапе P3.

---

## 🇺🇸 USA (Copart / IAAI)

### Коэффициенты формулы

```json
{
  "usa": {
    "auctionFeeMultiplier": 1.08,
    "comment_auctionFee": "8% средний buyer fee Copart/IAAI",
    
    "inlandShippingUSD": 750,
    "comment_inland": "доставка до порта в США (средняя)",
    
    "oceanShippingUSD": 2200,
    "comment_ocean": "морская доставка USA → Владивосток (контейнер)",
    
    "insuranceMultiplier": 1.011,
    "comment_insurance": "страховка 1.1% от суммы",
    
    "customsMultiplierRU": 0.48,
    "comment_customsRU": "таможня РФ 48% (до 3 лет, физлицо)",
    "customsBaseRU": "lot * 1.08 + 2200",
    "comment_customsBaseRU": "база для 48%: лот с аукц.сбором + доставка",
    
    "customsMultiplierBY": 0.30,
    "comment_customsBY": "таможня РБ 30% (до 3 лет)",
    "customsBaseBY": "lot * 1.08",
    "comment_customsBaseBY": "база для 30%: только лот с аукц.сбором (БЕЗ доставки)"
  }
}
```

### Формулы (напоминание)

**USA → РФ (до 3 лет, ≤160 л.с.):**
```
dollarPart = (lot × 1.08 + 2200 + 750) × 1.011 + (lot × 1.08 + 2200) × 0.48
totalRUB = dollarPart × USDT_rate + fixRU(lot)
```

**USA → РБ (до 3 лет, ≤160 л.с.):**
```
dollarPart = (lot × 1.08 + 2200 + 750) × 1.011 + (lot × 1.08) × 0.30
totalRUB = dollarPart × USDT_rate + fixBY(lot)
```

### ФИКСы USA → РФ

```json
{
  "fixedCosts_USA_RU": [
    { "maxLotUSD": 20000,  "fixRUB": 425000 },
    { "maxLotUSD": 30000,  "fixRUB": 495000 },
    { "maxLotUSD": 40000,  "fixRUB": 575000 },
    { "maxLotUSD": 50000,  "fixRUB": 675000 },
    { "maxLotUSD": 60000,  "fixRUB": 775000 },
    { "maxLotUSD": 70000,  "fixRUB": 875000 },
    { "maxLotUSD": 80000,  "fixRUB": 975000 },
    { "maxLotUSD": 90000,  "fixRUB": 1075000 },
    { "maxLotUSD": 100000, "fixRUB": 1175000 }
  ],
  "comment": "Шаг: +100K₽ за каждые $10K свыше $40K"
}
```

### ФИКСы USA → РБ

```json
{
  "fixedCosts_USA_BY": [
    { "maxLotUSD": 20000,  "fixRUB": 450000 },
    { "maxLotUSD": 30000,  "fixRUB": 520000 },
    { "maxLotUSD": 40000,  "fixRUB": 600000 },
    { "maxLotUSD": 50000,  "fixRUB": 700000 },
    { "maxLotUSD": 60000,  "fixRUB": 800000 },
    { "maxLotUSD": 70000,  "fixRUB": 900000 },
    { "maxLotUSD": 80000,  "fixRUB": 1000000 },
    { "maxLotUSD": 90000,  "fixRUB": 1100000 },
    { "maxLotUSD": 100000, "fixRUB": 1200000 }
  ],
  "comment": "Шаг: +100K₽ за каждые $10K свыше $40K"
}
```

---

## 🇰🇷 Корея

### Коэффициенты

```json
{
  "korea": {
    "logisticsFlatRUB": 90000,
    "comment_logistics": "фиксированная логистика (доставка + фрахт KR→Владивосток)",
    
    "customsMultiplierRU": 1.48,
    "comment_customsRU": "множитель таможни РФ (включает пошлину, НДС и т.д.)",
    
    "customsMultiplierBY": 1.30,
    "comment_customsBY": "множитель таможни РБ",
    
    "fixedRU_RUB": 600000,
    "comment_fixedRU": "фикс РФ (СБКТС + ЭПТС + брокер + маржа + внутренняя доставка)",
    
    "fixedBY_RUB": 720000,
    "comment_fixedBY": "фикс РБ (СБКТС + ЭПТС + брокер + маржа + доставка в РБ)"
  }
}
```

### Формулы

**Корея → РФ (до 3 лет, ≤160 л.с.):**
```
totalRUB = priceKRW × (CBR_KRW_rate + vtb_spread) × 1.48 + 90000 + 600000
```

**Корея → РБ (до 3 лет, ≤160 л.с.):**
```
totalRUB = priceKRW × (CBR_KRW_rate + vtb_spread) × 1.30 + 90000 + 720000
```

**Корея → РФ (3–5 лет):**
```
priceRUB = priceKRW × (CBR_KRW_rate + vtb_spread)
totalRUB = priceRUB + 90000 + ТКС(car) + 600000
```
> ТКС = расчёт по формулам ЕТТ ЕАЭС (из P2.2)

---

## 🇦🇪 ОАЭ (только новые авто)

### Коэффициенты

```json
{
  "uae": {
    "aedToUsdRate": 3.67,
    "comment_aedUsd": "фиксированный курс AED/USD (привязан)",
    
    "shippingUSD": 1600,
    "comment_shipping": "морская доставка ОАЭ → Новороссийск",
    
    "customsMultiplierRU": 1.48,
    "customsMultiplierBY": 1.30
  }
}
```

### Формулы

**ОАЭ → РФ (новые, ≤160 л.с.):**
```
priceUSD = priceAED / 3.67 + 1600
totalRUB = priceUSD × USDT_rate × 1.48 + fixRU(priceUSD)
```

**ОАЭ → РБ (новые, ≤160 л.с.):**
```
priceUSD = priceAED / 3.67 + 1600
totalRUB = priceUSD × USDT_rate × 1.30 + fixBY(priceUSD)
```

### ФИКСы ОАЭ → РФ

```json
{
  "fixedCosts_UAE_RU": [
    { "maxPriceUSD": 20000,  "fixRUB": 440000 },
    { "maxPriceUSD": 30000,  "fixRUB": 460000 },
    { "maxPriceUSD": 40000,  "fixRUB": 510000 },
    { "maxPriceUSD": 50000,  "fixRUB": 560000 },
    { "maxPriceUSD": 60000,  "fixRUB": 660000 },
    { "maxPriceUSD": 70000,  "fixRUB": 760000 },
    { "maxPriceUSD": 80000,  "fixRUB": 860000 },
    { "maxPriceUSD": 90000,  "fixRUB": 960000 },
    { "maxPriceUSD": 100000, "fixRUB": 1060000 }
  ],
  "comment": "Шаг: +100K₽ за каждые $10K свыше $50K"
}
```

### ФИКСы ОАЭ → РБ

```json
{
  "fixedCosts_UAE_BY": [
    { "maxPriceUSD": 20000,  "fixRUB": 530000 },
    { "maxPriceUSD": 30000,  "fixRUB": 580000 },
    { "maxPriceUSD": 40000,  "fixRUB": 630000 },
    { "maxPriceUSD": 50000,  "fixRUB": 680000 },
    { "maxPriceUSD": 60000,  "fixRUB": 780000 },
    { "maxPriceUSD": 70000,  "fixRUB": 880000 },
    { "maxPriceUSD": 80000,  "fixRUB": 980000 },
    { "maxPriceUSD": 90000,  "fixRUB": 1080000 },
    { "maxPriceUSD": 100000, "fixRUB": 1180000 }
  ],
  "comment": "⚠️ УТОЧНИТЬ: подтверждены только ≤$20K → 530K₽. Остальное — экстраполяция +50K₽ шаг до $50K, потом +100K₽/$10K"
}
```

> ⚠️ **ОТКРЫТЫЙ ВОПРОС:** ОАЭ → РБ фиксы после $20K не подтверждены. Значения выше — предполагаемые. Требуется уточнение у заказчика.

---

## 🇨🇳 Китай

### Коэффициенты

```json
{
  "china": {
    "logisticsCNY": 8000,
    "comment_logistics": "логистика в Китае (доставка до порта + фрахт CN→Владивосток)",
    
    "insuranceRate": 0.025,
    "comment_insurance": "страховка 2.5% от цены авто (не от цены+логистика!)",
    
    "customsMultiplierRU": 1.48,
    "customsMultiplierBY": 1.30,
    
    "fixedRU_RUB": 590000,
    "comment_fixedRU": "фикс РФ (СБКТС + ЭПТС + брокер + маржа + доставка)",
    
    "fixedBY_RUB": 720000,
    "comment_fixedBY": "фикс РБ"
  }
}
```

### Формулы

**Китай → РФ (до 3 лет, ≤160 л.с.):**
```
baseCNY = priceCNY + 8000 + priceCNY × 0.025
rateRUB = CBR_CNY_rate + vtb_spread
totalRUB = baseCNY × rateRUB × 1.48 + 590000
```

**Китай → РБ (до 3 лет, ≤160 л.с.):**
```
baseCNY = priceCNY + 8000 + priceCNY × 0.025
rateRUB = CBR_CNY_rate + vtb_spread
totalRUB = baseCNY × rateRUB × 1.30 + 720000
```

**Китай → РФ (3–5 лет):**
```
baseCNY = priceCNY + 8000 + priceCNY × 0.025
priceRUB = baseCNY × rateRUB
totalRUB = priceRUB + ТКС(car) + 590000
```

---

## 💱 Курсы валют

### USDT / RUB (для 🇺🇸 🇦🇪)

```json
{
  "usdt": {
    "source": "Bybit P2P API",
    "endpoint": "POST https://api2.bybit.com/fiat/otc/item/online",
    "algorithm": "median of top-5 ads where maxAmount >= 50000",
    "correctionField": "admin_correction_rub",
    "formula": "USDT_RUB = bybit_median + admin_correction",
    "cacheTTL_minutes": 5,
    "example": {
      "bybit_median": 77.00,
      "admin_correction": 1.50,
      "effective_rate": 78.50
    }
  }
}
```

### ЦБ РФ (для 🇰🇷 🇨🇳 + EUR для ЕТТ ЕАЭС)

```json
{
  "cbr": {
    "source": "ЦБ РФ",
    "endpoint": "GET https://www.cbr-xml-daily.ru/daily_json.js",
    "cacheTTL_minutes": 60,
    "currencies": {
      "KRW": {
        "charCode": "KRW",
        "nominal": 1000,
        "comment": "⚠️ ДЕЛИТЬ Value / Nominal!",
        "spreadField": "vtb_spread_krw",
        "formula": "KRW_RUB = (Value / Nominal) + vtb_spread"
      },
      "CNY": {
        "charCode": "CNY",
        "nominal": 1,
        "spreadField": "vtb_spread_cny",
        "formula": "CNY_RUB = Value + vtb_spread"
      },
      "EUR": {
        "charCode": "EUR",
        "nominal": 1,
        "comment": "нужен для расчёта ЕТТ ЕАЭС (ставки в евро за см³)"
      },
      "USD": {
        "charCode": "USD",
        "nominal": 1,
        "comment": "справочный, основной — через USDT"
      }
    }
  }
}
```

---

## 🏛️ ЕТТ ЕАЭС — ставки таможни для 3–5 лет

Используются вместо фиксированных множителей (1.48/1.30) когда возраст авто 3–5 лет.

```json
{
  "ettEaeu_3to5years": {
    "comment": "Единые ставки для авто 3–5 лет. Ставка в EUR за см³.",
    "rates": [
      { "maxVolumeCc": 1000,  "eurPerCc": 1.5 },
      { "maxVolumeCc": 1500,  "eurPerCc": 1.7 },
      { "maxVolumeCc": 1800,  "eurPerCc": 2.5 },
      { "maxVolumeCc": 2300,  "eurPerCc": 2.7 },
      { "maxVolumeCc": 3000,  "eurPerCc": 3.0 },
      { "maxVolumeCc": 999999, "eurPerCc": 3.6 }
    ],
    "formula": "customs = volumeCc × eurPerCc × EUR_RUB_rate",
    "nds": "20% сверху",
    "fullFormula": "totalCustoms = (volumeCc × eurPerCc × EUR_RUB) × 1.20"
  }
}
```

```json
{
  "ettEaeu_5plusYears": {
    "comment": "Единые ставки для авто 5+ лет",
    "rates": [
      { "maxVolumeCc": 1000,  "eurPerCc": 3.0 },
      { "maxVolumeCc": 1500,  "eurPerCc": 3.2 },
      { "maxVolumeCc": 1800,  "eurPerCc": 3.5 },
      { "maxVolumeCc": 2300,  "eurPerCc": 4.8 },
      { "maxVolumeCc": 3000,  "eurPerCc": 5.0 },
      { "maxVolumeCc": 999999, "eurPerCc": 5.7 }
    ]
  }
}
```

---

## 📋 Утильсбор — сводка для кода

```json
{
  "utilSbor": {
    "baseRate": 20000,
    "comment": "Базовая ставка × коэффициент = утильсбор",
    
    "льготный": {
      "условие": "ДВС ≤160лс И объём ≤3.0L | электро ≤80лс (30-мин)",
      "new": 3400,
      "used": 5200
    },
    
    "коммерческий": "см. файл util-sbor.md (P2.3) — полные таблицы",
    
    "дляКалькулятора": {
      "comment": "В наших формулах льготный утильсбор УЖЕ в ФИКСе. Доплата только для >160лс.",
      "formula": "utilSborExtra = lookupCommercial(volume, power, age) - (age=='new' ? 3400 : 5200)"
    }
  }
}
```

---

## 🔧 Дополнительные расходы (включены в ФИКСы)

Для справки — что входит в фиксированные суммы:

```json
{
  "includedInFix": {
    "SBKTS": { "min": 20000, "max": 30000, "comment": "сертификация безопасности" },
    "EPTS": { "amount": 600, "comment": "электронный ПТС" },
    "broker": { "min": 15000, "max": 25000, "comment": "таможенный брокер" },
    "customsFee": { "min": 1067, "max": 30000, "comment": "таможенные сборы 2026" },
    "domesticDelivery": {
      "vladivostok_moscow": { "min": 80000, "max": 120000 },
      "novorossiysk_moscow": { "min": 35000, "max": 50000 }
    },
    "utilSborBase": { "new": 3400, "used": 5200, "comment": "льготный утильсбор" },
    "margin": "наша маржа/комиссия"
  }
}
```

---

## 🔑 Настраиваемые параметры (AdminSettings)

Эти значения меняются через Telegram-бот админом:

```json
{
  "adminSettings": {
    "usdt_correction_rub": {
      "default": 1.50,
      "command": "/set_correction 1.50",
      "comment": "коррекция к Bybit P2P для MoscaEx"
    },
    "vtb_spread_krw": {
      "default": 0.001,
      "command": "/set_vtb_spread_krw 0.001",
      "comment": "спред ВТБ для KRW (в рублях за 1 KRW)"
    },
    "vtb_spread_cny": {
      "default": 0.30,
      "command": "/set_vtb_spread_cny 0.30",
      "comment": "спред ВТБ для CNY (в рублях за 1 CNY)"
    },
    "fixedCosts": {
      "comment": "все таблицы ФИКСов — обновляемые через админку",
      "command": "/set_fix USA_RU 20000 425000"
    }
  }
}
```

---

## 📊 Сводная таблица всех 11 направлений

| # | Направление | Возраст | Множитель | Фиксы | Валюта |
|---|---|---|---|---|---|
| 1 | 🇺🇸 USA → 🇷🇺 РФ | до 3 лет | ×0.48 | 425–575K₽+ | USDT |
| 2 | 🇺🇸 USA → 🇧🇾 РБ | до 3 лет | ×0.30 | 450–600K₽+ | USDT |
| 3 | 🇺🇸 USA → 🇷🇺 РФ | 3–5 лет | ЕТТ ЕАЭС | 425–575K₽+ | USDT |
| 4 | 🇰🇷 Корея → 🇷🇺 РФ | до 3 лет | ×1.48 | 90K+600K₽ | KRW |
| 5 | 🇰🇷 Корея → 🇧🇾 РБ | до 3 лет | ×1.30 | 90K+720K₽ | KRW |
| 6 | 🇰🇷 Корея → 🇷🇺 РФ | 3–5 лет | ЕТТ ЕАЭС | 90K+600K₽ | KRW |
| 7 | 🇦🇪 ОАЭ → 🇷🇺 РФ | новые | ×1.48 | 440–560K₽+ | USDT |
| 8 | 🇦🇪 ОАЭ → 🇧🇾 РБ | новые | ×1.30 | 530K₽+ ⚠️ | USDT |
| 9 | 🇨🇳 Китай → 🇷🇺 РФ | до 3 лет | ×1.48 | 590K₽ | CNY |
| 10 | 🇨🇳 Китай → 🇧🇾 РБ | до 3 лет | ×1.30 | 720K₽ | CNY |
| 11 | 🇨🇳 Китай → 🇷🇺 РФ | 3–5 лет | ЕТТ ЕАЭС | 590K₽ | CNY |

---

## ⚠️ Открытые вопросы (перенесены из предыдущих чатов)

1. **ОАЭ → РБ фиксы:** точная шкала после $20K→530K₽ — нужно подтверждение
2. **ОС на VPS:** Ubuntu / Debian — уточнить
3. **Домен для Mini App**
4. **Telegram Bot токен**
5. **Midjourney референсы для дизайна**

---

## ✅ Статус: P2.4 ЗАВЕРШЁН

Все числовые данные собраны. Готово для превращения в TypeScript на этапе P3.

**Весь P2 (Исследователь) — ✅ ЗАВЕРШЁН:**
- P2.1 ✅ API курсов валют (Bybit P2P, ЦБ РФ)
- P2.2 ✅ Формулы ЕТТ ЕАЭС (свои вместо парсинга tks.ru)
- P2.3 ✅ Таблица утильсбора >160 л.с.
- P2.4 ✅ JSON с фиксированными суммами

**Следующий Project: P3 · 🏛️ Таможенник** — реализация формул в TypeScript.
