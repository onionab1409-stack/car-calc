'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Country, Destination, EngineType } from '@/types';

/**
 * P6.7 · Хук истории расчётов
 *
 * localStorage, максимум 20 записей, LIFO (новые сверху)
 * Работает только в браузере (SSR-safe)
 */

const STORAGE_KEY = 'car-calc-history';
const MAX_ITEMS = 20;

export interface HistoryEntry {
  id: string;
  timestamp: number;
  country: Country;
  destination: Destination;
  price: number;
  year: number;
  engineType: EngineType;
  horsePower: number;
  totalRUB: number;
}

/** Генерация ID */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Чтение из localStorage (safe) */
function readHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as HistoryEntry[];
  } catch {
    return [];
  }
}

/** Запись в localStorage (safe) */
function writeHistory(entries: HistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Quota exceeded — удаляем старые
    try {
      const trimmed = entries.slice(0, 10);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // Совсем не работает — игнорируем
    }
  }
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  // Загрузка при маунте
  useEffect(() => {
    setEntries(readHistory());
  }, []);

  /** Добавить расчёт в историю */
  const addEntry = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    setEntries(prev => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: generateId(),
        timestamp: Date.now(),
      };
      const updated = [newEntry, ...prev].slice(0, MAX_ITEMS);
      writeHistory(updated);
      return updated;
    });
  }, []);

  /** Удалить одну запись */
  const removeEntry = useCallback((id: string) => {
    setEntries(prev => {
      const updated = prev.filter(e => e.id !== id);
      writeHistory(updated);
      return updated;
    });
  }, []);

  /** Очистить всю историю */
  const clearHistory = useCallback(() => {
    setEntries([]);
    writeHistory([]);
  }, []);

  return {
    entries,
    addEntry,
    removeEntry,
    clearHistory,
    count: entries.length,
    isEmpty: entries.length === 0,
  };
}
