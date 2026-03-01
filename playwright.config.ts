import { defineConfig, devices } from '@playwright/test';

/**
 * P7.4 · Playwright конфигурация для UI-тестов визарда
 *
 * Запуск:
 *   npx playwright test                    — все тесты
 *   npx playwright test --headed           — с браузером
 *   npx playwright test --ui               — интерактивный UI
 *   npx playwright test wizard-flow        — конкретный файл
 */
export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: false,           // визард — последовательный flow
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,                     // один воркер — стабильнее для UI-тестов
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'on-failure' }]],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ru-RU',
    timezoneId: 'Europe/Moscow',
    // Мобильный viewport (Telegram Mini App)
    viewport: { width: 390, height: 844 },
    // Увеличенные таймауты для Next.js dev
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'desktop-chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  /* Dev-сервер автозапуск */
  webServer: {
    command: process.env.CI ? 'npm start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
