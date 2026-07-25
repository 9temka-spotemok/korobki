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
| `index.html` | Главная: hero, «Почему», печать, логистика, форма (сетка продукции только в каталоге) |
| `catalog.html` | Каталог: сетка типов + модалка, материалы (трёх-/пятислойный, Z-картон), FEFCO |
| `print.html` | Печать логотипов (флексо, демо PANTONE на коробе) |
| `delivery.html` | Доставка, самовывоз, оплата |
| `contacts.html` | Телефон, email, адрес, карта, форма |

## Структура файлов

| Путь | За что отвечает |
|---|---|
| `vite.config.js` | Multi-page сборка Vite (все HTML-точки входа) |
| `package.json` | Скрипты `dev` / `build` / `preview`; зависимости: `vite`, `three` |
| `src/js/main.js` | Навигация, меню, форма, reveal, `initFoldDash`, `renderProductList`, `renderBoardTypes`, `initProductModal`, `initPrintDemo` |
| `src/js/print-box-3d.js` | Three.js-сцена демо печати: короб, OrbitControls, текстуры Pantone/лого |
| `src/partials/shell.js` | Разметка формы заявки (`.form-panel`, согласие `.form-consent`) и partials шапки/подвала |
| `src/data/catalog.js` | Типы продукции (в т.ч. крупногабарит, овощные/мясные лотки), FEFCO, `materials`, `boardTypes` (Т-21–Т-27, П-31–П-37, Z-картон); минимальный тираж — по согласованию |
| `src/data/pantone.js` | Семейства PANTONE Color Bridge + оттенки для ползунка на `print.html` |
| `src/styles/main.css` | Токены бренда, сетка, hero, секции, форма, адаптив; `.fold-svg`; `.product-grid`; `.print-stack` / `.print-demo`; `.product-modal` |
| `public/brand/` | Логотипы PNG и PDF брендбука |
| `public/brand/logo-horizontal-light.png` | Горизонтальный логотип для тёмного фона (шапка/подвал) |
| `public/brand/logo-horizontal-dark.png` | Горизонтальный логотип для светлого фона |
| `public/brand/logo-stacked-light.png` | Основная (вертикальная) версия логотипа |
| `public/brand/logo-stacked-dark.png` | Основная версия на светлом |
| `public/brand/logo-mark-light.png` | Символ БК в hero |
| `public/brand/logo-mark-dark.png` | Символ БК для светлого фона |
| `public/brand/baltkarton-brand.pdf` | PDF с логотипом |
| `public/images/corrugated.jpg` | Фото гофрокартона для 1-го пункта блока «Почему» |
| `public/images/production.jpg` | Фото производства для 2-го пункта блока «Почему» |
| `public/images/print-flexo.png` | Макет печати до 3 цветов для 3-го пункта блока «Почему» |
| `public/images/print-logo-pizza.svg` | Исходник логотипа Pizza (3 слоя) для демо печати |
| `public/images/products/` | Фото типов упаковки (по `id` из `catalog.js`) |
| `public/images/products/*.png` | Фото типов упаковки по `id` из `catalog.js` |

## Бренд

- **Оранжевый:** `#ff5a1f`
- **Чёрный:** `#1a1a1d`
- **Шрифты в макете:** Tablon Black, Bebas Neue Bold
- **На сайте:** hero — `logo-mark-light.png`; оранжевый сгиб — один SVG L-path (см. ниже); шапка — стекло/белая подложка; заголовки — Unbounded; акценты — Oswald; текст — Manrope

### Оранжевый сгиб (главная)

Продолжение белого пунктира сгиба из `logo-mark-light.png`: вниз → влево → вниз → вправо («Печать») → вниз → влево в кубик формы заявки.

| Элемент | Роль |
|---|---|
| `.fold-svg` в `.hero__mark-wrap` | SVG; `left`/ширина считает `initFoldDash` |
| `.fold-svg__path` | Path со `stroke-dasharray` 32/21 |
| `[data-fold-stop]` (`.why-fold-line`) | Верхняя горизонталь (под «Почему») |
| `[data-fold-turn]` (`.section--print`) | Поворот вправо |
| `[data-fold-return]` (`#order`) | Якорь секции заявки; вход пунктира в `.form-panel` |
| `initFoldDash()` в `main.js` | Координаты path только при `min-width: 1401px`; `--why-fold-max` — зазоры у «Почему» |

Чтобы подключить файлы Tablon Black / Bebas Neue локально (если есть woff2 с кириллицей), положите их в `public/fonts/` и пропишите `@font-face` в `src/styles/main.css` для `--font-display` / `--font-accent`.

## Демо печати (PANTONE)

На `print.html` секция `.print-stack`: сверху текст, под ним `.print-demo`. **Интерактивная 3D-коробка** (Three.js + OrbitControls): крутить мышью, зум колёсиком, сдвиг ПКМ. Пресеты в `.print-demo__controls` — одна строка: `select` **Форма** (гофроящик / пицца-бокс / лист) и **Картон** (бурый `#B79477` / белый Cool Gray 1 C), рядом кнопки **Пример Pizza** / **Загрузить макет**. Логотип Pizza — 3 краски (canvas-текстура). Слоты «Короб / База / Текст / Контур» → семейство → ползунок / номер. Upload: PNG/JPEG/WebP/SVG → до 3 красок (`analyzeArtworkLayers`). Кнопка **«Заказать макет»** → `contacts.html#order`. UI — `initPrintDemo` в `main.js`; геометрии — `print-box-3d.js`.

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
| «Оставить заявку» | Переход на `index.html#order` с подстановкой в `#lead-message` |

## Форма заявки

Клиентская проверка обязательных полей. После отправки открывается почтовый клиент на `sales@baltcarton.ru` с заполненной темой и телом письма (без имитации «успешной отправки» на сервере).

## Контакты (текущие)

- Телефоны: +7 (931) 980-71-19, +7 (930) 155-54-62
- Email: sales@baltcarton.ru
- Офис: г. СПб, ул. Домостроительная 18, БЦ Аурум
- Производство: г. Гатчина, ул. Индустриальная д.27

Единый источник — константа `CONTACTS` в `src/js/main.js` (`fillContactSlots`): слоты `[data-phone]`, `[data-phone-2]`, `[data-email]`, `[data-address="office"|"production"]`, `[data-map]` (карта офиса).
