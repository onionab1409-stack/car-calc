// ============================================
// 🚗 CAR-CALC — Все типы проекта
// ============================================
// Единый источник типов. Импортируется как: import { CarInput, ... } from '@/types'
// Версия: 1.0 · P1.2 · Архитектор

// ─────────────────────────────────────────────
// 📍 БАЗОВЫЕ ПЕРЕЧИСЛЕНИЯ
// ─────────────────────────────────────────────

/** Страны отправления */
export type Country = 'USA' | 'Korea' | 'UAE' | 'China';

/** Страны назначения */
export type Destination = 'RU' | 'BY';

/** Валюты по странам отправления */
export type Currency = 'USD' | 'KRW' | 'AED' | 'CNY';

/** Тип двигателя */
export type EngineType = 'petrol' | 'diesel' | 'electric' | 'hybrid';

/** Возрастная категория авто (от даты выпуска) */
export type AgeCategory = 'under3' | '3to5' | 'over5';

/** Аукцион (только для США) */
export type Auction = 'copart' | 'iaai' | 'manheim' | 'other';

/** Статус заявки */
export type LeadStatus = 'new' | 'contacted' | 'in_progress' | 'done' | 'cancelled';

/** Источник курса валюты */
export type RateSource = 'bybit_p2p' | 'cbr' | 'manual';

// ─────────────────────────────────────────────
// 🔗 МАППИНГИ (страна → валюта, страна → допустимые направления)
// ─────────────────────────────────────────────

/** Какая валюта у какой страны */
export const COUNTRY_CURRENCY: Record<Country, Currency> = {
  USA: 'USD',
  Korea: 'KRW',
  UAE: 'AED',
  China: 'CNY',
};

/** Флаги стран для UI */
export const COUNTRY_FLAG: Record<Country, string> = {
  USA: '🇺🇸',
  Korea: '🇰🇷',
  UAE: '🇦🇪',
  China: '🇨🇳',
};

/** Названия стран на русском */
export const COUNTRY_NAME_RU: Record<Country, string> = {
  USA: 'США',
  Korea: 'Корея',
  UAE: 'ОАЭ',
  China: 'Китай',
};

/** Названия направлений на русском */
export const DESTINATION_NAME_RU: Record<Destination, string> = {
  RU: 'Россия',
  BY: 'Беларусь',
};

// ─────────────────────────────────────────────
// 📥 ВХОДНЫЕ ДАННЫЕ (от пользователя)
// ─────────────────────────────────────────────

/** Данные об автомобиле — вводит пользователь */
export interface CarInput {
  /** Страна отправления */
  country: Country;

  /** Страна назначения */
  destination: Destination;

  /** Цена авто в валюте страны отправления */
  price: number;

  /** Валюта цены (определяется автоматически из country) */
  currency: Currency;

  /** Год выпуска */
  year: number;

  /** Тип двигателя */
  engineType: EngineType;

  /** Объём двигателя, см³ (не обязательно для электро) */
  engineCC?: number;

  /** Мощность, л.с. */
  horsePower: number;

  /** Аукцион (только для USA) */
  auction?: Auction;

  /** Юрлицо? (по умолчанию false = физлицо) */
  isLegalEntity?: boolean;

  /** Марка (опционально, для отчёта) */
  make?: string;

  /** Модель (опционально, для отчёта) */
  model?: string;

  /** VIN (опционально, для проверки истории) */
  vin?: string;
}

/** Возрастная категория — вычисляется из года выпуска */
export function getAgeCategory(year: number): AgeCategory {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  if (age < 3) return 'under3';
  if (age <= 5) return '3to5';
  return 'over5';
}

// ─────────────────────────────────────────────
// 💱 КУРСЫ ВАЛЮТ
// ─────────────────────────────────────────────

/** Курсы валют на момент расчёта */
export interface ExchangeRates {
  /** USDT/RUB — Bybit P2P + коррекция MoscaEx */
  USDT_RUB: number;

  /** KRW/RUB — ЦБ РФ + спред ВТБ */
  KRW_RUB: number;

  /** CNY/RUB — ЦБ РФ + спред ВТБ */
  CNY_RUB: number;

  /** AED/USD — фиксированный ≈ 3.67 */
  AED_USD: number;

  /** Метка времени обновления курсов */
  updatedAt: string;
}

/** Информация об одном курсе (для хранения и отображения) */
export interface RateInfo {
  /** Код валютной пары */
  pair: string;

  /** Значение курса */
  rate: number;

  /** Источник (bybit_p2p, cbr, manual) */
  source: RateSource;

  /** Базовый курс до коррекций */
  rawRate: number;

  /** Применённая коррекция (±₽) */
  correction: number;

  /** Когда обновлён */
  updatedAt: string;
}

// ─────────────────────────────────────────────
// 🧮 РЕЗУЛЬТАТ РАСЧЁТА
// ─────────────────────────────────────────────

/**
 * Результат расчёта — для клиента.
 * Клиент видит ТОЛЬКО totalRUB. Больше ничего.
 */
export interface CalcResult {
  /** Итоговая цена в рублях — ЕДИНСТВЕННОЕ что видит клиент */
  totalRUB: number;

  /** Полная смета — скрыта от клиента, для серверного лога */
  breakdown: CostBreakdown;
}

/**
 * Полная смета расчёта — СКРЫТА от клиента.
 * Логируется на сервере. Используется для аналитики и споров.
 */
export interface CostBreakdown {
  /** Страна отправления */
  country: Country;

  /** Страна назначения */
  destination: Destination;

  /** Возрастная категория */
  ageCategory: AgeCategory;

  // --- Цена авто ---
  /** Цена в оригинальной валюте */
  carPriceOriginal: number;
  /** Валюта оригинальной цены */
  carPriceCurrency: Currency;
  /** Цена в USD (если применимо) */
  carPriceUSD?: number;
  /** Цена в RUB (пересчитанная) */
  carPriceRUB: number;

  // --- Компоненты расчёта ---
  /** Аукционный сбор (8% для USA) */
  auctionFee: number;
  /** Морская доставка */
  shipping: number;
  /** Страховка */
  insurance: number;
  /** Таможенные платежи (пошлина + акциз + НДС) */
  customs: number;
  /** Утилизационный сбор (если >160 л.с.) */
  utilSbor: number;
  /** Фиксированные расходы (СБКТС, ЭПТС, брокер и т.д.) */
  fixedCosts: number;
  /** Комиссия / маржа */
  margin: number;

  // --- Курс на момент расчёта ---
  /** Какой курс использовался */
  exchangeRate: number;
  /** Источник курса */
  rateSource: RateSource;

  // --- Итого ---
  /** Итоговая цена в рублях */
  totalRUB: number;

  // --- Мета ---
  /** Формула в текстовом виде (для дебага) */
  formula: string;
  /** Использовался ли парсинг tks.ru */
  usedTKS: boolean;
  /** Метка времени расчёта */
  timestamp: string;
}

// ─────────────────────────────────────────────
// 📊 ФИКСИРОВАННЫЕ СУММЫ
// ─────────────────────────────────────────────

/** Одна ступень в таблице фиксов (порог цены → фиксированная сумма) */
export interface FixedCostStep {
  /** Верхняя граница цены в USD (включительно). null = без ограничения */
  maxPriceUSD: number | null;
  /** Фиксированная сумма в RUB */
  fixedRUB: number;
}

/** Таблица фиксов для одного направления */
export interface FixedCostsTable {
  /** Ключ направления, например 'USA_RU' */
  route: string;
  /** Ступени (порог → сумма) */
  steps: FixedCostStep[];
  /** Шаг для превышения последнего порога (₽ за каждые $10K) */
  overflowStepRUB: number;
  /** Порог, после которого начинается overflow */
  overflowAfterUSD: number;
}

/** Таблица утилизационного сбора по мощности (>160 л.с.) */
export interface UtilSborEntry {
  /** Минимальная мощность (л.с.), включительно */
  minHP: number;
  /** Максимальная мощность (л.с.), включительно. null = без ограничения */
  maxHP: number | null;
  /** Сумма утильсбора в RUB */
  amountRUB: number;
}

// ─────────────────────────────────────────────
// ⚙️ НАСТРОЙКИ АДМИНКИ
// ─────────────────────────────────────────────

/** Все настраиваемые параметры (через Telegram Bot) */
export interface AdminSettings {
  /** Коррекция USDT к MoscaEx (±₽). Пример: +1.50 */
  usdtCorrection: number;

  /** Спред ВТБ для KRW/RUB */
  vtbSpreadKRW: number;

  /** Спред ВТБ для CNY/RUB */
  vtbSpreadCNY: number;

  /** Фиксированный курс AED/USD (обычно 3.67) */
  aedUsdRate: number;

  /** Таблицы фиксов по направлениям */
  fixedCosts: Record<string, FixedCostsTable>;

  /** Таблица утильсбора */
  utilSbor: UtilSborEntry[];

  /** Порог мощности для доплаты утильсбора */
  utilSborThresholdHP: number;
}

// ─────────────────────────────────────────────
// 📱 TELEGRAM
// ─────────────────────────────────────────────

/** Данные Telegram пользователя */
export interface TelegramUser {
  /** Telegram ID */
  id: number;
  /** Username (без @) */
  username?: string;
  /** Имя */
  firstName: string;
  /** Фамилия */
  lastName?: string;
  /** Код языка */
  languageCode?: string;
}

/** Данные из Telegram WebApp SDK */
export interface WebAppInitData {
  /** Telegram пользователь */
  user?: TelegramUser;
  /** Хэш для валидации */
  hash: string;
  /** Query ID (для inline mode) */
  queryId?: string;
}

// ─────────────────────────────────────────────
// 📋 ЗАЯВКИ (LEADS)
// ─────────────────────────────────────────────

/** Заявка от клиента */
export interface Lead {
  /** Уникальный ID заявки */
  id: string;

  /** Telegram пользователь */
  telegramUserId: number;
  username?: string;
  firstName?: string;

  /** Контакт (телефон, если указал) */
  phone?: string;

  /** Комментарий от клиента */
  comment?: string;

  /** Результат расчёта (полный, для нас) */
  calcResult: CalcResult;

  /** Входные данные расчёта */
  carInput: CarInput;

  /** Статус заявки */
  status: LeadStatus;

  /** Когда создана */
  createdAt: string;

  /** Когда обновлена */
  updatedAt: string;
}

// ─────────────────────────────────────────────
// 🌐 API — REQUEST / RESPONSE
// ─────────────────────────────────────────────

/** POST /api/calculate — запрос */
export interface CalcRequest {
  country: Country;
  destination: Destination;
  price: number;
  year: number;
  engineType: EngineType;
  engineCC?: number;
  horsePower: number;
  auction?: Auction;
  isLegalEntity?: boolean;
  make?: string;
  model?: string;
}

/** POST /api/calculate — ответ (клиент видит ТОЛЬКО это) */
export interface CalcResponse {
  /** Итоговая цена в рублях */
  totalRUB: number;
}

/** POST /api/calculate — ошибка */
export interface CalcErrorResponse {
  error: string;
  details?: string;
}

/** GET /api/rates — ответ */
export interface RatesResponse {
  USDT_RUB: number;
  KRW_RUB: number;
  CNY_RUB: number;
  updatedAt: string;
}

/** POST /api/lead — запрос */
export interface LeadRequest {
  telegramUserId: number;
  username?: string;
  firstName?: string;
  phone?: string;
  comment?: string;
  calcRequest: CalcRequest;
  totalRUB: number;
}

/** POST /api/lead — ответ */
export interface LeadResponse {
  success: boolean;
  leadId: string;
}

// ─────────────────────────────────────────────
// 🔧 ВНУТРЕННИЕ (парсинг, ТКС)
// ─────────────────────────────────────────────

/** Результат парсинга tks.ru */
export interface TKSResult {
  /** Таможенная пошлина */
  duty: number;
  /** Акциз */
  excise: number;
  /** НДС */
  vat: number;
  /** Утилизационный сбор */
  utilSbor: number;
  /** Таможенные сборы (за оформление) */
  customsFee: number;
  /** Итого таможня */
  totalCustoms: number;
  /** Источник: парсинг tks.ru или fallback */
  source: 'tks_parsed' | 'fallback_formula';
}

/** Конфиг для парсера tks.ru */
export interface TKSParserConfig {
  /** URL таможенного калькулятора */
  baseUrl: string;
  /** TTL кэша результатов (мс) */
  cacheTTL: number;
  /** Таймаут запроса (мс) */
  timeout: number;
  /** Максимум попыток */
  maxRetries: number;
}

// ─────────────────────────────────────────────
// 📊 АНАЛИТИКА
// ─────────────────────────────────────────────

/** Запись расчёта для аналитики */
export interface CalculationLog {
  id: string;
  carInput: CarInput;
  result: CalcResult;
  rates: ExchangeRates;
  telegramUserId?: number;
  duration: number; // ms
  createdAt: string;
}

/** Статистика за период (для админки) */
export interface CalculationStats {
  /** Всего расчётов */
  total: number;
  /** По странам */
  byCountry: Record<Country, number>;
  /** По направлениям */
  byDestination: Record<Destination, number>;
  /** Средняя итоговая цена */
  avgTotalRUB: number;
  /** Количество заявок */
  leadsCount: number;
  /** Конверсия расчёт→заявка */
  conversionRate: number;
  /** Период */
  periodStart: string;
  periodEnd: string;
}
