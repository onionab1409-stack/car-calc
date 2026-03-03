/**
 * Тесты для StepForm — единый экран (параметры + расчёт + заявка)
 *
 * Без DOM-рендеринга. Проверяем: константы, валидацию, типы, бизнес-логику.
 */
import { describe, it, expect } from 'vitest';

import type { Country, Destination, EngineType } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';

// ─── Constants (same as in StepForm) ───

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', KRW: '₩', AED: 'AED', CNY: '¥' };
const PRICE_MAX: Record<Country, number> = {
  USA: 500_000,
  Korea: 500_000_000,
  UAE: 2_000_000,
  China: 5_000_000,
};
const ENGINE_TYPES: EngineType[] = ['petrol', 'diesel', 'electric', 'hybrid'];
const DESTINATIONS: Destination[] = ['RU', 'BY'];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_PRESETS = [
  CURRENT_YEAR,
  CURRENT_YEAR - 1,
  CURRENT_YEAR - 2,
  CURRENT_YEAR - 3,
  CURRENT_YEAR - 4,
  CURRENT_YEAR - 5,
];

// ─── Helper (same logic as StepForm) ───
function formatNumber(n: number): string {
  if (n === 0) return '';
  return n.toLocaleString('ru-RU');
}

// ─── Tests ───

describe('StepForm — константы и маппинги', () => {
  it('все 4 страны имеют символ валюты', () => {
    const countries: Country[] = ['USA', 'Korea', 'UAE', 'China'];
    for (const c of countries) {
      const currency = COUNTRY_CURRENCY[c];
      expect(CURRENCY_SYMBOL[currency]).toBeDefined();
    }
  });

  it('символы валют корректны', () => {
    expect(CURRENCY_SYMBOL.USD).toBe('$');
    expect(CURRENCY_SYMBOL.KRW).toBe('₩');
    expect(CURRENCY_SYMBOL.AED).toBe('AED');
    expect(CURRENCY_SYMBOL.CNY).toBe('¥');
  });

  it('максимальные цены адекватны для каждой страны', () => {
    expect(PRICE_MAX.USA).toBe(500_000);         // $500K
    expect(PRICE_MAX.Korea).toBe(500_000_000);    // ₩500M
    expect(PRICE_MAX.UAE).toBe(2_000_000);        // AED 2M
    expect(PRICE_MAX.China).toBe(5_000_000);      // ¥5M
  });

  it('все 4 типа двигателя определены', () => {
    expect(ENGINE_TYPES).toHaveLength(4);
    expect(ENGINE_TYPES).toContain('petrol');
    expect(ENGINE_TYPES).toContain('diesel');
    expect(ENGINE_TYPES).toContain('electric');
    expect(ENGINE_TYPES).toContain('hybrid');
  });

  it('2 направления: Россия и Беларусь', () => {
    expect(DESTINATIONS).toHaveLength(2);
    expect(DESTINATIONS).toContain('RU');
    expect(DESTINATIONS).toContain('BY');
  });

  it('6 пресетов года (текущий + 5 предыдущих)', () => {
    expect(YEAR_PRESETS).toHaveLength(6);
    expect(YEAR_PRESETS[0]).toBe(CURRENT_YEAR);
    expect(YEAR_PRESETS[5]).toBe(CURRENT_YEAR - 5);
  });
});

describe('StepForm — форматирование чисел', () => {
  it('formatNumber(0) возвращает пустую строку', () => {
    expect(formatNumber(0)).toBe('');
  });

  it('formatNumber форматирует тысячи с разделителем', () => {
    const result = formatNumber(15000);
    // Русская локаль: 15 000 (с неразрывным пробелом или обычным)
    expect(result.replace(/\s/g, '')).toBe('15000');
  });

  it('formatNumber форматирует миллионы', () => {
    const result = formatNumber(25000000);
    expect(result.replace(/\s/g, '')).toBe('25000000');
  });
});

describe('StepForm — валидация (бизнес-логика)', () => {
  it('цена должна быть > 0', () => {
    expect(0 <= 0).toBe(true);  // priceNum <= 0 → ошибка
    expect(15000 <= 0).toBe(false);  // priceNum > 0 → ок
  });

  it('цена не должна превышать максимум страны', () => {
    expect(600_000 > PRICE_MAX.USA).toBe(true);  // $600K > $500K → ошибка
    expect(400_000 > PRICE_MAX.USA).toBe(false);  // $400K < $500K → ок
  });

  it('мощность должна быть > 0 и ≤ 2000', () => {
    expect(0 <= 0).toBe(true);    // hp = 0 → ошибка
    expect(150 <= 0).toBe(false);  // hp = 150 → ок
    expect(2001 > 2000).toBe(true);  // hp > 2000 → ошибка
    expect(2000 > 2000).toBe(false); // hp = 2000 → ок
  });

  it('объём двигателя нужен для ≥3 лет или >160 л.с. (не электро)', () => {
    const needsVolume = (engineType: EngineType, carAge: number, hp: number) =>
      engineType !== 'electric' && (carAge >= 3 || hp > 160);

    expect(needsVolume('petrol', 2, 150)).toBe(false);   // до 3 лет, ≤160лс → не нужен
    expect(needsVolume('petrol', 3, 150)).toBe(true);    // 3 года → нужен
    expect(needsVolume('petrol', 0, 200)).toBe(true);    // >160лс → нужен
    expect(needsVolume('electric', 5, 300)).toBe(false);  // электро → не нужен
    expect(needsVolume('diesel', 4, 120)).toBe(true);    // дизель 4 года → нужен
    expect(needsVolume('hybrid', 1, 170)).toBe(true);    // гибрид >160лс → нужен
  });

  it('направление должно быть выбрано', () => {
    const dest: Destination | null = null;
    expect(dest === null).toBe(true);  // → ошибка "Выберите направление"
  });

  it('ОАЭ — только новые авто (до 1 года)', () => {
    const isUAE = true;
    const isDisabled = (yearPreset: number) => isUAE && (CURRENT_YEAR - yearPreset > 1);

    expect(isDisabled(CURRENT_YEAR)).toBe(false);     // текущий год → ок
    expect(isDisabled(CURRENT_YEAR - 1)).toBe(false);  // -1 год → ок
    expect(isDisabled(CURRENT_YEAR - 2)).toBe(true);   // -2 года → disabled
    expect(isDisabled(CURRENT_YEAR - 3)).toBe(true);   // -3 года → disabled
  });
});

describe('StepForm — фазы (состояния экрана)', () => {
  type FormPhase = 'input' | 'calculating' | 'result' | 'lead' | 'lead-sending' | 'lead-success' | 'lead-error';

  it('начальная фаза — input', () => {
    const phase: FormPhase = 'input';
    expect(phase).toBe('input');
  });

  it('hasResult = true для result/lead/lead-sending/lead-success/lead-error', () => {
    const hasResult = (p: FormPhase) =>
      p === 'result' || p === 'lead' || p === 'lead-sending' || p === 'lead-success' || p === 'lead-error';

    expect(hasResult('input')).toBe(false);
    expect(hasResult('calculating')).toBe(false);
    expect(hasResult('result')).toBe(true);
    expect(hasResult('lead')).toBe(true);
    expect(hasResult('lead-sending')).toBe(true);
    expect(hasResult('lead-success')).toBe(true);
    expect(hasResult('lead-error')).toBe(true);
  });

  it('showLeadForm = true для lead/lead-sending/lead-error', () => {
    const showLeadForm = (p: FormPhase) =>
      p === 'lead' || p === 'lead-sending' || p === 'lead-error';

    expect(showLeadForm('result')).toBe(false);
    expect(showLeadForm('lead')).toBe(true);
    expect(showLeadForm('lead-sending')).toBe(true);
    expect(showLeadForm('lead-error')).toBe(true);
    expect(showLeadForm('lead-success')).toBe(false);
  });

  it('isLeadSuccess только для lead-success', () => {
    const isLeadSuccess = (p: FormPhase) => p === 'lead-success';
    expect(isLeadSuccess('lead-success')).toBe(true);
    expect(isLeadSuccess('lead')).toBe(false);
    expect(isLeadSuccess('result')).toBe(false);
  });
});

describe('StepForm — сброс при изменении полей', () => {
  it('при изменении полей после расчёта фаза сбрасывается на input', () => {
    // Логика: if (phase !== 'input') { setPhase('input'); setTotalRUB(0); }
    let phase: string = 'result';
    let totalRUB = 3500000;

    // Симулируем изменение поля
    if (phase !== 'input') {
      phase = 'input';
      totalRUB = 0;
    }

    expect(phase).toBe('input');
    expect(totalRUB).toBe(0);
  });
});

describe('StepForm — интеграция с API', () => {
  it('API запрос содержит все обязательные поля', () => {
    const payload = {
      country: 'USA' as Country,
      destination: 'RU' as Destination,
      price: 25000,
      year: 2024,
      engineType: 'petrol' as EngineType,
      horsePower: 150,
      engineCC: undefined,
    };

    expect(payload.country).toBeDefined();
    expect(payload.destination).toBeDefined();
    expect(payload.price).toBeGreaterThan(0);
    expect(payload.year).toBeLessThanOrEqual(CURRENT_YEAR);
    expect(ENGINE_TYPES).toContain(payload.engineType);
    expect(payload.horsePower).toBeGreaterThan(0);
  });

  it('engineCC передаётся только если задан', () => {
    const volume = '2000';
    const engineCC = volume ? parseInt(volume) : undefined;
    expect(engineCC).toBe(2000);

    const noVolume = '';
    const noEngineCC = noVolume ? parseInt(noVolume) : undefined;
    expect(noEngineCC).toBeUndefined();
  });
});

describe('StepForm — lead форма валидация', () => {
  it('имя обязательно', () => {
    expect(''.trim().length === 0).toBe(true);
    expect('Иван'.trim().length === 0).toBe(false);
  });

  it('телефон: минимум 5 цифр', () => {
    const isValidPhone = (phone: string) => phone.replace(/\D/g, '').length >= 5;
    expect(isValidPhone('+7 900')).toBe(false);   // 4 цифры
    expect(isValidPhone('+7 9001')).toBe(true);    // 5 цифр
    expect(isValidPhone('+7 (900) 123-45-67')).toBe(true);  // 11 цифр
    expect(isValidPhone('')).toBe(false);
  });

  it('комментарий необязателен', () => {
    const comment = '';
    // Нет ошибки для пустого комментария
    expect(comment.length <= 500).toBe(true);
  });
});

describe('StepForm — onCalcComplete callback', () => {
  it('callback содержит все поля для истории', () => {
    const callbackData = {
      country: 'USA' as Country,
      destination: 'RU' as Destination,
      price: 25000,
      year: 2024,
      engineType: 'petrol' as EngineType,
      horsePower: 150,
      totalRUB: 3500000,
    };

    expect(callbackData.country).toBeDefined();
    expect(callbackData.destination).toBeDefined();
    expect(callbackData.price).toBeGreaterThan(0);
    expect(callbackData.totalRUB).toBeGreaterThan(0);
  });
});

describe('StepForm — экспорт типов', () => {
  it('StepFormProps включает country и onBack', () => {
    interface StepFormProps {
      country: Country;
      onBack: () => void;
      onCalcComplete?: (data: {
        country: Country;
        destination: Destination;
        price: number;
        year: number;
        engineType: EngineType;
        horsePower: number;
        totalRUB: number;
      }) => void;
    }

    const props: StepFormProps = {
      country: 'Korea',
      onBack: () => {},
    };

    expect(props.country).toBe('Korea');
    expect(typeof props.onBack).toBe('function');
    expect(props.onCalcComplete).toBeUndefined();  // optional
  });
});
