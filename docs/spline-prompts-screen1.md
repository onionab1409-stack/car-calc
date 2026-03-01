# 🎯 SPLINE AI — Экран 1: Выбор страны
## Пошаговые инструкции · Без пропусков · Каждый клик описан
## Car-Calc · P5 Дизайн

---

## 📋 ЧТО ДЕЛАЕМ

6 Spline-сцен для Экрана 1 (выбор страны):

| # | Сцена | Что это | Приоритет |
|---|---|---|---|
| 1 | Glass Card | Стеклянная карточка-фон (одна на все страны) | 🔴 |
| 2 | Korea Symbol | Золотая пагода-символ Кореи | 🔴 |
| 3 | USA Symbol | Золотая Статуя Свободы | 🔴 |
| 4 | UAE Symbol | Золотая Бурдж-Халифа | 🔴 |
| 5 | China Symbol | Золотая китайская пагода | 🔴 |
| 6 | Loading Car | Золотая машинка для экрана загрузки | 🟡 |

Порядок: строго 1 → 2 → 3 → 4 → 5 → 6. После каждого — скриншот мне.

---

# ═══════════════════════════════════════
# СЦЕНА 1: GLASS CARD (стеклянная карточка)
# ═══════════════════════════════════════

## Шаг 1 — Генерация

### 1.1 Открой Spline
- Зайди на spline.design
- Войди в аккаунт

### 1.2 Выбери способ генерации
- На Dashboard нажми вкладку **«Generate»** (сверху)
- Или: открой новый файл → кнопка **AI** на панели инструментов → **AI Generate**

### 1.3 Используй КОМБО-режим (текст + картинка)
- Нажми иконку 📎 (скрепка) или кнопку загрузки изображения
- Загрузи файл **ref-05-country-list.png**
- В текстовое поле вставь этот промпт:

```
A single rounded rectangle card made of dark smoked glass. The card has visible thickness and depth like a real glass slab. Edges are smooth and chamfered. There is a thin golden glowing line along the entire border edge of the card. The glass is semi-transparent, dark grey tinted. The card floats in empty black space. Close-up front view showing one card only. No text, no icons on the surface. Premium luxury material, like a high-end credit card made of glass. Soft golden rim light on edges.
```

### 1.4 Выбери лучший вариант
- Spline покажет **4 превью-картинки**
- Выбирай ту, где:
  ✅ Чётко видно прямоугольник со скруглёнными углами
  ✅ Есть ощущение толщины/глубины (не плоский)
  ✅ Похоже на стеклянную плитку или карточку
  ❌ НЕ выбирай если: бесформенная масса, слишком круглое, не похоже на карточку
- Нажми на лучший → Spline сгенерирует 3D-меш

### 1.5 Сделай скриншот
- Сделай скриншот того что получилось
- Скинь мне — я скажу ок или перегенерировать

---

## Шаг 2 — Настройка материала

После того как меш появился в сцене:

### 2.1 Выдели объект
- Кликни на карточку в сцене (она подсветится)

### 2.2 Открой панель материала
- Справа найди секцию **«Material»**
- Если материала нет — нажми **«+»** рядом с Material

### 2.3 Настрой параметры материала

```
Тип материала: выбери «Physical» (или «Glass» если есть)

Color (цвет):        #1A1A1F  (очень тёмный серый)
Opacity (прозрачность): 0.80  (сдвинь ползунок на ~80%)
Metalness (металл):     0.05  (почти 0, это стекло а не металл)
Roughness (шершавость): 0.12  (почти гладкий, но не зеркало)

Если есть параметр Transmission (пропускание света): 0.5
Если есть параметр IOR (преломление): 1.45
```

### 2.4 Включи Emission (свечение) — для золотого ободка
- В секции Material найди **«Emission»** → включи тумблер
- Если нет отдельного Emission — пропусти, сделаем через второй объект

```
Emission Color: #D4AF37  (золотой)
Emission Intensity: 0.15  (еле заметное, subtle)
```

---

## Шаг 3 — Золотой бордер (rim light)

Если свечение от Emission недостаточно заметно, делаем отдельный объект:

### 3.1 Дублируй карточку
- Выдели карточку
- **Cmd+D** (Mac) или **Ctrl+D** (Windows) — появится копия

### 3.2 Сделай копию чуть больше
- Выдели копию
- Справа найди **«Scale»** (размер)
- Увеличь X и Y на 1.02 (то есть было 1.00 → стало 1.02)
- Z оставь как есть или уменьши на 0.5 (тоньше оригинала)

### 3.3 Настрой материал копии (золотой бордер)

```
Color:     #D4AF37  (золотой)
Opacity:   0.40
Metalness: 0.8
Roughness: 0.2
Emission:  ON
  Color:     #D4AF37
  Intensity: 0.5
```

### 3.4 Поставь копию ЗА оригинал
- Выдели золотую копию
- В панели слоёв (слева) перетащи её НИЖЕ оригинальной карточки
- Или подвинь по оси Z: на -2 (чуть назад)

**Результат:** тёмная стеклянная карточка с золотым свечением по контуру.

---

## Шаг 4 — Освещение

### 4.1 Удали стандартный свет
- В панели слоёв (слева) найди все объекты типа **«Directional Light»** или **«Ambient Light»**
- Удали их (выдели → Delete)

### 4.2 Добавь свой свет
- Верхнее меню → **«+»** (Add) → **«Light»** → **«Directional Light»**

```
Directional Light 1 (основной):
  Position: x=0, y=200, z=300  (сверху-спереди)
  Rotation: направь на карточку (x=-30, y=0, z=0)
  Color: #FFF5E0  (тёплый белый)
  Intensity: 0.8
  Shadows: OFF (для скорости)
```

### 4.3 Добавь второй свет (золотая подсветка)
- **«+»** → **«Light»** → **«Point Light»**

```
Point Light (золотой):
  Position: x=0, y=-100, z=-50  (снизу-сзади карточки)
  Color: #D4AF37  (золотой)
  Intensity: 0.4
  Range: 500
```

---

## Шаг 5 — Камера

### 5.1 Настрой камеру
- В панели слоёв найди **«Camera»** (или добавь: + → Camera)
- Выдели камеру

```
Type: Orthographic  (нажми в панели справа, переключи с Perspective)
Position: x=0, y=0, z=500
Rotation: x=0, y=0, z=0
Zoom: подкрути чтобы карточка занимала ~70% кадра
```

### 5.2 Фон — прозрачный
- Кликни на пустое место в сцене (снимает выделение)
- Справа найди **«Scene»** или **«Background»**
- Выбери **«Transparent»** или установи цвет **#00000000**
- Если нет прозрачного — поставь **#0C0C0E** (фон приложения)

---

## Шаг 6 — Анимация

### 6.1 Idle-анимация (медленное парение)
- Выдели карточку (оригинал + золотой бордер — выдели оба, зажми Shift)
- Слева внизу найди вкладку **«Events»** или **«States»**

Если используешь **States + Transitions:**
```
State 1 (default):
  Rotation X: 0°
  Position Y: 0

State 2:
  Rotation X: 3°
  Position Y: 5

Transition 1→2:
  Duration: 3000ms
  Easing: ease-in-out

Transition 2→1:
  Duration: 3000ms  
  Easing: ease-in-out

Loop: ON (зациклить)
```

Если используешь **Events:**
```
Event: Start (при загрузке)
Action: Transition → State 2
After: Transition → State 1 (loop)
```

### 6.2 Hover-анимация (при наведении)
```
Event: Mouse Hover
Action: 
  Scale: 1.00 → 1.05  (увеличение на 5%)
  Duration: 200ms
  Easing: ease-out

Event: Mouse Hover End  
Action:
  Scale: 1.05 → 1.00
  Duration: 300ms
```

---

## Шаг 7 — Экспорт

### 7.1 Настрой размер
- Кликни **File** → **Export Settings** (или иконка экспорта)
- Canvas size: **340 × 200** px

### 7.2 Экспортируй
- Нажми **Export** (правый верхний угол)
- Выбери **«Code»** → **«React»**
- Скопируй URL сцены (формат: `https://prod.spline.design/xxxxx/scene.splinecode`)
- Или нажми **Download** (иконка скачивания) → скачается `.splinecode` файл

### 7.3 Скинь мне
- Скриншот финального результата
- URL сцены
- .splinecode файл (если скачал)

---

# ═══════════════════════════════════════
# СЦЕНА 2: СИМВОЛ КОРЕИ (золотая пагода)
# ═══════════════════════════════════════

## Шаг 1 — Генерация

### Открой новый файл в Spline (+ New File)

### Вставь промпт (только текст, без картинки):

```
A cute miniature golden Korean traditional pagoda tower. Simple smooth stylized design with 3 tiers. Rounded soft edges, low-poly aesthetic. Shiny gold metallic material. Single small object centered in empty dark space. Front facing view. Toy figurine collectible style, not realistic. Warm golden glow.
```

### Выбор варианта:
- Из 4 превью выбирай где:
  ✅ Узнаваемо как пагода/храм (2-3 яруса)
  ✅ Простые формы, не перегруженный деталями
  ✅ Компактный, «игрушечный» вид
  ❌ НЕ выбирай: слишком детальный, развалившийся, непонятная форма

---

## Шаг 2 — Материал (золото)

```
Color:     #D4AF37  (золотой)
Metalness: 0.75
Roughness: 0.20
Emission:  ON
  Color:     #D4AF37
  Intensity: 0.25
```

## Шаг 3 — Свет

```
Directional Light:
  Position: сверху-спереди
  Color: #FFF5E0
  Intensity: 1.0

Point Light (снизу):
  Color: #D4AF37
  Intensity: 0.3
```

## Шаг 4 — Камера + фон

```
Camera: Orthographic
Background: Transparent или #0C0C0E
Zoom: объект занимает ~70% кадра
```

## Шаг 5 — Анимация

```
Idle: медленное вращение Y
  State 1: Rotation Y = 0°
  State 2: Rotation Y = 360°
  Duration: 20000ms (20 секунд на полный оборот)
  Loop: ON

Hover:
  Scale: 1.0 → 1.1
  Duration: 200ms
```

## Шаг 6 — Экспорт

```
Canvas: 160 × 120 px (маленький, ставится НА карточку)
Export: Code → React → скопируй URL
```

---

# ═══════════════════════════════════════
# СЦЕНА 3: СИМВОЛ США (Статуя Свободы)
# ═══════════════════════════════════════

## Промпт:

```
A cute miniature golden Statue of Liberty figurine. Simplified smooth stylized design. Rounded soft forms, low detail, toy collectible aesthetic. Shiny gold metallic surface with warm glow. Single small centered object on dark empty background. Front facing view. Not realistic, more like a golden trophy or chess piece.
```

## Материал, свет, камера, анимация — ИДЕНТИЧНО сцене 2 (Корея)
## Canvas: 160 × 120 px
## Экспорт: Code → React

---

# ═══════════════════════════════════════
# СЦЕНА 4: СИМВОЛ ОАЭ (Бурдж-Халифа)
# ═══════════════════════════════════════

## Промпт:

```
A cute miniature golden Burj Khalifa skyscraper figurine. Simple smooth stylized geometric tower shape. Tapered elegant silhouette. Shiny gold metallic material with warm glow. Single small centered object on dark empty background. Front facing view. Luxury golden trophy miniature aesthetic. Low-poly smooth surfaces.
```

## Материал, свет, камера, анимация — ИДЕНТИЧНО сцене 2
## Canvas: 160 × 120 px
## Экспорт: Code → React

---

# ═══════════════════════════════════════
# СЦЕНА 5: СИМВОЛ КИТАЯ (пагода)
# ═══════════════════════════════════════

## Промпт:

```
A cute miniature golden Chinese pagoda temple. Five-tiered traditional tower with curved roof edges on each level. Simplified smooth stylized design. Shiny gold metallic material with warm glow. Single small centered object on dark empty background. Front facing view. Decorative golden figurine collectible style.
```

## Материал, свет, камера, анимация — ИДЕНТИЧНО сцене 2
## Canvas: 160 × 120 px
## Экспорт: Code → React

---

# ═══════════════════════════════════════
# СЦЕНА 6: ЗАГРУЗКА (золотая машинка)
# ═══════════════════════════════════════

Для Экрана 4 (loading). Делаем после того как карточки готовы.

## Промпт:

```
A cute miniature golden sports car. Simple smooth rounded body shape. Low-poly stylized design like a toy model. Shiny gold metallic surface with warm glowing edges. Single small car centered on dark empty background. Side profile view showing the full car silhouette. Luxury golden trophy miniature aesthetic.
```

## Материал:

```
Color:     #D4AF37
Metalness: 0.80
Roughness: 0.15
Emission:  ON, #D4AF37, intensity 0.3
```

## Анимация:

```
Idle: движение вправо + покачивание
  State 1: Position X = -50, Rotation Z = 0°
  State 2: Position X = +50, Rotation Z = 2°
  Duration: 3000ms
  Loop: ping-pong (туда-сюда)
```

## Canvas: 280 × 120 px
## Экспорт: Code → React

---

# ═══════════════════════════════════════
# 📱 КАК ВСТРОИТЬ В NEXT.JS
# ═══════════════════════════════════════

После того как все 6 сцен готовы и экспортированы:

```tsx
// src/components/spline/CountryCard.tsx
import Spline from '@splinetool/react-spline/next';

interface CountryCardProps {
  country: 'US' | 'KR' | 'AE' | 'CN';
  name: string;
  minPrice: string;
  onSelect: () => void;
}

const SYMBOL_SCENES = {
  US: 'https://prod.spline.design/ТВОЙ_URL_США/scene.splinecode',
  KR: 'https://prod.spline.design/ТВОЙ_URL_КОРЕИ/scene.splinecode',
  AE: 'https://prod.spline.design/ТВОЙ_URL_ОАЭ/scene.splinecode',
  CN: 'https://prod.spline.design/ТВОЙ_URL_КИТАЯ/scene.splinecode',
};

const GLASS_CARD = 'https://prod.spline.design/ТВОЙ_URL_КАРТОЧКИ/scene.splinecode';

export function CountryCard({ country, name, minPrice, onSelect }: CountryCardProps) {
  return (
    <button onClick={onSelect} className="relative w-[170px] h-[210px] group">
      {/* 3D стеклянная карточка */}
      <div className="absolute inset-0">
        <Spline scene={GLASS_CARD} />
      </div>
      
      {/* 3D символ страны */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[130px] h-[90px]">
        <Spline scene={SYMBOL_SCENES[country]} />
      </div>
      
      {/* Текст поверх (CSS) */}
      <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
        <h3 className="text-[15px] font-semibold text-white">{name}</h3>
        <p className="text-[12px] text-[#D4AF37] mt-0.5">от {minPrice}</p>
      </div>
    </button>
  );
}
```

```tsx
// Использование на экране выбора страны:
<div className="grid grid-cols-2 gap-4 px-4">
  <CountryCard country="KR" name="Корея" minPrice="2.7 млн ₽" onSelect={() => {}} />
  <CountryCard country="CN" name="Китай" minPrice="3.1 млн ₽" onSelect={() => {}} />
  <CountryCard country="US" name="США" minPrice="2.3 млн ₽" onSelect={() => {}} />
  <CountryCard country="AE" name="ОАЭ" minPrice="4.5 млн ₽" onSelect={() => {}} />
</div>
```

---

# ═══════════════════════════════════════
# ✅ ЧЕКЛИСТ
# ═══════════════════════════════════════

- [ ] Сцена 1: Glass Card — сгенерировано
- [ ] Сцена 1: Glass Card — материал настроен
- [ ] Сцена 1: Glass Card — золотой бордер добавлен
- [ ] Сцена 1: Glass Card — свет настроен
- [ ] Сцена 1: Glass Card — анимация работает
- [ ] Сцена 1: Glass Card — экспортировано
- [ ] Скриншот отправлен Claude ← **СТОП**
- [ ] Сцена 2: Korea — сгенерировано + настроено + экспорт
- [ ] Скриншот отправлен Claude ← **СТОП**
- [ ] Сцена 3: USA — сгенерировано + настроено + экспорт
- [ ] Скриншот отправлен Claude ← **СТОП**
- [ ] Сцена 4: UAE — сгенерировано + настроено + экспорт
- [ ] Скриншот отправлен Claude ← **СТОП**
- [ ] Сцена 5: China — сгенерировано + настроено + экспорт
- [ ] Скриншот отправлен Claude ← **СТОП**
- [ ] Сцена 6: Loading Car — сгенерировано + настроено + экспорт
- [ ] Скриншот отправлен Claude ← **СТОП**
- [ ] ВСЕ URL сцен записаны
- [ ] Готово к P6 (фронтенд)
