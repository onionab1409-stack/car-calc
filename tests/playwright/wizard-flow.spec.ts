/**
 * P7.4 · Playwright: Happy Path — полный flow визарда
 *
 * Тесты:
 * A. Выбор страны (4 страны)
 * B. Заполнение формы авто
 * C. Выбор направления
 * D. Загрузка + анимация
 * E. Экран результата
 * F. Форма заявки
 * G. Полный path для каждой страны
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
  MOCK_CALCULATE_OK,
} from './helpers';

test.describe('A · Экран выбора страны', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
  });

  test('заголовок «Откуда везём?» виден', async ({ page }) => {
    await expect(page.getByText('Откуда везём?')).toBeVisible();
  });

  test('4 карточки стран отображаются', async ({ page }) => {
    for (const country of ['США', 'Корея', 'ОАЭ', 'Китай']) {
      await expect(page.getByText(country, { exact: false })).toBeVisible();
    }
  });

  test('клик по США → переход на StepCar', async ({ page }) => {
    await selectCountry(page, 'США');
    await expect(page.getByText('Параметры авто')).toBeVisible();
  });

  test('клик по Корея → переход на StepCar', async ({ page }) => {
    await selectCountry(page, 'Корея');
    await expect(page.getByText('Параметры авто')).toBeVisible();
  });

  test('клик по ОАЭ → переход на StepCar', async ({ page }) => {
    await selectCountry(page, 'ОАЭ');
    await expect(page.getByText('Параметры авто')).toBeVisible();
  });

  test('клик по Китай → переход на StepCar', async ({ page }) => {
    await selectCountry(page, 'Китай');
    await expect(page.getByText('Параметры авто')).toBeVisible();
  });
});

test.describe('B · Форма ввода данных авто', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
    await selectCountry(page, 'США');
  });

  test('заголовок и флаг страны отображаются', async ({ page }) => {
    await expect(page.getByText('Параметры авто')).toBeVisible();
    await expect(page.getByText('🇺🇸')).toBeVisible();
  });

  test('4 типа двигателя видны', async ({ page }) => {
    for (const type of ['Бензин', 'Дизель', 'Электро', 'Гибрид']) {
      await expect(page.getByText(type)).toBeVisible();
    }
  });

  test('pills годов видны', async ({ page }) => {
    await expect(page.getByText('Новый')).toBeVisible();
  });

  test('кнопка «Далее» видна', async ({ page }) => {
    await expect(page.getByText('Далее →')).toBeVisible();
  });

  test('кнопка «Назад» видна', async ({ page }) => {
    await expect(page.getByText('← Назад')).toBeVisible();
  });

  test('заполнение формы + Далее → переход на StepDestination', async ({ page }) => {
    await fillCarForm(page, { price: '15000' });
    await submitCarForm(page);
    await expect(page.getByText('Куда доставляем?')).toBeVisible();
  });

  test('переключение типа двигателя на Электро', async ({ page }) => {
    await page.getByText('Электро').click();
    // Электро — поле мощности в кВт (зависит от реализации)
    await fillCarForm(page, { price: '30000' });
    await submitCarForm(page);
    await expect(page.getByText('Куда доставляем?')).toBeVisible();
  });

  test('выбор года из прошлых', async ({ page }) => {
    const prevYear = String(new Date().getFullYear() - 3);
    await page.getByText(prevYear, { exact: true }).click();
    await fillCarForm(page, { price: '20000' });
    await submitCarForm(page);
    await expect(page.getByText('Куда доставляем?')).toBeVisible();
  });
});

test.describe('C · Выбор направления', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
    await selectCountry(page, 'США');
    await fillCarForm(page, { price: '15000' });
    await submitCarForm(page);
  });

  test('заголовок «Куда доставляем?»', async ({ page }) => {
    await expect(page.getByText('Куда доставляем?')).toBeVisible();
  });

  test('2 направления: Россия и Беларусь', async ({ page }) => {
    await expect(page.getByText('Россия')).toBeVisible();
    await expect(page.getByText('Беларусь')).toBeVisible();
  });

  test('кнопка «Рассчитать стоимость» появляется после выбора', async ({ page }) => {
    await selectDestination(page, 'Россия');
    await expect(page.getByText('Рассчитать стоимость →')).toBeVisible();
  });

  test('«Назад» → возврат на StepCar', async ({ page }) => {
    await page.getByText('← Назад').click();
    await expect(page.getByText('Параметры авто')).toBeVisible();
  });
});

test.describe('D · Экран загрузки', () => {
  test.beforeEach(async ({ page }) => {
    // Замедляем ответ API для отлова анимации
    await mockAllAPIs(page, { calculateDelay: 2000 });
    await page.goto('/');
    await selectCountry(page, 'США');
    await fillCarForm(page, { price: '15000' });
    await submitCarForm(page);
    await selectDestination(page, 'Россия');
    await clickCalculate(page);
  });

  test('показывает стадии загрузки', async ({ page }) => {
    // Хотя бы одна стадия должна быть видна
    const stages = [
      'Получаем курсы валют',
      'Рассчитываем таможню',
      'Считаем доставку',
      'Добавляем все сборы',
      'Формируем итог',
    ];
    // Ждём любой из стадий
    const anyStage = page.locator(`text=/${stages.join('|')}/`);
    await expect(anyStage.first()).toBeVisible({ timeout: 5_000 });
  });

  test('после загрузки → переход на результат', async ({ page }) => {
    await waitForResult(page);
    await expect(page.getByText('Оставить заявку')).toBeVisible();
  });
});

test.describe('E · Экран результата', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
    await goToResult(page);
  });

  test('итоговая цена отображается', async ({ page }) => {
    // Цена formatRUB: «2 351 000 ₽» (с пробелами)
    await expect(page.getByText(/[\d\s]+₽/)).toBeVisible();
  });

  test('параметры расчёта видны', async ({ page }) => {
    await expect(page.getByText('Параметры расчёта')).toBeVisible();
  });

  test('кнопка «Оставить заявку 📩»', async ({ page }) => {
    await expect(page.getByText('Оставить заявку 📩')).toBeVisible();
  });

  test('кнопка «Рассчитать другой автомобиль»', async ({ page }) => {
    await expect(page.getByText('Рассчитать другой автомобиль')).toBeVisible();
  });

  test('«Рассчитать другой» → возврат на StepCountry', async ({ page }) => {
    await page.getByText('Рассчитать другой автомобиль').click();
    await expect(page.getByText('Откуда везём?')).toBeVisible();
  });

  test('«Оставить заявку» → переход на StepLead', async ({ page }) => {
    await page.getByText('Оставить заявку 📩').click();
    await expect(page.getByText('Оставить заявку').first()).toBeVisible();
  });
});

test.describe('F · Форма заявки (StepLead)', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
    await goToResult(page);
    await page.getByText('Оставить заявку 📩').click();
  });

  test('поля формы видны', async ({ page }) => {
    await expect(page.getByText('Ваше имя')).toBeVisible();
    await expect(page.getByText('Телефон')).toBeVisible();
  });

  test('placeholder для имени — «Иван»', async ({ page }) => {
    await expect(page.getByPlaceholder('Иван')).toBeVisible();
  });

  test('placeholder для телефона', async ({ page }) => {
    await expect(page.getByPlaceholder('+7 (900) 123-45-67')).toBeVisible();
  });

  test('кнопка «← Назад к результату»', async ({ page }) => {
    await expect(page.getByText('Назад к результату')).toBeVisible();
  });

  test('заполнение и отправка заявки → успех', async ({ page }) => {
    await page.getByPlaceholder('Иван').fill('Тестов Тест');
    await page.getByPlaceholder('+7 (900) 123-45-67').fill('+79001234567');
    await page.getByText('Отправить заявку').click();

    // Ждём экран успеха
    await expect(page.getByText('Заявка отправлена')).toBeVisible({ timeout: 5_000 });
  });

  test('после успешной заявки — кнопка «Рассчитать другой»', async ({ page }) => {
    await page.getByPlaceholder('Иван').fill('Тест');
    await page.getByPlaceholder('+7 (900) 123-45-67').fill('+79001234567');
    await page.getByText('Отправить заявку').click();
    await expect(page.getByText('Заявка отправлена')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText('Рассчитать другой автомобиль')).toBeVisible();
  });

  test('назад к результату → цена видна', async ({ page }) => {
    await page.getByText('Назад к результату').click();
    await expect(page.getByText(/[\d\s]+₽/)).toBeVisible();
  });
});

test.describe('G · Полный path для каждой страны → РФ', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
  });

  for (const country of ['США', 'Корея', 'ОАЭ', 'Китай'] as const) {
    test(`${country} → Россия: полный цикл`, async ({ page }) => {
      await goToResult(page, { country, price: '20000', destination: 'Россия' });
      await expect(page.getByText(/[\d\s]+₽/)).toBeVisible();
    });
  }

  for (const country of ['США', 'Корея', 'ОАЭ', 'Китай'] as const) {
    test(`${country} → Беларусь: полный цикл`, async ({ page }) => {
      await goToResult(page, { country, price: '20000', destination: 'Беларусь' });
      await expect(page.getByText(/[\d\s]+₽/)).toBeVisible();
    });
  }
});
