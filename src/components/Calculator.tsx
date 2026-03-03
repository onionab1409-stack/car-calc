'use client';

import React, { useState, useCallback } from 'react';
import type { Country } from '@/types';
import {
  StepCountry, StepForm, StepHistory,
  useHistory,
} from '@/components/wizard';
import type { HistoryEntry } from '@/components/wizard';

/**
 * Calculator — главный компонент визарда.
 * 2 основных экрана: выбор страны → единая форма (параметры + расчёт + заявка)
 * + экран истории
 */

export type WizardStep = 'country' | 'form' | 'history';

export function Calculator() {
  const [step, setStep] = useState<WizardStep>('country');
  const [country, setCountry] = useState<Country | null>(null);
  const history = useHistory();

  // ─── Handlers ───

  const handleCountrySelect = useCallback((c: Country) => {
    setCountry(c);
    setStep('form');
  }, []);

  const handleBackToCountry = useCallback(() => {
    setStep('country');
  }, []);

  const handleShowHistory = useCallback(() => {
    setStep('history');
  }, []);

  const handleCalcComplete = useCallback((data: {
    country: Country;
    destination: string;
    price: number;
    year: number;
    engineType: string;
    horsePower: number;
    totalRUB: number;
  }) => {
    history.addEntry({
      country: data.country as HistoryEntry['country'],
      destination: data.destination as HistoryEntry['destination'],
      price: data.price,
      year: data.year,
      engineType: data.engineType as HistoryEntry['engineType'],
      horsePower: data.horsePower,
      totalRUB: data.totalRUB,
    });
  }, [history]);

  const handleHistorySelect = useCallback((entry: HistoryEntry) => {
    setCountry(entry.country);
    setStep('form');
  }, []);

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

      {step === 'form' && country && (
        <StepForm
          country={country}
          onBack={handleBackToCountry}
          onCalcComplete={handleCalcComplete}
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
    </main>
  );
}

/** Плавающая кнопка истории на экране выбора страны */
function HistoryButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-5 z-10 flex items-center gap-2 animate-slide-up card-3d !rounded-full !px-4 !py-2.5"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="var(--gold-warm)" strokeWidth="1.2" />
        <path d="M8 4.5V8L10 10" stroke="var(--gold-warm)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span className="text-xs" style={{ color: 'var(--txt-gold)' }}>История</span>
      <span className="pill-3d !text-[10px] !h-[20px] !px-[6px]">{count}</span>
    </button>
  );
}
