/** Разметка шапки и подвала для единообразия страниц */
export const headerHTML = `
  <header class="site-header">
    <div class="container site-header__inner">
      <a class="logo" href="index.html" aria-label="БАЛТКАРТОН — на главную">
        <img class="logo__img--light" src="/brand/logo-horizontal-light.png" alt="БАЛТКАРТОН — производство картона" width="220" height="48" />
        <img class="logo__img--dark" src="/brand/logo-horizontal-dark.png" alt="" width="220" height="48" aria-hidden="true" />
      </a>
      <button class="menu-toggle" type="button" aria-label="Открыть меню" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <nav class="nav" aria-label="Основная навигация">
        <a data-nav href="index.html">Главная</a>
        <a data-nav href="catalog.html">Каталог</a>
        <a data-nav href="print.html">Печать логотипов</a>
        <a data-nav href="delivery.html">Доставка и оплата</a>
        <a data-nav href="contacts.html">Контакты</a>
      </nav>
      <a class="nav-cta" href="contacts.html#order">Заявка</a>
    </div>
  </header>
`

export const footerHTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="site-footer__top">
        <a class="footer-logo" href="index.html" aria-label="БАЛТКАРТОН">
          <img src="/brand/logo-horizontal-light.png" alt="БАЛТКАРТОН" width="180" height="40" />
        </a>
        <nav class="site-footer__nav" aria-label="Навигация в подвале">
          <a href="catalog.html">Каталог</a>
          <a href="print.html">Печать логотипов</a>
          <a href="delivery.html">Доставка и оплата</a>
          <a href="contacts.html">Контакты</a>
        </nav>
      </div>
      <div class="site-footer__bottom">
        <span>© ${new Date().getFullYear()} БАЛТКАРТОН</span>
        <span>
          <a data-phone href="tel:+79219401291">+7 (921) 940-12-91</a>
          ·
          <a data-email href="mailto:sales@piterpak-trade.ru">sales@piterpak-trade.ru</a>
        </span>
      </div>
    </div>
  </footer>
`

export const leadFormHTML = `
  <form class="form-panel" data-lead-form novalidate>
    <h2>Рассчитать тираж</h2>
    <p>Оставьте контакты — подготовим предложение по размерам, материалу и печати.</p>
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
        <label>
          <input type="checkbox" name="consent" value="1" required />
          Согласен на обработку персональных данных
        </label>
      </div>
    </div>
    <p class="form-error" role="alert"></p>
    <button class="btn btn--primary" type="submit">Отправить заявку</button>
    <p class="form-note">Заявка откроется в почтовом клиенте на адрес отдела продаж.</p>
  </form>
`
