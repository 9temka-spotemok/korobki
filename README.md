# БАЛТКАРТОН — сайт

Многостраничный лендинг компании БАЛТКАРТОН: гофротара, печать логотипов, доставка и контакты. Визуал построен на бренд-цветах `#ff5a1f` / `#1a1a1d` и логотипах из `public/brand/`.

Спектр услуг: гофротара (типы изделий, FEFCO, флексо до 3 цветов, доставка по РФ). Контакты — офис в СПб и производство в Гатчине. В шапке — Telegram [@Dmitry_an812](https://t.me/Dmitry_an812) (`.nav-tg`).

## Запуск

```bash
npm install
npm run dev
```

## Адаптив (лендинг)

| Ширина | Поведение |
|---|---|
| `>1400px` | Hero: текст слева, mark справа + пунктир сгиба |
| `>1100px` | Полное меню, сетка продукции 4 кол. |
| `≤1400px` | Hero: текст сверху, mark снизу; без пунктира (нет наложения на лого) |
| `≤1100px` | Бургер справа у CTA; выпадающее меню; контраст ссылок на тёмной панели |
| `≤960px` | Сплиты в 1 кол.; продукция 2 кол.; форма в 1 кол.; mark компактнее |
| `≤640px` | Продукция 1 кол.; кнопки hero на всю ширину; уплотнённые отступы |

Сборка статики в `dist/`:

```bash
npm run build
npm run preview
```

## Страницы

| Файл | Назначение |
|---|---|
| `index.html` | Редирект на `journey.html` (старый лендинг скрыт) |
| `journey.html` | **Стартовый лендинг / «Главная»** — cinematic Journey (React + R3F + GSAP + Lenis) |
| `catalog.html` | Каталог: сетка типов + модалка, материалы (трёх-/пятислойный, Z-картон), FEFCO |
| `print.html` | Печать логотипов (флексо, демо PANTONE на коробе) |
| `delivery.html` | Доставка, самовывоз, оплата |
| `contacts.html` | Телефон, email, адрес, карта, форма |

## Структура файлов

| Путь | За что отвечает |
|---|---|
| `vite.config.js` | Multi-page сборка Vite (все HTML-точки входа) + `@vitejs/plugin-react` для Journey |
| `package.json` | Скрипты `dev` / `build` / `preview`; зависимости: `vite`, `three`, `react`, `@react-three/*`, `gsap`, `lenis` |
| `src/js/main.js` | Навигация, меню, форма, reveal, `initHeroIntro`, `initFoldDash`, `renderProductList`, `renderBoardTypes`, `initProductModal`, `initPrintDemo` |
| `src/js/print-box-3d.js` | Three.js-сцена демо печати: OrbitControls, Pantone/лого; геометрии из `cardboard-kit.js` |
| `src/lib/cardboard-kit.js` | Общие модели: гофролист (лайнеры + экструзия волны), RSC FEFCO 0201, пицца-бокс, kraft-материалы `#B79477` |
| `src/journey/main.jsx` | Точка входа React для `journey.html` |
| `src/journey/App.jsx` | Оболочка Journey: Canvas, Lenis, оверлеи; бургер-меню шапки на планшете/мобилке; `journey--start` / `journey--config` |
| `src/journey/hooks/useScrollStory.js` | Lenis + GSAP ScrollTrigger → master progress 0–1; `scrollToProgress` для прыжков по меню |
| `src/journey/data/story.js` | Таймлайн секций, `HERO_POINTS` / `HERO_LEAD`, `JOURNEY_NAV`, `BOX_TYPES` (+ `desc` на эволюции), trust-статы |
| `src/journey/components/LineSidebar.jsx` + `LineSidebar.css` | React Bits LineSidebar: vertical right rail + `orientation="horizontal"` (верхняя полоса) |
| `src/journey/components/JourneySectionNav.jsx` | Обёртка этапов: десктоп — справа; на планшете/телефоне — горизонтально под брендом «БАЛТКАРТОН» (`--tablet` / `--phone`) |
| `src/journey/state/configStore.js` | Состояние 3D-конфигуратора: длина/ширина/высота мм (`SIZE_BOUNDS` 400–800 / 300–600 / 240–600), картон, печать, тираж |
| `src/journey/materials/kraft.js` | Текстура бурого картона как в конструкторе (`#B79477` + soft fiber); гофра только на торце; флексо: `ensurePrintArtwork` / `createPrintTexture` (логотип) |
| `src/journey/components/Scene.jsx` | R3F-сцена: `StudioAtmosphere` (тёплый kraft-задник + мягкий пол), свет, Environment, ContactShadows, пыль, камера |
| `src/journey/components/CorrugatedSheet.jsx` | (legacy) старый hero-лист; Journey использует `cardboard-kit` |
| `src/journey/components/CardboardObject.jsx` | Scroll: RSC с первого экрана → морф → пицца; на Printing — логотип спереди и транспортные знаки сбоку; финал — закрытие → `closedTop` |
| `src/journey/components/Overlays.jsx` | Типографика секций; hero CTA; на каждом типе эволюции — «Оставить заявку»; печать/применение/финал |
| `src/journey/components/HeroPointIcon.jsx` | SVG-иконки пунктов hero (seal / box / stack / truck) |
| `src/journey/components/ConfiguratorPanel.jsx` | UI конфигуратора: размеры / картон / печать / тираж + CTA «Оставить заявку» → `contacts.html#order` |
| `src/journey/components/BrandSelect.jsx` | Кастомная выпадашка конфигуратора: чёрный триггер, белый список, серая активная строка |
| `src/journey/styles/journey.css` | Стили cinematic-страницы; `.j-select`; планшет `961–1100` / portrait ≤1366 (крупнее текст); мобильный `≤960px` / `≤420px` |
| `src/partials/shell.js` | Разметка формы заявки (`.form-panel`, согласие `.form-consent`) и partials шапки/подвала |
| `src/data/catalog.js` | Типы продукции (в т.ч. крупногабарит, овощные/мясные лотки), FEFCO, `materials`, `boardTypes` (Т-21–Т-27, П-31–П-37, Z-картон); минимальный тираж — по согласованию |
| `src/data/pantone.js` | Семейства PANTONE Color Bridge + оттенки для ползунка на `print.html` |
| `src/styles/main.css` | Токены бренда, сетка, hero, секции, форма, адаптив; `.fold-svg`; `.product-grid`; `.print-stack` / `.print-demo`; `.brand-select`; `.product-modal`. Подключается из `<head>` каждой HTML (не только из JS — иначе FOUC) |
| `src/styles/fonts.css` | Локальные `@font-face` (Unbounded / Oswald / Manrope), `font-display: block` — без смены начертания после load |
| `public/fonts/*.woff2` | Файлы шрифтов (cyrillic / latin); preload кириллицы в `<head>` |
| `public/brand/` | Логотипы PNG и PDF брендбука |
| `public/brand/logo-horizontal-light.png` | Горизонтальный логотип для тёмного фона: «БАЛТКАРТОН» + «ПРОИЗВОДСТВО ГОФРОКАРТОНА» |
| `public/brand/logo-horizontal-dark.png` | Горизонтальный логотип для светлого фона (тот же текст) |
| `scripts/rebuild-horizontal-logo.py` | Пересборка horizontal-логотипов с актуальной подписью |
| `public/brand/logo-stacked-light.png` | Основная (вертикальная) версия логотипа |
| `public/brand/logo-stacked-dark.png` | Основная версия на светлом |
| `public/brand/logo-mark-light.png` | Исходный символ БК (полная сборка) |
| `public/brand/logo-mark-dark.png` | Символ БК для светлого фона |
| `public/brand/mark-layers/` | Слои intro: `letter-b`, `letter-k`, `top` (цельный оранжевый верх), `dashes` |
| `scripts/split-logo-mark.py` | Нарезка `logo-mark-light.png` на слои; оранжевый ромб режется через середины сторон (не по диагонали — иначе треугольники) |
| `public/brand/baltkarton-brand.pdf` | PDF с логотипом |
| `public/images/corrugated.jpg` | Фото гофрокартона для 1-го пункта блока «Почему» |
| `public/images/production.jpg` | Фото производства для 2-го пункта блока «Почему» |
| `public/images/print-flexo.png` | Макет печати до 3 цветов для 3-го пункта блока «Почему» |
| `public/images/print-logo-pizza.svg` | Исходник логотипа Pizza (3 слоя) для демо печати |
| `public/images/products/` | Фото типов упаковки (по `id` из `catalog.js`) |
| `public/images/products/*.png` | Фото типов упаковки по `id` из `catalog.js` |

## Journey (cinematic landing)

Стартовый лендинг `/journey.html` (также `/` и `/index.html` → редирект сюда) — scroll-storytelling вокруг **готовой RSC-коробки** с первого экрана: морф между типами упаковки, производство, печать, приложения, конфигуратор, trust и финальный CTA. `LineSidebar` (`JourneySectionNav`): на десктопе справа вертикально (`line-sidebar--right`); на планшете/телефоне — та же шкала этапов горизонтально сверху под шапкой (скролл по X при нехватке места), клик прыгает по progress через Lenis. На планшетах (`viewportFit` / CameraRig: ширина <1100 или portrait ≤1366) короб уменьшен (~0.68), камера дальше, тексты этапов снизу, типографика крупнее. На узких экранах (`≤960px`): компактная шапка, тексты снизу, конфигуратор с внутренним скроллом, `journey--narrow`.

Стек: React 19, React Three Fiber, Drei, postprocessing (Bloom / DoF / Vignette), GSAP ScrollTrigger, Lenis. Основной сайт остаётся multi-page Vite (без Next.js), чтобы не ломать текущие HTML-страницы.

Секции по `src/journey/data/story.js` (`SECTIONS`): Hero+Fold (старт, progress 0–0.1, укорочен в ~2 раза) → Box evolution → Printing → Applications → Configurator → Trust → Finale. На старте: бренд сверху; слоган + лид + CTA одним паком по центру поверх 3D-коробки (`journey-stage--hero-cta`); блок качества/доставки (`HERO_POINTS` / `HERO_LEAD`) снизу слева.

3D в Journey (`cardboard-kit.js`): готовый RSC с первого экрана → морф размеров → пицца-бокс. RSC — простые `BoxGeometry`-панели (как в конструкторе): один kraft `plain` на стенках и клапанах, без ExtrudeGeometry/капов/knuckle (они давали смазанные UV и щели).

На секциях **Evolution** (RSC-морф и пицца) и **Printing** на `mats.logo` собирается логотип из слоёв `public/brand/mark-layers/` (Б / К / крышка / пунктир) + текст «БАЛТКАРТОН» / «ПРОИЗВОДСТВО ГОФРОКАРТОНА». В эволюции — режим «2 цвета» на RSC и на крышке пиццы. На **Printing / 3 цвета** пунктир сгиба — белый (`#ffffff`). На **Доверие** и **Финал**: на десктопе печать снимается (`tInk = 0`) ради читаемости оверлеев; на планшете/мобилке логотип остаётся.

## Бренд

- **Оранжевый:** `#ff5a1f`
- **Чёрный:** `#1a1a1d`
- **Шрифты в макете:** Tablon Black, Bebas Neue Bold
- **На сайте:** hero — `logo-mark-light.png`; оранжевый сгиб — один SVG L-path (см. ниже); шапка — стекло/белая подложка; заголовки — Unbounded; акценты — Oswald; текст — Manrope (локально в `public/fonts`, не Google CDN — иначе FOUT: текст сначала системный, потом «другой»)

### Hero intro (главная)

Hero-макет: `.hero__content--main` → `.hero__mark-wrap` → `.hero__content--foot`. Десктоп: intro 1+4 (Б/К с краёв → вспышка → **два прямоугольных клапана** закрываются → пунктир → FLIP вправо → fade текста). Intro: Б/К слетаются (десктоп) / собираются на месте (≤1400); цельный `top.png` падает сверху (`heroLayerTop`); белый пунктир сгиба (`phase-dashes`) — только после полной сборки Б/К+крышки. Текст hero на десктопе только fade; лид+кнопки снизу слева. ≤1400px: `hero--inplace` — лого собирается на месте между иконками и лидом; класс ставит синхронный `<script>` в `index.html` до отрисовки контента, геометрия `hero--intro` на мобилке совпадает с финальной (`100svh` / `space-between`), чтобы не было прыжка при обновлении. На мобилке текст hero без `translateY` (`.hero-reveal`) — иначе субпиксельный blur. ≤960px: hero жёстко в `100svh`. Логика анимации — `initHeroIntro()` в `main.js`. При `prefers-reduced-motion: reduce` intro пропускается.

### Оранжевый сгиб (главная)

Продолжение белого пунктира сгиба из `logo-mark-light.png`: вниз → влево → вниз → вправо («Печать») → вниз → влево в кубик формы заявки.

| Элемент | Роль |
|---|---|
| `.fold-svg` в `.hero__mark-wrap` | SVG; `left`/ширина считает `initFoldDash` |
| `.fold-svg__path` | Path со `stroke-dasharray` 32/21; клип через mask |
| `.fold-svg__reveal` | Белый path в `<mask id="fold-dash-reveal">`: длина растёт от скролла |
| `[data-fold-stop]` (`.why-fold-line`) | Верхняя горизонталь (под «Почему») |
| `[data-fold-turn]` (`.section--print`) | Поворот вправо |
| `[data-fold-return]` (`#order`) | Якорь секции заявки; вход пунктира в `.form-panel` |
| `initFoldDash()` в `main.js` | Координаты path только при `min-width: 1401px`; `--why-fold-max` — зазоры у «Почему»; пунктир прорастает по скроллу (`applyReveal`): на десктопе старт уже на первом экране (низ лого выше нижней кромки viewport), `maxReveal` не уменьшается при скролле вверх; во время intro/`hero--docking` SVG скрыт — рыжий fold появляется после FLIP на место |

Чтобы подключить файлы Tablon Black / Bebas Neue локально (если есть woff2 с кириллицей), положите их в `public/fonts/` и пропишите `@font-face` в `src/styles/main.css` для `--font-display` / `--font-accent`.

## Демо печати (PANTONE)

На `print.html` секция `.print-stack`: сверху текст, под ним `.print-demo`. **Интерактивная 3D-коробка** (Three.js + OrbitControls): крутить мышью, зум колёсиком, сдвиг ПКМ. Пресеты в `.print-demo__controls` — одна строка: **Форма** (гофроящик / пицца-бокс / лист) и **Картон** (бурый `#B79477` / белый Cool Gray 1 C), рядом кнопки **Пример Pizza** / **Загрузить макет**. Выпадашки — кастомный `.brand-select` поверх `select.print-demo__select` / `[data-brand-select]` (`initBrandSelects` в `main.js`: оранжевая обводка в фокусе, список с серым hover). Логотип Pizza — 3 краски (canvas-текстура). Слоты «Короб / База / Текст / Контур» → семейство → ползунок / номер. Upload: PNG/JPEG/WebP/SVG → до 3 красок (`analyzeArtworkLayers`). Кнопка **«Заказать макет»** → `contacts.html#order`. UI — `initPrintDemo` в `main.js`; геометрии — `print-box-3d.js`.

| Файл | Роль |
|---|---|
| `src/data/pantone.js` | `pantoneFamilies` — семейства и оттенки |
| `src/js/print-box-3d.js` | WebGL-сцена, геометрии короба, текстуры картона и лого |
| `public/images/print-logo-pizza.svg` | Исходник логотипа Pizza (3 слоя); в 3D — SVG собирается в JS |
| `scripts/build-pantone.py` | Пересборка `pantone.js` из Color Bridge JSON |
| `scripts/pantone-p-color-bridge-coated.json` | Кэш исходного каталога для скрипта |

## Модалка продукции

Клик по карточке типа упаковки в каталоге открывает `<dialog class="product-modal">`: фото, название, описание и кнопка «Оставить заявку». На главной сетки продукции нет.

| Элемент | Роль |
|---|---|
| `renderProductList('[data-products-catalog]', { modal: true })` | Карточки как `button[data-product-open]` |
| `initProductModal()` | Открытие/закрытие, заполнение из `productTypes` |
| «Оставить заявку» | Переход на `contacts.html#order` с подстановкой в `#lead-message` |

## Форма заявки

Клиентская проверка обязательных полей. После отправки открывается почтовый клиент на `sales@baltcarton.ru` с заполненной темой и телом письма (без имитации «успешной отправки» на сервере).

## Контакты (текущие)

- Телефоны: +7 (931) 980-71-19, +7 (930) 155-54-62
- Email: sales@baltcarton.ru
- Офис: г. СПб, ул. Домостроительная 18, БЦ Аурум
- Производство: г. Гатчина, ул. Индустриальная д.27

Единый источник — константа `CONTACTS` в `src/js/main.js` (`fillContactSlots`): слоты `[data-phone]`, `[data-phone-2]`, `[data-email]`, `[data-address="office"|"production"]`, `[data-map]` (карта офиса).
