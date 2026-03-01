'use client';

import React, { useState } from 'react';
import type { Country, Destination } from '@/types';

/**
 * Calculator — главный компонент визарда.
 * Управляет шагами: страна → данные авто → направление → результат
 * 
 * Экраны будут в P6.2–P6.7
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

  const updateState = (patch: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...patch }));
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Placeholder — будет заменён на экраны */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-4 animate-fade-in">
          <div className="text-5xl">🚗</div>
          <h1 className="font-serif text-display text-gold-300">Car-Calc</h1>
          <p className="text-neutral-400 text-sm">
            Калькулятор стоимости доставки авто
          </p>
          <div className="pill-gold mx-auto w-fit">
            Шаг: {step}
          </div>
          <p className="text-neutral-600 text-xs mt-8">
            P6.1 ✅ Дизайн-токены + базовый layout
          </p>
        </div>
      </div>
    </main>
  );
}
