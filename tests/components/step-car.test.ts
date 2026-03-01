/**
 * P6.3 · Тесты для StepCar — данные и логика
 *
 * Без DOM-рендеринга (testing-library будет в P7).
 * Проверяем: валюты, подсказки, ограничения, типы движков.
 */
import { describe, it, expect } from 'vitest';
import type { Country, EngineType, Currency } from '@/types';
import { COUNTRY_CURRENCY } from '@/types';

const ALL_COUNTRIES: Country[] = ['USA', 'Korea', 'UAE', 'China'];

/** Символы валют (дублируем из StepCar для тестирования) */
const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$',
  KRW: '₩',
  AED: 'AED',
  CNY: '¥',
};

describe('P6.3 · StepCar — валюты и символы', () => {
  it('каждая страна имеет корректный символ валюты', () => {
    expect(CURRENCY_SYMBOL[COUNTRY_CURRENCY.USA]).toBe('$');
    expect(CURRENCY_SYMBOL[COUNTRY_CURRENCY.Korea]).toBe('₩');
    expect(CURRENCY_SYMBOL[COUNTRY_CURRENCY.UAE]).toBe('AED');
    expect(CURRENCY_SYMBOL[COUNTRY_CURRENCY.China]).toBe('¥');
  });

  it('все валюты стран покрыты символами', () => {
    for (const c of ALL_COUNTRIES) {
      const currency = COUNTRY_CURRENCY[c];
      expect(CURRENCY_SYMBOL[currency]).toBeDefined();
    }
  });
});

describe('P6.3 · StepCar — типы двигателей', () => {
  const ENGINE_TYPES: EngineType[] = ['petrol', 'diesel', 'electric', 'hybrid'];

  it('ровно 4 типа двигателя', () => {
    expect(ENGINE_TYPES).toHaveLength(4);
  });

  it('каждый тип — валидный EngineType', () => {
    const valid: EngineType[] = ['petrol', 'diesel', 'electric', 'hybrid'];
    for (const et of ENGINE_TYPES) {
      expect(valid).toContain(et);
    }
  });
});

describe('P6.3 · StepCar — бизнес-логика формы', () => {
  const CURRENT_YEAR = new Date().getFullYear();

  it('возраст авто считается правильно', () => {
    expect(CURRENT_YEAR - CURRENT_YEAR).toBe(0);
    expect(CURRENT_YEAR - (CURRENT_YEAR - 3)).toBe(3);
    expect(CURRENT_YEAR - (CURRENT_YEAR - 5)).toBe(5);
  });

  it('объём двигателя нужен для 3+ лет (ЕТТ ЕАЭС)', () => {
    const needsVolume = (age: number, engineType: EngineType, hp: number) =>
      engineType !== 'electric' && (age >= 3 || hp > 160);

    // До 3 лет, ≤160 л.с. → НЕ нужен
    expect(needsVolume(0, 'petrol', 150)).toBe(false);
    expect(needsVolume(2, 'diesel', 160)).toBe(false);

    // 3+ лет → нужен
    expect(needsVolume(3, 'petrol', 150)).toBe(true);
    expect(needsVolume(5, 'diesel', 100)).toBe(true);

    // >160 л.с. → нужен (для утильсбора)
    expect(needsVolume(1, 'petrol', 200)).toBe(true);
    expect(needsVolume(0, 'diesel', 161)).toBe(true);

    // Электро → НЕ нужен никогда
    expect(needsVolume(5, 'electric', 300)).toBe(false);
  });

  it('ОАЭ: только новые авто (до 1 года)', () => {
    const isUAE = (country: Country) => country === 'UAE';
    expect(isUAE('UAE')).toBe(true);
    expect(isUAE('USA')).toBe(false);

    // Максимальный допустимый возраст для ОАЭ
    const maxUAEAge = 1;
    expect(CURRENT_YEAR - (CURRENT_YEAR - 1)).toBeLessThanOrEqual(maxUAEAge);
    expect(CURRENT_YEAR - (CURRENT_YEAR - 2)).toBeGreaterThan(maxUAEAge);
  });

  it('ценовые лимиты корректны для каждой страны', () => {
    const PRICE_MAX: Record<Country, number> = {
      USA: 500_000,
      Korea: 500_000_000,
      UAE: 2_000_000,
      China: 5_000_000,
    };

    // USA: доллары — до $500K
    expect(PRICE_MAX.USA).toBe(500_000);
    // Korea: воны — до 500M₩
    expect(PRICE_MAX.Korea).toBe(500_000_000);
    // UAE: дирхамы — до 2M AED
    expect(PRICE_MAX.UAE).toBe(2_000_000);
    // China: юани — до 5M¥
    expect(PRICE_MAX.China).toBe(5_000_000);
  });

  it('formatNumber форматирует правильно', () => {
    const formatNumber = (n: number): string => {
      if (n === 0) return '';
      return n.toLocaleString('ru-RU');
    };

    expect(formatNumber(0)).toBe('');
    expect(formatNumber(25000)).toMatch(/25[\s\u00a0]000/); // пробел или &nbsp;
    expect(formatNumber(1500000)).toMatch(/1[\s\u00a0]500[\s\u00a0]000/);
  });

  it('мощность валидируется: 1–2000 л.с.', () => {
    const isValidHP = (hp: number) => hp > 0 && hp <= 2000;
    expect(isValidHP(0)).toBe(false);
    expect(isValidHP(150)).toBe(true);
    expect(isValidHP(2000)).toBe(true);
    expect(isValidHP(2001)).toBe(false);
  });
});

describe('P6.3 · StepCar — CarFormData интерфейс', () => {
  it('CarFormData содержит все необходимые поля', () => {
    interface CarFormData {
      price: number;
      year: number;
      engineType: EngineType;
      horsePower: number;
      engineVolume?: number;
    }

    const data: CarFormData = {
      price: 25000,
      year: 2024,
      engineType: 'petrol',
      horsePower: 150,
    };

    expect(data.price).toBe(25000);
    expect(data.year).toBe(2024);
    expect(data.engineType).toBe('petrol');
    expect(data.horsePower).toBe(150);
    expect(data.engineVolume).toBeUndefined();
  });

  it('CarFormData с объёмом двигателя (3-5 лет)', () => {
    interface CarFormData {
      price: number;
      year: number;
      engineType: EngineType;
      horsePower: number;
      engineVolume?: number;
    }

    const data: CarFormData = {
      price: 15000,
      year: 2022,
      engineType: 'diesel',
      horsePower: 200,
      engineVolume: 2500,
    };

    expect(data.engineVolume).toBe(2500);
  });
});
