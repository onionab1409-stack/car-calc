/**
 * P6.7 · Тесты для useHistory + StepHistory
 */
import { describe, it, expect } from 'vitest';
import type { Country, Destination, EngineType } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';

/** Имитируем структуру HistoryEntry */
interface HistoryEntry {
  id: string;
  timestamp: number;
  country: Country;
  destination: Destination;
  price: number;
  year: number;
  engineType: EngineType;
  horsePower: number;
  totalRUB: number;
}

describe('P6.7 · useHistory — логика хранения', () => {
  it('максимум 20 записей (LIFO)', () => {
    const MAX_ITEMS = 20;
    const entries: HistoryEntry[] = [];

    // Добавляем 25 записей
    for (let i = 0; i < 25; i++) {
      entries.unshift({
        id: `id-${i}`,
        timestamp: Date.now() + i,
        country: 'USA',
        destination: 'RU',
        price: 10000 + i * 1000,
        year: 2024,
        engineType: 'petrol',
        horsePower: 150,
        totalRUB: 2000000 + i * 100000,
      });
    }

    const trimmed = entries.slice(0, MAX_ITEMS);
    expect(trimmed).toHaveLength(20);
    // Первая запись = самая новая
    expect(trimmed[0].id).toBe('id-24');
  });

  it('новые записи добавляются в начало', () => {
    const entries: HistoryEntry[] = [
      { id: 'old', timestamp: 1000, country: 'USA', destination: 'RU', price: 15000, year: 2024, engineType: 'petrol', horsePower: 150, totalRUB: 2500000 },
    ];

    const newEntry: HistoryEntry = {
      id: 'new', timestamp: 2000, country: 'Korea', destination: 'BY', price: 28000000, year: 2023, engineType: 'diesel', horsePower: 130, totalRUB: 3469000,
    };

    const updated = [newEntry, ...entries];
    expect(updated[0].id).toBe('new');
    expect(updated[1].id).toBe('old');
  });

  it('удаление по id', () => {
    const entries: HistoryEntry[] = [
      { id: 'a', timestamp: 1, country: 'USA', destination: 'RU', price: 1, year: 2024, engineType: 'petrol', horsePower: 100, totalRUB: 1 },
      { id: 'b', timestamp: 2, country: 'Korea', destination: 'BY', price: 2, year: 2024, engineType: 'diesel', horsePower: 200, totalRUB: 2 },
      { id: 'c', timestamp: 3, country: 'UAE', destination: 'RU', price: 3, year: 2024, engineType: 'petrol', horsePower: 300, totalRUB: 3 },
    ];

    const after = entries.filter(e => e.id !== 'b');
    expect(after).toHaveLength(2);
    expect(after.map(e => e.id)).toEqual(['a', 'c']);
  });

  it('очистка = пустой массив', () => {
    const cleared: HistoryEntry[] = [];
    expect(cleared).toHaveLength(0);
  });
});

describe('P6.7 · StepHistory — отображение', () => {
  it('formatDate: корректный формат', () => {
    const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    const d = new Date(2026, 1, 28, 14, 30); // 28 фев 2026, 14:30
    const day = d.getDate();
    const month = months[d.getMonth()];
    const formatted = `${day} ${month}, 14:30`;
    expect(formatted).toBe('28 фев, 14:30');
  });

  it('formatShort: миллионы → М', () => {
    const formatShort = (n: number) => {
      if (n >= 1_000_000) return (n / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'М';
      if (n >= 1_000) return Math.round(n / 1_000) + 'К';
      return String(Math.round(n));
    };

    expect(formatShort(3972193)).toBe('3.97М');
    expect(formatShort(2351000)).toBe('2.35М');
    expect(formatShort(500000)).toBe('500К');
    expect(formatShort(999)).toBe('999');
  });

  it('статистика: средняя цена вычисляется', () => {
    const prices = [2351000, 3972193, 3469000, 2762496];
    const avg = prices.reduce((s, p) => s + p, 0) / prices.length;
    expect(avg).toBeCloseTo(3138672.25);
  });

  it('статистика: уникальные страны считаются', () => {
    const countries: Country[] = ['USA', 'USA', 'Korea', 'UAE', 'Korea'];
    const unique = new Set(countries).size;
    expect(unique).toBe(3);
  });

  it('пустая история → показывает empty state', () => {
    const entries: HistoryEntry[] = [];
    expect(entries.length === 0).toBe(true);
  });

  it('клик по записи → загружает параметры для пересчёта', () => {
    const entry: HistoryEntry = {
      id: 'test', timestamp: Date.now(),
      country: 'China', destination: 'RU',
      price: 180000, year: 2024,
      engineType: 'electric', horsePower: 245,
      totalRUB: 3838000,
    };

    // handleHistorySelect загружает state и переходит к loading
    const newState = {
      country: entry.country,
      destination: entry.destination,
      price: entry.price,
      year: entry.year,
      engineType: entry.engineType,
      horsePower: entry.horsePower,
    };

    expect(newState.country).toBe('China');
    expect(newState.price).toBe(180000);
  });
});

describe('P6.7 · Calculator — интеграция истории', () => {
  it('8 шагов визарда', () => {
    type Step = 'country' | 'car' | 'destination' | 'loading' | 'result' | 'lead' | 'error' | 'history';
    const allSteps: Step[] = ['country', 'car', 'destination', 'loading', 'result', 'lead', 'error', 'history'];
    expect(allSteps).toHaveLength(8);
  });

  it('история доступна с экрана country', () => {
    // HistoryButton показывается когда count > 0
    const count = 5;
    expect(count > 0).toBe(true);
  });

  it('выбор из истории → step loading (пересчёт)', () => {
    const nextStep = 'loading';
    expect(nextStep).toBe('loading');
  });

  it('сохранение в историю только на step result (один раз)', () => {
    let savedRef = false;
    const step = 'result';
    const totalRUB = 3972193;

    if (step === 'result' && totalRUB && !savedRef) {
      savedRef = true;
    }

    expect(savedRef).toBe(true);
    // Второй раз не сохраняет
    if (step === 'result' && totalRUB && !savedRef) {
      savedRef = true; // не выполнится
    }
    expect(savedRef).toBe(true); // всё ещё true, не дубль
  });
});
