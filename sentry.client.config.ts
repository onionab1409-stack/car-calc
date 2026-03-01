// ============================================
// 🔍 Sentry — Client-side (браузер)
// ============================================

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Процент трейсов (10% в продакшене)
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Replay (записи сессий) — 5% сессий, 100% при ошибке
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,

    // Не отправлять в dev
    enabled: process.env.NODE_ENV === 'production',

    // Фильтруем шум
    ignoreErrors: [
      'ResizeObserver loop',
      'Non-Error promise rejection',
      'Network request failed',
    ],
  });
}
