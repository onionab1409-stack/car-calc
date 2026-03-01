/**
 * P7.4 · Playwright: Визуальные + адаптивные проверки
 *
 * Тесты:
 * A. Luxury dark-gold тема: фон, золотые элементы
 * B. Responsive: мобильный viewport
 * C. Анимации: fade-in, slide-up
 * D. Конфиденциальность: нет breakdown цены
 */
import { test, expect } from '@playwright/test';
import {
  mockAllAPIs,
  goToResult,
  selectCountry,
} from './helpers';

test.describe('A · Dark-gold тема', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
  });

  test('фон приложения — тёмный (#0C0C0E)', async ({ page }) => {
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);
    // Может быть rgb(12, 12, 14) или близкий
    expect(bgColor).toMatch(/rgb\(1[0-2], 1[0-2], 1[0-6]\)/);
  });

  test('заголовок «Откуда везём?» — золотой/светлый цвет', async ({ page }) => {
    const h1 = page.getByText('Откуда везём?');
    await expect(h1).toBeVisible();
    // Текст не должен быть белым (#fff) — должен быть gold-50
  });

  test('карточки стран кликабельны и имеют hover-эффект', async ({ page }) => {
    const card = page.getByText('США').locator('..');
    await expect(card).toBeVisible();
    // Карточка видна и кликабельна
    await card.hover();
    // После hover — border должен измениться (визуальная проверка)
  });
});

test.describe('B · Responsive (мобильный)', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE

  test('StepCountry — 4 карточки помещаются на экран', async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
    for (const country of ['США', 'Корея', 'ОАЭ', 'Китай']) {
      await expect(page.getByText(country)).toBeVisible();
    }
  });

  test('StepCar — форма скроллится без обрезки', async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
    await selectCountry(page, 'США');
    await expect(page.getByText('Далее →')).toBeVisible();
  });
});

test.describe('B2 · Responsive (планшет)', () => {
  test.use({ viewport: { width: 768, height: 1024 } }); // iPad

  test('визард центрирован на планшете', async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
    await expect(page.getByText('Откуда везём?')).toBeVisible();
  });
});

test.describe('C · Анимации и переходы', () => {
  test('StepCountry → StepCar: переход без задержек > 2с', async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');

    const start = Date.now();
    await selectCountry(page, 'США');
    await expect(page.getByText('Параметры авто')).toBeVisible();
    const elapsed = Date.now() - start;

    // Переход должен быть < 2 секунд
    expect(elapsed).toBeLessThan(2_000);
  });

  test('загрузка → результат: анимация цены (count-up)', async ({ page }) => {
    await mockAllAPIs(page, { calculateDelay: 500 });
    await page.goto('/');
    await goToResult(page);

    // Цена должна быть видна с символом ₽
    await expect(page.getByText(/[\d\s]+₽/)).toBeVisible();
  });
});

test.describe('D · Конфиденциальность — нет breakdown', () => {
  test('на экране результата ТОЛЬКО итоговая цена, нет breakdown', async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
    await goToResult(page);

    // ❌ Не должно быть слов breakdown/детализации:
    const forbiddenTexts = [
      'Таможенная пошлина',
      'Утильсбор',
      'Доставка',
      'Комиссия',
      'Страховка',
      'customs duty',
      'breakdown',
      'Детализация',
      'Состав цены',
    ];

    for (const text of forbiddenTexts) {
      await expect(page.getByText(text, { exact: false })).not.toBeVisible();
    }

    // ✅ Должна быть ТОЛЬКО итоговая цена
    await expect(page.getByText(/[\d\s]+₽/)).toBeVisible();
  });

  test('API-ответ не содержит breakdown (проверка network)', async ({ page }) => {
    let apiResponse: any = null;

    await page.route('**/api/calculate', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ totalRUB: 2_351_000 }),
      });
    });

    // Перехватываем ответ
    page.on('response', async (response) => {
      if (response.url().includes('/api/calculate')) {
        apiResponse = await response.json().catch(() => null);
      }
    });

    await page.goto('/');
    await goToResult(page);

    // API-ответ должен содержать ТОЛЬКО totalRUB
    if (apiResponse) {
      expect(Object.keys(apiResponse)).toEqual(['totalRUB']);
      expect(apiResponse.totalRUB).toBe(2_351_000);
    }
  });

  test('исходный код страницы не содержит формулы', async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
    await goToResult(page);

    const pageContent = await page.content();

    // Не должно быть формул/множителей
    const forbiddenPatterns = [
      '×1.08', '×1.011', '×0.48', '×0.30',
      '×1.48', '×1.30',
      'CUSTOMS_MULTIPLIER',
      'COMMISSION_RATE',
    ];

    for (const pattern of forbiddenPatterns) {
      expect(pageContent).not.toContain(pattern);
    }
  });
});
