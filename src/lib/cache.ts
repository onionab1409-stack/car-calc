// ============================================
// 💾 TTL Cache (in-memory)
// ============================================
// Подэтап: P4.3 · Бэкенд
//
// Используется для:
//   - Курсы валют: TTL 1 час (rates)
//   - Данные ЦБ: TTL 1 час (cbr)
//   - Парсинг ссылок: TTL 24 часа (будущее)
//
// Фичи:
//   - get/set/delete/has/clear
//   - size() — количество записей
//   - stats() — hit rate, количество expired
//   - Автоочистка expired записей (опционально)
//   - Типизированный (generics)

import { logInfo } from '@/lib/logger';

// ─────────────────────────────────────────────
// 📐 Типы
// ─────────────────────────────────────────────

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export interface CacheStats {
  /** Текущее количество записей */
  size: number;
  /** Количество обращений к кэшу (hit) */
  hits: number;
  /** Количество промахов (miss или expired) */
  misses: number;
  /** Hit rate в процентах */
  hitRate: number;
  /** Количество удалённых expired записей */
  evictions: number;
}

// ─────────────────────────────────────────────
// 📐 Класс
// ─────────────────────────────────────────────

export class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>();
  private _hits = 0;
  private _misses = 0;
  private _evictions = 0;
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * @param name — имя кэша (для логов)
   * @param autoCleanupMs — интервал автоочистки (0 = отключена)
   */
  constructor(
    private name?: string,
    autoCleanupMs: number = 0
  ) {
    if (autoCleanupMs > 0) {
      this.cleanupTimer = setInterval(() => this.cleanup(), autoCleanupMs);
      // Не блокируем процесс
      if (this.cleanupTimer && typeof this.cleanupTimer === 'object' && 'unref' in this.cleanupTimer) {
        this.cleanupTimer.unref();
      }
    }
  }

  /**
   * Получить значение из кэша.
   * Возвращает null если нет или expired.
   */
  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this._misses++;
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this._misses++;
      this._evictions++;
      return null;
    }
    this._hits++;
    return entry.value;
  }

  /**
   * Записать значение с TTL.
   * @param ttlMs — время жизни в миллисекундах
   */
  set(key: string, value: T, ttlMs: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now(),
    });
  }

  /** Удалить конкретный ключ */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /** Проверить наличие (и валидность TTL) */
  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this._evictions++;
      return false;
    }
    return true;
  }

  /** Количество записей (включая expired, до очистки) */
  get size(): number {
    return this.store.size;
  }

  /** Очистить весь кэш */
  clear(): void {
    this.store.clear();
  }

  /** Удалить все expired записи */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        cleaned++;
        this._evictions++;
      }
    }
    if (cleaned > 0 && this.name) {
      logInfo('CACHE', `${this.name}: очищено ${cleaned} expired записей`);
    }
    return cleaned;
  }

  /** Статистика кэша */
  stats(): CacheStats {
    const total = this._hits + this._misses;
    return {
      size: this.store.size,
      hits: this._hits,
      misses: this._misses,
      hitRate: total > 0 ? Math.round((this._hits / total) * 100) : 0,
      evictions: this._evictions,
    };
  }

  /** Сброс статистики */
  resetStats(): void {
    this._hits = 0;
    this._misses = 0;
    this._evictions = 0;
  }

  /** Остановить автоочистку */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /** Оставшееся TTL для ключа (мс), -1 если нет */
  ttl(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return -1;
    const remaining = entry.expiresAt - Date.now();
    return remaining > 0 ? remaining : -1;
  }
}

// ─────────────────────────────────────────────
// 📐 Предустановленные TTL (для единообразия)
// ─────────────────────────────────────────────

export const TTL = {
  /** Курсы валют: 1 час */
  RATES: 60 * 60 * 1000,
  /** Парсинг ссылок: 24 часа */
  PARSE: 24 * 60 * 60 * 1000,
  /** Клиентский кэш API: 5 минут */
  API_CLIENT: 5 * 60 * 1000,
} as const;
