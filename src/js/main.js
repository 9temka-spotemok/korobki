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
  const svg = document.querySelector('.fold-svg')
  const path = document.querySelector('.fold-svg__path')
  const mark = document.querySelector('.hero__mark-wrap')
  const stop = document.querySelector('[data-fold-stop]')
  const turn = document.querySelector('[data-fold-turn]')
  const ret = document.querySelector('[data-fold-return]')
  if (!svg || !path || !mark || !stop || !turn || !ret) return

  // Path: … → вправо (Печать) → вниз → влево в кубик формы.
  const LOGO_W = 1205
  const FOLD_CX = 602.5
  const DASH = 32
  const GAP = 21
  const STROKE = 11
  const SIDE_OUTSET = 28
  const RIGHT_INSET = 14
  const TEXT_CLEAR = 28

  const snapLen = (len, period, dash) => {
    const mod = ((len % period) + period) % period
    let delta = dash / 2 - mod
    if (delta > period / 2) delta -= period
    if (delta < -period / 2) delta += period
    return len + delta
  }

  const quantize = (raw, period) => {
    const n = Math.max(1, Math.round(raw / period))
    return n * period
  }

  const desktopFold = window.matchMedia('(min-width: 961px)')

  const clearFold = () => {
    path.setAttribute('d', '')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
  }

  const update = () => {
    if (!desktopFold.matches || window.getComputedStyle(mark).display === 'none') {
      clearFold()
      return
    }

    const img = mark.querySelector('.hero__mark') || mark.querySelector('img')
    const imgRect = (img || mark).getBoundingClientRect()
    const markRect = mark.getBoundingClientRect()
    const stopRect = stop.getBoundingClientRect()
    const turnRect = turn.getBoundingClientRect()
    const container = stop.closest('.container') || stop.parentElement
    const containerRect = container.getBoundingClientRect()
    const main = document.querySelector('.site-main')
    const mainRect = main ? main.getBoundingClientRect() : containerRect
    const form = document.querySelector('[data-lead-form]')
    const formRect = (form || ret).getBoundingClientRect()

    const originY = markRect.bottom
    const toY = (clientY) => clientY - originY

    const scale = imgRect.width / LOGO_W
    const dash = DASH * scale
    const gap = GAP * scale
    const thickness = Math.max(2, STROKE * scale)
    const pad = thickness / 2
    const period = dash + gap

    const foldX = imgRect.left + imgRect.width * (FOLD_CX / LOGO_W)
    const leftEdge = Math.max(
      mainRect.left + thickness,
      containerRect.left - SIDE_OUTSET,
    )
    // правый край — у края main, чтобы вертикаль не резала тексты в колонках
    const rightEdge = mainRect.right - RIGHT_INSET

    const width = Math.max(rightEdge - leftEdge, thickness * 2)
    const xFold = foldX - leftEdge
    svg.style.left = `calc(100% * ${FOLD_CX} / ${LOGO_W})`
    svg.style.transform = `translateX(${-xFold}px)`

    const xLeft = pad
    const xRight = width - pad

    const yStart = gap
    const yCornerRaw = toY(stopRect.top + stopRect.height / 2)
    const lenToLeft = snapLen(
      Math.max(period, yCornerRaw - yStart) + Math.max(0, xFold - xLeft),
      period,
      dash,
    )
    const yCorner = yStart + (lenToLeft - (xFold - xLeft))

    const yTurnRaw = toY(turnRect.top) + thickness
    const yTurn = yCorner + quantize(Math.max(period, yTurnRaw - yCorner), period)

    // горизонталь на «Печать» тянем правее текстов (material-list / колонки)
    const materials = turn.querySelector('[data-materials], .material-list')
    const logisticsCol = document.querySelector('.section--logistics .steps')
    const clearRight = Math.max(
      materials ? materials.getBoundingClientRect().right + TEXT_CLEAR : 0,
      logisticsCol ? logisticsCol.getBoundingClientRect().right + TEXT_CLEAR : 0,
      containerRect.right + SIDE_OUTSET,
    )
    let xDrop = Math.min(xRight, Math.max(xLeft + period, clearRight - leftEdge))

    // вниз справа → влево в кубик формы
    const yCube = toY(formRect.top + Math.min(72, formRect.height * 0.22))
    const xCube = formRect.right - leftEdge - Math.min(64, formRect.width * 0.14)

    const height = Math.max(yCube, toY(formRect.bottom)) + thickness

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.setAttribute('width', String(width))
    svg.setAttribute('height', String(height))
    svg.setAttribute('overflow', 'visible')

    path.setAttribute(
      'd',
      `M ${xFold} ${yStart} L ${xFold} ${yCorner} L ${xLeft} ${yCorner} L ${xLeft} ${yTurn} L ${xDrop} ${yTurn} L ${xDrop} ${yCube} L ${xCube} ${yCube}`,
    )
    path.setAttribute('stroke', '#ff5a1f')
    path.setAttribute('stroke-width', String(thickness))
    path.setAttribute('stroke-dasharray', `${dash} ${gap}`)
    path.setAttribute('stroke-dashoffset', '0')
    path.setAttribute('stroke-linecap', 'butt')
    path.setAttribute('stroke-linejoin', 'miter')
    path.setAttribute('shape-rendering', 'geometricPrecision')
  }

  const schedule = () => requestAnimationFrame(() => requestAnimationFrame(update))

  schedule()
  window.addEventListener('resize', schedule)
  window.addEventListener('load', schedule)
  desktopFold.addEventListener('change', schedule)
  mark.addEventListener('animationend', schedule)
  if (document.fonts?.ready) document.fonts.ready.then(schedule)
  const img = mark.querySelector('img')
  if (img && !img.complete) img.addEventListener('load', schedule)

  const ro = new ResizeObserver(schedule)
  ro.observe(mark)
  ro.observe(stop)
  ro.observe(turn)
  ro.observe(ret)
  const formEl = document.querySelector('[data-lead-form]')
  if (formEl) ro.observe(formEl)
  const why = document.querySelector('.section--why')
  if (why) ro.observe(why)
  const products = document.querySelector('.section--products')
  if (products) ro.observe(products)
  const logistics = document.querySelector('.section--logistics')
  if (logistics) ro.observe(logistics)
  const main = document.querySelector('.site-main')
  if (main) ro.observe(main)
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

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open)
    toggle.setAttribute('aria-expanded', String(open))
    document.body.classList.toggle('is-nav-open', open)
  }

  toggle.addEventListener('click', () => {
    setOpen(!nav.classList.contains('is-open'))
  })

  nav.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => setOpen(false))
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false)
  })

  document.addEventListener('click', (event) => {
    if (!nav.classList.contains('is-open')) return
    if (nav.contains(event.target) || toggle.contains(event.target)) return
    setOpen(false)
  })

  window.matchMedia('(min-width: 1101px)').addEventListener('change', (mq) => {
    if (mq.matches) setOpen(false)
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

function renderProductList(selector, { compact = false, modal = false } = {}) {
  const root = document.querySelector(selector)
  if (!root) return

  root.innerHTML = productTypes
    .map((item) => {
      const openAttr = modal ? `type="button" data-product-open="${item.id}"` : ''
      const idAttr = modal ? '' : `id="${item.id}"`
      const tag = modal ? 'button' : 'article'
      const img = `
          <img
            class="product-item__img"
            src="${item.image}"
            alt="${item.title}"
            width="${compact ? 96 : 640}"
            height="${compact ? 96 : 360}"
            loading="lazy"
          />`
      const text = compact
        ? `
          <div class="product-item__body">
            <span class="product-item__title">${item.title}</span>
            <p>${item.description}</p>
          </div>`
        : `
          <span class="product-item__title">${item.title}</span>
          <p>${item.description}</p>`
      return `
        <${tag} class="product-item${compact ? ' product-item--compact' : ''}" ${openAttr} ${idAttr}>
          ${img}${text}
        </${tag}>
      `
    })
    .join('')
}

function initProductModal() {
  const modal = document.querySelector('[data-product-modal]')
  if (!modal) return

  const img = modal.querySelector('[data-product-img]')
  const title = modal.querySelector('[data-product-title]')
  const desc = modal.querySelector('[data-product-desc]')
  const cta = modal.querySelector('[data-product-cta]')
  const closeBtn = modal.querySelector('[data-product-close]')
  let activeId = ''

  const byId = Object.fromEntries(productTypes.map((item) => [item.id, item]))

  const open = (id) => {
    const item = byId[id]
    if (!item) return
    activeId = id
    img.src = item.image
    img.alt = item.title
    title.textContent = item.title
    desc.textContent = item.description
    modal.showModal()
    document.body.classList.add('is-modal-open')
  }

  const close = () => {
    modal.close()
    document.body.classList.remove('is-modal-open')
  }

  document.querySelectorAll('[data-product-open]').forEach((btn) => {
    btn.addEventListener('click', () => open(btn.getAttribute('data-product-open')))
  })

  closeBtn.addEventListener('click', close)

  modal.addEventListener('click', (event) => {
    if (event.target === modal) close()
  })

  modal.addEventListener('close', () => {
    document.body.classList.remove('is-modal-open')
  })

  cta.addEventListener('click', () => {
    const item = byId[activeId]
    const message = document.querySelector('#lead-message')
    if (item && message) {
      message.value = `Интересует: ${item.title}`
    }
    close()
  })
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
  renderProductList('[data-products-home]', { modal: true })
  renderProductList('[data-products-catalog]', { modal: true })
  renderFefco('[data-fefco]')
  renderMaterials('[data-materials]')
  initReveal()
  initLeadForm()
  initProductModal()
  initFoldDash()

  if (window.location.hash) {
    const target = document.querySelector(window.location.hash)
    if (target) target.scrollIntoView({ block: 'start' })
  }
})
