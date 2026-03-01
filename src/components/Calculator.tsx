'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Country, Destination, EngineType } from '@/types';
import {
  StepCountry, StepCar, StepDestination, StepLoading, StepResult, StepLead, StepHistory,
  useHistory,
} from '@/components/wizard';
import type { CarFormData, HistoryEntry } from '@/components/wizard';

/**
 * Calculator — главный компонент визарда.
 * P6.2–P6.7: все шаги + история
 */

export type WizardStep = 'country' | 'car' | 'destination' | 'loading' | 'result' | 'lead' | 'error' | 'history';

export interface WizardState {
  country: Country | null;
  destination: Destination | null;
  price: number;
  year: number;
  engineType: EngineType;
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
  const history = useHistory();
  const savedToHistoryRef = useRef(false);

  const updateState = useCallback((patch: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  // Сохранение в историю при получении результата
  useEffect(() => {
    if (step === 'result' && state.totalRUB && state.country && state.destination && !savedToHistoryRef.current) {
      savedToHistoryRef.current = true;
      history.addEntry({
        country: state.country,
        destination: state.destination,
        price: state.price,
        year: state.year,
        engineType: state.engineType,
        horsePower: state.horsePower,
        totalRUB: state.totalRUB,
      });
    }
  }, [step, state, history]);

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
    savedToHistoryRef.current = false;
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

  const handleLeadRequest = useCallback(() => setStep('lead'), []);
  const handleShowHistory = useCallback(() => setStep('history'), []);

  const handleNewCalc = useCallback(() => {
    setState(initialState);
    savedToHistoryRef.current = false;
    setStep('country');
  }, []);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    setState({
      country: entry.country,
      destination: entry.destination,
      price: entry.price,
      year: entry.year,
      engineType: entry.engineType,
      horsePower: entry.horsePower,
    });
    savedToHistoryRef.current = false;
    setStep('loading');
  }, []);

  const handleBackToCountry = useCallback(() => setStep('country'), []);
  const handleBackToCar = useCallback(() => setStep('car'), []);
  const handleBackToDestination = useCallback(() => setStep('destination'), []);
  const handleBackToResult = useCallback(() => setStep('result'), []);

  return (
    <main className="min-h-screen flex flex-col relative">
      {step === 'country' && (
        <>
          <StepCountry onSelect={handleCountrySelect} />
          {history.count > 0 && (
            <HistoryButton count={history.count} onClick={handleShowHistory} />
          )}
        </>
      )}

      {step === 'car' && state.country && (
        <StepCar
          country={state.country}
          onSubmit={handleCarSubmit}
          onBack={handleBackToCountry}
        />
      )}

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

      {step === 'history' && (
        <StepHistory
          entries={history.entries}
          onSelectEntry={handleHistorySelect}
          onClearHistory={history.clearHistory}
          onRemoveEntry={history.removeEntry}
          onBack={handleBackToCountry}
        />
      )}

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

/** Плавающая кнопка истории на экране выбора страны */
function HistoryButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-6 right-5 z-10
        flex items-center gap-2
        bg-bg-card border border-[rgba(196,162,101,0.14)]
        rounded-full px-4 py-2.5
        hover:border-[rgba(196,162,101,0.30)]
        hover:shadow-[0_0_20px_rgba(196,162,101,0.08)]
        transition-all duration-250
        animate-slide-up
      "
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gold-400">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 4.5V8L10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span className="text-xs text-gold-300">История</span>
      <span className="bg-[rgba(196,162,101,0.15)] text-gold-400 text-[10px] font-medium px-1.5 py-0.5 rounded-full">
        {count}
      </span>
    </button>
  );
}
