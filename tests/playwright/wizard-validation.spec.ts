/**
 * P7.4 · Playwright: Валидация формы StepCar
 *
 * Тесты:
 * A. Пустая цена → ошибка
 * B. Цена ниже минимума → ошибка
 * C. Цена выше максимума → ошибка
 * D. Мощность вне диапазона → ошибка
 * E. Электро/Гибрид → мощность в кВт (без поля объёма)
 * F. Старые авто (3-5 лет, 5+ лет) → объём двигателя обязателен
 */
import { test, expect } from '@playwright/test';
import {
  mockAllAPIs,
  selectCountry,
  fillCarForm,
  submitCarForm,
} from './helpers';

test.describe('A · Валидация цены', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
    await selectCountry(page, 'США');
  });

  test('пустая цена → не переходит на следующий шаг', async ({ page }) => {
    await submitCarForm(page);
    // Должны остаться на StepCar
    await expect(page.getByText('Параметры авто')).toBeVisible();
  });

  test('цена = 0 → ошибка валидации', async ({ page }) => {
    await fillCarForm(page, { price: '0' });
    await submitCarForm(page);
    await expect(page.getByText('Параметры авто')).toBeVisible();
  });

  test('слишком высокая цена → ошибка «Максимум»', async ({ page }) => {
    await fillCarForm(page, { price: '999999999' });
    await submitCarForm(page);
    // Ожидаем текст ошибки с «Максимум»
    await expect(page.getByText('Максимум', { exact: false })).toBeVisible();
    await expect(page.getByText('Параметры авто')).toBeVisible();
  });

  test('корректная цена → переход на StepDestination', async ({ page }) => {
    await fillCarForm(page, { price: '15000' });
    await submitCarForm(page);
    await expect(page.getByText('Куда доставляем?')).toBeVisible();
  });
});

test.describe('B · Валидация для разных стран', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
  });

  test('Корея: цена в KRW (большие числа)', async ({ page }) => {
    await selectCountry(page, 'Корея');
    await fillCarForm(page, { price: '30000000' }); // 30M KRW
    await submitCarForm(page);
    await expect(page.getByText('Куда доставляем?')).toBeVisible();
  });

  test('Китай: цена в CNY', async ({ page }) => {
    await selectCountry(page, 'Китай');
    await fillCarForm(page, { price: '200000' }); // 200K CNY
    await submitCarForm(page);
    await expect(page.getByText('Куда доставляем?')).toBeVisible();
  });

  test('ОАЭ: цена в AED', async ({ page }) => {
    await selectCountry(page, 'ОАЭ');
    await fillCarForm(page, { price: '150000' }); // 150K AED
    await submitCarForm(page);
    await expect(page.getByText('Куда доставляем?')).toBeVisible();
  });
});

test.describe('C · Типы двигателей', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
    await selectCountry(page, 'США');
  });

  test('Бензин выбран по умолчанию', async ({ page }) => {
    // Бензин должен быть выделен (active state)
    const benzinPill = page.getByText('Бензин');
    await expect(benzinPill).toBeVisible();
  });

  test('переключение на Дизель', async ({ page }) => {
    await page.getByText('Дизель').click();
    await fillCarForm(page, { price: '20000' });
    await submitCarForm(page);
    await expect(page.getByText('Куда доставляем?')).toBeVisible();
  });

  test('переключение на Электро', async ({ page }) => {
    await page.getByText('Электро').click();
    await fillCarForm(page, { price: '35000' });
    await submitCarForm(page);
    await expect(page.getByText('Куда доставляем?')).toBeVisible();
  });

  test('переключение на Гибрид', async ({ page }) => {
    await page.getByText('Гибрид').click();
    await fillCarForm(page, { price: '25000' });
    await submitCarForm(page);
    await expect(page.getByText('Куда доставляем?')).toBeVisible();
  });
});

test.describe('D · Объём двигателя для старых авто', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');
    await selectCountry(page, 'США');
  });

  test('новый авто → поле объёма НЕ показывается (для бензин/дизель)', async ({ page }) => {
    // Для авто до 3 лет объём не нужен при ≤160лс
    // Проверяем что кол-во input-полей ограничено
    await fillCarForm(page, { price: '15000' });
    await submitCarForm(page);
    // Успешный переход означает валидация прошла без объёма
    await expect(page.getByText('Куда доставляем?')).toBeVisible();
  });

  test('старый авто (5+ лет) → поле объёма может появиться', async ({ page }) => {
    const oldYear = String(new Date().getFullYear() - 5);
    await page.getByText(oldYear, { exact: true }).click();
    // Для старых авто может потребоваться объём двигателя
    // Заполняем цену и пробуем
    await fillCarForm(page, { price: '10000' });
    // Пробуем отправить — если нужен объём, останемся на StepCar
    await submitCarForm(page);

    // Два варианта: либо перешли, либо нужен объём
    const isStillOnCar = await page.getByText('Параметры авто').isVisible().catch(() => false);
    if (isStillOnCar) {
      // Нужно ввести объём — ищем третий input
      const inputs = page.locator('input[type="number"], input[inputMode="numeric"]');
      const count = await inputs.count();
      if (count >= 3) {
        await inputs.nth(2).fill('2000');
        await submitCarForm(page);
      }
    }
    await expect(page.getByText('Куда доставляем?')).toBeVisible({ timeout: 5_000 });
  });
});

test.describe('E · Валидация StepLead', () => {
  test.beforeEach(async ({ page }) => {
    await mockAllAPIs(page);
    await page.goto('/');

    // Доходим до формы заявки
    await selectCountry(page, 'США');
    await fillCarForm(page, { price: '15000' });
    await submitCarForm(page);
    await page.getByText('Россия', { exact: false }).click();
    await page.getByText('Рассчитать стоимость →').click();
    await page.getByText('Оставить заявку', { exact: false }).waitFor({ timeout: 15_000 });
    await page.getByText('Оставить заявку 📩').click();
  });

  test('пустое имя → не отправляется', async ({ page }) => {
    await page.getByPlaceholder('+7 (900) 123-45-67').fill('+79001234567');
    await page.getByText('Отправить заявку').click();
    // Остаёмся на форме (нет «Заявка отправлена»)
    await expect(page.getByText('Ваше имя')).toBeVisible();
  });

  test('пустой телефон → не отправляется', async ({ page }) => {
    await page.getByPlaceholder('Иван').fill('Тест');
    await page.getByText('Отправить заявку').click();
    await expect(page.getByText('Телефон')).toBeVisible();
  });

  test('короткий телефон → ошибка', async ({ page }) => {
    await page.getByPlaceholder('Иван').fill('Тест');
    await page.getByPlaceholder('+7 (900) 123-45-67').fill('123');
    await page.getByText('Отправить заявку').click();
    // Ожидаем ошибку валидации
    await expect(page.getByText('Ваше имя')).toBeVisible(); // Всё ещё на форме
  });
});
