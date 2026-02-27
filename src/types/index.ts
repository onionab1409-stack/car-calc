// Страны отправления
export type Country = 'USA' | 'Korea' | 'UAE' | 'China';

// Страны назначения
export type Destination = 'RU' | 'BY';

// Тип двигателя
export type EngineType = 'petrol' | 'diesel' | 'electric' | 'hybrid';

// Возрастная категория авто
export type AgeCategory = 'under3' | '3to5' | 'over5';

// Входные данные от пользователя
export interface CarInput {
  country: Country;
  destination: Destination;
  price: number;           // цена в валюте страны
  currency: 'USD' | 'KRW' | 'AED' | 'CNY';
  year: number;            // год выпуска
  engineType: EngineType;
  engineCC?: number;       // объём двигателя (см³)
  horsePower: number;      // лошадиные силы
  isLegalEntity?: boolean; // юрлицо (по умолчанию физлицо)
}

// Курсы валют
export interface ExchangeRates {
  USDT_RUB: number;        // Bybit P2P + коррекция MoscaEx
  KRW_RUB: number;         // ЦБ РФ + спред ВТБ
  CNY_RUB: number;         // ЦБ РФ + спред ВТБ
  AED_USD: number;         // фиксированный ≈ 3.67
}

// Настройки админки
export interface AdminSettings {
  usdtCorrection: number;  // ±₽ коррекция к Bybit
  vtbSpreadKRW: number;    // спред ВТБ для KRW
  vtbSpreadCNY: number;    // спред ВТБ для CNY
}

// Результат расчёта (для клиента — только totalRUB)
export interface CalcResult {
  totalRUB: number;         // ИТОГО — единственное что видит клиент
  breakdown: CostBreakdown; // для серверного лога / админки
}

// Полная смета (скрыта от клиента)
export interface CostBreakdown {
  country: Country;
  destination: Destination;
  carPriceOriginal: number;
  carPriceCurrency: string;
  carPriceUSD?: number;
  auctionFee?: number;
  shipping: number;
  customs: number;
  fixedCosts: number;
  totalUSD?: number;
  exchangeRate: number;
  totalRUB: number;
  formula: string;          // какая формула использовалась
  timestamp: string;
}
