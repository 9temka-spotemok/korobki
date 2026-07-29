/** Scroll timeline for the cinematic packaging journey (progress 0–1). */

export const KRAFT = '#B79477'
export const KRAFT_DARK = '#8B6B4F'
export const BG = '#121212'
export const ACCENT = '#ff5a1f'

/** Size morph order (RSC), then pizza box swap at the end. */
export const BOX_TYPES = [
  {
    id: 'shipping',
    label: 'Транспортный короб',
    desc: 'Четырёхклапанный RSC для склада и перевозки — держит штабель и защищает груз.',
    w: 1.2,
    h: 0.85,
    d: 0.95,
    flap: 0.28,
  },
  {
    id: 'display',
    label: 'Дисплей-короб',
    desc: 'Узкий профиль под полку и витрину: товар видно сразу, без лишнего объёма.',
    w: 1.1,
    h: 1.05,
    d: 0.55,
    flap: 0.18,
  },
  {
    id: 'gift',
    label: 'Подарочная упаковка',
    desc: 'Кубическая геометрия под премиум-подарок — ровные грани и аккуратный силуэт.',
    w: 0.9,
    h: 0.9,
    d: 0.9,
    flap: 0.22,
  },
  {
    id: 'mailer',
    label: 'Почтовый mailer',
    desc: 'Плоский формат под e‑commerce и доставку: меньше воздуха, проще в отправке.',
    w: 1.25,
    h: 0.45,
    d: 0.85,
    flap: 0.35,
  },
  {
    id: 'heavy',
    label: 'Усиленный транспортный',
    desc: 'Крупнее и жёстче обычного RSC — под тяжёлые и габаритные отправления.',
    w: 1.45,
    h: 1.15,
    d: 1.1,
    flap: 0.32,
  },
  {
    id: 'pizza',
    label: 'Короб для пиццы',
    desc: 'Низкий широкий лоток с крышкой: держит форму, тепло и подачу на стол.',
    w: 1.35,
    h: 0.28,
    d: 1.35,
    flap: 0.12,
  },
]

/** RSC-only types used for size morph before pizza swap. */
export const RSC_BOX_TYPES = BOX_TYPES.filter((b) => b.id !== 'pizza')

export const PRINT_MODES = [
  { id: '1', label: '1 цвет', colors: ['#1a1a1d'] },
  { id: '2', label: '2 цвета', colors: ['#1a1a1d', '#ff5a1f'] },
  { id: '3', label: '3 цвета', colors: ['#1a1a1d', '#ff5a1f', '#ffffff'] },
  { id: 'custom', label: 'Свой макет', colors: ['#1a1a1d', '#ff5a1f'] },
]

export const APPLICATIONS = [
  { id: 'electronics', label: 'Электроника', color: '#3d5a80' },
  { id: 'shoes', label: 'Обувь', color: '#6b4f3a' },
  { id: 'pizza', label: 'Пицца', color: '#c1121f' },
  { id: 'cosmetics', label: 'Косметика', color: '#b8a0c8' },
  { id: 'books', label: 'Книги', color: '#264653' },
  { id: 'parts', label: 'Промдетали', color: '#6c757d' },
  { id: 'food', label: 'Продукты', color: '#e9c46a' },
]

export const TRUST_STATS = [
  { value: '15+', label: 'лет на рынке' },
  { value: '5000+', label: 'реализованных проектов' },
  { value: 'Миллионы', label: 'коробов произведено' },
  { value: 'Быстро', label: 'производство' },
  { value: 'Любые', label: 'размеры под заказ' },
]

/** Hero intro on Journey start (from landing, without the quality slogan). */
export const HERO_POINTS = [
  { id: 'materials', label: 'Качественные материалы', icon: 'seal' },
  { id: 'equipment', label: 'Современное оборудование', icon: 'box' },
  { id: 'volume', label: 'Любые объёмы заказа', icon: 'stack' },
  { id: 'delivery', label: 'Доставка по СПб, ЛО и всей России', icon: 'truck' },
]

export const HERO_LEAD =
  'Стандартные конструкции FEFCO и индивидуальные размеры. Печать до трёх цветов. Минимальный тираж — по согласованию.'

/** Section ranges on the master scroll progress. */
export const SECTIONS = {
  // Start block (hero+fold) shortened ~2× vs previous 0–0.2
  hero: { start: 0, end: 0.05 },
  // Camera settle after hero (box already on screen)
  fold: { start: 0.04, end: 0.1 },
  // RSC size morph → pizza appears → extra scroll spins the pizza
  evolution: { start: 0.1, end: 0.38 },
  printing: { start: 0.38, end: 0.5 },
  applications: { start: 0.5, end: 0.6 },
  configurator: { start: 0.6, end: 0.7 },
  trust: { start: 0.7, end: 0.85 },
  finale: { start: 0.85, end: 1 },
}

/** Right LineSidebar: `progress` = scroll jump target; `activeFrom` = highlight threshold. */
export const JOURNEY_NAV = [
  { id: 'hero', label: 'Старт', progress: 0, activeFrom: SECTIONS.hero.start },
  { id: 'evolution', label: 'Эволюция', progress: SECTIONS.evolution.start + 0.02, activeFrom: SECTIONS.evolution.start },
  { id: 'printing', label: 'Печать', progress: SECTIONS.printing.start + 0.02, activeFrom: SECTIONS.printing.start },
  { id: 'applications', label: 'Применение', progress: SECTIONS.applications.start + 0.02, activeFrom: SECTIONS.applications.start },
  { id: 'configurator', label: 'Конфигуратор', progress: SECTIONS.configurator.start + 0.02, activeFrom: SECTIONS.configurator.start },
  { id: 'trust', label: 'Доверие', progress: SECTIONS.trust.start + 0.02, activeFrom: SECTIONS.trust.start },
  { id: 'finale', label: 'Финал', progress: SECTIONS.finale.start + 0.02, activeFrom: SECTIONS.finale.start },
]

export function journeyNavIndex(progress) {
  let idx = 0
  for (let i = 0; i < JOURNEY_NAV.length; i += 1) {
    if (progress >= JOURNEY_NAV[i].activeFrom) idx = i
  }
  return idx
}

/** Within evolution progress 0–1: RSC morph, then pizza in, then pizza spin. */
export const EVO_PIZZA_GATE = 0.7
export const EVO_PIZZA_SPIN = 0.82

export function clamp01(v) {
  return Math.min(1, Math.max(0, v))
}

export function sectionProgress(progress, start, end) {
  if (end <= start) return 0
  return clamp01((progress - start) / (end - start))
}

export function lerp(a, b, t) {
  return a + (b - a) * t
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}
