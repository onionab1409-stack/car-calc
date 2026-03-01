'use client';

import React, { useState, useCallback } from 'react';
import type { Country, Destination } from '@/types';
import { StepCountry } from '@/components/wizard';

/**
 * Calculator — главный компонент визарда.
 * Управляет шагами: страна → данные авто → направление → загрузка → результат → заявка
 *
 * P6.2: StepCountry ✅
 * P6.3: StepCar ⏳
 * P6.4: StepDestination ⏳
 * P6.5: StepResult ⏳
 * P6.6: StepLead ⏳
 * P6.7: StepHistory ⏳
 */

export type WizardStep = 'country' | 'car' | 'destination' | 'loading' | 'result' | 'lead';

export interface WizardState {
  country: Country | null;
  destination: Destination | null;
  price: number;
  year: number;
  engineType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  horsePower: number;
  engineVolume?: number;
}

const initialState: WizardState = {
  country: null,
  destination: null,
  price: 0,
  year: new Date().getFullYear(),
  engineType: 'petrol',
  horsePower: 150,
};

export function Calculator() {
  const [step, setStep] = useState<WizardStep>('country');
  const [state, setState] = useState<WizardState>(initialState);

  const updateState = useCallback((patch: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  /** Обработчик выбора страны → переход к вводу данных авто */
  const handleCountrySelect = useCallback((country: Country) => {
    updateState({ country });
    setStep('car');
  }, [updateState]);

  return (
    <main className="min-h-screen flex flex-col">
      {/* ─── Step: Выбор страны ─── */}
      {step === 'country' && (
        <StepCountry onSelect={handleCountrySelect} />
      )}

      {/* ─── Step: Ввод данных авто (placeholder — P6.3) ─── */}
      {step === 'car' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="text-4xl">📋</div>
            <h2 className="font-serif text-xl text-gold-100">Данные авто</h2>
            <p className="text-neutral-400 text-sm">
              Страна: {state.country}
            </p>
            <div className="pill-gold mx-auto w-fit">P6.3 — в разработке</div>
            <button
              onClick={() => setStep('country')}
              className="text-sm text-gold-400 underline underline-offset-4 mt-4"
            >
              ← Назад к выбору страны
            </button>
          </div>
        </div>
      )}

      {/* ─── Остальные шаги (placeholder) ─── */}
      {!['country', 'car'].includes(step) && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-3 animate-fade-in">
            <div className="text-4xl">🚗</div>
            <div className="pill-gold mx-auto w-fit">Шаг: {step}</div>
          </div>
        </div>
      )}
    </main>
  );
}
