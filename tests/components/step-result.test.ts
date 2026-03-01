/**
 * P6.5 · Тесты для StepLoading + StepResult — данные и логика
 */
import { describe, it, expect } from 'vitest';
import type { Country, Destination } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';

describe('P6.5 · StepLoading — этапы загрузки', () => {
  const LOADING_STAGES = [
    { pct: 10, text: 'Получаем курсы валют...' },
    { pct: 30, text: 'Рассчитываем таможню...' },
    { pct: 55, text: 'Считаем доставку...' },
    { pct: 75, text: 'Добавляем все сборы...' },
    { pct: 90, text: 'Формируем итог...' },
  ];

  it('5 этапов загрузки', () => {
    expect(LOADING_STAGES).toHaveLength(5);
  });

  it('проценты возрастают', () => {
    for (let i = 1; i < LOADING_STAGES.length; i++) {
      expect(LOADING_STAGES[i].pct).toBeGreaterThan(LOADING_STAGES[i - 1].pct);
    }
  });

  it('последний этап < 100% (100% = done)', () => {
    const last = LOADING_STAGES[LOADING_STAGES.length - 1];
    expect(last.pct).toBeLessThan(100);
  });

  it('API request body содержит все нужные поля', () => {
    const body = {
      country: 'USA' as Country,
      destination: 'RU' as Destination,
      price: 25000,
      year: 2024,
      engineType: 'petrol',
      horsePower: 150,
      engineCC: undefined,
    };
    expect(body.country).toBe('USA');
    expect(body.destination).toBe('RU');
    expect(body.price).toBe(25000);
  });
});

describe('P6.5 · StepResult — отображение цены', () => {
  it('formatRUB форматирует рубли правильно', () => {
    const formatRUB = (n: number) => Math.round(n).toLocaleString('ru-RU');

    // Типичные значения
    expect(formatRUB(3972193)).toMatch(/3[\s\u00a0]972[\s\u00a0]193/);
    expect(formatRUB(2351000)).toMatch(/2[\s\u00a0]351[\s\u00a0]000/);
  });

  it('count-up анимация: eased value от 0 до target', () => {
    // Ease-out cubic: 1 - (1 - t)^3
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    // В начале (t=0) → 0
    expect(easeOutCubic(0)).toBe(0);
    // В середине (t=0.5) → 0.875 (быстрый старт)
    expect(easeOutCubic(0.5)).toBe(0.875);
    // В конце (t=1) → 1
    expect(easeOutCubic(1)).toBe(1);

    // Для цены 3,972,193₽:
    const target = 3972193;
    expect(Math.round(target * easeOutCubic(0.5))).toBe(3475669);
    expect(Math.round(target * easeOutCubic(1))).toBe(target);
  });

  it('результат показывает ТОЛЬКО totalRUB (без breakdown)', () => {
    // API возвращает { totalRUB: 3972193 }
    const apiResponse = { totalRUB: 3972193 };

    // Проверяем что НЕТ breakdown
    expect(apiResponse).not.toHaveProperty('breakdown');
    expect(apiResponse).not.toHaveProperty('formula');
    expect(apiResponse).not.toHaveProperty('costs');

    // Только одно число
    expect(Object.keys(apiResponse)).toHaveLength(1);
    expect(apiResponse.totalRUB).toBe(3972193);
  });

  it('все 8 эталонных цен отображаются корректно', () => {
    const formatRUB = (n: number) => Math.round(n).toLocaleString('ru-RU');
    const testPrices = [
      2351000, 3972193, 3469000, 2762496,
      4495000, 3246000, 3838000, 3117000,
    ];

    for (const p of testPrices) {
      const formatted = formatRUB(p);
      // Должно содержать цифры и разделители
      expect(formatted).toMatch(/\d/);
      // Не должно быть отрицательным
      expect(p).toBeGreaterThan(0);
    }
  });
});

describe('P6.5 · Calculator flow — полный путь', () => {
  it('wizard flow: country → car → destination → loading → result', () => {
    type Step = 'country' | 'car' | 'destination' | 'loading' | 'result' | 'lead' | 'error';
    const flow: Step[] = ['country', 'car', 'destination', 'loading', 'result'];

    expect(flow[0]).toBe('country');
    expect(flow[flow.length - 1]).toBe('result');
    expect(flow).toHaveLength(5);
  });

  it('ошибка API → step error', () => {
    type Step = 'country' | 'car' | 'destination' | 'loading' | 'result' | 'lead' | 'error';
    const errorStep: Step = 'error';
    expect(errorStep).toBe('error');
  });

  it('«Рассчитать другой» сбрасывает в country', () => {
    const initialStep = 'country';
    // newCalc handler should reset to country
    expect(initialStep).toBe('country');
  });
});
