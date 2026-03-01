/**
 * P7.4 · Playwright helpers — API-моки + утилиты
 */
import { Page } from '@playwright/test';

// ─── API Mock Responses ───

/** Мок ответа /api/calculate — успешный */
export const MOCK_CALCULATE_OK = {
  totalRUB: 2_351_000,
};

/** Мок ответа /api/calculate — ошибка */
export const MOCK_CALCULATE_ERROR = {
  error: 'Validation error',
  details: 'Неверные параметры расчёта',
};

/** Мок ответа /api/rates */
export const MOCK_RATES = {
  USDT_RUB: 98.50,
  KRW_RUB: 0.05364,
  CNY_RUB: 13.40,
  EUR_RUB: 105.20,
  updatedAt: new Date().toISOString(),
};

/** Мок ответа /api/lead — успех */
export const MOCK_LEAD_OK = {
  id: 'lead-test-123',
  success: true,
};

/** Мок ответа /api/lead — ошибка */
export const MOCK_LEAD_ERROR = {
  error: 'Ошибка сервера',
};

// ─── Setup Helpers ───

/**
 * Мокаем все API-эндпоинты для стабильных UI-тестов.
 * Playwright page.route перехватывает fetch-запросы.
 */
export async function mockAllAPIs(page: Page, overrides?: {
  calculateResponse?: object;
  calculateStatus?: number;
  leadResponse?: object;
  leadStatus?: number;
  calculateDelay?: number;
  leadDelay?: number;
}) {
  // /api/calculate
  await page.route('**/api/calculate', async (route) => {
    const delay = overrides?.calculateDelay ?? 100;
    if (delay > 0) await new Promise(r => setTimeout(r, delay));
    await route.fulfill({
      status: overrides?.calculateStatus ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(overrides?.calculateResponse ?? MOCK_CALCULATE_OK),
    });
  });

  // /api/rates
  await page.route('**/api/rates', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_RATES),
    });
  });

  // /api/lead
  await page.route('**/api/lead', async (route) => {
    const delay = overrides?.leadDelay ?? 100;
    if (delay > 0) await new Promise(r => setTimeout(r, delay));
    await route.fulfill({
      status: overrides?.leadStatus ?? 200,
      contentType: 'application/json',
      body: JSON.stringify(overrides?.leadResponse ?? MOCK_LEAD_OK),
    });
  });
}

// ─── Step Navigation Helpers ───

/** Выбрать страну (первый шаг) */
export async function selectCountry(page: Page, country: 'США' | 'Корея' | 'ОАЭ' | 'Китай') {
  await page.getByText(country, { exact: false }).click();
}

/** Заполнить форму авто (второй шаг) */
export async function fillCarForm(page: Page, opts: {
  price: string;
  year?: string;
  engineType?: 'Бензин' | 'Дизель' | 'Электро' | 'Гибрид';
  horsePower?: string;
  engineVolume?: string;
}) {
  // Цена — ищем input по placeholder или label
  const priceInput = page.locator('input').first();
  await priceInput.fill(opts.price);

  // Год — по умолчанию "Новый" уже выбран
  if (opts.year) {
    await page.getByText(opts.year, { exact: true }).click();
  }

  // Тип двигателя — по умолчанию "Бензин" выбран
  if (opts.engineType) {
    await page.getByText(opts.engineType, { exact: false }).click();
  }

  // Мощность — второй или третий input
  if (opts.horsePower) {
    const hpInputs = page.locator('input[type="number"], input[inputMode="numeric"]');
    const count = await hpInputs.count();
    // Мощность — обычно 2-й input (после цены)
    if (count >= 2) {
      await hpInputs.nth(1).fill(opts.horsePower);
    }
  }

  // Объём двигателя (если показан)
  if (opts.engineVolume) {
    const inputs = page.locator('input[type="number"], input[inputMode="numeric"]');
    const count = await inputs.count();
    if (count >= 3) {
      await inputs.nth(2).fill(opts.engineVolume);
    }
  }
}

/** Нажать «Далее» на форме авто */
export async function submitCarForm(page: Page) {
  await page.getByText('Далее →').click();
}

/** Выбрать направление */
export async function selectDestination(page: Page, dest: 'Россия' | 'Беларусь') {
  await page.getByText(dest, { exact: false }).click();
}

/** Нажать «Рассчитать стоимость» */
export async function clickCalculate(page: Page) {
  await page.getByText('Рассчитать стоимость →').click();
}

/** Дождаться результата (цена отображена) */
export async function waitForResult(page: Page) {
  // Ждём пока появится кнопка "Оставить заявку"
  await page.getByText('Оставить заявку', { exact: false }).waitFor({ timeout: 15_000 });
}

/** Полный happy path: страна → авто → направление → результат */
export async function goToResult(page: Page, opts?: {
  country?: 'США' | 'Корея' | 'ОАЭ' | 'Китай';
  price?: string;
  destination?: 'Россия' | 'Беларусь';
}) {
  const country = opts?.country ?? 'США';
  const price = opts?.price ?? '15000';
  const destination = opts?.destination ?? 'Россия';

  await selectCountry(page, country);
  await fillCarForm(page, { price });
  await submitCarForm(page);
  await selectDestination(page, destination);
  await clickCalculate(page);
  await waitForResult(page);
}
