'use client';

import React, { useState, useCallback, useRef } from 'react';
import type { Country, Destination } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';
import { Input, Button } from '@/components/ui';
import { useTelegram } from '@/components/TelegramProvider';

/**
 * P6.6 · Экран заявки — форма + экран успеха
 *
 * Поля: имя, телефон, комментарий (опц.)
 * POST /api/lead → экран "Заявка отправлена"
 *
 * Референсы: ref-16-lead-form.png, ref-17-lead-success.png
 */

interface StepLeadProps {
  totalRUB: number;
  country: Country;
  destination: Destination;
  price: number;
  year: number;
  engineType: string;
  horsePower: number;
  onBack: () => void;
  onNewCalc: () => void;
}

const CURRENCY_SYMBOL: Record<string, string> = {
  USD: '$', KRW: '₩', AED: 'AED', CNY: '¥',
};

const ENGINE_LABEL: Record<string, string> = {
  petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид',
};

type LeadStep = 'form' | 'sending' | 'success' | 'error';

export function StepLead({
  totalRUB, country, destination, price, year, engineType, horsePower,
  onBack, onNewCalc,
}: StepLeadProps) {
  const { haptic, user } = useTelegram();

  const [leadStep, setLeadStep] = useState<LeadStep>('form');
  const [name, setName] = useState(user?.first_name || '');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const submittedRef = useRef(false);

  const currency = COUNTRY_CURRENCY[country];
  const symbol = CURRENCY_SYMBOL[currency];

  // ─── Валидация телефона ───
  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d+\-() ]/g, '');
    if (val.length > 20) return;
    setPhone(val);
    setErrors(prev => ({ ...prev, phone: '' }));
  }, []);

  // ─── Сабмит ───
  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Введите ваше имя';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 5) {
      newErrors.phone = 'Введите номер телефона';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      haptic?.notificationOccurred('error');
      return;
    }

    submittedRef.current = true;
    setLeadStep('sending');
    haptic?.impactOccurred('medium');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          comment: comment.trim(),
          country,
          destination,
          price,
          year,
          engineType,
          horsePower,
          totalRUB,
          telegramUserId: user?.id,
          telegramUsername: user?.username,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Ошибка отправки');
      }

      haptic?.notificationOccurred('success');
      setLeadStep('success');
    } catch (err) {
      submittedRef.current = false;
      setServerError(err instanceof Error ? err.message : 'Ошибка');
      setLeadStep('error');
      haptic?.notificationOccurred('error');
    }
  }, [name, phone, comment, country, destination, price, year, engineType, horsePower, totalRUB, user, haptic]);

  // ─── Экран успеха ───
  if (leadStep === 'success') {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-6 animate-fade-in">
        {/* Золотой чекмарк */}
        <div className="relative w-28 h-28 mb-6">
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="url(#successGold)"
              strokeWidth="3"
            />
            <circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="rgba(196,162,101,0.15)"
              strokeWidth="8"
              className="blur-[2px]"
            />
            <path
              d="M38 60 L52 74 L82 44"
              fill="none"
              stroke="#C4A265"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="successGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FFE2A9" />
                <stop offset="100%" stopColor="#A08050" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h2 className="font-serif text-2xl text-gold-50 text-center mb-2">
          Заявка отправлена
        </h2>
        <p className="text-sm text-neutral-400 text-center mb-8 max-w-[280px]">
          Наш менеджер свяжется с вами в ближайшее время
        </p>

        <div className="space-y-3 mb-8 w-full max-w-sm">
          <SuccessItem icon="✓" text="Мы получили вашу заявку" />
          <SuccessItem icon="✓" text="Ответим в течение 30 минут в рабочее время" />
        </div>

        <div className="w-full max-w-sm space-y-3">
          <Button onClick={onNewCalc}>
            Рассчитать другой автомобиль
          </Button>
          <button
            onClick={onBack}
            className="w-full text-sm text-neutral-500 hover:text-gold-300 transition-colors py-2"
          >
            Вернуться к результату
          </button>
        </div>
      </div>
    );
  }

  // ─── Форма ───
  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      {/* Заголовок */}
      <div className="px-5 pt-5 pb-3">
        <button
          onClick={onBack}
          className="text-neutral-500 hover:text-gold-400 transition-colors text-sm mb-2"
        >
          ← Назад к результату
        </button>
        <h1 className="font-serif text-2xl text-gold-50 tracking-tight">
          Оставить заявку
        </h1>
        <p className="text-neutral-400 text-sm mt-1">
          Мы свяжемся с вами для обсуждения деталей
        </p>
      </div>

      {/* Карточка расчёта (сводка) */}
      <div className="px-5 pb-4">
        <div className="
          bg-bg-card rounded-lg border border-[rgba(196,162,101,0.14)]
          p-4 relative overflow-hidden
        ">
          {/* Фоновое свечение */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(196,162,101,0.05)] rounded-full blur-[40px]" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span>{COUNTRY_FLAG[country]}</span>
              <span className="text-neutral-500 text-xs">→</span>
              <span>{destination === 'RU' ? '🇷🇺' : '🇧🇾'}</span>
              <span className="ml-auto pill-gold text-[10px]">
                {COUNTRY_NAME_RU[country]}
              </span>
            </div>

            <div className="font-serif text-2xl text-gold-50 mb-2">
              {Math.round(totalRUB).toLocaleString('ru-RU')}
              <span className="text-gold-300 text-lg ml-1">₽</span>
            </div>

            <div className="flex gap-4 text-xs text-neutral-400">
              <span>{symbol}{price.toLocaleString('ru-RU')}</span>
              <span>{year}</span>
              <span>{ENGINE_LABEL[engineType]}</span>
              <span>{horsePower} л.с.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Форма */}
      <div className="flex-1 px-5 pb-4 space-y-4">
        <Input
          label="Ваше имя"
          placeholder="Иван"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors(prev => ({ ...prev, name: '' }));
          }}
          error={errors.name}
          maxLength={100}
        />

        <Input
          type="tel"
          label="Телефон"
          placeholder="+7 (900) 123-45-67"
          value={phone}
          onChange={handlePhoneChange}
          error={errors.phone}
        />

        <div className="space-y-1.5">
          <label className="block text-sm text-neutral-400 ml-1">
            Комментарий <span className="text-neutral-600">(необязательно)</span>
          </label>
          <textarea
            placeholder="Интересует конкретная модель, сроки, доп. услуги..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={3}
            className="
              w-full px-4 py-3 text-[16px] text-white
              bg-bg-input rounded-md
              border border-[rgba(196,162,101,0.08)]
              placeholder:text-neutral-600
              focus:outline-none focus:border-gold-400
              focus:shadow-[0_0_0_3px_rgba(196,162,101,0.12)]
              transition-all duration-250 resize-none
            "
          />
        </div>

        {/* Ошибка сервера */}
        {leadStep === 'error' && serverError && (
          <div className="bg-[rgba(248,113,113,0.08)] border border-error/20 rounded-lg p-3">
            <p className="text-sm text-error">{serverError}</p>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-2 safe-bottom">
        <Button
          onClick={handleSubmit}
          disabled={leadStep === 'sending'}
          loading={leadStep === 'sending'}
        >
          {leadStep === 'sending' ? 'Отправляем...' : 'Отправить заявку 📩'}
        </Button>
      </div>
    </div>
  );
}

/** Элемент успеха */
function SuccessItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-bg-card rounded-lg border border-[rgba(196,162,101,0.08)]">
      <span className="text-gold-400 text-sm font-bold mt-0.5">{icon}</span>
      <p className="text-sm text-neutral-300">{text}</p>
    </div>
  );
}
