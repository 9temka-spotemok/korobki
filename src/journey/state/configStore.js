/** Mutable configurator state shared between UI overlay and 3D scene. */

/** Длина × ширина × высота (мм) — диапазон по линейке типовых коробов. */
export const SIZE_BOUNDS = {
  length: { min: 400, max: 800 },
  width: { min: 300, max: 600 },
  height: { min: 240, max: 600 },
}

/** 600 мм длины ≈ 1.2 scene-unit. */
const MM_TO_SCENE = 1.2 / 600

function clampMm(key, value) {
  const { min, max } = SIZE_BOUNDS[key]
  return Math.min(max, Math.max(min, Math.round(value)))
}

function mmToScene(lengthMm, widthMm, heightMm) {
  return {
    // X = длина, Y = высота, Z = ширина (оси RSC в cardboard-kit)
    width: lengthMm * MM_TO_SCENE,
    height: heightMm * MM_TO_SCENE,
    depth: widthMm * MM_TO_SCENE,
  }
}

export const configState = {
  lengthMm: 600,
  widthMm: 400,
  heightMm: 300,
  ...mmToScene(600, 400, 300),
  board: 'kraft',
  printing: '2',
  quantity: 1000,
  listeners: new Set(),
}

export function setConfig(partial) {
  const next = { ...partial }
  if (partial.lengthMm != null) next.lengthMm = clampMm('length', partial.lengthMm)
  if (partial.widthMm != null) next.widthMm = clampMm('width', partial.widthMm)
  if (partial.heightMm != null) next.heightMm = clampMm('height', partial.heightMm)

  const lengthMm = next.lengthMm ?? configState.lengthMm
  const widthMm = next.widthMm ?? configState.widthMm
  const heightMm = next.heightMm ?? configState.heightMm
  if (partial.lengthMm != null || partial.widthMm != null || partial.heightMm != null) {
    Object.assign(next, mmToScene(lengthMm, widthMm, heightMm))
  }

  Object.assign(configState, next)
  configState.listeners.forEach((fn) => fn(configState))
}

export function subscribeConfig(fn) {
  configState.listeners.add(fn)
  return () => configState.listeners.delete(fn)
}
