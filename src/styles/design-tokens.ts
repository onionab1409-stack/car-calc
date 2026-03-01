/**
 * 🎨 Design Tokens — Car-Calc
 * 
 * Единая дизайн-система, объединённая из 5 источников:
 * - design-system-v2.html   → золотая палитра (9 ступеней), шрифты
 * - typography-v1.html       → нейтральная палитра, контраст WCAG AA
 * - ui-kit-v6.html          → компоненты, акцентные цвета, бордеры
 * - ui-kit-components.html  → badges, spacing, radii
 * - icons-v2.html           → 56 SVG иконок
 * 
 * Золотой якорь: #C4A265 (совпадает во всех файлах)
 * Шрифт цены: Playfair Display 400
 */

// ═══════════════════════════════════════════
// ЦВЕТА
// ═══════════════════════════════════════════

export const colors = {
  // ── Фоны (из ui-kit-v6, самые тёмные = ближе к референсам) ──
  bg: {
    app:      '#0C0C0E',   // основной фон приложения
    elevated: '#111114',   // приподнятый слой (хедер, навбар)
    card:     '#141418',   // карточки
    cardHover:'#1A1A1E',   // карточка при hover
    input:    '#141413',   // поля ввода (утоплено, из v6)
    overlay:  'rgba(0,0,0,0.6)', // модальные оверлеи
  },

  // ── Золотая палитра (из design-system-v2, 9 ступеней) ──
  gold: {
    50:  '#FFE2A9',  // lightest — свечение, glow
    100: '#FDDDA5',  // light — активный hover
    200: '#F1C080',  // mid — яркий акцент
    300: '#D4B876',  // bright — текст заголовков
    400: '#C4A265',  // core ⭐ — ГЛАВНЫЙ ЦВЕТ, кнопки, бордеры
    500: '#A08050',  // dark — pressed состояния
    600: '#83582E',  // bronze — тёмный акцент
    700: '#634023',  // deep — тени
    800: '#4B3423',  // shadow — глубокие тени
    900: '#2D1C13',  // darkest — едва заметный фон
  },

  // ── Нейтральная палитра (из typography-v1) ──
  neutral: {
    50:  '#F0EDE5',  // почти белый (кремовый)
    100: '#E0DCD4',  // основной текст на тёмном
    200: '#D4C8A8',  // вторичный светлый
    300: '#B0A898',  // приглушённый
    400: '#8A8478',  // мuted
    500: '#6A665E',  // hint
    600: '#5A5650',  // dim
    700: '#4A4844',  // subtle
    800: '#3A3836',  // бордеры
    900: '#2A2826',  // еле видимые линии
  },

  // ── Текст ──
  text: {
    primary:   '#F5F5F5',  // основной белый
    cream:     '#DFDCD3',  // кремовый (для body)
    secondary: '#ABABAB',  // вторичный
    muted:     '#888888',  // приглушённый
    hint:      '#666666',  // подсказки
    dim:       '#444444',  // disabled
    accent:    '#C4A265',  // золотой текст
    onGold:    '#1A1208',  // текст НА золотой кнопке
  },

  // ── Бордеры (из ui-kit-v6) ──
  border: {
    subtle:    'rgba(196,162,101,0.08)',  // еле заметный золотой
    default:   'rgba(196,162,101,0.14)',  // стандартный
    hover:     'rgba(196,162,101,0.25)',  // при наведении
    active:    '#C4A265',                  // активный / focus
    strong:    'rgba(255,255,255,0.12)',   // белый (для нейтральных)
  },

  // ── Семантические ──
  success:    '#4ADE80',
  successBg:  'rgba(74,222,128,0.10)',
  error:      '#F87171',
  errorBg:    'rgba(248,113,113,0.10)',
  warning:    '#FBBF24',
  warningBg:  'rgba(251,191,36,0.10)',
  info:       '#8B9DAF',
} as const;


// ═══════════════════════════════════════════
// ТИПОГРАФИКА
// ═══════════════════════════════════════════

export const fonts = {
  /** Для заголовков и ЦЕНЫ */
  serif:  "'Playfair Display', 'Georgia', serif",
  /** Для body-текста, кнопок, интерфейса */
  sans:   "'DM Sans', 'Inter', system-ui, sans-serif",
  /** Для цифр, данных, кодов */
  mono:   "'JetBrains Mono', 'Geist Mono', monospace",
} as const;

export const fontSizes = {
  /** Цена на экране результата: 3 972 000 ₽ */
  priceXL:  { size: '48px', weight: '400', lineHeight: '1.0', font: fonts.serif },
  /** Заголовок экрана */
  display:  { size: '32px', weight: '500', lineHeight: '1.15', font: fonts.serif },
  /** H1 */
  h1:       { size: '24px', weight: '600', lineHeight: '1.2', font: fonts.serif },
  /** H2 */
  h2:       { size: '20px', weight: '500', lineHeight: '1.25', font: fonts.sans },
  /** H3 */
  h3:       { size: '16px', weight: '600', lineHeight: '1.3', font: fonts.sans },
  /** Body */
  body:     { size: '15px', weight: '400', lineHeight: '1.5', font: fonts.sans },
  /** Small */
  small:    { size: '13px', weight: '400', lineHeight: '1.4', font: fonts.sans },
  /** Caption */
  caption:  { size: '12px', weight: '400', lineHeight: '1.3', font: fonts.sans },
  /** Micro */
  micro:    { size: '10px', weight: '500', lineHeight: '1.2', font: fonts.sans },
  /** Моно данные */
  mono:     { size: '14px', weight: '400', lineHeight: '1.4', font: fonts.mono },
  /** Моно цена малая (в карточках) */
  monoLg:   { size: '18px', weight: '500', lineHeight: '1.2', font: fonts.mono },
} as const;


// ═══════════════════════════════════════════
// ОТСТУПЫ И РАДИУСЫ
// ═══════════════════════════════════════════

export const spacing = {
  xs:  '4px',
  sm:  '8px',
  md:  '12px',
  lg:  '16px',
  xl:  '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '48px',
} as const;

export const radius = {
  xs:   '6px',
  sm:   '8px',
  md:   '12px',
  lg:   '16px',
  xl:   '20px',
  full: '9999px',
} as const;


// ═══════════════════════════════════════════
// ТЕНИ И ЭФФЕКТЫ (из ui-kit-v6)
// ═══════════════════════════════════════════

export const shadows = {
  sm:   '0 1px 3px rgba(0,0,0,0.3)',
  md:   '0 4px 12px rgba(0,0,0,0.4)',
  lg:   '0 8px 24px rgba(0,0,0,0.5)',
  xl:   '0 12px 40px rgba(0,0,0,0.6)',
  gold: '0 4px 20px rgba(196,162,101,0.15)',
  goldHover: '0 6px 28px rgba(196,162,101,0.25)',
  goldGlow:  '0 0 40px rgba(196,162,101,0.12)',
} as const;


// ═══════════════════════════════════════════
// АНИМАЦИИ
// ═══════════════════════════════════════════

export const transitions = {
  fast:   '150ms ease-out',
  normal: '250ms ease-out',
  slow:   '400ms ease-out',
  spring: '500ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;


// ═══════════════════════════════════════════
// КОМПОНЕНТЫ — стандартные стили (из ui-kit-v6)
// ═══════════════════════════════════════════

export const components = {
  button: {
    primary: {
      bg: `linear-gradient(135deg, ${colors.gold[300]}, ${colors.gold[400]}, ${colors.gold[500]})`,
      text: colors.text.onGold,
      border: 'none',
      radius: radius.md,
      height: '52px',
      fontSize: '16px',
      fontWeight: '600',
    },
    ghost: {
      bg: 'transparent',
      text: colors.gold[400],
      border: `1px solid ${colors.border.default}`,
      radius: radius.md,
      height: '48px',
      fontSize: '15px',
      fontWeight: '500',
    },
  },
  card: {
    bg: colors.bg.card,
    border: `1px solid ${colors.border.default}`,
    radius: radius.lg,
    padding: spacing.lg,
  },
  input: {
    bg: colors.bg.input,
    border: `1px solid ${colors.border.subtle}`,
    borderFocus: `1px solid ${colors.gold[400]}`,
    radius: radius.md,
    height: '52px',
    fontSize: '16px',
    padding: `0 ${spacing.lg}`,
  },
  pill: {
    bg: 'rgba(196,162,101,0.12)',
    text: colors.gold[300],
    border: `1px solid ${colors.border.subtle}`,
    radius: radius.full,
    height: '32px',
    fontSize: '13px',
    padding: `0 ${spacing.md}`,
  },
} as const;


// ═══════════════════════════════════════════
// СТРАНЫ — цвета акцентов для карточек
// ═══════════════════════════════════════════

export const countryAccents = {
  US: { label: '🇺🇸 США', color: '#C4A265', bg: 'rgba(196,162,101,0.08)' },
  KR: { label: '🇰🇷 Корея', color: '#C4A265', bg: 'rgba(196,162,101,0.08)' },
  AE: { label: '🇦🇪 ОАЭ', color: '#C4A265', bg: 'rgba(196,162,101,0.08)' },
  CN: { label: '🇨🇳 Китай', color: '#C4A265', bg: 'rgba(196,162,101,0.08)' },
} as const;
