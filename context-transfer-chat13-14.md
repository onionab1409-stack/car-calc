# Context Transfer: Chat 13→14 — OBSIDIAN GOLD FORGE Redesign

## ПРОЕКТ
Car-calc Telegram Mini App — калькулятор стоимости импорта авто из 4 стран → РФ/РБ.
Repo: `onionab1409-stack/car-calc`
**GitHub token:** `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`
VPS: 155.212.245.223, Ubuntu 24.04, домен app.americanautohouse.com
Telegram Bot: `8566904232:AAE9EsEjRiQbXcxgE6lo-aaMd9eSblL3XmI`

```bash
git clone https://onionab1409-stack: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@github.com/onionab1409-stack/car-calc.git
cd car-calc && git config user.email "claude@anthropic.com" && git config user.name "Claude" && npm install
```

Deploy:
```bash
cd /var/www/car-calc && git pull && npm run build && pm2 restart car-calc
```

---

## ТЕКУЩЕЕ СОСТОЯНИЕ

- **Коммит в git:** `fcad5aa` — OBSIDIAN GOLD FORGE redesign (ЗАПУШЕН!)
- **Базовый коммит:** `dc7f823` (P0-P8, 394 Vitest + 82 Playwright)
- **Все 16 файлов закоммичены и запушены** — 865 insertions, 1423 deletions

### Что модифицировано (все uncommitted):
| Файл | Строк | Статус |
|---|---|---|
| `src/app/globals.css` | 419 | ✅ ПОЛНОСТЬЮ переписан — OBSIDIAN GOLD FORGE |
| `tailwind.config.ts` | ~60 | ✅ Новая палитра warm charcoal |
| `src/app/layout.tsx` | ~61 | ✅ themeColor #2a2b2a, app-bg div wrapper |
| `src/components/TelegramProvider.tsx` | ~152 | ✅ Цвета #0C0C0E → #2a2b2a |
| `src/components/ui/Button.tsx` | ~18 | ✅ btn-gold-3d / btn-ghost-3d / cta-gold-bar |
| `src/components/ui/Card.tsx` | ~20 | ✅ card-3d / card-3d-selected |
| `src/components/ui/Input.tsx` | ~35 | ✅ input-3d / input-3d-error / label-gold |
| `src/components/ui/Pill.tsx` | ~15 | ✅ pill-3d / pill-3d-dark |
| `src/components/ui/Divider.tsx` | 1 | ✅ divider-gold |
| `src/components/Calculator.tsx` | ~250 | ✅ error state + history button → 3D |
| `src/components/wizard/StepCountry.tsx` | ~130 | ✅ Полностью переписан |
| `src/components/wizard/StepDestination.tsx` | 162 | ✅ Переписан (card-3d, check-3d, info-bar) |
| `src/components/wizard/StepCar.tsx` | 271 | ✅ Переписан (chip-3d, input-3d) |
| `src/components/wizard/StepLoading.tsx` | 151 | ✅ Переписан (loading-ring) |
| `src/components/wizard/StepResult.tsx` | 157 | ✅ Переписан (price-display, cta-gold-bar) |
| `src/components/wizard/StepLead.tsx` | 204 | ✅ Переписан (input-3d, info-bar) |
| `src/components/wizard/StepHistory.tsx` | 246 | ⚠️ Нужно проверить — возможно не обновлён |

---

## ВАЖНО: КАК ПРОДОЛЖИТЬ

Код запушен в GitHub (коммит `fcad5aa`). В новом чате:

1. **Клонировать репо** — все файлы уже на месте
2. **npm install**
3. **Проверить тесты** — `npx vitest run` (394 должны пройти)
4. **npm run build** — проверить сборку
5. **Просмотреть каждый экран** — особенно StepHistory (мог быть не обновлён)
6. **Довести визуал до совершенства** — Антон проверит на телефоне
7. **Задеплоить** на VPS

---

## ДИЗАЙН-СИСТЕМА: OBSIDIAN GOLD FORGE

### Философия
Каждый элемент = физический объект. Тёплый угольный фон (НИКОГДА чёрный). Металлические панели с фасками. Утопленные поля ввода. Золото, светящееся изнутри. Многослойные тени = настоящая левитация. Источник света: сверху-слева ~45°.

### Фон (НЕ ЧЁРНЫЙ!)
```
--sf-base: #2a2b2a   ← основной фон (тёплый угольный)
Gradient: 175deg, #333433 → #2e2f2e → #2a2b2a → #282928
+ noise overlay (fractalNoise SVG)
+ radial gold glow at 20% 15% (barely visible warmth)
```

### Золотая шкала температур
```css
--gold-peak: #fff4d4;    /* почти белый — блик */
--gold-bright: #ffe9a1;  /* яркое золото — текст цены */
--gold-hot: #d9a54e;     /* горячее — акценты */
--gold-warm: #c99a48;    /* тёплое — бордеры active */
--gold-core: #b8933f;    /* ядро — основной */
--gold-med: #a68540;     /* средний */
--gold-sub: #8a7344;     /* приглушённый */
--gold-dim: #6b5a3e;     /* тусклый — бордеры idle */
--gold-mute: #4d4132;    /* почти фон */
--gold-ember: #3a3028;   /* тлеющий уголь */
```

### CSS-классы (все в globals.css)

**Карточки:**
- `card-3d` — 3D floating panel (gradient surface, multi-layer shadow, top-edge highlight)
- `card-3d-selected` — gold aura emission (добавляется к card-3d)

**Кнопки:**
- `btn-gold-3d` — convex gold CTA (beveled, pressed depth)
- `cta-gold-bar` — full-width gold CTA (для нижних действий)
- `btn-ghost-3d` — transparent + gold frame

**Ввод:**
- `input-3d` — recessed input (inset shadows, gold focus ring)
- `input-3d-error` — red glow variant

**Выбор:**
- `chip-3d` — selectable token (convex, subtle bevel)
- `chip-3d-active` — active state (gold glow + border)

**Бейджи:**
- `pill-3d` — gold convex badge
- `pill-3d-dark` — dark variant

**Панели:**
- `info-bar` — compact panel with gold accent line (::before top line)
- `error-box` — dark red error panel

**Прогресс:**
- `dot-3d` / `dot-3d-done` / `dot-3d-active` — progress orbs
- `progress-track` / `progress-fill` — bar
- `loading-ring` — animated golden arc

**Чекмарки:**
- `check-3d` / `check-3d-active` — toggle circle

**Кнопки-иконки:**
- `icon-btn-3d` — small round action button

**Текст/утилиты:**
- `price-display` — hero price (Playfair 48px, gold glow)
- `text-gold-gradient` — gradient text
- `label-gold` — uppercase small serif label
- `divider-gold` — gradient separator
- `glow-gold` / `glow-gold-hot` — box-shadow utilities
- `safe-top` / `safe-bottom` — Telegram safe areas
- `app-bg` — full-page background (fixed, gradient + noise)

### Шрифты
- **Заголовки/кнопки:** Playfair Display (serif) — `var(--font-serif)`
- **Body:** DM Sans (sans) — `var(--font-sans)`  
- **Цифры/цены:** JetBrains Mono (mono) — `var(--font-mono)`

### Текст
```css
--txt-primary: #e8dcc4;   /* основной */
--txt-gold: #d4b87a;       /* золотой акцент */
--txt-secondary: #a09480;  /* вторичный */
--txt-muted: #7a7068;      /* приглушённый */
--txt-dim: #5a524a;        /* placeholder */
--txt-on-gold: #2a2218;    /* текст на золотой кнопке */
```

---

## ПОЛНЫЙ КОД globals.css (419 строк)

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* OBSIDIAN GOLD FORGE — Premium Design System */

@layer base {
  :root {
    --sf-base: #2a2b2a; --sf-base-rgb: 42,43,42;
    --sf-raised: #313231; --sf-raised-rgb: 49,50,49;
    --sf-card: #353534; --sf-card-rgb: 53,53,52;
    --sf-card-hi: #3d3d3c;
    --sf-input: #262726; --sf-input-rgb: 38,39,38;
    --sf-overlay: #222322;

    --gold-peak: #fff4d4; --gold-bright: #ffe9a1; --gold-hot: #d9a54e;
    --gold-warm: #c99a48; --gold-core: #b8933f; --gold-med: #a68540;
    --gold-sub: #8a7344; --gold-dim: #6b5a3e; --gold-mute: #4d4132;
    --gold-ember: #3a3028;

    --glow-gold-hot: rgba(217,165,78, 0.35);
    --glow-gold-warm: rgba(201,154,72, 0.20);
    --glow-gold-soft: rgba(184,147,63, 0.12);
    --glow-gold-dim: rgba(138,115,68, 0.08);

    --brd-highlight: rgba(255,244,212, 0.08);
    --brd-card: rgba(168,142,86, 0.16);
    --brd-card-top: rgba(200,170,100, 0.14);
    --brd-card-bot: rgba(80,68,46, 0.20);
    --brd-input: rgba(138,115,68, 0.12);
    --brd-gold-active: rgba(217,165,78, 0.50);
    --brd-subtle: rgba(255,255,255, 0.04);

    --txt-primary: #e8dcc4; --txt-gold: #d4b87a;
    --txt-secondary: #a09480; --txt-muted: #7a7068;
    --txt-dim: #5a524a; --txt-on-gold: #2a2218;

    --shadow-z1: 0 2px 4px rgba(0,0,0,0.20), 0 4px 12px rgba(0,0,0,0.12);
    --shadow-z2: 0 4px 8px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.18), 0 2px 4px rgba(0,0,0,0.10);
    --shadow-z3: 0 8px 16px rgba(0,0,0,0.30), 0 16px 48px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.15);
    --shadow-inset: inset 0 2px 6px rgba(0,0,0,0.35), inset 0 1px 2px rgba(0,0,0,0.25);
    --shadow-inset-deep: inset 0 3px 8px rgba(0,0,0,0.45), inset 0 1px 3px rgba(0,0,0,0.30);
  }
  html { background: var(--sf-base); color-scheme: dark; }
  body { color: var(--txt-primary); overflow-x: hidden;
    -webkit-tap-highlight-color: transparent; -webkit-touch-callout: none;
    -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
  input, select, textarea { font-size: 16px !important; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 4px; }
  *:focus-visible { outline: 2px solid var(--gold-warm); outline-offset: 2px; }
}

@layer components {
  .app-bg { position: fixed; inset: 0; z-index: 0;
    background: radial-gradient(ellipse 120% 80% at 20% 15%, rgba(184,147,63,0.03) 0%, transparent 60%),
      linear-gradient(175deg, #333433 0%, #2e2f2e 30%, #2a2b2a 60%, #282928 100%); }
  .app-bg::after { content: ''; position: absolute; inset: 0; opacity: 0.30;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
    background-repeat: repeat; background-size: 128px; pointer-events: none; }

  .card-3d { position: relative; isolation: isolate;
    background: linear-gradient(170deg, var(--sf-card-hi) 0%, var(--sf-card) 40%, var(--sf-raised) 100%);
    border-radius: 16px; border: 1px solid var(--brd-card);
    border-top-color: var(--brd-card-top); border-bottom-color: var(--brd-card-bot);
    padding: 16px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.30), 0 12px 40px rgba(0,0,0,0.15),
      0 2px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,244,212, 0.05);
    transition: transform 300ms ease, box-shadow 300ms ease; }
  .card-3d:active { transform: translateY(0) scale(0.985); transition: transform 100ms ease; }
  .card-3d-selected { border-color: var(--brd-gold-active) !important;
    border-top-color: rgba(217,165,78, 0.55) !important;
    box-shadow: 0 0 20px var(--glow-gold-warm), 0 0 50px var(--glow-gold-dim),
      0 8px 24px rgba(0,0,0,0.35), 0 16px 48px rgba(0,0,0,0.18),
      0 2px 4px rgba(0,0,0,0.30), inset 0 1px 0 rgba(217,165,78, 0.12) !important; }

  .btn-gold-3d { position: relative; isolation: isolate;
    display: inline-flex; align-items: center; justify-content: center;
    background: linear-gradient(170deg, #dbb368 0%, #c9a04c 30%, #b8933f 60%, #a68040 100%);
    color: var(--txt-on-gold); font-family: var(--font-serif), 'Playfair Display', serif;
    font-weight: 600; font-size: 15px; letter-spacing: 0.5px;
    border: none; border-radius: 14px; height: 52px; padding: 0 28px;
    cursor: pointer; transition: all 250ms ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.35), 0 8px 24px rgba(184,147,63,0.15),
      inset 0 1px 0 rgba(255,244,212,0.30), inset 0 -1px 0 rgba(0,0,0,0.15); }
  .btn-gold-3d:hover { background: linear-gradient(170deg, #e4bf74 0%, #d1a854 30%, #c09a48 60%, #ae8844 100%);
    box-shadow: 0 6px 16px rgba(0,0,0,0.40), 0 12px 32px rgba(184,147,63,0.22),
      inset 0 1px 0 rgba(255,244,212,0.35), inset 0 -1px 0 rgba(0,0,0,0.12);
    transform: translateY(-1px); }
  .btn-gold-3d:active { transform: translateY(1px) scale(0.98);
    box-shadow: 0 2px 6px rgba(0,0,0,0.35), inset 0 2px 4px rgba(0,0,0,0.15);
    transition: all 80ms ease; }
  .btn-gold-3d:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }

  .cta-gold-bar { position: relative; isolation: isolate;
    display: flex; align-items: center; justify-content: center;
    width: 100%; height: 54px;
    background: linear-gradient(170deg, #ddb56a 0%, #c9a04c 35%, #b8933f 65%, #a07e38 100%);
    color: var(--txt-on-gold); font-family: var(--font-serif), 'Playfair Display', serif;
    font-weight: 600; font-size: 16px; letter-spacing: 0.8px;
    border: none; border-radius: 14px; cursor: pointer; transition: all 250ms ease;
    box-shadow: 0 4px 14px rgba(0,0,0,0.35), 0 8px 28px rgba(184,147,63,0.18),
      inset 0 1px 0 rgba(255,244,212,0.28), inset 0 -2px 0 rgba(0,0,0,0.10); }
  .cta-gold-bar:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.40), 0 12px 36px rgba(184,147,63,0.25),
      inset 0 1px 0 rgba(255,244,212,0.35), inset 0 -2px 0 rgba(0,0,0,0.08);
    transform: translateY(-1px); }
  .cta-gold-bar:active { transform: translateY(1px) scale(0.98);
    box-shadow: 0 2px 8px rgba(0,0,0,0.35), inset 0 2px 6px rgba(0,0,0,0.12);
    transition: all 80ms ease; }
  .cta-gold-bar:disabled { opacity: 0.30; cursor: not-allowed; transform: none; }

  .btn-ghost-3d { display: inline-flex; align-items: center; justify-content: center;
    background: linear-gradient(170deg, rgba(53,53,52,0.6) 0%, rgba(49,50,49,0.4) 100%);
    color: var(--txt-gold); font-family: var(--font-serif), 'Playfair Display', serif;
    font-weight: 500; font-size: 13px;
    border: 1px solid var(--brd-card); border-top-color: var(--brd-card-top);
    border-bottom-color: var(--brd-card-bot);
    border-radius: 10px; height: 36px; padding: 0 14px;
    cursor: pointer; transition: all 200ms ease;
    box-shadow: 0 2px 6px rgba(0,0,0,0.20), 0 4px 12px rgba(0,0,0,0.10),
      inset 0 1px 0 rgba(255,244,212,0.04); }
  .btn-ghost-3d:active { transform: scale(0.96); transition: all 80ms ease; }

  .input-3d { background: var(--sf-input);
    border: 1px solid var(--brd-input); border-top-color: rgba(0,0,0,0.15);
    border-bottom-color: rgba(138,115,68,0.10);
    border-radius: 12px; height: 52px; padding: 0 16px;
    font-size: 16px; color: var(--txt-primary); width: 100%;
    transition: all 250ms ease; box-shadow: var(--shadow-inset); }
  .input-3d::placeholder { color: var(--txt-dim); }
  .input-3d:focus { border-color: var(--gold-warm);
    box-shadow: var(--shadow-inset), 0 0 0 3px var(--glow-gold-soft), 0 0 16px var(--glow-gold-dim);
    outline: none; }
  .input-3d-error { border-color: rgba(220,80,60,0.50) !important;
    box-shadow: var(--shadow-inset), 0 0 0 3px rgba(220,80,60,0.12), 0 0 12px rgba(220,80,60,0.08) !important; }

  .chip-3d { display: inline-flex; align-items: center; justify-content: center;
    background: linear-gradient(170deg, var(--sf-card) 0%, var(--sf-raised) 100%);
    color: var(--txt-secondary); font-size: 13px; font-weight: 500;
    border: 1px solid var(--brd-subtle); border-top-color: rgba(255,255,255,0.06);
    border-bottom-color: rgba(0,0,0,0.08);
    border-radius: 10px; height: 40px; padding: 0 16px;
    cursor: pointer; transition: all 200ms ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.08),
      inset 0 1px 0 rgba(255,255,255,0.03); }
  .chip-3d:hover { border-color: rgba(168,142,86,0.20); color: var(--txt-gold); }
  .chip-3d:active { transform: scale(0.95); transition: all 80ms ease; }
  .chip-3d-active { background: linear-gradient(170deg, rgba(184,147,63,0.15) 0%, rgba(138,115,68,0.10) 100%) !important;
    border-color: var(--gold-warm) !important; border-top-color: rgba(217,165,78,0.45) !important;
    color: var(--gold-bright) !important;
    box-shadow: 0 2px 6px rgba(0,0,0,0.22), 0 4px 12px rgba(184,147,63,0.12),
      0 0 16px var(--glow-gold-dim), inset 0 1px 0 rgba(217,165,78,0.10) !important; }

  .pill-3d { display: inline-flex; align-items: center; justify-content: center;
    background: linear-gradient(170deg, rgba(184,147,63,0.18) 0%, rgba(138,115,68,0.12) 100%);
    color: var(--gold-hot); font-size: 10px; font-weight: 600;
    letter-spacing: 0.5px; text-transform: uppercase;
    border: 1px solid rgba(168,142,86,0.25); border-top-color: rgba(217,165,78,0.20);
    border-radius: 8px; height: 24px; padding: 0 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,244,212,0.06); }
  .pill-3d-dark { display: inline-flex; align-items: center; justify-content: center;
    background: linear-gradient(170deg, var(--sf-card) 0%, var(--sf-raised) 100%);
    color: var(--txt-secondary); font-size: 10px; font-weight: 600;
    letter-spacing: 0.5px; text-transform: uppercase;
    border: 1px solid var(--brd-subtle); border-top-color: rgba(255,255,255,0.05);
    border-radius: 8px; height: 24px; padding: 0 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.02); }

  .info-bar { position: relative; display: flex; align-items: center;
    background: linear-gradient(170deg, rgba(49,50,49,0.8) 0%, rgba(42,43,42,0.6) 100%);
    border: 1px solid var(--brd-subtle); border-top: none;
    border-radius: 12px; padding: 12px 14px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.02);
    overflow: hidden; }
  .info-bar::before { content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--gold-warm), transparent); opacity: 0.6; }

  .dot-3d { width: 6px; height: 6px; border-radius: 50%;
    background: var(--sf-overlay); border: 1px solid var(--brd-subtle);
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.30); transition: all 300ms ease; }
  .dot-3d-done { background: var(--gold-dim); border-color: var(--gold-sub);
    box-shadow: 0 0 4px var(--glow-gold-dim), inset 0 1px 0 rgba(255,244,212,0.10); }
  .dot-3d-active { width: 24px; height: 6px; border-radius: 3px;
    background: linear-gradient(90deg, var(--gold-warm), var(--gold-hot));
    border-color: var(--gold-hot);
    box-shadow: 0 0 8px var(--glow-gold-warm), 0 0 16px var(--glow-gold-dim),
      inset 0 1px 0 rgba(255,244,212,0.20); }

  .check-3d { width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(170deg, #2e2e2d 0%, #363534 100%);
    border: 2px solid var(--gold-dim);
    box-shadow: var(--shadow-inset), 0 2px 6px rgba(0,0,0,0.25);
    transition: all 300ms ease; }
  .check-3d-active { background: linear-gradient(170deg, #d4ac5a 0%, #c99a48 50%, #b8933f 100%);
    border-color: var(--gold-hot);
    box-shadow: 0 0 12px var(--glow-gold-warm), 0 2px 6px rgba(0,0,0,0.25),
      inset 0 1px 2px rgba(255,244,212,0.25), inset 0 -1px 2px rgba(0,0,0,0.10); }

  .icon-btn-3d { display: flex; align-items: center; justify-content: center;
    width: 38px; height: 38px;
    background: linear-gradient(170deg, var(--sf-card-hi) 0%, var(--sf-card) 50%, var(--sf-raised) 100%);
    border: 1px solid var(--brd-card); border-top-color: var(--brd-card-top);
    border-bottom-color: var(--brd-card-bot);
    border-radius: 10px; cursor: pointer; transition: all 200ms ease;
    box-shadow: 0 2px 6px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.10),
      inset 0 1px 0 rgba(255,244,212,0.04); }
  .icon-btn-3d:active { transform: scale(0.92); transition: all 80ms ease; }

  .price-display { font-family: var(--font-serif), 'Playfair Display', Georgia, serif;
    font-weight: 400; font-size: 48px; line-height: 1; color: var(--gold-bright);
    text-shadow: 0 0 30px var(--glow-gold-warm), 0 0 60px var(--glow-gold-dim),
      0 2px 4px rgba(0,0,0,0.30); }

  .divider-gold { height: 1px; border: none;
    background: linear-gradient(90deg, transparent, var(--gold-dim), transparent); opacity: 0.5; }

  .error-box { background: rgba(180,40,30,0.08); border: 1px solid rgba(220,80,60,0.20);
    border-radius: 10px; padding: 10px 14px; color: #e8725a; font-size: 12px;
    box-shadow: inset 0 1px 3px rgba(180,40,30,0.10), 0 2px 6px rgba(0,0,0,0.10); }

  .loading-ring { width: 120px; height: 120px; border-radius: 50%;
    border: 3px solid var(--sf-overlay); border-top-color: var(--gold-warm);
    box-shadow: 0 0 20px var(--glow-gold-soft), 0 0 40px var(--glow-gold-dim),
      inset 0 0 20px var(--glow-gold-dim);
    animation: spin 1.2s linear infinite; }

  .shimmer { background: linear-gradient(90deg, var(--sf-raised) 25%, rgba(184,147,63,0.06) 50%, var(--sf-raised) 75%);
    background-size: 200% 100%; animation: shimmer 2s linear infinite; }

  .progress-track { height: 4px; background: var(--sf-overlay); border-radius: 2px;
    overflow: hidden; box-shadow: var(--shadow-inset); }
  .progress-fill { height: 100%; background: linear-gradient(90deg, var(--gold-warm), var(--gold-hot));
    border-radius: 2px; box-shadow: 0 0 8px var(--glow-gold-warm); transition: width 400ms ease; }
}

@layer utilities {
  .text-gold-gradient { background: linear-gradient(135deg, var(--gold-bright), var(--gold-warm));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .glow-gold { box-shadow: 0 0 30px var(--glow-gold-soft); }
  .glow-gold-hot { box-shadow: 0 0 20px var(--glow-gold-warm), 0 0 50px var(--glow-gold-dim); }
  .safe-top { padding-top: env(safe-area-inset-top, 0px); }
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom, 0px); }
  .scrollbar-none::-webkit-scrollbar { display: none; }
  .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
  .label-gold { font-family: var(--font-serif), 'Playfair Display', serif;
    font-size: 11px; font-weight: 500; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--txt-muted); }
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
@keyframes slideUp { 0% { opacity: 0; transform: translateY(16px); } 100% { opacity: 1; transform: translateY(0); } }
@keyframes countUp { 0% { opacity: 0; transform: scale(0.85); } 60% { opacity: 1; transform: scale(1.02); } 100% { transform: scale(1); } }
@keyframes goldPulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
@keyframes floatUp { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
```

---

## layout.tsx ИЗМЕНЕНИЯ

```tsx
// themeColor changed:
themeColor: '#2a2b2a',

// body changed:
<body className="min-h-screen font-sans antialiased" style={{ background: '#2a2b2a' }}>
  <div className="app-bg" aria-hidden="true" />
  <div className="relative z-10">
    {children}
  </div>
</body>
```

---

## UI КОМПОНЕНТЫ (все маленькие обёртки)

**Button.tsx:** `btn-gold-3d` / `btn-ghost-3d` / `cta-gold-bar` variants
**Card.tsx:** `card-3d` + optional `card-3d-selected`
**Input.tsx:** `input-3d` + `input-3d-error` + `label-gold` + suffix support
**Pill.tsx:** `pill-3d` / `pill-3d-dark`
**Divider.tsx:** `divider-gold`

---

## ФОРМУЛЫ (краткая сводка)

### USA → РФ/РБ (до 3 лет, ≤160лс)
```
РФ: (lot×1.08+2200+750)×1.011 + (lot×1.08+2200)×0.48 = $×USDT_rate + ФИКС(425K/495K/575K/+100K)
РБ: (lot×1.08+2200+750)×1.011 + (lot×1.08)×0.30 = $×USDT_rate + ФИКС(450K/520K/600K/+100K)
```
### Корея → РФ/РБ: priceKRW × KRW_RUB × 1.48/1.30 + 90K + 600K/720K
### ОАЭ → РФ/РБ: (AED/3.67+$1600) × USDT × 1.48/1.30 + fix
### Китай → РФ/РБ: (price+8000+price×0.025) × CNY × 1.48/1.30 + 590K/720K
### >160лс: + коммерческий утильсбор

---

## КУРСЫ ВАЛЮТ
- **USDT/RUB** (США, ОАЭ): Bybit P2P медиана + коррекция MoscaEx (дефолт +1.50₽)
- **KRW/RUB** (Корея): ЦБ РФ + спред ВТБ (дефолт +0.00050₽)
- **CNY/RUB** (Китай): ЦБ РФ + спред ВТБ (дефолт +0.30₽)
- **EUR/RUB** (ЕТТ ЕАЭС): ЦБ РФ (без коррекции)
- **AED/USD**: фиксированный 3.67

---

## ⚠️ КРИТИЧЕСКИЕ ПРАВИЛА

1. **Антон НЕ разработчик** — веди пошагово
2. **Клиент видит ТОЛЬКО итоговую цену** — никакого breakdown
3. **После каждого подэтапа СТОП** и жди команду «продолжай»
4. **Пуш в GitHub** после каждого значимого изменения
5. **Тесты не должны ломаться** — проверяй `npx vitest run` после изменений
6. **Фон ТЁПЛЫЙ УГОЛЬНЫЙ** (#2a2b2a) — НИКОГДА чёрный
7. **3D через тени и градиенты** — каждый элемент физический объект
8. **Не адаптировать** — дизайн-система OBSIDIAN GOLD FORGE как есть

---

## 💬 Как начать новый чат

Загрузи этот файл в Project. Напиши:

**«Контекст перенесён. OBSIDIAN GOLD FORGE запушен (коммит fcad5aa). Клонируй репо, проверь тесты и сборку, просмотри все экраны. Доведи визуал до совершенства — 3D, тени, свечение, объёмы, парящие карточки, тёплый угольный фон. Продолжай.»**

Claude должен:
1. Клонировать репо (fcad5aa — уже с новым дизайном)
2. npm install
3. npx vitest run (394 теста должны пройти)
4. npm run build
5. Проверить StepHistory (мог быть не обновлён)
6. Довести каждый экран до совершенства
7. Запушить финальные правки
8. Дать команду для деплоя на VPS
