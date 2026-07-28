/** Scroll timeline for the cinematic packaging journey (progress 0–1). */

export const KRAFT = '#B79477'
export const KRAFT_DARK = '#8B6B4F'
export const BG = '#121212'
export const ACCENT = '#ff5a1f'

/** Size morph order (RSC), then pizza box swap at the end. */
export const BOX_TYPES = [
  { id: 'shipping', label: 'Транспортный короб', w: 1.2, h: 0.85, d: 0.95, flap: 0.28 },
  { id: 'display', label: 'Дисплей-короб', w: 1.1, h: 1.05, d: 0.55, flap: 0.18 },
  { id: 'gift', label: 'Подарочная упаковка', w: 0.9, h: 0.9, d: 0.9, flap: 0.22 },
  { id: 'mailer', label: 'Почтовый mailer', w: 1.25, h: 0.45, d: 0.85, flap: 0.35 },
  { id: 'heavy', label: 'Усиленный транспортный', w: 1.45, h: 1.15, d: 1.1, flap: 0.32 },
  { id: 'pizza', label: 'Короб для пиццы', w: 1.35, h: 0.28, d: 1.35, flap: 0.12 },
]

/** RSC-only types used for size morph before pizza swap. */
export const RSC_BOX_TYPES = BOX_TYPES.filter((b) => b.id !== 'pizza')

export const MANUFACTURING = [
  'Сырой картон',
  'Резка',
  'Биговка',
  'Флексопечать',
  'Высечка',
  'Складывание',
  'Склейка',
  'Готовое изделие',
]

export const PRINT_MODES = [
  { id: '1', label: '1 цвет', colors: ['#1a1a1d'] },
  { id: '2', label: '2 цвета', colors: ['#1a1a1d', '#ff5a1f'] },
  { id: '3', label: '3 цвета', colors: ['#1a1a1d', '#ff5a1f', '#ffffff'] },
  { id: 'custom', label: 'Свой макет', colors: ['#ff5a1f', '#c9a66b', '#1a1a1d'] },
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

/** Section ranges on the master scroll progress. */
export const SECTIONS = {
  hero: { start: 0, end: 0.1 },
  // Sheet → ready RSC box (no fold assembly)
  fold: { start: 0.08, end: 0.2 },
  // RSC size morph → pizza appears → extra scroll spins the pizza
  evolution: { start: 0.2, end: 0.46 },
  manufacturing: { start: 0.46, end: 0.56 },
  printing: { start: 0.56, end: 0.66 },
  applications: { start: 0.66, end: 0.75 },
  configurator: { start: 0.75, end: 0.84 },
  trust: { start: 0.84, end: 0.93 },
  finale: { start: 0.93, end: 1 },
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
