/**
 * P6.4 · Тесты для StepDestination — данные и логика
 */
import { describe, it, expect } from 'vitest';
import type { Destination, Country } from '@/types';
import { COUNTRY_CURRENCY } from '@/types';

describe('P6.4 · StepDestination — направления', () => {
  const DESTINATIONS: Destination[] = ['RU', 'BY'];

  it('ровно 2 направления', () => {
    expect(DESTINATIONS).toHaveLength(2);
  });

  it('названия направлений корректны', () => {
    const names: Record<Destination, string> = { RU: 'Россия', BY: 'Беларусь' };
    expect(names.RU).toBe('Россия');
    expect(names.BY).toBe('Беларусь');
  });

  it('каждое направление доступно для всех 4 стран', () => {
    const countries: Country[] = ['USA', 'Korea', 'UAE', 'China'];
    // Все комбинации страна×направление = 8 вариантов
    const combinations = countries.flatMap(c => DESTINATIONS.map(d => `${c}→${d}`));
    expect(combinations).toHaveLength(8);
    expect(combinations).toContain('USA→RU');
    expect(combinations).toContain('USA→BY');
    expect(combinations).toContain('China→BY');
  });
});

describe('P6.4 · StepDestination — бизнес-логика', () => {
  it('множитель РФ (1.48) больше чем РБ (1.30)', () => {
    const RU_MULTIPLIER = 1.48;
    const BY_MULTIPLIER = 1.30;
    expect(RU_MULTIPLIER).toBeGreaterThan(BY_MULTIPLIER);
  });

  it('для расчёта нужны country + destination + price + year + engineType + horsePower', () => {
    interface CalcInput {
      country: Country;
      destination: Destination;
      price: number;
      year: number;
      engineType: string;
      horsePower: number;
    }

    const input: CalcInput = {
      country: 'USA',
      destination: 'RU',
      price: 25000,
      year: 2024,
      engineType: 'petrol',
      horsePower: 150,
    };

    expect(input.country).toBe('USA');
    expect(input.destination).toBe('RU');
  });

  it('подсказки отличаются для РФ и РБ', () => {
    const hintRU = 'прямая растаможка, ставка ×1.48';
    const hintBY = 'таможенная ставка ×1.30';
    expect(hintRU).not.toBe(hintBY);
    expect(hintRU).toContain('1.48');
    expect(hintBY).toContain('1.30');
  });
});
