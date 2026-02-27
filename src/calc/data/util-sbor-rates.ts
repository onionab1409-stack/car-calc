// ============================================
// 📊 CAR-CALC — Ставки утилизационного сбора 2026
// ============================================
// Подэтап: P3.5 · Таможенник
// Источник: P2.3 · docs/research/util-sbor.md
// Постановление Правительства РФ от 01.11.2025 № 1713
// Действует с 01.01.2026 по 31.12.2026
//
// Базовая ставка = 20 000 ₽
// Утильсбор = 20000 × коэффициент

const BASE_RATE = 20_000;

// ─────────────────────────────────────────────
// 📋 Типы
// ─────────────────────────────────────────────

/** Строка таблицы коэффициентов */
interface UtilRow {
  /** Макс. мощность в диапазоне (л.с.), Infinity для последнего */
  maxHP: number;
  /** Коэффициент для авто до 3 лет */
  kNew: number;
  /** Коэффициент для авто 3+ лет */
  kUsed: number;
}

/** Диапазон объёма двигателя → таблица коэффициентов */
interface VolumeRange {
  /** Макс. объём в диапазоне (см³), Infinity для последнего */
  maxCC: number;
  /** Строки по мощности */
  rows: UtilRow[];
}

// ─────────────────────────────────────────────
// 🔥 ДВС: Коммерческие коэффициенты по объёму и мощности
// ─────────────────────────────────────────────

const ICE_TABLES: VolumeRange[] = [
  // ≤1000 см³
  {
    maxCC: 1000,
    rows: [
      { maxHP: 160,      kNew: 0.17,   kUsed: 0.26 },
      { maxHP: 190,      kNew: 15.36,  kUsed: 28.43 },
      { maxHP: 220,      kNew: 15.84,  kUsed: 29.28 },
      { maxHP: 250,      kNew: 16.20,  kUsed: 30.12 },
      { maxHP: Infinity,  kNew: 17.28,  kUsed: 30.12 },
    ],
  },
  // 1001–2000 см³ ⭐ самый частый
  {
    maxCC: 2000,
    rows: [
      { maxHP: 160,      kNew: 0.17,    kUsed: 0.26 },
      { maxHP: 190,      kNew: 45.00,   kUsed: 74.64 },
      { maxHP: 220,      kNew: 47.64,   kUsed: 79.20 },
      { maxHP: 250,      kNew: 50.52,   kUsed: 83.88 },
      { maxHP: 280,      kNew: 57.12,   kUsed: 91.92 },
      { maxHP: 310,      kNew: 64.56,   kUsed: 100.56 },
      { maxHP: 340,      kNew: 72.96,   kUsed: 110.16 },
      { maxHP: 370,      kNew: 83.16,   kUsed: 120.60 },
      { maxHP: 400,      kNew: 94.80,   kUsed: 132.00 },
      { maxHP: 430,      kNew: 108.00,  kUsed: 144.60 },
      { maxHP: 460,      kNew: 123.24,  kUsed: 158.40 },
      { maxHP: 500,      kNew: 140.40,  kUsed: 173.40 },
      { maxHP: Infinity,  kNew: 160.08,  kUsed: 189.84 },
    ],
  },
  // 2001–3000 см³
  {
    maxCC: 3000,
    rows: [
      { maxHP: 160,      kNew: 0.17,    kUsed: 0.26 },
      { maxHP: 190,      kNew: 115.34,  kUsed: 172.80 },
      { maxHP: 220,      kNew: 118.20,  kUsed: 175.08 },
      { maxHP: 250,      kNew: 120.12,  kUsed: 177.60 },
      { maxHP: 280,      kNew: 126.00,  kUsed: 183.00 },
      { maxHP: 310,      kNew: 131.04,  kUsed: 188.52 },
      { maxHP: 340,      kNew: 136.32,  kUsed: 193.68 },
      { maxHP: 370,      kNew: 141.72,  kUsed: 199.08 },
      { maxHP: 400,      kNew: 147.48,  kUsed: 204.72 },
      { maxHP: 430,      kNew: 153.36,  kUsed: 210.48 },
      { maxHP: 460,      kNew: 159.48,  kUsed: 216.36 },
      { maxHP: 500,      kNew: 165.84,  kUsed: 222.36 },
      { maxHP: Infinity,  kNew: 172.44,  kUsed: 228.60 },
    ],
  },
  // 3001–3500 см³ ⚠️ КОММЕРЧЕСКИЙ ДАЖЕ ДЛЯ ≤160 л.с.!
  {
    maxCC: 3500,
    rows: [
      { maxHP: 160,      kNew: 129.20,  kUsed: 197.81 },
      { maxHP: 190,      kNew: 131.76,  kUsed: 200.04 },
      { maxHP: 220,      kNew: 134.40,  kUsed: 202.20 },
      { maxHP: 250,      kNew: 137.16,  kUsed: 204.36 },
      { maxHP: 280,      kNew: 140.52,  kUsed: 207.24 },
      { maxHP: 310,      kNew: 144.00,  kUsed: 212.40 },
      { maxHP: 340,      kNew: 151.92,  kUsed: 217.80 },
      { maxHP: 370,      kNew: 160.32,  kUsed: 224.28 },
      { maxHP: 400,      kNew: 168.00,  kUsed: 230.40 },
      { maxHP: 430,      kNew: 174.00,  kUsed: 236.40 },
      { maxHP: 460,      kNew: 180.00,  kUsed: 242.40 },
      { maxHP: 500,      kNew: 186.00,  kUsed: 248.40 },
      { maxHP: Infinity,  kNew: 192.00,  kUsed: 254.40 },
    ],
  },
  // >3500 см³
  {
    maxCC: Infinity,
    rows: [
      { maxHP: 160,      kNew: 145.00,  kUsed: 210.00 },
      { maxHP: 190,      kNew: 148.00,  kUsed: 214.00 },
      { maxHP: 220,      kNew: 152.00,  kUsed: 218.00 },
      { maxHP: 250,      kNew: 156.00,  kUsed: 222.00 },
      { maxHP: 280,      kNew: 160.00,  kUsed: 226.00 },
      { maxHP: 310,      kNew: 164.00,  kUsed: 230.00 },
      { maxHP: 340,      kNew: 168.00,  kUsed: 234.00 },
      { maxHP: 370,      kNew: 172.00,  kUsed: 238.00 },
      { maxHP: 400,      kNew: 176.00,  kUsed: 242.00 },
      { maxHP: 430,      kNew: 180.00,  kUsed: 246.00 },
      { maxHP: 460,      kNew: 184.00,  kUsed: 250.00 },
      { maxHP: 500,      kNew: 188.00,  kUsed: 254.00 },
      { maxHP: Infinity,  kNew: 192.00,  kUsed: 260.00 },
    ],
  },
];

// ─────────────────────────────────────────────
// ⚡ Электромобили: коэффициенты по 30-мин мощности (кВт)
// ─────────────────────────────────────────────

interface ElectricRow {
  /** Макс. 30-мин мощность (кВт), Infinity для последнего */
  maxKW: number;
  kNew: number;
  kUsed: number;
}

const ELECTRIC_TABLE: ElectricRow[] = [
  { maxKW: 58.84,   kNew: 0.17,   kUsed: 0.26 },     // ≤80 л.с. — льготный
  { maxKW: 80.91,   kNew: 49.56,  kUsed: 95.04 },     // 80–110 л.с.
  { maxKW: 102.97,  kNew: 54.00,  kUsed: 100.44 },    // 110–140 л.с.
  { maxKW: 125.04,  kNew: 58.56,  kUsed: 105.84 },    // 140–170 л.с.
  { maxKW: 147.10,  kNew: 63.48,  kUsed: 111.60 },    // 170–200 л.с.
  { maxKW: 169.16,  kNew: 68.40,  kUsed: 117.36 },    // 200–230 л.с.
  { maxKW: 191.23,  kNew: 73.68,  kUsed: 123.12 },    // 230–260 л.с.
  { maxKW: 205.94,  kNew: 79.20,  kUsed: 128.88 },    // 260–280 л.с.
  { maxKW: Infinity, kNew: 182.40, kUsed: 182.40 },    // >280 л.с.
];

// ─────────────────────────────────────────────
// 🔍 Lookup функции
// ─────────────────────────────────────────────

/** Найти коэффициент ДВС по объёму, мощности и возрасту */
function lookupICE(volumeCC: number, horsePower: number, isNew: boolean): number {
  const volumeRange = ICE_TABLES.find(v => volumeCC <= v.maxCC);
  if (!volumeRange) throw new Error(`Утильсбор: не найден диапазон для объёма ${volumeCC} см³`);

  const row = volumeRange.rows.find(r => horsePower <= r.maxHP);
  if (!row) throw new Error(`Утильсбор: не найден диапазон для мощности ${horsePower} л.с.`);

  return isNew ? row.kNew : row.kUsed;
}

/** Найти коэффициент электро по 30-мин мощности */
function lookupElectric(power30minKW: number, isNew: boolean): number {
  const row = ELECTRIC_TABLE.find(r => power30minKW <= r.maxKW);
  if (!row) throw new Error(`Утильсбор электро: не найден диапазон для ${power30minKW} кВт`);

  return isNew ? row.kNew : row.kUsed;
}

// ─────────────────────────────────────────────
// 📐 Экспортируемые функции
// ─────────────────────────────────────────────

import type { AgeCategory, EngineType } from '@/types';

/** Льготный утильсбор */
export const UTIL_SBOR_PREFERENTIAL_NEW = 3_400;
export const UTIL_SBOR_PREFERENTIAL_USED = 5_200;

/**
 * Определяет, имеет ли авто право на ЛЬГОТНЫЙ утильсбор.
 *
 * Льготный: ДВС ≤160 л.с. И объём ≤3.0L (3000 см³)
 * Электро: 30-мин мощность ≤80 л.с. (≤58.84 кВт)
 */
export function isPreferentialUtilSbor(
  horsePower: number,
  engineCC: number | undefined,
  engineType: EngineType
): boolean {
  if (engineType === 'electric') {
    // 30-мин мощность ≈ пиковая × 0.45
    const power30minKW = (horsePower * 0.7355) * 0.45; // л.с.→кВт × 0.45
    return power30minKW <= 58.84;
  }

  // ДВС и гибриды
  return horsePower <= 160 && (engineCC ?? 0) <= 3000;
}

/**
 * Рассчитывает ПОЛНЫЙ утилизационный сбор.
 *
 * @returns Полная сумма утильсбора в рублях
 */
export function calcUtilSbor(
  horsePower: number,
  engineCC: number | undefined,
  engineType: EngineType,
  ageCategory: AgeCategory
): number {
  const isNew = ageCategory === 'under3';

  // Электромобили — отдельная таблица
  if (engineType === 'electric') {
    const power30minKW = (horsePower * 0.7355) * 0.45;
    const k = lookupElectric(power30minKW, isNew);
    return Math.round(BASE_RATE * k);
  }

  // ДВС / гибриды: проверяем льготу
  if (horsePower <= 160 && (engineCC ?? 0) <= 3000) {
    return isNew ? UTIL_SBOR_PREFERENTIAL_NEW : UTIL_SBOR_PREFERENTIAL_USED;
  }

  // Коммерческий — полная таблица
  if (!engineCC) {
    throw new Error('Для коммерческого утильсбора обязателен объём двигателя (engineCC)');
  }

  const k = lookupICE(engineCC, horsePower, isNew);
  return Math.round(BASE_RATE * k);
}

/**
 * Рассчитывает ДОПЛАТУ утильсбора для авто >160 л.с. (или >3.0L, или электро >80лс).
 *
 * Доплата = коммерческий утильсбор − льготный (который уже включён в ФИКС).
 *
 * @returns Доплата в рублях. 0 если авто попадает под льготу.
 */
export function calcUtilSborExtra(
  horsePower: number,
  engineCC: number | undefined,
  engineType: EngineType,
  ageCategory: AgeCategory
): number {
  // Если льготный — доплата = 0
  if (isPreferentialUtilSbor(horsePower, engineCC, engineType)) {
    return 0;
  }

  const isNew = ageCategory === 'under3';
  const fullSbor = calcUtilSbor(horsePower, engineCC, engineType, ageCategory);
  const preferential = isNew ? UTIL_SBOR_PREFERENTIAL_NEW : UTIL_SBOR_PREFERENTIAL_USED;

  return fullSbor - preferential;
}
