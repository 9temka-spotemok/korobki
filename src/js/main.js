import {
  productTypes,
  fefcoGroups,
  boardTypes,
  materials,
} from '../data/catalog.js'
import { pantoneFamilies } from '../data/pantone.js'
import { leadFormHTML } from '../partials/shell.js'

const CONTACTS = {
  phone: '+7 (931) 980-71-19',
  phoneHref: 'tel:+79319807119',
  phone2: '+7 (930) 155-54-62',
  phone2Href: 'tel:+79301555462',
  email: 'sales@baltcarton.ru',
  emailHref: 'mailto:sales@baltcarton.ru',
  telegram: '@Dmitry_an812',
  telegramHref: 'https://t.me/Dmitry_an812',
  addressOffice: 'г. СПб, ул. Домостроительная 18, БЦ Аурум',
  addressProduction: 'г. Гатчина, ул. Индустриальная д.27',
  mapSrc:
    'https://yandex.ru/map-widget/v1/?ll=30.373334%2C60.073339&z=16&pt=30.373334,60.073339,pm2rdm',
}

function waitMs(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function writeHeroCopy(hero, { instant = false } = {}) {
  const actions = hero.querySelector('[data-hero-actions]')
  const blocks = [
    hero.querySelector('.hero__brand'),
    hero.querySelector('.hero__title'),
    hero.querySelector('.hero__points'),
    hero.querySelector('.hero__lead'),
    actions,
  ].filter(Boolean)

  hero.classList.add('hero--content-in')
  window.dispatchEvent(new Event('resize'))

  if (instant) {
    // без .hero-reveal: translateY на мобилке даёт мыльный/«кривой» текст
    return
  }

  blocks.forEach((el) => el.classList.add('hero-reveal'))
  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve))
  })

  for (const el of blocks) {
    el.classList.add('is-in')
    await waitMs(140)
  }
}

function initHeroIntro() {
  const hero = document.querySelector('[data-hero]')
  const mark = hero?.querySelector('.hero__mark-wrap')
  if (!hero || !mark) return

  const clearMarkMotion = () => {
    mark.style.transition = ''
    mark.style.transform = ''
    mark.style.transformOrigin = ''
  }

  const revealBlocks = () =>
    [
      hero.querySelector('.hero__brand'),
      hero.querySelector('.hero__title'),
      hero.querySelector('.hero__points'),
      hero.querySelector('.hero__lead'),
      hero.querySelector('[data-hero-actions]'),
    ].filter(Boolean)

  const finishInstant = () => {
    hero.classList.remove('hero--intro', 'hero--settling', 'hero--phase-impact')
    hero.classList.add(
      'hero--ready',
      'hero--inplace',
      'hero--phase-letters',
      'hero--phase-top',
      'hero--phase-dashes',
      'hero--content-in',
    )
    if (window.matchMedia('(max-width: 1400px)').matches) {
      hero.classList.add('hero--content-in')
    } else {
      revealBlocks().forEach((el) => el.classList.add('hero-reveal', 'is-in'))
    }
    clearMarkMotion()
    hero.style.minHeight = ''
    window.dispatchEvent(new Event('resize'))
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    finishInstant()
    return
  }

  const DOCK_MS = 900
  const later = (fn, ms) => window.setTimeout(fn, ms)
  const stackedHero = window.matchMedia('(max-width: 1400px)').matches

  // Мобилка/планшет: контент сразу виден; пунктир — только после Б/К + крышки
  if (stackedHero) {
    hero.classList.remove('hero--intro')
    hero.classList.add('hero--inplace', 'hero--content-in')
    later(() => hero.classList.add('hero--phase-letters'), 40)
    later(() => hero.classList.add('hero--phase-top'), 420)
    // top 0.7s → ~1120; dashes 0.7s; ready после полной отрисовки
    later(() => hero.classList.add('hero--phase-dashes'), 1200)
    later(() => hero.classList.add('hero--ready'), 2000)
    return
  }

  const animateFlip = (first, last, duration, onDone) => {
    const dx = first.left - last.left
    const dy = first.top - last.top
    const sx = first.width / Math.max(last.width, 1)
    const sy = first.height / Math.max(last.height, 1)

    mark.style.transformOrigin = 'top left'
    mark.style.transition = 'none'
    mark.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        mark.style.transition = `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)`
        mark.style.transform = 'translate(0, 0) scale(1)'

        let done = false
        const finish = () => {
          if (done) return
          done = true
          clearMarkMotion()
          onDone?.()
        }

        const onEnd = (event) => {
          if (event.target !== mark || event.propertyName !== 'transform') return
          mark.removeEventListener('transitionend', onEnd)
          finish()
        }
        mark.addEventListener('transitionend', onEnd)
        later(() => {
          mark.removeEventListener('transitionend', onEnd)
          finish()
        }, duration + 120)
      })
    })
  }

  const startDock = () => {
    const first = mark.getBoundingClientRect()
    // docking: рыжий fold скрыт, пока лого едет на место
    hero.classList.add('hero--ready', 'hero--docking')
    hero.classList.remove('hero--intro', 'hero--phase-impact')
    const last = mark.getBoundingClientRect()
    animateFlip(first, last, DOCK_MS, () => {
      hero.classList.remove('hero--docking')
      writeHeroCopy(hero)
    })
  }

  // Десктоп: Б/К → вспышка + крышка → (всё готово) → пунктир → FLIP → текст
  hero.classList.add('hero--phase-letters')
  later(() => {
    hero.classList.add('hero--phase-impact', 'hero--phase-top')
  }, 720)
  // top 0.7s с 720 → ~1420; пунктир только когда короб уже собран
  later(() => hero.classList.add('hero--phase-dashes'), 1550)
  later(startDock, 2350)
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
  const MASK_ID = 'fold-dash-reveal'

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

  // Ниже ~1401px mark пересекается с текстом hero — пунктир сгиба не рисуем
  const desktopFold = window.matchMedia('(min-width: 1401px)')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  let pathLength = 0
  // Прогресс только растёт: доскроллили до конца — пунктир остаётся при скролле вверх
  let maxReveal = 0

  const ensureRevealMask = () => {
    let reveal = svg.querySelector('.fold-svg__reveal')
    if (reveal) return reveal

    const ns = 'http://www.w3.org/2000/svg'
    const defs = document.createElementNS(ns, 'defs')
    const mask = document.createElementNS(ns, 'mask')
    mask.setAttribute('id', MASK_ID)
    mask.setAttribute('maskUnits', 'userSpaceOnUse')
    mask.setAttribute('maskContentUnits', 'userSpaceOnUse')
    reveal = document.createElementNS(ns, 'path')
    reveal.setAttribute('class', 'fold-svg__reveal')
    reveal.setAttribute('fill', 'none')
    reveal.setAttribute('stroke', '#fff')
    reveal.setAttribute('stroke-linecap', 'butt')
    reveal.setAttribute('stroke-linejoin', 'miter')
    mask.appendChild(reveal)
    defs.appendChild(mask)
    svg.insertBefore(defs, path)
    path.setAttribute('mask', `url(#${MASK_ID})`)
    return reveal
  }

  const applyReveal = () => {
    const reveal = svg.querySelector('.fold-svg__reveal')
    if (!reveal || !pathLength || !desktopFold.matches) return

    if (reduceMotion.matches) {
      maxReveal = 1
      reveal.setAttribute('stroke-dasharray', String(pathLength))
      reveal.setAttribute('stroke-dashoffset', '0')
      return
    }

    const form = document.querySelector('[data-lead-form]') || ret
    const markBottom = mark.getBoundingClientRect().bottom
    const formTop = form.getBoundingClientRect().top
    const viewH = window.innerHeight
    // 0 — низ лого у нижней кромки viewport (на первом экране линия уже растёт);
    // 1 — линия дошла до формы
    const start = markBottom - viewH
    const end = formTop - viewH * 0.38
    const progress = Math.min(1, Math.max(0, (0 - start) / Math.max(1, end - start)))
    maxReveal = Math.max(maxReveal, progress)

    reveal.setAttribute('stroke-dasharray', String(pathLength))
    reveal.setAttribute('stroke-dashoffset', String(pathLength * (1 - maxReveal)))
  }

  const clearFold = () => {
    path.setAttribute('d', '')
    pathLength = 0
    const reveal = svg.querySelector('.fold-svg__reveal')
    if (reveal) reveal.setAttribute('d', '')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    const whySection = document.querySelector('.section--why')
    if (whySection) whySection.style.removeProperty('--why-fold-max')
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

    // Центрированные заголовки «Почему» не должны заходить под первую вертикаль сгиба
    const whySection = document.querySelector('.section--why')
    if (whySection) {
      const centerX = containerRect.left + containerRect.width / 2
      const maxW = Math.floor((foldX - TEXT_CLEAR - centerX) * 2)
      if (maxW >= 220) {
        whySection.style.setProperty('--why-fold-max', `${maxW}px`)
      } else {
        whySection.style.setProperty('--why-fold-max', 'min(100%, 36rem)')
      }
    }

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

    const d = `M ${xFold} ${yStart} L ${xFold} ${yCorner} L ${xLeft} ${yCorner} L ${xLeft} ${yTurn} L ${xDrop} ${yTurn} L ${xDrop} ${yCube} L ${xCube} ${yCube}`
    path.setAttribute('d', d)
    path.setAttribute('stroke', '#ff5a1f')
    path.setAttribute('stroke-width', String(thickness))
    path.setAttribute('stroke-dasharray', `${dash} ${gap}`)
    path.setAttribute('stroke-dashoffset', '0')
    path.setAttribute('stroke-linecap', 'butt')
    path.setAttribute('stroke-linejoin', 'miter')
    path.setAttribute('shape-rendering', 'geometricPrecision')

    const reveal = ensureRevealMask()
    reveal.setAttribute('d', d)
    reveal.setAttribute('stroke-width', String(thickness * 2.4))
    pathLength = path.getTotalLength()
    applyReveal()
  }

  const schedule = () => requestAnimationFrame(() => requestAnimationFrame(update))

  let revealTick = 0
  const scheduleReveal = () => {
    if (revealTick) return
    revealTick = requestAnimationFrame(() => {
      revealTick = 0
      applyReveal()
    })
  }

  schedule()
  window.addEventListener('resize', schedule)
  window.addEventListener('load', schedule)
  window.addEventListener('scroll', scheduleReveal, { passive: true })
  desktopFold.addEventListener('change', schedule)
  reduceMotion.addEventListener('change', scheduleReveal)
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
  const file = path.split('/').pop() || 'journey.html'
  const current =
    file === '' || file === '/' || file === 'index.html' || file === 'journey.html'
      ? 'journey.html'
      : file

  document.querySelectorAll('[data-nav]').forEach((link) => {
    const href = link.getAttribute('href')
    if (href === current || (current === 'journey.html' && (href === './' || href === 'index.html'))) {
      link.classList.add('is-active')
    }
  })

  const toggle = document.querySelector('.menu-toggle')
  const nav = document.querySelector('.nav')
  if (!toggle || !nav) return

  const setOpen = (open) => {
    nav.classList.toggle('is-open', open)
    toggle.classList.toggle('is-open', open)
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню')
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

function renderBoardTypes(selector) {
  const root = document.querySelector(selector)
  if (!root) return

  root.innerHTML = boardTypes
    .map(
      (item) => `
      <article class="board-item reveal" id="${item.id}">
        <h3>${item.title}</h3>
        <p>${item.description}</p>
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
  document.querySelectorAll('[data-phone-2]').forEach((el) => {
    el.textContent = CONTACTS.phone2
    if (el.tagName === 'A') el.href = CONTACTS.phone2Href
  })
  document.querySelectorAll('[data-email]').forEach((el) => {
    el.textContent = CONTACTS.email
    if (el.tagName === 'A') el.href = CONTACTS.emailHref
  })
  document.querySelectorAll('[data-telegram]').forEach((el) => {
    el.textContent = CONTACTS.telegram
    if (el.tagName === 'A') el.href = CONTACTS.telegramHref
  })
  document.querySelectorAll('[data-address]').forEach((el) => {
    const kind = el.getAttribute('data-address')
    el.textContent =
      kind === 'production' ? CONTACTS.addressProduction : CONTACTS.addressOffice
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

function normalizePantoneQuery(raw) {
  return String(raw)
    .trim()
    .replace(/^pantone\s+/i, '')
    .replace(/\s+/g, ' ')
    .toUpperCase()
}

function initBrandSelects(scope = document) {
  const selects = [...scope.querySelectorAll('select.print-demo__select, select[data-brand-select]')]
  if (!selects.length) return

  const closeAll = (except) => {
    selects.forEach((select) => {
      const ui = select.closest('.brand-select')
      if (!ui || ui === except) return
      ui.classList.remove('is-open')
      const list = ui.querySelector('.brand-select__list')
      const trigger = ui.querySelector('.brand-select__trigger')
      if (list) list.hidden = true
      if (trigger) trigger.setAttribute('aria-expanded', 'false')
    })
  }

  selects.forEach((select) => {
    if (select.dataset.brandSelectReady === '1') return
    select.dataset.brandSelectReady = '1'

    const wrap = document.createElement('div')
    wrap.className = 'brand-select'
    select.parentNode.insertBefore(wrap, select)
    wrap.appendChild(select)
    select.classList.add('brand-select__native')

    const trigger = document.createElement('button')
    trigger.type = 'button'
    trigger.className = 'brand-select__trigger'
    trigger.setAttribute('aria-haspopup', 'listbox')
    trigger.setAttribute('aria-expanded', 'false')
    if (select.id) trigger.id = `${select.id}-trigger`
    const labelBy = select.getAttribute('aria-label')
    if (labelBy) trigger.setAttribute('aria-label', labelBy)

    const valueEl = document.createElement('span')
    valueEl.className = 'brand-select__value'
    const caret = document.createElement('span')
    caret.className = 'brand-select__caret'
    caret.setAttribute('aria-hidden', 'true')
    trigger.append(valueEl, caret)

    const list = document.createElement('ul')
    list.className = 'brand-select__list'
    list.setAttribute('role', 'listbox')
    list.hidden = true

    wrap.append(trigger, list)

    const syncFromNative = () => {
      const selected = select.selectedOptions[0]
      valueEl.textContent = selected ? selected.textContent : ''
      list.querySelectorAll('.brand-select__option').forEach((btn) => {
        const on = btn.dataset.value === select.value
        btn.classList.toggle('is-active', on)
        btn.setAttribute('aria-selected', String(on))
      })
    }

    const rebuildOptions = () => {
      list.replaceChildren(
        ...[...select.options].map((opt) => {
          const li = document.createElement('li')
          li.setAttribute('role', 'presentation')
          const btn = document.createElement('button')
          btn.type = 'button'
          btn.className = 'brand-select__option'
          btn.setAttribute('role', 'option')
          btn.dataset.value = opt.value
          btn.textContent = opt.textContent
          btn.disabled = opt.disabled
          btn.addEventListener('click', () => {
            if (select.value !== opt.value) {
              select.value = opt.value
              select.dispatchEvent(new Event('change', { bubbles: true }))
            }
            closeAll()
            trigger.focus()
          })
          li.appendChild(btn)
          return li
        }),
      )
      syncFromNative()
    }

    const open = () => {
      closeAll(wrap)
      rebuildOptions()
      wrap.classList.add('is-open')
      list.hidden = false
      trigger.setAttribute('aria-expanded', 'true')
    }

    const close = () => {
      wrap.classList.remove('is-open')
      list.hidden = true
      trigger.setAttribute('aria-expanded', 'false')
    }

    trigger.addEventListener('click', () => {
      if (wrap.classList.contains('is-open')) close()
      else open()
    })

    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (!wrap.classList.contains('is-open')) open()
        const active = list.querySelector('.brand-select__option.is-active') || list.querySelector('.brand-select__option')
        active?.focus()
      }
    })

    list.addEventListener('keydown', (event) => {
      const options = [...list.querySelectorAll('.brand-select__option:not(:disabled)')]
      const i = options.indexOf(document.activeElement)
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        trigger.focus()
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        options[Math.min(options.length - 1, i + 1)]?.focus()
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        options[Math.max(0, i - 1)]?.focus()
      }
    })

    select.addEventListener('change', syncFromNative)

    const valueDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')
    Object.defineProperty(select, 'value', {
      configurable: true,
      enumerable: true,
      get() {
        return valueDesc.get.call(this)
      },
      set(next) {
        valueDesc.set.call(this, next)
        syncFromNative()
      },
    })

    rebuildOptions()
  })

  if (!initBrandSelects._bound) {
    initBrandSelects._bound = true
    document.addEventListener('click', (event) => {
      if (event.target.closest('.brand-select')) return
      closeAll()
    })
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeAll()
    })
  }
}

async function initPrintDemo() {
  const root = document.querySelector('[data-print-demo]')
  if (!root) return

  const familyRoot = root.querySelector('[data-print-demo-families]')
  const slider = root.querySelector('[data-print-demo-slider]')
  const shadeTrack = root.querySelector('[data-print-demo-shade-track]')
  const codeInput = root.querySelector('[data-print-demo-code-input]')
  const codeWrap = root.querySelector('.print-demo__code-wrap')
  const render = root.querySelector('[data-print-render]')
  const viewport = root.querySelector('[data-print-viewport]')
  const boxRoot = root.querySelector('[data-print-demo-boxes]')
  const boardRoot = root.querySelector('[data-print-demo-boards]')
  const artworkRoot = root.querySelector('[data-print-demo-artwork]')
  const artworkFile = root.querySelector('[data-print-artwork-file]')
  const artworkName = root.querySelector('[data-print-artwork-name]')
  const targetRoot = root.querySelector('[data-print-demo-targets]')
  if (
    !familyRoot ||
    !slider ||
    !codeInput ||
    !render ||
    !viewport ||
    !boxRoot ||
    !boardRoot ||
    !artworkRoot ||
    !artworkFile ||
    !artworkName ||
    !targetRoot
  )
    return

  const { createPrintBox3D } = await import('./print-box-3d.js')
  const box3d = createPrintBox3D(viewport)

  let artworkObjectUrl = null
  /** @type {HTMLImageElement | null} */
  let loadedArtwork = null

  const revokeArtworkUrl = () => {
    if (!artworkObjectUrl) return
    URL.revokeObjectURL(artworkObjectUrl)
    artworkObjectUrl = null
  }

  const shadeLookup = new Map()
  pantoneFamilies.forEach((family) => {
    family.shades.forEach((shade, index) => {
      shadeLookup.set(normalizePantoneQuery(shade.code), {
        family,
        shade,
        index,
      })
    })
  })

  const resolveQuery = (raw) => {
    const q = normalizePantoneQuery(raw)
    if (!q) return null
    return shadeLookup.get(q) || shadeLookup.get(`${q} C`) || null
  }

  const requireShade = (code) => {
    const hit = resolveQuery(code)
    if (!hit) {
      throw new Error(`PANTONE ${code} отсутствует в каталоге демо`)
    }
    return hit
  }

  // Бурый — точный цвет с эталона kraft (не Pantone): средний тон с референса.
  const kraftBoardHex = '#B79477'
  const kraftBoardHit = {
    family: {
      id: 'board-kraft',
      label: 'Бурый картон',
      hex: kraftBoardHex,
      shades: [{ code: 'Бурый картон', hex: kraftBoardHex }],
    },
    shade: { code: 'Бурый картон', hex: kraftBoardHex },
    index: 0,
  }

  const boardPresets = {
    kraft: kraftBoardHit,
    white: requireShade('Cool Gray 1 C'),
  }

  const targets = {
    box: {
      cssVar: '--box-color',
      ...boardPresets.kraft,
    },
    logo1: {
      cssVar: '--logo-color-1',
      ...requireShade('2935 C'),
    },
    logo2: {
      cssVar: '--logo-color-2',
      ...requireShade('Black C'),
    },
    logo3: {
      cssVar: '--logo-color-3',
      ...requireShade('Orange 021 C'),
    },
  }

  const syncBox3dColors = () => {
    box3d.setColors({
      box: targets.box.shade.hex,
      logo1: targets.logo1.shade.hex,
      logo2: targets.logo2.shade.hex,
      logo3: targets.logo3.shade.hex,
    })
  }

  const selectBox = (boxId) => {
    if (!boxId) return
    render.dataset.box = boxId
    boxRoot.value = boxId
    box3d.setBoxType(boxId)
  }

  boxRoot.addEventListener('change', () => {
    selectBox(boxRoot.value)
  })

  let activeTargetId = 'box'
  let activeFamily = targets.box.family

  const setCodeValid = (ok) => {
    codeInput.classList.toggle('is-invalid', !ok)
    if (codeWrap) codeWrap.classList.toggle('is-invalid', !ok)
  }

  const paintTarget = (targetId, hit, { syncInput = true } = {}) => {
    const target = targets[targetId]
    target.family = hit.family
    target.shade = hit.shade
    target.index = hit.index
    render.style.setProperty(target.cssVar, hit.shade.hex)
    const btn = targetRoot.querySelector(`[data-print-target="${targetId}"]`)
    if (btn) btn.style.setProperty('--target-swatch', hit.shade.hex)
    syncBox3dColors()
    if (targetId !== activeTargetId) return
    activeFamily = hit.family
    slider.setAttribute('aria-valuetext', `PANTONE ${hit.shade.code}`)
    if (syncInput) codeInput.value = hit.shade.code
    setCodeValid(true)
  }

  const syncFamilyUi = (family) => {
    familyRoot.querySelectorAll('[data-pantone-family]').forEach((btn) => {
      const on = btn.getAttribute('data-pantone-family') === family.id
      btn.classList.toggle('is-active', on)
      btn.setAttribute('aria-selected', String(on))
    })
  }

  const syncSliderUi = (family, index) => {
    const max = family.shades.length - 1
    const i = Math.min(Math.max(index, 0), max)
    slider.min = '0'
    slider.max = String(max)
    slider.value = String(i)
    if (shadeTrack) {
      shadeTrack.style.background = `linear-gradient(90deg, ${family.shades
        .map((s) => s.hex)
        .join(', ')})`
    }
  }

  const selectTarget = (targetId) => {
    const target = targets[targetId]
    if (!target) return
    activeTargetId = targetId
    activeFamily = target.family
    targetRoot.querySelectorAll('[data-print-target]').forEach((btn) => {
      const on = btn.getAttribute('data-print-target') === targetId
      btn.classList.toggle('is-active', on)
      btn.setAttribute('aria-selected', String(on))
    })
    syncFamilyUi(target.family)
    syncSliderUi(target.family, target.index)
    codeInput.value = target.shade.code
    slider.setAttribute('aria-valuetext', `PANTONE ${target.shade.code}`)
    setCodeValid(true)
  }

  const applyHitToActive = (hit) => {
    paintTarget(activeTargetId, hit)
    syncFamilyUi(hit.family)
    syncSliderUi(hit.family, hit.index)
  }

  const selectBoard = (boardId) => {
    const hit = boardPresets[boardId]
    if (!hit) return
    boardRoot.value = boardId
    paintTarget('box', hit, { syncInput: false })
    selectTarget('box')
  }

  boardRoot.addEventListener('change', () => {
    selectBoard(boardRoot.value)
  })

  const setArtworkUi = (mode, fileName = '') => {
    artworkRoot.querySelectorAll('[data-print-artwork]').forEach((btn) => {
      const on = btn.getAttribute('data-print-artwork') === mode
      btn.classList.toggle('is-active', on)
      btn.setAttribute('aria-pressed', String(on))
    })
    if (mode === 'upload' && fileName) {
      artworkName.hidden = false
      artworkName.textContent = fileName
    } else {
      artworkName.hidden = true
      artworkName.textContent = ''
    }
  }

  const selectDemoArtwork = () => {
    revokeArtworkUrl()
    loadedArtwork = null
    setArtworkUi('demo')
    box3d.setArtwork(null)
    selectTarget('box')
  }

  const applyUploadedArtwork = (file) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      revokeArtworkUrl()
      artworkObjectUrl = url
      loadedArtwork = img
      setArtworkUi('upload', file.name)
      box3d.setArtwork(img)
      selectTarget('box')
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      throw new Error('Не удалось прочитать файл макета')
    }
    img.src = url
  }

  artworkRoot.querySelectorAll('[data-print-artwork]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-print-artwork')
      if (mode === 'demo') {
        selectDemoArtwork()
        return
      }
      artworkFile.click()
    })
  })

  artworkFile.addEventListener('change', () => {
    const file = artworkFile.files?.[0]
    artworkFile.value = ''
    if (!file) return
    applyUploadedArtwork(file)
  })

  familyRoot.innerHTML = pantoneFamilies
    .map(
      (family) => `
      <button
        type="button"
        class="print-demo__family"
        role="option"
        data-pantone-family="${family.id}"
        aria-selected="false"
        aria-label="${family.label}"
        title="${family.label}"
        style="--swatch:${family.hex}"
      ></button>`,
    )
    .join('')

  targetRoot.querySelectorAll('[data-print-target]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectTarget(btn.getAttribute('data-print-target'))
    })
  })

  familyRoot.querySelectorAll('[data-pantone-family]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-pantone-family')
      const family = pantoneFamilies.find((item) => item.id === id)
      if (!family) return
      const mid = Math.floor(family.shades.length / 2)
      applyHitToActive({ family, shade: family.shades[mid], index: mid })
    })
  })

  slider.addEventListener('input', () => {
    const index = Number(slider.value)
    const shade = activeFamily.shades[index]
    if (!shade) return
    applyHitToActive({ family: activeFamily, shade, index })
  })

  const tryApplyCode = () => {
    const hit = resolveQuery(codeInput.value)
    if (!hit) {
      setCodeValid(false)
      return
    }
    applyHitToActive(hit)
  }

  codeInput.addEventListener('input', () => {
    codeInput.classList.remove('is-invalid')
    if (codeWrap) codeWrap.classList.remove('is-invalid')
    const hit = resolveQuery(codeInput.value)
    if (hit) applyHitToActive(hit)
  })

  codeInput.addEventListener('change', tryApplyCode)
  codeInput.addEventListener('blur', tryApplyCode)
  codeInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    tryApplyCode()
  })

  root.querySelectorAll('[data-print-demo-code-example]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const sample = btn.getAttribute('data-print-demo-code-example')
      if (!sample) return
      codeInput.value = sample
      tryApplyCode()
      codeInput.focus()
    })
  })

  Object.keys(targets).forEach((id) => {
    paintTarget(id, targets[id], { syncInput: false })
  })
  selectBox(render.dataset.box || 'pair')
  selectBoard('kraft')
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-form-mount]').forEach((el) => {
    el.innerHTML = leadFormHTML
  })

  initHeaderScroll()
  initNav()
  fillContactSlots()
  renderProductList('[data-products-catalog]', { modal: true })
  renderBoardTypes('[data-board-types]')
  renderFefco('[data-fefco]')
  renderMaterials('[data-materials]')
  initReveal()
  initLeadForm()
  initProductModal()
  initBrandSelects()
  initPrintDemo()
  initHeroIntro()
  initFoldDash()

  if (window.location.hash) {
    const target = document.querySelector(window.location.hash)
    if (target) target.scrollIntoView({ block: 'start' })
  }
})
