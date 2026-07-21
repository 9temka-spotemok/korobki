import '../styles/main.css'
import { productTypes, fefcoGroups, materials } from '../data/catalog.js'
import { leadFormHTML } from '../partials/shell.js'

const CONTACTS = {
  phone: '+7 (921) 940-12-91',
  phoneHref: 'tel:+79219401291',
  email: 'sales@piterpak-trade.ru',
  emailHref: 'mailto:sales@piterpak-trade.ru',
  address: 'Санкт-Петербург, м. Волковская, ул. Прогонная, 5',
  mapSrc:
    'https://yandex.ru/map-widget/v1/?ll=30.3685%2C59.8975&z=16&pt=30.3685,59.8975,pm2rdm',
}

function initFoldDash() {
  const mark = document.querySelector('.hero__mark-wrap')
  const line = document.querySelector('[data-fold-line]')
  const stop = document.querySelector('[data-fold-stop]')
  if (!mark || !line || !stop) return

  // Линия внутри .hero__mark-wrap — ось задаёт CSS (центр сгиба).
  // JS только тянет высоту до [data-fold-stop].
  const update = () => {
    if (window.getComputedStyle(mark).display === 'none') {
      line.style.height = '0px'
      return
    }

    const img = mark.querySelector('.hero__mark') || mark.querySelector('img')
    const imgRect = (img || mark).getBoundingClientRect()
    const stopRect = stop.getBoundingClientRect()
    const h = Math.max(0, stopRect.top + stopRect.height / 2 - imgRect.bottom)
    line.style.height = `${h}px`
  }

  const schedule = () => requestAnimationFrame(() => requestAnimationFrame(update))

  schedule()
  window.addEventListener('resize', schedule)
  window.addEventListener('load', schedule)
  const img = mark.querySelector('img')
  if (img && !img.complete) img.addEventListener('load', schedule)

  const ro = new ResizeObserver(schedule)
  ro.observe(mark)
  ro.observe(stop)
  const why = document.querySelector('.section--why')
  if (why) ro.observe(why)
}

function initHeaderScroll() {
  const header = document.querySelector('.site-header')
  if (!header) return

  const onScroll = () => {
    // Подложка нужна на светлых секциях; на тёмном hero оставляем стекло
    const hero = document.querySelector('.hero, .page-hero')
    const heroBottom = hero
      ? hero.offsetTop + hero.offsetHeight - 48
      : 80
    header.classList.toggle('is-scrolled', window.scrollY > heroBottom)
  }

  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
}

function initNav() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  const file = path.split('/').pop() || 'index.html'
  const current =
    file === '' || file === '/' || file === 'index.html' ? 'index.html' : file

  document.querySelectorAll('[data-nav]').forEach((link) => {
    const href = link.getAttribute('href')
    if (href === current || (current === 'index.html' && href === './')) {
      link.classList.add('is-active')
    }
  })

  const toggle = document.querySelector('.menu-toggle')
  const nav = document.querySelector('.nav')
  if (!toggle || !nav) return

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open')
    toggle.setAttribute('aria-expanded', String(open))
  })

  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      nav.classList.remove('is-open')
      toggle.setAttribute('aria-expanded', 'false')
    })
  })
}

function initReveal() {
  const items = document.querySelectorAll('.reveal')
  if (!items.length) return

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.16, rootMargin: '0px 0px -40px 0px' },
  )

  items.forEach((el) => io.observe(el))
}

function renderProductList(selector, { linkToCatalog = false } = {}) {
  const root = document.querySelector(selector)
  if (!root) return

  root.innerHTML = productTypes
    .map((item) => {
      const link = linkToCatalog
        ? `<span class="product-item__link">В каталог →</span>`
        : ''
      const tag = linkToCatalog ? 'a' : 'article'
      const href = linkToCatalog ? `catalog.html#${item.id}` : ''
      return `
        <${tag} class="product-item" ${href ? `href="${href}"` : ''} id="${item.id}">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          ${link}
        </${tag}>
      `
    })
    .join('')
}

function renderFefco(selector) {
  const root = document.querySelector(selector)
  if (!root) return

  root.innerHTML = fefcoGroups
    .map(
      (g) => `
      <article class="fefco-item reveal">
        <div class="fefco-item__code">${g.code}</div>
        <h3>${g.title}</h3>
        <p>${g.description}</p>
      </article>
    `,
    )
    .join('')
}

function renderMaterials(selector) {
  const root = document.querySelector(selector)
  if (!root) return
  root.innerHTML = materials.map((m) => `<li>${m}</li>`).join('')
}

function fillContactSlots() {
  document.querySelectorAll('[data-phone]').forEach((el) => {
    el.textContent = CONTACTS.phone
    if (el.tagName === 'A') el.href = CONTACTS.phoneHref
  })
  document.querySelectorAll('[data-email]').forEach((el) => {
    el.textContent = CONTACTS.email
    if (el.tagName === 'A') el.href = CONTACTS.emailHref
  })
  document.querySelectorAll('[data-address]').forEach((el) => {
    el.textContent = CONTACTS.address
  })
  document.querySelectorAll('[data-map]').forEach((el) => {
    el.src = CONTACTS.mapSrc
  })
}

function initLeadForm() {
  const form = document.querySelector('[data-lead-form]')
  if (!form) return

  const errorEl = form.querySelector('.form-error')

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    errorEl?.classList.remove('is-visible')

    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const phone = String(data.get('phone') || '').trim()
    const company = String(data.get('company') || '').trim()
    const message = String(data.get('message') || '').trim()
    const consent = data.get('consent')

    if (!name || !phone || !consent) {
      if (errorEl) {
        errorEl.textContent =
          'Заполните имя, телефон и подтвердите согласие на обработку данных.'
        errorEl.classList.add('is-visible')
      }
      return
    }

    const subject = encodeURIComponent(`Заявка с сайта БАЛТКАРТОН — ${name}`)
    const body = encodeURIComponent(
      [
        `Имя: ${name}`,
        `Телефон: ${phone}`,
        company ? `Компания: ${company}` : '',
        '',
        'Сообщение:',
        message || '—',
      ]
        .filter(Boolean)
        .join('\n'),
    )

    window.location.href = `${CONTACTS.emailHref}?subject=${subject}&body=${body}`
  })
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-form-mount]').forEach((el) => {
    el.innerHTML = leadFormHTML
  })

  initHeaderScroll()
  initNav()
  fillContactSlots()
  renderProductList('[data-products-home]', { linkToCatalog: true })
  renderProductList('[data-products-catalog]')
  renderFefco('[data-fefco]')
  renderMaterials('[data-materials]')
  initReveal()
  initLeadForm()
  initFoldDash()

  if (window.location.hash) {
    const target = document.querySelector(window.location.hash)
    if (target) target.scrollIntoView({ block: 'start' })
  }
})
