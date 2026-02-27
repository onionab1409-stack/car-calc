// ============================================
// 🚦 Rate Limiter (in-memory)
// ============================================
// Подэтап: P4.2 · Бэкенд
//
// Простой rate limiter на основе Map.
// Ключ: IP или telegramUserId.
// Автоочистка старых записей каждые 5 минут.

import { logInfo } from '@/lib/logger';

// ─────────────────────────────────────────────
// 📐 Типы
// ─────────────────────────────────────────────

interface RateLimitEntry {
  /** Временные метки запросов (ms) */
  timestamps: number[];
}

interface RateLimitConfig {
  /** Максимум запросов за окно */
  maxRequests: number;
  /** Размер окна в миллисекундах */
  windowMs: number;
}

// ─────────────────────────────────────────────
// 🌐 Конфиги по endpoint-ам
// ─────────────────────────────────────────────

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/api/calculate': { maxRequests: 10, windowMs: 60_000 },  // 10/мин
  '/api/rates':     { maxRequests: 30, windowMs: 60_000 },  // 30/мин
  '/api/lead':      { maxRequests: 3,  windowMs: 60_000 },  // 3/мин
};

// ─────────────────────────────────────────────
// 💾 Хранилище
// ─────────────────────────────────────────────

/** key = `${endpoint}:${clientId}` */
const store = new Map<string, RateLimitEntry>();

/** Интервал автоочистки (5 мин) */
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      // Удаляем записи, где все таймстемпы старше 2 минут
      entry.timestamps = entry.timestamps.filter((t) => now - t < 120_000);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, 300_000); // каждые 5 минут

  // Не блокируем процесс
  if (cleanupInterval && typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
    cleanupInterval.unref();
  }
}

// ─────────────────────────────────────────────
// 📐 Основная функция
// ─────────────────────────────────────────────

export interface RateLimitResult {
  /** Разрешён ли запрос */
  allowed: boolean;
  /** Сколько запросов осталось */
  remaining: number;
  /** Через сколько мс сбросится лимит */
  resetMs: number;
}

/**
 * Проверяет rate limit для клиента.
 *
 * @param endpoint — путь API (для выбора конфига)
 * @param clientId — IP или telegramUserId
 * @returns RateLimitResult
 */
export function checkRateLimit(
  endpoint: string,
  clientId: string
): RateLimitResult {
  ensureCleanup();

  const config = RATE_LIMITS[endpoint];
  if (!config) {
    // Неизвестный endpoint — пропускаем
    return { allowed: true, remaining: 999, resetMs: 0 };
  }

  const key = `${endpoint}:${clientId}`;
  const now = Date.now();

  // Получаем или создаём запись
  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Убираем таймстемпы за пределами окна
  entry.timestamps = entry.timestamps.filter(
    (t) => now - t < config.windowMs
  );

  // Проверяем лимит
  if (entry.timestamps.length >= config.maxRequests) {
    // Вычисляем когда освободится самый старый слот
    const oldestInWindow = entry.timestamps[0];
    const resetMs = oldestInWindow + config.windowMs - now;

    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(0, resetMs),
    };
  }

  // Разрешаем и записываем
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.timestamps.length,
    resetMs: config.windowMs,
  };
}

/**
 * Извлекает ID клиента из запроса.
 * Приоритет: X-Telegram-User-Id → X-Forwarded-For → IP fallback.
 */
export function getClientId(headers: Headers): string {
  // Telegram User ID (если есть)
  const tgUserId = headers.get('x-telegram-user-id');
  if (tgUserId) return `tg:${tgUserId}`;

  // IP из прокси
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return `ip:${forwarded.split(',')[0].trim()}`;

  const realIp = headers.get('x-real-ip');
  if (realIp) return `ip:${realIp}`;

  return 'ip:unknown';
}

/** Сброс для тестов */
export function _resetRateLimiter(): void {
  store.clear();
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
}
