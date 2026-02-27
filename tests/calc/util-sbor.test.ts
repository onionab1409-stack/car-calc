// ============================================
// 🧪 Тесты: util-sbor-rates.ts
// ============================================
// Проверка таблиц утильсбора 2026
// Источник: P2.3 docs/research/util-sbor.md

import { describe, it, expect } from 'vitest';
import {
  calcUtilSbor,
  calcUtilSborExtra,
  isPreferentialUtilSbor,
  UTIL_SBOR_PREFERENTIAL_NEW,
  UTIL_SBOR_PREFERENTIAL_USED,
} from '@/calc/data/util-sbor-rates';

// ─────────────────────────────────────────────
// 🔍 Тесты определения льготы
// ─────────────────────────────────────────────

describe('isPreferentialUtilSbor', () => {
  it('150лс, 2.0L бензин → льготный', () => {
    expect(isPreferentialUtilSbor(150, 2000, 'petrol')).toBe(true);
  });

  it('160лс, 3.0L бензин → льготный (граница включительно)', () => {
    expect(isPreferentialUtilSbor(160, 3000, 'petrol')).toBe(true);
  });

  it('161лс, 2.0L бензин → НЕ льготный', () => {
    expect(isPreferentialUtilSbor(161, 2000, 'petrol')).toBe(false);
  });

  it('150лс, 3.5L бензин → НЕ льготный (объём >3.0L)', () => {
    expect(isPreferentialUtilSbor(150, 3500, 'petrol')).toBe(false);
  });

  it('200лс, 3.5L бензин → НЕ льготный', () => {
    expect(isPreferentialUtilSbor(200, 3500, 'petrol')).toBe(false);
  });

  it('электро 150лс → льготный (30мин ≤80лс)', () => {
    // 150 × 0.7355 × 0.45 = 49.65 кВт ≤ 58.84 → льготный
    expect(isPreferentialUtilSbor(150, undefined, 'electric')).toBe(true);
  });

  it('электро 250лс → НЕ льготный', () => {
    // 250 × 0.7355 × 0.45 = 82.74 кВт > 58.84
    expect(isPreferentialUtilSbor(250, undefined, 'electric')).toBe(false);
  });
});

// ─────────────────────────────────────────────
// 🏛️ Тесты полного утильсбора
// ─────────────────────────────────────────────

describe('calcUtilSbor — льготный', () => {
  it('150лс, 2.0L, до 3 лет → 3,400₽', () => {
    expect(calcUtilSbor(150, 2000, 'petrol', 'under3')).toBe(3_400);
  });

  it('150лс, 2.0L, 3+ лет → 5,200₽', () => {
    expect(calcUtilSbor(150, 2000, 'petrol', '3to5')).toBe(5_200);
  });

  it('160лс, 3.0L, до 3 лет → 3,400₽ (граница)', () => {
    expect(calcUtilSbor(160, 3000, 'petrol', 'under3')).toBe(3_400);
  });
});

describe('calcUtilSbor — коммерческий ДВС', () => {
  // ≤1000 см³
  it('170лс, 1.0L, до 3 лет → 307,200₽ (15.36×20K)', () => {
    expect(calcUtilSbor(170, 1000, 'petrol', 'under3')).toBe(307_200);
  });

  it('170лс, 1.0L, 3+ лет → 568,600₽ (28.43×20K)', () => {
    expect(calcUtilSbor(170, 1000, 'petrol', '3to5')).toBe(568_600);
  });

  // 1001–2000 см³ ⭐ самый частый
  it('170лс, 1.5L, до 3 лет → 900,000₽ (45.00×20K)', () => {
    expect(calcUtilSbor(170, 1500, 'petrol', 'under3')).toBe(900_000);
  });

  it('200лс, 2.0L, до 3 лет → 952,800₽ (47.64×20K)', () => {
    expect(calcUtilSbor(200, 2000, 'petrol', 'under3')).toBe(952_800);
  });

  it('200лс, 2.0L, 3+ лет → 1,584,000₽ (79.20×20K)', () => {
    expect(calcUtilSbor(200, 2000, 'petrol', '3to5')).toBe(1_584_000);
  });

  it('300лс, 2.0L, до 3 лет → 1,291,200₽ (64.56×20K)', () => {
    expect(calcUtilSbor(300, 2000, 'petrol', 'under3')).toBe(1_291_200);
  });

  it('550лс, 2.0L, до 3 лет → 3,201,600₽ (160.08×20K)', () => {
    expect(calcUtilSbor(550, 2000, 'petrol', 'under3')).toBe(3_201_600);
  });

  // 2001–3000 см³
  it('170лс, 2.5L, до 3 лет → 2,306,800₽ (115.34×20K)', () => {
    expect(calcUtilSbor(170, 2500, 'petrol', 'under3')).toBe(2_306_800);
  });

  it('260лс, 3.0L, до 3 лет → 2,520,000₽ (126.00×20K)', () => {
    expect(calcUtilSbor(260, 3000, 'petrol', 'under3')).toBe(2_520_000);
  });

  it('550лс, 3.0L, 3+ лет → 4,572,000₽ (228.60×20K)', () => {
    expect(calcUtilSbor(550, 3000, 'petrol', '3to5')).toBe(4_572_000);
  });

  // 3001–3500 см³ ⚠️ коммерческий даже для ≤160 л.с.!
  it('150лс, 3.2L, до 3 лет → 2,584,000₽ (коммерческий!)', () => {
    expect(calcUtilSbor(150, 3200, 'petrol', 'under3')).toBe(2_584_000);
  });

  it('150лс, 3.2L, 3+ лет → 3,956,200₽', () => {
    expect(calcUtilSbor(150, 3200, 'petrol', '3to5')).toBe(3_956_200);
  });
});

describe('calcUtilSbor — электромобили', () => {
  it('электро 150лс (30мин ≤80лс), до 3 лет → 3,400₽ льготный', () => {
    expect(calcUtilSbor(150, undefined, 'electric', 'under3')).toBe(3_400);
  });

  it('электро 250лс (30мин ~83кВт), до 3 лет → 1,080,000₽', () => {
    // 250 × 0.7355 × 0.45 = 82.74 кВт → диапазон 80.92–102.97 → k=54.00
    expect(calcUtilSbor(250, undefined, 'electric', 'under3')).toBe(1_080_000);
  });

  it('электро 400лс (30мин ~132кВт), до 3 лет → 1,269,600₽', () => {
    // 400 × 0.7355 × 0.45 = 132.39 кВт → диапазон 125.05–147.10 → k=63.48
    expect(calcUtilSbor(400, undefined, 'electric', 'under3')).toBe(1_269_600);
  });

  it('электро 700лс (30мин ~232кВт), 3+ лет → 2,577,600₽', () => {
    // 700 × 0.7355 × 0.45 = 231.68 кВт → диапазон 191.24–205.94 → k=128.88
    // Нет, 231.68 > 205.94 → следующий: >205.95 → k=182.40
    expect(calcUtilSbor(700, undefined, 'electric', '3to5')).toBe(3_648_000);
  });
});

// ─────────────────────────────────────────────
// 💰 Тесты доплаты (extra = коммерческий - льготный)
// ─────────────────────────────────────────────

describe('calcUtilSborExtra', () => {
  it('150лс, 2.0L → 0₽ (льготный, нет доплаты)', () => {
    expect(calcUtilSborExtra(150, 2000, 'petrol', 'under3')).toBe(0);
  });

  it('170лс, 1.5L, до 3 лет → 900K - 3.4K = 896,600₽', () => {
    expect(calcUtilSborExtra(170, 1500, 'petrol', 'under3')).toBe(896_600);
  });

  it('170лс, 1.5L, 3+ лет → 1,492,800 - 5,200 = 1,487,600₽', () => {
    expect(calcUtilSborExtra(170, 1500, 'petrol', '3to5')).toBe(1_487_600);
  });

  it('200лс, 2.0L, до 3 лет → 952,800 - 3,400 = 949,400₽', () => {
    expect(calcUtilSborExtra(200, 2000, 'petrol', 'under3')).toBe(949_400);
  });

  it('150лс, 3.2L, до 3 лет → 2,584,000 - 3,400 = 2,580,600₽', () => {
    // Объём >3.0L → коммерческий даже при ≤160лс
    expect(calcUtilSborExtra(150, 3200, 'petrol', 'under3')).toBe(2_580_600);
  });

  it('электро 250лс, до 3 лет → 1,080,000 - 3,400 = 1,076,600₽', () => {
    expect(calcUtilSborExtra(250, undefined, 'electric', 'under3')).toBe(1_076_600);
  });

  it('электро 150лс → 0₽ (льготный)', () => {
    expect(calcUtilSborExtra(150, undefined, 'electric', 'under3')).toBe(0);
  });
});
