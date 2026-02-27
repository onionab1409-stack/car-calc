// ============================================
// 🧪 Тесты TTLCache
// ============================================
// P4.3 · Кэш с TTL

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TTLCache, TTL } from '@/lib/cache';

describe('TTLCache', () => {
  let cache: TTLCache<string>;

  beforeEach(() => {
    cache = new TTLCache<string>('test');
  });

  // --- Базовые операции ---

  it('set/get — записывает и читает', () => {
    cache.set('key1', 'value1', 60_000);
    expect(cache.get('key1')).toBe('value1');
  });

  it('get — возвращает null для несуществующего ключа', () => {
    expect(cache.get('nonexistent')).toBeNull();
  });

  it('set перезаписывает значение', () => {
    cache.set('key', 'old', 60_000);
    cache.set('key', 'new', 60_000);
    expect(cache.get('key')).toBe('new');
  });

  it('delete удаляет ключ', () => {
    cache.set('key', 'val', 60_000);
    expect(cache.delete('key')).toBe(true);
    expect(cache.get('key')).toBeNull();
  });

  it('delete возвращает false для несуществующего', () => {
    expect(cache.delete('nope')).toBe(false);
  });

  it('has — true для существующего', () => {
    cache.set('key', 'val', 60_000);
    expect(cache.has('key')).toBe(true);
  });

  it('has — false для несуществующего', () => {
    expect(cache.has('nope')).toBe(false);
  });

  it('size — количество записей', () => {
    expect(cache.size).toBe(0);
    cache.set('a', '1', 60_000);
    cache.set('b', '2', 60_000);
    expect(cache.size).toBe(2);
  });

  it('clear — очищает всё', () => {
    cache.set('a', '1', 60_000);
    cache.set('b', '2', 60_000);
    cache.clear();
    expect(cache.size).toBe(0);
    expect(cache.get('a')).toBeNull();
  });

  // --- TTL ---

  it('expired запись возвращает null', () => {
    vi.useFakeTimers();
    cache.set('key', 'val', 1000); // TTL 1 сек
    expect(cache.get('key')).toBe('val');

    vi.advanceTimersByTime(1001); // прошла 1 сек
    expect(cache.get('key')).toBeNull();
    vi.useRealTimers();
  });

  it('has возвращает false для expired', () => {
    vi.useFakeTimers();
    cache.set('key', 'val', 500);
    vi.advanceTimersByTime(501);
    expect(cache.has('key')).toBe(false);
    vi.useRealTimers();
  });

  it('ttl() возвращает оставшееся время', () => {
    vi.useFakeTimers();
    cache.set('key', 'val', 10_000);
    vi.advanceTimersByTime(3_000);
    const remaining = cache.ttl('key');
    expect(remaining).toBeCloseTo(7_000, -2);
    vi.useRealTimers();
  });

  it('ttl() возвращает -1 для несуществующего', () => {
    expect(cache.ttl('nope')).toBe(-1);
  });

  it('ttl() возвращает -1 для expired', () => {
    vi.useFakeTimers();
    cache.set('key', 'val', 100);
    vi.advanceTimersByTime(200);
    expect(cache.ttl('key')).toBe(-1);
    vi.useRealTimers();
  });

  // --- Cleanup ---

  it('cleanup удаляет expired записи', () => {
    vi.useFakeTimers();
    cache.set('fresh', 'val', 60_000);
    cache.set('stale', 'val', 100);
    vi.advanceTimersByTime(200);
    const cleaned = cache.cleanup();
    expect(cleaned).toBe(1);
    expect(cache.has('fresh')).toBe(true);
    expect(cache.has('stale')).toBe(false);
    vi.useRealTimers();
  });

  it('cleanup возвращает 0 если нечего чистить', () => {
    cache.set('a', '1', 60_000);
    expect(cache.cleanup()).toBe(0);
  });

  // --- Stats ---

  it('stats: hits и misses', () => {
    cache.set('key', 'val', 60_000);
    cache.get('key');     // hit
    cache.get('key');     // hit
    cache.get('nope');    // miss

    const s = cache.stats();
    expect(s.hits).toBe(2);
    expect(s.misses).toBe(1);
    expect(s.hitRate).toBe(67); // 2/3 = 67%
  });

  it('stats: evictions при expired get', () => {
    vi.useFakeTimers();
    cache.set('key', 'val', 100);
    vi.advanceTimersByTime(200);
    cache.get('key'); // expired → eviction + miss

    const s = cache.stats();
    expect(s.evictions).toBe(1);
    expect(s.misses).toBe(1);
    vi.useRealTimers();
  });

  it('resetStats сбрасывает счётчики', () => {
    cache.set('key', 'val', 60_000);
    cache.get('key');
    cache.get('nope');
    cache.resetStats();
    const s = cache.stats();
    expect(s.hits).toBe(0);
    expect(s.misses).toBe(0);
    expect(s.hitRate).toBe(0);
  });

  // --- Типизация ---

  it('работает с объектами', () => {
    const objCache = new TTLCache<{ a: number; b: string }>();
    objCache.set('obj', { a: 1, b: 'hello' }, 60_000);
    const val = objCache.get('obj');
    expect(val).toEqual({ a: 1, b: 'hello' });
  });

  it('работает с числами', () => {
    const numCache = new TTLCache<number>();
    numCache.set('rate', 78.50, 60_000);
    expect(numCache.get('rate')).toBe(78.50);
  });
});

// --- TTL константы ---

describe('TTL constants', () => {
  it('RATES = 1 час', () => {
    expect(TTL.RATES).toBe(3_600_000);
  });
  it('PARSE = 24 часа', () => {
    expect(TTL.PARSE).toBe(86_400_000);
  });
  it('API_CLIENT = 5 минут', () => {
    expect(TTL.API_CLIENT).toBe(300_000);
  });
});
