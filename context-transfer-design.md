# 🔄 Контекст переноса: Дизайн-ревизия (P9 · UI Polish)

**Проект:** car-calc — Telegram Mini App калькулятор импорта авто
**Дата:** 2026-03-02
**GitHub:** onionab1409-stack/car-calc
**Токен:** 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 (classic, write access)
**Продакшен:** https://app.americanautohouse.com (LIVE, работает!)
**VPS:** 155.212.245.223, Ubuntu 24.04, PM2 + Nginx + SSL

```
git clone https://onionab1409-stack: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@github.com/onionab1409-stack/car-calc.git
```

---

## 🎯 ЗАДАЧА

Переделать визуальный дизайн всех экранов калькулятора. Текущий дизайн плоский и базовый. Нужно привести к luxury dark gold эстетике из референсов (Midjourney V7), которые лежат в `desing/`.

**Ключевые проблемы:**
1. Карточки плоские — нужен glassmorphism (backdrop-blur, полупрозрачность)
2. Фон плоский чёрный — нужен градиент с мягким свечением
3. Нет золотого glow по бордерам карточек
4. Кнопки/стрелки без объёма и теней
5. Карты стран без золотого свечения точек
6. Общая глубина и атмосфера luxury не передана

**Функционал НЕ трогаем!** Только CSS/стили/визуал. Логика, API, тесты — всё работает.

---

## 📂 РЕФЕРЕНСЫ (desing/)

Все картинки из Midjourney V7. Claude должен **посмотреть каждый** перед работой:

| Файл | Экран |
|---|---|
| `ref-05-country-list.png` | 🏠 Выбор страны (главный экран) |
| `ref-06-destination.png` | Выбор направления (РФ/РБ) |
| `ref-07-input-form.png` | Ввод данных авто |
| `ref-08-price-input.png` | Ввод цены |
| `ref-09-engine-type.png` | Выбор типа двигателя |
| `ref-10-loading-circle.png` | Загрузка (круг) |
| `ref-11-loading-bar.png` | Загрузка (полоса) |
| `ref-12-result-minimal.png` | Результат (минимал) |
| `ref-13-result-gradient.png` | Результат (градиент) |
| `ref-14-result-card.png` | Результат (карточка) |
| `ref-15-result-route.png` | Результат (маршрут) |
| `ref-16-lead-form.png` | Форма заявки |
| `ref-17-lead-success.png` | Успешная отправка |
| `ref-18-history.png` | История расчётов |
| `Style ref.png` | Общий стиль-борд |
| `ref-02-moodboard.png` | Мудборд |

Также есть HTML-файлы дизайн-системы:
- `design-system-v2.html` — полная дизайн-система
- `ui-kit-car-calc-v6.html` — UI-компоненты
- `typography-design-system.html` — типографика
- `icons-v2.html` — 56 SVG иконок
- `result-screen-v1.html` — экран результата

---

## 🧩 ФАЙЛЫ ДЛЯ ПЕРЕДЕЛКИ (2,800 строк)

### UI-компоненты (базовые)
| Файл | Строк | Что делает |
|---|---|---|
| `src/components/ui/Card.tsx` | 40 | Базовая карточка |
| `src/components/ui/Button.tsx` | 50 | Кнопка |
| `src/components/ui/Input.tsx` | 57 | Поле ввода |
| `src/components/ui/Pill.tsx` | 33 | Тег/бейдж |
| `src/components/ui/Divider.tsx` | 5 | Разделитель |

### Экраны визарда
| Файл | Строк | Экран |
|---|---|---|
| `src/components/wizard/StepCountry.tsx` | 317 | Выбор страны (4 карточки с картами) |
| `src/components/wizard/StepCar.tsx` | 417 | Ввод данных авто (цена, год, двигатель, мощность) |
| `src/components/wizard/StepDestination.tsx` | 270 | Выбор направления (РФ/РБ) |
| `src/components/wizard/StepLoading.tsx` | 192 | Экран загрузки |
| `src/components/wizard/StepResult.tsx` | 212 | Результат (итоговая цена) |
| `src/components/wizard/StepLead.tsx` | 312 | Форма заявки (имя, телефон) |
| `src/components/wizard/StepHistory.tsx` | 246 | История расчётов |

### Общие стили
| Файл | Строк | Описание |
|---|---|---|
| `src/styles/design-tokens.ts` | 242 | Цвета, шрифты, тени, radii |
| `src/components/Calculator.tsx` | 267 | Оболочка визарда (фон, хедер, прогресс) |
| `src/app/globals.css` | ~50 | Глобальные Tailwind стили |

---

## 🎨 ДИЗАЙН-СИСТЕМА (из design-tokens.ts)

- **Золотой якорь:** #C4A265 (core), палитра 9 ступеней #FFE2A9 → #2D1C13
- **Фон:** app #0C0C0E, card #141418, elevated #111114
- **Текст:** primary #F5F5F5, secondary #B0A898, muted #6A665E
- **Шрифт цены:** Playfair Display 400
- **Основной шрифт:** Inter
- **Стиль:** luxury dark gold — чёрное + золото

---

## 🔧 КАК ДЕПЛОИТЬ ИЗМЕНЕНИЯ

После каждого изменения:
```bash
# В этом чате (Claude):
git add -A && git commit -m "описание" && git push origin main

# Потом пользователь на VPS:
cd /var/www/car-calc && git pull && npm run build && pm2 restart car-calc
```

Или просто: Claude пушит → пользователь проверяет на https://app.americanautohouse.com

---

## ⚠️ ВАЖНЫЕ ПРАВИЛА

1. **Пользователь НЕ разработчик** — веди пошагово
2. **Не трогай логику!** Только стили, CSS, className, визуал
3. **После каждого экрана — СТОП**, жди «продолжай»
4. **Сначала смотри референс**, потом пиши код
5. **Тесты не должны ломаться** — проверяй `npx vitest run` после изменений
6. **Клиент видит ТОЛЬКО итоговую цену** — никакого breakdown
7. **Пуш в GitHub** после каждого завершённого экрана

---

## 📋 ПЛАН РАБОТЫ (по экранам)

1. **Глобальные стили** — фон app, градиенты, glassmorphism-миксины в tokens
2. **Card / Button / Input / Pill** — переделка базовых UI-компонентов
3. **StepCountry** — карточки стран с glassmorphism + золотой glow
4. **StepCar** — форма ввода с luxury-полями
5. **StepDestination** — выбор РФ/РБ
6. **StepLoading** — анимация загрузки
7. **StepResult** — итоговая цена (самый важный экран)
8. **StepLead** — форма заявки
9. **StepHistory** — история расчётов
10. **Calculator.tsx** — хедер, прогресс-бар, переходы

---

## 💬 Как начать новый чат

Загрузи этот файл в Project. Напиши:

**«Контекст перенесён. P0–P8 завершены, приложение LIVE на https://app.americanautohouse.com. Задача: переделать дизайн всех экранов под luxury dark gold из референсов Midjourney. Начинаем с глобальных стилей и базовых UI-компонентов. GitHub репо подключено. Продолжай.»**

Claude должен:
1. Клонировать репо, npm install
2. Посмотреть ВСЕ референсы в `desing/` (ref-05 по ref-18 + Style ref.png)
3. Посмотреть HTML дизайн-системы (design-system-v2.html, ui-kit-v6.html)
4. Посмотреть текущие компоненты и design-tokens.ts
5. Начать с глобальных стилей + базовых компонентов (Card, Button, Input)
6. Пуш → СТОП → ждать «продолжай»
