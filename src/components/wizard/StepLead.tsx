'use client';

import React, { useState, useCallback, useRef } from 'react';
import type { Country, Destination } from '@/types';
import { COUNTRY_FLAG, COUNTRY_NAME_RU, COUNTRY_CURRENCY } from '@/types';
import { Input } from '@/components/ui';
import { useTelegram } from '@/components/TelegramProvider';

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

const CURRENCY_SYMBOL: Record<string, string> = { USD: '$', KRW: '₩', AED: 'AED', CNY: '¥' };
const ENGINE_LABEL: Record<string, string> = { petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид' };

type LeadStep = 'form' | 'sending' | 'success' | 'error';

export function StepLead({
  totalRUB, country, destination, price, year, engineType, horsePower, onBack, onNewCalc,
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

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/[^\d+\-() ]/g, '');
    if (val.length > 20) return;
    setPhone(val);
    setErrors(prev => ({ ...prev, phone: '' }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Введите ваше имя';
    if (!phone.trim() || phone.replace(/\D/g, '').length < 5) newErrors.phone = 'Введите номер телефона';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); haptic?.notificationOccurred('error'); return; }
    submittedRef.current = true;
    setLeadStep('sending');
    haptic?.impactOccurred('medium');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), phone: phone.trim(), comment: comment.trim(),
          country, destination, price, year, engineType, horsePower, totalRUB,
          telegramUserId: user?.id, telegramUsername: user?.username,
        }),
      });
      if (!res.ok) { const data = await res.json().catch(() => ({})); throw new Error(data.error || 'Ошибка отправки'); }
      haptic?.notificationOccurred('success');
      setLeadStep('success');
    } catch (err) {
      submittedRef.current = false;
      setServerError(err instanceof Error ? err.message : 'Ошибка');
      setLeadStep('error');
      haptic?.notificationOccurred('error');
    }
  }, [name, phone, comment, country, destination, price, year, engineType, horsePower, totalRUB, user, haptic]);

  // Success screen
  if (leadStep === 'success') {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-6 animate-fade-in">
        <div className="relative w-28 h-28 mb-6">
          {/* Glow */}
          <div className="absolute inset-[-20px] rounded-full" style={{
            background: 'radial-gradient(circle, rgba(201,154,72,0.15) 0%, transparent 70%)',
          }} />
          <svg viewBox="0 0 120 120" className="w-full h-full relative z-10">
            <defs>
              <linearGradient id="successGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--gold-bright)" />
                <stop offset="100%" stopColor="var(--gold-med)" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="52" fill="none" stroke="url(#successGold)" strokeWidth="3" />
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(201,154,72,0.15)" strokeWidth="8" style={{ filter: 'blur(3px)' }} />
            <path d="M38 60 L52 74 L82 44" fill="none" stroke="var(--gold-warm)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-[24px] text-center mb-2" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--gold-bright)' }}>
          Заявка отправлена
        </h2>
        <p className="text-[13px] text-center mb-8 max-w-[280px]" style={{ color: 'var(--txt-secondary)' }}>
          Наш менеджер свяжется с вами в ближайшее время
        </p>
        <div className="space-y-3 mb-8 w-full max-w-sm">
          <div className="info-bar" style={{ gap: 10 }}>
            <span style={{ color: 'var(--gold-warm)', fontWeight: 700 }}>✓</span>
            <p className="text-[12px]" style={{ color: 'var(--txt-secondary)' }}>Мы получили вашу заявку</p>
          </div>
          <div className="info-bar" style={{ gap: 10 }}>
            <span style={{ color: 'var(--gold-warm)', fontWeight: 700 }}>✓</span>
            <p className="text-[12px]" style={{ color: 'var(--txt-secondary)' }}>Ответим в течение 30 минут в рабочее время</p>
          </div>
        </div>
        <div className="w-full max-w-sm space-y-3">
          <button className="cta-gold-bar" onClick={onNewCalc}>Рассчитать другой автомобиль</button>
          <button className="btn-ghost-3d w-full" style={{ height: 40, fontSize: 13 }} onClick={onBack}>Вернуться к результату</button>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <button onClick={onBack} className="btn-ghost-3d mb-3" style={{ height: 32, fontSize: 12, padding: '0 12px' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: 4 }}>
            <path d="M8.5 3L4.5 7L8.5 11" stroke="var(--gold-warm)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Назад
        </button>
        <h1 className="text-[26px] tracking-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 500, color: 'var(--gold-bright)' }}>
          Оставить заявку
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--txt-muted)' }}>Мы свяжемся с вами для обсуждения деталей</p>
      </div>

      {/* Summary card */}
      <div className="px-5 pb-4">
        <div className="card-3d relative overflow-hidden" style={{ padding: 16 }}>
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full" style={{
            background: 'radial-gradient(circle, rgba(201,154,72,0.06) 0%, transparent 70%)', filter: 'blur(20px)',
          }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[16px]">{COUNTRY_FLAG[country]}</span>
              <svg width="16" height="6" viewBox="0 0 16 6" fill="none">
                <path d="M0 3H12M12 3L9 1M12 3L9 5" stroke="var(--gold-dim)" strokeWidth="1" strokeLinecap="round"/>
              </svg>
              <span className="text-[16px]">{destination === 'RU' ? '🇷🇺' : '🇧🇾'}</span>
              <span className="ml-auto pill-3d" style={{ height: 20, fontSize: 9, padding: '0 8px' }}>
                {COUNTRY_NAME_RU[country]}
              </span>
            </div>
            <div style={{
              fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 400, color: 'var(--gold-bright)',
              textShadow: '0 0 20px rgba(201,154,72,0.15)',
            }}>
              {Math.round(totalRUB).toLocaleString('ru-RU')}
              <span style={{ fontSize: 18, color: 'var(--gold-sub)', marginLeft: 4 }}>₽</span>
            </div>
            <div className="flex gap-4 mt-2 text-[11px]" style={{ color: 'var(--txt-muted)' }}>
              <span>{symbol}{price.toLocaleString('ru-RU')}</span>
              <span>{year}</span>
              <span>{ENGINE_LABEL[engineType]}</span>
              <span>{horsePower} л.с.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form fields */}
      <div className="flex-1 px-5 pb-4 space-y-4">
        <Input label="Ваше имя" placeholder="Иван" value={name}
          onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
          error={errors.name} maxLength={100} />
        <Input type="tel" label="Телефон" placeholder="+7 (900) 123-45-67"
          value={phone} onChange={handlePhoneChange} error={errors.phone} />
        <div className="space-y-1.5">
          <p className="label-gold ml-1">Комментарий <span style={{ color: 'var(--txt-dim)' }}>(необязательно)</span></p>
          <textarea
            placeholder="Интересует конкретная модель, сроки..."
            value={comment} onChange={(e) => setComment(e.target.value)}
            maxLength={500} rows={3}
            className="input-3d"
            style={{ height: 'auto', padding: '12px 16px', resize: 'none', borderRadius: 14 }}
          />
        </div>
        {leadStep === 'error' && serverError && (
          <div className="error-box"><p>{serverError}</p></div>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-2 safe-bottom">
        <button className="cta-gold-bar" onClick={handleSubmit} disabled={leadStep === 'sending'}>
          {leadStep === 'sending' ? 'Отправляем...' : 'Отправить заявку 📩'}
        </button>
      </div>
    </div>
  );
}
