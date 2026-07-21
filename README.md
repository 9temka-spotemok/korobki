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
| `index.html` | Главная: hero, УТП, продукция, печать, логистика, форма заявки |
| `catalog.html` | Каталог типов упаковки и группы FEFCO |
| `print.html` | Печать логотипов (флексо, PANTONE) |
| `delivery.html` | Доставка, самовывоз, оплата |
| `contacts.html` | Телефон, email, адрес, карта, форма |

## Структура файлов

| Путь | За что отвечает |
|---|---|
| `vite.config.js` | Multi-page сборка Vite (все HTML-точки входа) |
| `package.json` | Скрипты `dev` / `build` / `preview`, зависимости |
| `src/js/main.js` | Навигация, мобильное меню, форма, reveal-анимации, рендер каталога |
| `src/partials/shell.js` | Общая разметка формы заявки (и запасные partials шапки/подвала) |
| `src/data/catalog.js` | Данные типов продукции, FEFCO-групп и материалов |
| `src/styles/main.css` | Токены бренда, сетка, hero, секции, форма, адаптив |
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

## Бренд

- **Оранжевый:** `#ff5a1f`
- **Чёрный:** `#1a1a1d`
- **Шрифты в макете:** Tablon Black, Bebas Neue Bold
- **На сайте:** hero — `logo-mark-light.png`; оранжевая вертикаль сгиба — `.fold-line-v` внутри блока лого (та же ось, что белый пунктир), высота до `[data-fold-stop]` (`initFoldDash`); шапка — стекло/белая подложка; заголовки — Unbounded; акценты — Oswald; текст — Manrope

Чтобы подключить файлы Tablon Black / Bebas Neue локально (если есть woff2 с кириллицей), положите их в `public/fonts/` и пропишите `@font-face` в `src/styles/main.css` для `--font-display` / `--font-accent`.

## Форма заявки

Клиентская проверка обязательных полей. После отправки открывается почтовый клиент на `sales@piterpak-trade.ru` с заполненной темой и телом письма (без имитации «успешной отправки» на сервере).

## Контакты (текущие)

- Телефон: +7 (921) 940-12-91
- Email: sales@piterpak-trade.ru
- Адрес: Санкт-Петербург, м. Волковская, ул. Прогонная, 5

Обновляются в константе `CONTACTS` в `src/js/main.js`.
