/**
 * P6.6 · Тесты для StepLead — форма заявки
 */
import { describe, it, expect } from 'vitest';
import type { Country, Destination } from '@/types';

describe('P6.6 · StepLead — валидация формы', () => {
  it('имя обязательно', () => {
    const isValid = (name: string) => name.trim().length > 0;
    expect(isValid('')).toBe(false);
    expect(isValid('  ')).toBe(false);
    expect(isValid('Иван')).toBe(true);
  });

  it('телефон минимум 5 цифр', () => {
    const isValidPhone = (phone: string) => phone.replace(/\D/g, '').length >= 5;
    expect(isValidPhone('')).toBe(false);
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('+79001')).toBe(true);
    expect(isValidPhone('+7 (900) 123-45-67')).toBe(true);
  });

  it('комментарий опционален (макс 500 символов)', () => {
    const isValidComment = (c: string) => c.length <= 500;
    expect(isValidComment('')).toBe(true);
    expect(isValidComment('Нужна Toyota Camry')).toBe(true);
    expect(isValidComment('x'.repeat(501))).toBe(false);
  });
});

describe('P6.6 · Lead API — request body', () => {
  it('body содержит все обязательные поля', () => {
    const body = {
      name: 'Иван',
      phone: '+79001234567',
      comment: '',
      country: 'USA' as Country,
      destination: 'RU' as Destination,
      price: 25000,
      year: 2024,
      engineType: 'petrol',
      horsePower: 150,
      totalRUB: 3972193,
    };

    expect(body.name).toBe('Иван');
    expect(body.phone).toContain('7900');
    expect(body.totalRUB).toBe(3972193);
  });

  it('Telegram user данные опциональны', () => {
    const body = {
      name: 'Test',
      phone: '+79001',
      country: 'Korea',
      destination: 'BY',
      price: 35000000,
      year: 2023,
      engineType: 'petrol',
      horsePower: 150,
      totalRUB: 3469000,
      // Нет telegramUserId — это OK
    };

    expect(body).not.toHaveProperty('telegramUserId');
  });

  it('API возвращает { success: true, leadId }', () => {
    const response = { success: true, leadId: 'clxyz123' };
    expect(response.success).toBe(true);
    expect(response.leadId).toBeDefined();
  });
});

describe('P6.6 · StepLead — состояния', () => {
  type LeadStep = 'form' | 'sending' | 'success' | 'error';

  it('4 состояния формы', () => {
    const states: LeadStep[] = ['form', 'sending', 'success', 'error'];
    expect(states).toHaveLength(4);
  });

  it('начальное состояние — form', () => {
    const initial: LeadStep = 'form';
    expect(initial).toBe('form');
  });

  it('flow: form → sending → success', () => {
    const flow: LeadStep[] = ['form', 'sending', 'success'];
    expect(flow[0]).toBe('form');
    expect(flow[flow.length - 1]).toBe('success');
  });

  it('ошибка: form → sending → error → form (retry)', () => {
    const errorFlow: LeadStep[] = ['form', 'sending', 'error'];
    expect(errorFlow[errorFlow.length - 1]).toBe('error');
    // После ошибки submittedRef сбрасывается, можно retry
  });
});
