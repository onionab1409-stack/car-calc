/**
 * Кэш с TTL
 *
 * Курсы валют: TTL 1 час
 * Результаты парсинга tks.ru: TTL 24 часа
 *
 * Реализация: P4 · Бэкенд (подэтап 4.3)
 */

// TODO: P4
export class TTLCache<T> {
  private store = new Map<string, { value: T; expiresAt: number }>();

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  clear(): void {
    this.store.clear();
  }
}
