// ============================================
// 📊 CAR-CALC — Все фиксированные данные
// ============================================
// Единый источник числовых констант.
// Версия: 1.0 · P3.1 · Таможенник
// Источник: P2.4 fixed-costs.md

import type { FixedCostsTable } from '@/types';

// ─────────────────────────────────────────────
// 🇺🇸 USA — коэффициенты
// ─────────────────────────────────────────────

export const USA = {
  /** Средний buyer fee Copart/IAAI ~8% */
  AUCTION_FEE_RATE: 0.08,

  /** Доставка до порта в США, $ */
  INLAND_SHIPPING_USD: 750,

  /** Морская доставка USA → Владивосток, $ */
  OCEAN_SHIPPING_USD: 2200,

  /** Страховка 1.1% от суммы */
  INSURANCE_RATE: 0.011,

  /** Таможня РФ: 48% (до 3 лет, физлицо) */
  CUSTOMS_RATE_RU: 0.48,

  /** Таможня РБ: 30% (до 3 лет) */
  CUSTOMS_RATE_BY: 0.30,
} as const;

// ─────────────────────────────────────────────
// 🇰🇷 Корея — коэффициенты
// ─────────────────────────────────────────────

export const KOREA = {
  /** Логистика (доставка + фрахт KR→Владивосток), ₽ */
  LOGISTICS_RUB: 90_000,

  /** Множитель таможни РФ (пошлина+НДС+...) */
  CUSTOMS_MULTIPLIER_RU: 1.48,

  /** Множитель таможни РБ */
  CUSTOMS_MULTIPLIER_BY: 1.30,

  /** Фикс РФ (СБКТС+ЭПТС+брокер+маржа+доставка), ₽ */
  FIXED_RU_RUB: 600_000,

  /** Фикс РБ, ₽ */
  FIXED_BY_RUB: 720_000,
} as const;

// ─────────────────────────────────────────────
// 🇦🇪 ОАЭ — коэффициенты
// ─────────────────────────────────────────────

export const UAE = {
  /** Фиксированный курс AED/USD (привязка) */
  AED_USD_RATE: 3.67,

  /** Морская доставка ОАЭ → Новороссийск, $ */
  SHIPPING_USD: 1600,

  /** Множитель таможни РФ */
  CUSTOMS_MULTIPLIER_RU: 1.48,

  /** Множитель таможни РБ */
  CUSTOMS_MULTIPLIER_BY: 1.30,
} as const;

// ─────────────────────────────────────────────
// 🇨🇳 Китай — коэффициенты
// ─────────────────────────────────────────────

export const CHINA = {
  /** Логистика в Китае (до порта + фрахт CN→Владивосток), ¥ */
  LOGISTICS_CNY: 8000,

  /** Страховка 2.5% от ЦЕНЫ авто (не от цены+логистика!) */
  INSURANCE_RATE: 0.025,

  /** Множитель таможни РФ */
  CUSTOMS_MULTIPLIER_RU: 1.48,

  /** Множитель таможни РБ */
  CUSTOMS_MULTIPLIER_BY: 1.30,

  /** Фикс РФ, ₽ */
  FIXED_RU_RUB: 590_000,

  /** Фикс РБ, ₽ */
  FIXED_BY_RUB: 720_000,
} as const;

// ─────────────────────────────────────────────
// 💰 ТАБЛИЦЫ ФИКСОВ (по направлениям)
// ─────────────────────────────────────────────

/** USA → РФ: фиксированные расходы по ступеням цены лота */
export const FIXED_COSTS_USA_RU: FixedCostsTable = {
  route: 'USA_RU',
  steps: [
    { maxPriceUSD: 20_000, fixedRUB: 425_000 },
    { maxPriceUSD: 30_000, fixedRUB: 495_000 },
    { maxPriceUSD: 40_000, fixedRUB: 575_000 },
  ],
  overflowStepRUB: 100_000,   // +100K₽
  overflowAfterUSD: 40_000,   // за каждые $10K свыше $40K
};

/** USA → РБ */
export const FIXED_COSTS_USA_BY: FixedCostsTable = {
  route: 'USA_BY',
  steps: [
    { maxPriceUSD: 20_000, fixedRUB: 450_000 },
    { maxPriceUSD: 30_000, fixedRUB: 520_000 },
    { maxPriceUSD: 40_000, fixedRUB: 600_000 },
  ],
  overflowStepRUB: 100_000,
  overflowAfterUSD: 40_000,
};

/** ОАЭ → РФ: фиксы по ступеням priceUSD (= priceAED/3.67 + shipping) */
export const FIXED_COSTS_UAE_RU: FixedCostsTable = {
  route: 'UAE_RU',
  steps: [
    { maxPriceUSD: 20_000, fixedRUB: 440_000 },
    { maxPriceUSD: 30_000, fixedRUB: 460_000 },
    { maxPriceUSD: 40_000, fixedRUB: 510_000 },
    { maxPriceUSD: 50_000, fixedRUB: 560_000 },
  ],
  overflowStepRUB: 100_000,
  overflowAfterUSD: 50_000,
};

/** ОАЭ → РБ ⚠️ после $20K — экстраполяция, уточнить! */
export const FIXED_COSTS_UAE_BY: FixedCostsTable = {
  route: 'UAE_BY',
  steps: [
    { maxPriceUSD: 20_000, fixedRUB: 530_000 },
    { maxPriceUSD: 30_000, fixedRUB: 580_000 },
    { maxPriceUSD: 40_000, fixedRUB: 630_000 },
    { maxPriceUSD: 50_000, fixedRUB: 680_000 },
  ],
  overflowStepRUB: 100_000,
  overflowAfterUSD: 50_000,
};

// ─────────────────────────────────────────────
// 🔍 Функция поиска фикса по таблице
// ─────────────────────────────────────────────

/**
 * Находит фиксированную сумму по цене авто.
 * Если цена выше последнего порога — считает overflow (+100K₽ за каждые $10K).
 */
export function lookupFixedCost(table: FixedCostsTable, priceUSD: number): number {
  // Проходим по ступеням — ищем подходящую
  for (const step of table.steps) {
    if (step.maxPriceUSD !== null && priceUSD <= step.maxPriceUSD) {
      return step.fixedRUB;
    }
  }

  // Если цена выше всех ступеней — overflow
  const lastStep = table.steps[table.steps.length - 1];
  const lastFixedRUB = lastStep.fixedRUB;
  const overAmount = priceUSD - table.overflowAfterUSD;
  const extraSteps = Math.ceil(overAmount / 10_000);
  // extraSteps уже включает первый шаг после порога
  // Но первый шаг после порога — это lastStep + overflowStepRUB
  const stepsAlreadyInTable = table.steps.length;

  // Простая формула: последний фикс + шаг * количество $10K-блоков сверх последнего порога
  const exceededBy = priceUSD - (lastStep.maxPriceUSD ?? table.overflowAfterUSD);
  const overflowBlocks = Math.ceil(exceededBy / 10_000);

  return lastFixedRUB + overflowBlocks * table.overflowStepRUB;
}

// ─────────────────────────────────────────────
// 🏛️ ЕТТ ЕАЭС — ставки для авто 3–5 лет
// ─────────────────────────────────────────────

/** Ставка ЕТТ ЕАЭС: евро за см³ для авто 3–5 лет */
export interface EttRate {
  maxVolumeCc: number;
  eurPerCc: number;
}

export const ETT_RATES_3TO5: EttRate[] = [
  { maxVolumeCc: 1000,    eurPerCc: 1.5 },
  { maxVolumeCc: 1500,    eurPerCc: 1.7 },
  { maxVolumeCc: 1800,    eurPerCc: 2.5 },
  { maxVolumeCc: 2300,    eurPerCc: 2.7 },
  { maxVolumeCc: 3000,    eurPerCc: 3.0 },
  { maxVolumeCc: Infinity, eurPerCc: 3.6 },
];

export const ETT_RATES_5PLUS: EttRate[] = [
  { maxVolumeCc: 1000,    eurPerCc: 3.0 },
  { maxVolumeCc: 1500,    eurPerCc: 3.2 },
  { maxVolumeCc: 1800,    eurPerCc: 3.5 },
  { maxVolumeCc: 2300,    eurPerCc: 4.8 },
  { maxVolumeCc: 3000,    eurPerCc: 5.0 },
  { maxVolumeCc: Infinity, eurPerCc: 5.7 },
];

/**
 * Расчёт таможни по ЕТТ ЕАЭС (для авто 3–5 и 5+ лет).
 * @returns Таможенная пошлина + НДС 20% в рублях
 */
export function calcETT(
  volumeCc: number,
  eurRubRate: number,
  ageCategory: '3to5' | 'over5'
): number {
  const rates = ageCategory === '3to5' ? ETT_RATES_3TO5 : ETT_RATES_5PLUS;

  const rate = rates.find(r => volumeCc <= r.maxVolumeCc);
  if (!rate) throw new Error(`ETT: не найдена ставка для объёма ${volumeCc} см³`);

  const dutyEUR = volumeCc * rate.eurPerCc;
  const dutyRUB = dutyEUR * eurRubRate;

  return Math.round(dutyRUB);
}

// ─────────────────────────────────────────────
// 📋 Маппинг таблиц фиксов по маршруту
// ─────────────────────────────────────────────

export const FIXED_COSTS_MAP: Record<string, FixedCostsTable> = {
  USA_RU: FIXED_COSTS_USA_RU,
  USA_BY: FIXED_COSTS_USA_BY,
  UAE_RU: FIXED_COSTS_UAE_RU,
  UAE_BY: FIXED_COSTS_UAE_BY,
};

/**
 * Получить таблицу фиксов по направлению.
 * Для Кореи и Китая фиксы — просто константы, не таблица.
 */
export function getFixedCostsTable(country: string, destination: string): FixedCostsTable | null {
  const key = `${country}_${destination}`;
  return FIXED_COSTS_MAP[key] ?? null;
}
