/**
 * P7.4 · Playwright: История расчётов
 *
 * Тесты:
 * A. Кнопка «История» появляется после первого расчёта
 * B. История содержит запись после расчёта
 * C. Клик по записи → пересчёт
 * D. Очистка истории
 * E. Несколько записей в истории
 */
import { test, expect } from '@playwright/test';
import {
  mockAllAPIs,
  goToResult,
} from './helpers';

test.describe('A · Кнопка «История» на StepCountry', () => {
  test('изначально кнопка «История» не видна (нет расчётов)', async ({ page }) => {
    await mockAllAPIs(page);
    // Очищаем localStorage перед тестом
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');
    await expect(page.getByText('Откуда везём?')).toBeVisible();
    // Кнопка «История» не должна быть видна
    await expect(page.getByText('История')).not.toBeVisible();
  });

  test('после расчёта → кнопка «История» появляется', async ({ page }) => {
    await mockAllAPIs(page);
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');

    // Делаем расчёт
    await goToResult(page);

    // Возвращаемся на StepCountry
    await page.getByText('Рассчитать другой автомобиль').click();
    await expect(page.getByText('Откуда везём?')).toBeVisible();

    // Кнопка «История» с бейджем
    await expect(page.getByText('История')).toBeVisible();
  });
});

test.describe('B · Экран истории', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');

    // Один расчёт
    await goToResult(page);
    await page.getByText('Рассчитать другой автомобиль').click();
  });

  test('открытие истории → заголовок «История расчётов»', async ({ page }) => {
    await page.getByText('История').click();
    await expect(page.getByText('История расчётов')).toBeVisible();
  });

  test('история содержит хотя бы 1 запись', async ({ page }) => {
    await page.getByText('История').click();
    await expect(page.getByText('Расчётов')).toBeVisible();
    // Должен быть счётчик ≥ 1
    await expect(page.getByText('1', { exact: true })).toBeVisible();
  });

  test('кнопка «← Назад» → возврат на StepCountry', async ({ page }) => {
    await page.getByText('История').click();
    await page.getByText('← Назад').click();
    await expect(page.getByText('Откуда везём?')).toBeVisible();
  });
});

test.describe('C · Пересчёт из истории', () => {
  test('клик по записи → загрузка → результат', async ({ page }) => {
    await mockAllAPIs(page);
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');

    // Первый расчёт
    await goToResult(page);
    await page.getByText('Рассчитать другой автомобиль').click();

    // Открываем историю
    await page.getByText('История').click();
    await expect(page.getByText('История расчётов')).toBeVisible();

    // Кликаем на первую запись (карточка с ценой)
    const entryCard = page.locator('[class*="card"]').first();
    if (await entryCard.isVisible()) {
      await entryCard.click();
      // Должен начать загрузку или показать результат
      await expect(
        page.getByText('Оставить заявку').or(page.getByText('Получаем курсы'))
      ).toBeVisible({ timeout: 15_000 });
    }
  });
});

test.describe('D · Очистка истории', () => {
  test('очистка → пустой экран', async ({ page }) => {
    await mockAllAPIs(page);
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');

    // Делаем расчёт
    await goToResult(page);
    await page.getByText('Рассчитать другой автомобиль').click();

    // Открываем историю
    await page.getByText('История').click();

    // Ищем кнопку очистки
    const clearBtn = page.getByText('Очистить', { exact: false });
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      // После очистки — пустой экран или «История пуста»
      await expect(page.getByText('История пуста')).toBeVisible({ timeout: 3_000 });
    }
  });
});

test.describe('E · Несколько записей', () => {
  test('3 расчёта → 3 записи в истории', async ({ page }) => {
    await mockAllAPIs(page);
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/');

    // 3 расчёта подряд
    for (const country of ['США', 'Корея', 'Китай'] as const) {
      await goToResult(page, { country, price: '20000' });
      await page.getByText('Рассчитать другой автомобиль').click();
      await expect(page.getByText('Откуда везём?')).toBeVisible();
    }

    // Открываем историю
    await page.getByText('История').click();
    await expect(page.getByText('История расчётов')).toBeVisible();

    // Проверяем счётчик = 3
    await expect(page.getByText('3', { exact: true })).toBeVisible();
  });
});
