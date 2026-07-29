/** Разметка шапки и подвала для единообразия страниц */
export const headerHTML = `
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="logo" href="journey.html" aria-label="БАЛТКАРТОН — на главную">
        <img class="logo__img--light" src="/brand/logo-horizontal-light.png" alt="БАЛТКАРТОН — производство гофрокартона" width="220" height="48" />
        <img class="logo__img--dark" src="/brand/logo-horizontal-dark.png" alt="" width="220" height="48" aria-hidden="true" />
      </a>
      <button class="menu-toggle" type="button" aria-label="Открыть меню" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <nav class="nav" aria-label="Основная навигация">
        <a data-nav href="journey.html">Главная</a>
        <a data-nav href="catalog.html">Каталог</a>
        <a data-nav href="print.html">Печать логотипов</a>
        <a data-nav href="delivery.html">Доставка и оплата</a>
        <a data-nav href="contacts.html">Контакты</a>
      </nav>
      <a
        class="nav-tg"
        href="https://t.me/Dmitry_an812"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram @Dmitry_an812"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path
            d="M9.78 18.65l.28-4.23 7.68-6.93c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 14.5l-1.99 1.93c-.23.23-.42.42-.83.42z"
          />
        </svg>
      </a>
      <a class="nav-cta" href="contacts.html#order">Заявка</a>
    </div>
  </header>
`

export const footerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="site-footer__top">
        <a class="footer-logo" href="journey.html" aria-label="БАЛТКАРТОН">
          <img src="/brand/logo-horizontal-light.png" alt="БАЛТКАРТОН" width="180" height="40" />
        </a>
        <nav class="site-footer__nav" aria-label="Навигация в подвале">
          <a href="journey.html">Главная</a>
          <a href="catalog.html">Каталог</a>
          <a href="print.html">Печать логотипов</a>
          <a href="delivery.html">Доставка и оплата</a>
          <a href="contacts.html">Контакты</a>
        </nav>
      </div>
      <div class="site-footer__bottom">
        <span>© ${new Date().getFullYear()} БАЛТКАРТОН</span>
        <span>
          <a data-phone href="tel:+79319807119">+7 (931) 980-71-19</a>
          ·
          <a data-phone-2 href="tel:+79301555462">+7 (930) 155-54-62</a>
          ·
          <a data-email href="mailto:sales@baltcarton.ru">sales@baltcarton.ru</a>
        </span>
      </div>
    </div>
  </footer>
`

export const leadFormHTML = `
  <form class="form-panel" data-lead-form novalidate>
    <h2>Рассчитать тираж</h2>
    <p>Оставьте контакты — подготовим предложение по размерам, материалу и печати. Минимальный тираж — по согласованию.</p>
    <div class="form-grid">
      <div class="form-field">
        <label for="lead-name">Имя *</label>
        <input id="lead-name" name="name" type="text" autocomplete="name" required />
      </div>
      <div class="form-field">
        <label for="lead-phone">Телефон *</label>
        <input id="lead-phone" name="phone" type="tel" autocomplete="tel" required />
      </div>
      <div class="form-field form-field--full">
        <label for="lead-company">Компания</label>
        <input id="lead-company" name="company" type="text" autocomplete="organization" />
      </div>
      <div class="form-field form-field--full">
        <label for="lead-message">Задача</label>
        <textarea id="lead-message" name="message" placeholder="Тип упаковки, размеры, тираж, нужна ли печать"></textarea>
      </div>
      <div class="form-field form-field--full">
        <label class="form-consent">
          <input type="checkbox" name="consent" value="1" required />
          <span>Согласен на обработку персональных данных</span>
        </label>
      </div>
    </div>
    <p class="form-error" role="alert"></p>
    <div class="form-actions">
      <button class="btn btn--primary" type="submit">Отправить заявку</button>
      <p class="form-note">
        Заявка откроется в почтовом клиенте на адрес отдела продаж.
      </p>
    </div>
  </form>
`
