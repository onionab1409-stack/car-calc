'use client';

import React, { useState, useCallback } from 'react';
import type { Country, Destination } from '@/types';
import { StepCountry, StepCar, StepDestination, StepLoading, StepResult, StepLead } from '@/components/wizard';
import type { CarFormData } from '@/components/wizard';

/**
 * Calculator — главный компонент визарда.
 * Управляет шагами: страна → данные авто → направление → загрузка → результат → заявка
 *
 * P6.2: StepCountry ✅
 * P6.3: StepCar ✅
 * P6.4: StepDestination ✅
 * P6.5: StepLoading + StepResult ✅
 * P6.6: StepLead ⏳
 */

export type WizardStep = 'country' | 'car' | 'destination' | 'loading' | 'result' | 'lead' | 'error';

export interface WizardState {
  country: Country | null;
  destination: Destination | null;
  price: number;
  year: number;
  engineType: 'petrol' | 'diesel' | 'electric' | 'hybrid';
  horsePower: number;
  engineVolume?: number;
  totalRUB?: number;
  error?: string;
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

  // ─── Handlers ───

  const handleCountrySelect = useCallback((country: Country) => {
    updateState({ country });
    setStep('car');
  }, [updateState]);

  const handleCarSubmit = useCallback((data: CarFormData) => {
    updateState({
      price: data.price,
      year: data.year,
      engineType: data.engineType,
      horsePower: data.horsePower,
      engineVolume: data.engineVolume,
    });
    setStep('destination');
  }, [updateState]);

  const handleDestinationSubmit = useCallback((destination: Destination) => {
    updateState({ destination });
    setStep('loading');
  }, [updateState]);

  const handleCalcComplete = useCallback((totalRUB: number) => {
    updateState({ totalRUB });
    setStep('result');
  }, [updateState]);

  const handleCalcError = useCallback((error: string) => {
    updateState({ error });
    setStep('error');
  }, [updateState]);

  const handleLeadRequest = useCallback(() => {
    setStep('lead');
  }, []);

  const handleNewCalc = useCallback(() => {
    setState(initialState);
    setStep('country');
  }, []);

  const handleBackToCountry = useCallback(() => setStep('country'), []);
  const handleBackToCar = useCallback(() => setStep('car'), []);
  const handleBackToDestination = useCallback(() => setStep('destination'), []);
  const handleBackToResult = useCallback(() => setStep('result'), []);

  return (
    <main className="min-h-screen flex flex-col">
      {/* ─── Step 1: Выбор страны ─── */}
      {step === 'country' && (
        <StepCountry onSelect={handleCountrySelect} />
      )}

      {/* ─── Step 2: Данные авто ─── */}
      {step === 'car' && state.country && (
        <StepCar
          country={state.country}
          onSubmit={handleCarSubmit}
          onBack={handleBackToCountry}
        />
      )}

      {/* ─── Step 3: Направление ─── */}
      {step === 'destination' && state.country && (
        <StepDestination
          country={state.country}
          price={state.price}
          year={state.year}
          horsePower={state.horsePower}
          engineType={state.engineType}
          onSubmit={handleDestinationSubmit}
          onBack={handleBackToCar}
        />
      )}

      {/* ─── Step 4: Загрузка (API call) ─── */}
      {step === 'loading' && state.country && state.destination && (
        <StepLoading
          country={state.country}
          destination={state.destination}
          price={state.price}
          year={state.year}
          engineType={state.engineType}
          horsePower={state.horsePower}
          engineVolume={state.engineVolume}
          onComplete={handleCalcComplete}
          onError={handleCalcError}
        />
      )}

      {/* ─── Step 5: Результат ─── */}
      {step === 'result' && state.country && state.destination && state.totalRUB && (
        <StepResult
          totalRUB={state.totalRUB}
          country={state.country}
          destination={state.destination}
          price={state.price}
          year={state.year}
          engineType={state.engineType}
          horsePower={state.horsePower}
          onLeadRequest={handleLeadRequest}
          onNewCalc={handleNewCalc}
        />
      )}

      {/* ─── Step 6: Заявка ─── */}
      {step === 'lead' && state.country && state.destination && state.totalRUB && (
        <StepLead
          totalRUB={state.totalRUB}
          country={state.country}
          destination={state.destination}
          price={state.price}
          year={state.year}
          engineType={state.engineType}
          horsePower={state.horsePower}
          onBack={handleBackToResult}
          onNewCalc={handleNewCalc}
        />
      )}

      {/* ─── Ошибка ─── */}
      {step === 'error' && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 animate-fade-in max-w-sm">
            <div className="text-4xl">⚠️</div>
            <h2 className="font-serif text-xl text-gold-100">Ошибка расчёта</h2>
            <p className="text-sm text-neutral-400">{state.error || 'Неизвестная ошибка'}</p>
            <div className="space-y-2 pt-2">
              <button
                onClick={handleBackToDestination}
                className="
                  w-full h-12 text-sm text-gold-400
                  border border-[rgba(196,162,101,0.14)] rounded-lg
                  hover:border-[rgba(196,162,101,0.25)]
                  transition-all duration-250
                "
              >
                Попробовать снова
              </button>
              <button
                onClick={handleNewCalc}
                className="text-sm text-neutral-500 hover:text-gold-300 transition-colors"
              >
                Начать заново
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
