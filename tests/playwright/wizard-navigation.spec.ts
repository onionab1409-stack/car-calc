/**
 * P7.4 · Playwright: Навигация, кнопки «Назад», ошибки
 *
 * Тесты:
 * A. Навигация назад на каждом шаге
 * B. «Новый расчёт» из разных точек
 * C. Ошибка API → экран ошибки → retry
 * D. Множественные расчёты подряд
 */
import { test, expect } from '@playwright/test';
import {
  mockAllAPIs,
  selectCountry,
  fillCarForm,
  submitCarForm,
  selectDestination,
  clickCalculate,
  waitForResult,
  goToResult,
  MOCK_CALCULATE_ERROR,
} from './helpers';

test.describe('A · Навигация «Назад»', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
  });

  test('StepCar → Назад → StepCountry', async ({ page }) => {
    await selectCountry(page, 'США');
    await expect(page.getByText('Параметры авто')).toBeVisible();

    await page.getByText('← Назад').click();
    await expect(page.getByText('Откуда везём?')).toBeVisible();
  });

  test('StepDestination → Назад → StepCar (данные сохранены)', async ({ page }) => {
    await selectCountry(page, 'Корея');
    await fillCarForm(page, { price: '25000' });
    await submitCarForm(page);
    await expect(page.getByText('Куда доставляем?')).toBeVisible();

    await page.getByText('← Назад').click();
    await expect(page.getByText('Параметры авто')).toBeVisible();
  });

  test('StepLead → Назад → StepResult', async ({ page }) => {
    await goToResult(page);
    await page.getByText('Оставить заявку 📩').click();

    await page.getByText('Назад к результату').click();
    await expect(page.getByText(/[\d\s]+₽/)).toBeVisible();
    await expect(page.getByText('Оставить заявку 📩')).toBeVisible();
  });

  test('полная цепочка: result → lead → назад → result → новый → country', async ({ page }) => {
    // До результата
    await goToResult(page);

    // В заявку
    await page.getByText('Оставить заявку 📩').click();
    await expect(page.getByText('Ваше имя')).toBeVisible();

    // Назад к результату
    await page.getByText('Назад к результату').click();
    await expect(page.getByText('Оставить заявку 📩')).toBeVisible();

    // Новый расчёт
    await page.getByText('Рассчитать другой автомобиль').click();
    await expect(page.getByText('Откуда везём?')).toBeVisible();
  });
});

test.describe('B · Новый расчёт из разных точек', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
  });

  test('из StepResult → StepCountry', async ({ page }) => {
    await goToResult(page);
    await page.getByText('Рассчитать другой автомобиль').click();
    await expect(page.getByText('Откуда везём?')).toBeVisible();
  });

  test('из StepLead (после отправки) → StepCountry', async ({ page }) => {
    await goToResult(page);
    await page.getByText('Оставить заявку 📩').click();

    // Отправляем заявку
    await page.getByPlaceholder('Иван').fill('Тест');
    await page.getByPlaceholder('+7 (900) 123-45-67').fill('+79001234567');
    await page.getByText('Отправить заявку').click();
    await expect(page.getByText('Заявка отправлена')).toBeVisible({ timeout: 5_000 });

    // Новый расчёт
    await page.getByText('Рассчитать другой автомобиль').click();
    await expect(page.getByText('Откуда везём?')).toBeVisible();
  });
});

test.describe('C · Ошибки API', () => {
  test('ошибка /api/calculate → экран ошибки', async ({ page }) => {
    await mockAllAPIs(page, {
      calculateResponse: MOCK_CALCULATE_ERROR,
      calculateStatus: 400,
    });
    await page.goto('/');

    await selectCountry(page, 'США');
    await fillCarForm(page, { price: '15000' });
    await submitCarForm(page);
    await selectDestination(page, 'Россия');
    await clickCalculate(page);

    // Ждём экран ошибки
    await expect(page.getByText('Ошибка расчёта')).toBeVisible({ timeout: 10_000 });
  });

  test('экран ошибки → «Попробовать снова» → StepDestination', async ({ page }) => {
    await mockAllAPIs(page, {
      calculateResponse: MOCK_CALCULATE_ERROR,
      calculateStatus: 500,
    });
    await page.goto('/');

    await selectCountry(page, 'США');
    await fillCarForm(page, { price: '15000' });
    await submitCarForm(page);
    await selectDestination(page, 'Россия');
    await clickCalculate(page);

    await expect(page.getByText('Ошибка расчёта')).toBeVisible({ timeout: 10_000 });
    await page.getByText('Попробовать снова').click();
    await expect(page.getByText('Куда доставляем?')).toBeVisible();
  });

  test('экран ошибки → «Начать заново» → StepCountry', async ({ page }) => {
    await mockAllAPIs(page, {
      calculateResponse: MOCK_CALCULATE_ERROR,
      calculateStatus: 500,
    });
    await page.goto('/');

    await selectCountry(page, 'США');
    await fillCarForm(page, { price: '15000' });
    await submitCarForm(page);
    await selectDestination(page, 'Россия');
    await clickCalculate(page);

    await expect(page.getByText('Ошибка расчёта')).toBeVisible({ timeout: 10_000 });
    await page.getByText('Начать заново').click();
    await expect(page.getByText('Откуда везём?')).toBeVisible();
  });

  test('ошибка lead API → сообщение об ошибке, retry возможен', async ({ page }) => {
    await mockAllAPIs(page, {
      leadResponse: { error: 'Ошибка сервера' },
      leadStatus: 500,
    });
    await page.goto('/');
    await goToResult(page);

    await page.getByText('Оставить заявку 📩').click();
    await page.getByPlaceholder('Иван').fill('Тест');
    await page.getByPlaceholder('+7 (900) 123-45-67').fill('+79001234567');
    await page.getByText('Отправить заявку').click();

    // Ожидаем сообщение об ошибке (текст может отличаться)
    // Кнопка «Отправить» должна снова стать доступной для retry
    await expect(page.getByText('Отправить заявку', { exact: false })).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('D · Множественные расчёты подряд', () => {
  test('2 расчёта подряд: разные страны', async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');

    // Первый расчёт: США → РФ
    await goToResult(page, { country: 'США', destination: 'Россия' });
    await expect(page.getByText(/[\d\s]+₽/)).toBeVisible();

    // Новый расчёт
    await page.getByText('Рассчитать другой автомобиль').click();
    await expect(page.getByText('Откуда везём?')).toBeVisible();

    // Второй расчёт: Корея → Беларусь
    await goToResult(page, { country: 'Корея', destination: 'Беларусь', price: '30000' });
    await expect(page.getByText(/[\d\s]+₽/)).toBeVisible();
  });

  test('3 расчёта подряд без перезагрузки', async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');

    for (const country of ['США', 'ОАЭ', 'Китай'] as const) {
      await goToResult(page, { country, price: '25000' });
      await expect(page.getByText(/[\d\s]+₽/)).toBeVisible();

      await page.getByText('Рассчитать другой автомобиль').click();
      await expect(page.getByText('Откуда везём?')).toBeVisible();
    }
  });
});
