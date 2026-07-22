# БАЛТКАРТОН — сайт

Многостраничный лендинг компании БАЛТКАРТОН: гофротара, печать логотипов, доставка и контакты. Визуал построен на бренд-цветах `#ff5a1f` / `#1a1a1d` и логотипах из `public/brand/`.

Спектр услуг соответствует поставщику гофротары (типы изделий, FEFCO, флексо до 3 цветов, доставка по РФ). Контакты на старте — из действующего канала продаж PiterPak.

## Запуск

```bash
npm install
npm run dev
```

Сборка статики в `dist/`:

```bash
npm run build
npm run preview
```

## Страницы

| Файл | Назначение |
|---|---|
| `index.html` | Главная: hero, «Почему», продукция (сетка + модалка), печать, логистика, форма |
| `catalog.html` | Каталог: сетка типов + модалка, группы FEFCO |
| `print.html` | Печать логотипов (флексо, PANTONE) |
| `delivery.html` | Доставка, самовывоз, оплата |
| `contacts.html` | Телефон, email, адрес, карта, форма |

## Структура файлов

| Путь | За что отвечает |
|---|---|
| `vite.config.js` | Multi-page сборка Vite (все HTML-точки входа) |
| `package.json` | Скрипты `dev` / `build` / `preview`, зависимости |
| `src/js/main.js` | Навигация, меню, форма, reveal, `initFoldDash`, `renderProductList`, `initProductModal` |
| `src/partials/shell.js` | Разметка формы заявки (`.form-panel`, согласие `.form-consent`) и partials шапки/подвала |
| `src/data/catalog.js` | Данные типов продукции, FEFCO-групп и материалов |
| `src/styles/main.css` | Токены бренда, сетка, hero, секции, форма, адаптив; `.fold-svg`; `.products-statement` + `.product-grid`; `.product-modal` |
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
| `public/images/products/` | Фото типов упаковки (по `id` из `catalog.js`) |
| `public/images/products/*.png` | Фото типов (сейчас тестовый короб на все 8; заменить по именам `id`) |

## Бренд

- **Оранжевый:** `#ff5a1f`
- **Чёрный:** `#1a1a1d`
- **Шрифты в макете:** Tablon Black, Bebas Neue Bold
- **На сайте:** hero — `logo-mark-light.png`; оранжевый сгиб — один SVG L-path (см. ниже); шапка — стекло/белая подложка; заголовки — Unbounded; акценты — Oswald; текст — Manrope

### Оранжевый сгиб (главная)

Продолжение белого пунктира сгиба из `logo-mark-light.png`: вниз → влево → вниз → вправо («Печать») → вниз → влево до середины → вниз в форму заявки.

| Элемент | Роль |
|---|---|
| `.fold-svg` в `.hero__mark-wrap` | SVG; `left`/ширина считает `initFoldDash` |
| `.fold-svg__path` | Path со `stroke-dasharray` 32/21 |
| `[data-fold-stop]` (`.why-fold-line`) | Верхняя горизонталь (под «Почему») |
| `[data-fold-turn]` (`.section--print`) | Поворот вправо |
| `[data-fold-return]` (`#order`) | Горизонталь над заявкой; короткий спуск в центр формы и конец |
| `initFoldDash()` в `main.js` | Координаты path; углы на середине штриха, сегменты кратны `dash+gap` |

Чтобы подключить файлы Tablon Black / Bebas Neue локально (если есть woff2 с кириллицей), положите их в `public/fonts/` и пропишите `@font-face` в `src/styles/main.css` для `--font-display` / `--font-accent`.

## Модалка продукции

Клик по карточке типа упаковки (главная и каталог) открывает `<dialog class="product-modal">`: фото, название, описание и кнопка «Оставить заявку».

| Элемент | Роль |
|---|---|
| `renderProductList(..., { modal: true })` | Карточки как `button[data-product-open]` |
| `initProductModal()` | Открытие/закрытие, заполнение из `productTypes` |
| «Оставить заявку» | На главной — скролл к `#order` и подстановка в `#lead-message`; в каталоге — переход на `index.html#order` |

## Форма заявки

Клиентская проверка обязательных полей. После отправки открывается почтовый клиент на `sales@piterpak-trade.ru` с заполненной темой и телом письма (без имитации «успешной отправки» на сервере).

## Контакты (текущие)

- Телефон: +7 (921) 940-12-91
- Email: sales@piterpak-trade.ru
- Адрес: Санкт-Петербург, м. Волковская, ул. Прогонная, 5

Обновляются в константе `CONTACTS` в `src/js/main.js`.
