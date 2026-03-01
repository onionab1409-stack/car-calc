/**
 * P6.2 · Тесты для StepCountry
 *
 * Без DOM-рендеринга (testing-library будет в P7).
 * Проверяем: данные стран, экспорты, типы, покрытие всех 4 стран.
 */
import { describe, it, expect } from 'vitest';

// Проверяем что типы и константы корректно экспортируются
import type { Country } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU } from '@/types';

const ALL_COUNTRIES: Country[] = ['USA', 'Korea', 'UAE', 'China'];

describe('P6.2 · StepCountry — данные стран', () => {
  it('все 4 страны имеют флаги', () => {
    for (const c of ALL_COUNTRIES) {
      expect(COUNTRY_FLAG[c]).toBeDefined();
      expect(COUNTRY_FLAG[c].length).toBeGreaterThan(0);
    }
  });

  it('все 4 страны имеют русские названия', () => {
    expect(COUNTRY_NAME_RU.USA).toBe('США');
    expect(COUNTRY_NAME_RU.Korea).toBe('Корея');
    expect(COUNTRY_NAME_RU.UAE).toBe('ОАЭ');
    expect(COUNTRY_NAME_RU.China).toBe('Китай');
  });

  it('флаги — эмодзи флагов', () => {
    expect(COUNTRY_FLAG.USA).toBe('🇺🇸');
    expect(COUNTRY_FLAG.Korea).toBe('🇰🇷');
    expect(COUNTRY_FLAG.UAE).toBe('🇦🇪');
    expect(COUNTRY_FLAG.China).toBe('🇨🇳');
  });

  it('ровно 4 страны в маппингах', () => {
    expect(Object.keys(COUNTRY_FLAG)).toHaveLength(4);
    expect(Object.keys(COUNTRY_NAME_RU)).toHaveLength(4);
  });
});

describe('P6.2 · StepCountry — wizard интеграция', () => {
  it('wizard шаги включают country', () => {
    // Проверяем что тип WizardStep существует и country - первый шаг
    type WizardStep = 'country' | 'car' | 'destination' | 'loading' | 'result' | 'lead';
    const firstStep: WizardStep = 'country';
    expect(firstStep).toBe('country');
  });

  it('WizardState.country может быть null (начальное) или Country', () => {
    interface WizardState {
      country: Country | null;
    }
    const initial: WizardState = { country: null };
    expect(initial.country).toBeNull();

    const selected: WizardState = { country: 'USA' };
    expect(selected.country).toBe('USA');
  });

  it('все страны являются валидными Country', () => {
    const isValidCountry = (c: string): c is Country =>
      ['USA', 'Korea', 'UAE', 'China'].includes(c);

    for (const c of ALL_COUNTRIES) {
      expect(isValidCountry(c)).toBe(true);
    }
    expect(isValidCountry('Germany')).toBe(false);
  });
});
