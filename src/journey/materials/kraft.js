import * as THREE from 'three'
import { KRAFT_HEX, paintBoardNoise } from '../../lib/cardboard-kit'

/** Same kraft board as print.html constructor (`main.js` / `paintBoardNoise`). */
export const KRAFT_BOARD = KRAFT_HEX
export const KRAFT_BOARD_WHITE = '#E8E2D6'

function hash2(x, y) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

function hexRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function makeCanvas(size) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  return { canvas, ctx: canvas.getContext('2d') }
}

/**
 * Face albedo — matches constructor `paintBoardNoise`: flat kraft + soft fiber,
 * no flute stripes on the liner (those belong only on cut edges).
 */
export function createKraftMaps(hex = KRAFT_BOARD, size = 256) {
  const { r, g, b } = hexRgb(hex)
  const { canvas, ctx } = makeCanvas(size)
  const image = ctx.createImageData(size, size)

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const o = (y * size + x) * 4
      const n = (hash2(x, y) - 0.5) * 18
      image.data[o] = Math.min(255, Math.max(0, r + n))
      image.data[o + 1] = Math.min(255, Math.max(0, g + n * 0.85))
      image.data[o + 2] = Math.min(255, Math.max(0, b + n * 0.65))
      image.data[o + 3] = 255
    }
  }

  ctx.putImageData(image, 0, 0)

  const map = new THREE.CanvasTexture(canvas)
  map.colorSpace = THREE.SRGBColorSpace
  map.anisotropy = 8
  map.needsUpdate = true

  return { map }
}

/** Cut-edge map: liner / wavy flute / liner — only for thickness faces. */
export function createFluteEdgeTexture(size = 256) {
  const { canvas, ctx } = makeCanvas(size)
  const image = ctx.createImageData(size, size)
  for (let y = 0; y < size; y += 1) {
    const v = y / size
    const isLiner = v < 0.22 || v > 0.78
    for (let x = 0; x < size; x += 1) {
      let r
      let g
      let b
      if (isLiner) {
        r = 183
        g = 148
        b = 119
      } else {
        const arch = 0.5 + 0.5 * Math.sin((x / size) * Math.PI * 16)
        const shade = 100 + arch * 50
        r = shade
        g = shade * 0.74
        b = shade * 0.52
      }
      const n = (hash2(x, y) - 0.5) * 12
      const o = (y * size + x) * 4
      image.data[o] = Math.min(255, Math.max(0, r + n))
      image.data[o + 1] = Math.min(255, Math.max(0, g + n * 0.85))
      image.data[o + 2] = Math.min(255, Math.max(0, b + n * 0.6))
      image.data[o + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

/** Face material — same recipe as constructor `createCardboardMaterial`. */
export function createKraftMaterial(hex = KRAFT_BOARD, { maps } = {}) {
  const m = maps || createKraftMaps(hex)
  return new THREE.MeshStandardMaterial({
    map: m.map,
    color: 0xffffff,
    roughness: 0.92,
    metalness: 0,
    envMapIntensity: 0.2,
  })
}

export function createEdgeMaterial() {
  return new THREE.MeshStandardMaterial({
    map: createFluteEdgeTexture(),
    roughness: 0.96,
    metalness: 0,
    color: 0xffffff,
    envMapIntensity: 0,
  })
}

export function createInnerMaterial() {
  return new THREE.MeshStandardMaterial({
    color: '#c9b09a',
    roughness: 0.96,
    metalness: 0,
    envMapIntensity: 0.1,
  })
}

const MARK_INK = '#1a1a1d'

const printArt = {
  letterB: null,
  letterK: null,
  top: null,
  dashes: null,
  promise: null,
}

const WORDMARK_TITLE = 'БАЛТКАРТОН'
const WORDMARK_TAGLINE = 'ПРОИЗВОДСТВО ГОФРОКАРТОНА'

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Не удалось загрузить ${src}`))
    img.src = src
  })
}

/** Loads BK mark layers for the Journey print stage. */
export function ensurePrintArtwork() {
  if (!printArt.promise) {
    printArt.promise = Promise.all([
      loadImage('/brand/mark-layers/letter-b.png'),
      loadImage('/brand/mark-layers/letter-k.png'),
      loadImage('/brand/mark-layers/top.png'),
      loadImage('/brand/mark-layers/dashes.png'),
    ]).then(([letterB, letterK, top, dashes]) => {
      printArt.letterB = punchBlackBackground(letterB)
      printArt.letterK = punchBlackBackground(letterK)
      printArt.top = punchBlackBackground(top)
      printArt.dashes = punchBlackBackground(dashes)
      return printArt
    })
  }
  return printArt.promise
}

export function isPrintArtworkReady() {
  return Boolean(printArt.letterB && printArt.letterK && printArt.top && printArt.dashes)
}

function punchBlackBackground(img) {
  const c = document.createElement('canvas')
  c.width = img.naturalWidth || img.width
  c.height = img.naturalHeight || img.height
  const ctx = c.getContext('2d')
  ctx.drawImage(img, 0, 0)
  const id = ctx.getImageData(0, 0, c.width, c.height)
  const d = id.data
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]
    const g = d[i + 1]
    const b = d[i + 2]
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    if (max < 28 && max - min < 6) d[i + 3] = 0
  }
  ctx.putImageData(id, 0, 0)
  return c
}

/** Title + tagline under the BK cube (no cropped PNG — avoids truncated letters). */
function drawBrandWordmark(ctx, colors, cx, y, maxW, alpha) {
  const ink = colors[0] || MARK_INK
  const accent = colors[1] || ink
  const mono = colors.length <= 1

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'

  let titleSize = maxW * 0.125
  ctx.font = `800 ${Math.round(titleSize)}px Oswald, Unbounded, sans-serif`
  const titleW = ctx.measureText(WORDMARK_TITLE).width
  if (titleW > maxW) {
    titleSize *= maxW / titleW
    ctx.font = `800 ${Math.round(titleSize)}px Oswald, Unbounded, sans-serif`
  }
  ctx.fillStyle = mono ? ink : accent
  ctx.fillText(WORDMARK_TITLE, cx, y)

  let tagSize = titleSize * 0.34
  ctx.font = `600 ${Math.round(tagSize)}px Oswald, Manrope, sans-serif`
  let tagW = ctx.measureText(WORDMARK_TAGLINE).width
  if (tagW > maxW) {
    tagSize *= maxW / tagW
    ctx.font = `600 ${Math.round(tagSize)}px Oswald, Manrope, sans-serif`
  }
  ctx.fillStyle = ink
  ctx.globalAlpha = alpha * (mono ? 1 : 0.9)
  ctx.fillText(WORDMARK_TAGLINE, cx, y + titleSize * 1.28)
  ctx.restore()

  return titleSize * 1.28 + tagSize
}

function makeCanvasTexture(canvas) {
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  texture.needsUpdate = true
  return texture
}

function drawTintedLogo(ctx, source, x, y, w, h, color, alpha) {
  const tmp = document.createElement('canvas')
  tmp.width = Math.max(1, Math.round(w))
  tmp.height = Math.max(1, Math.round(h))
  const t = tmp.getContext('2d')
  t.drawImage(source, 0, 0, tmp.width, tmp.height)
  t.globalCompositeOperation = 'source-in'
  t.fillStyle = color
  t.fillRect(0, 0, tmp.width, tmp.height)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.drawImage(tmp, x, y)
  ctx.restore()
}

/**
 * BK cube from hero mark-layers — one plate per layer, no double dashes.
 * 1 color: all ink; 2 colors: Б/К/пунктир ink + крышка accent; 3 colors: пунктир = white.
 */
function composeMarkCube(colors) {
  const w = printArt.letterB.width
  const h = printArt.letterB.height
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  const ink = colors[0] || MARK_INK
  const lid = colors[1] || ink
  const dash = colors[2] || ink
  drawTintedLogo(ctx, printArt.letterB, 0, 0, w, h, ink, 1)
  drawTintedLogo(ctx, printArt.letterK, 0, 0, w, h, ink, 1)
  drawTintedLogo(ctx, printArt.top, 0, 0, w, h, lid, 1)
  drawTintedLogo(ctx, printArt.dashes, 0, 0, w, h, dash, 1)
  return c
}

/** RSC front panel aspect (L / H) — keeps print from stretching on the liner. */
export const RSC_FACE_ASPECT = 1.62 / 0.98

/**
 * Front-face map for RSC `mats.logo`: kraft + layered Baltkarton lockup.
 */
export function createPrintTexture(
  colors = ['#1a1a1d', '#ff5a1f'],
  ink = 1,
  size = 1024,
  boardHex = KRAFT_BOARD,
  aspect = RSC_FACE_ASPECT,
) {
  const width = size
  const height = Math.max(1, Math.round(size / aspect))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const tile = Math.max(width, height)
  const board = document.createElement('canvas')
  board.width = tile
  board.height = tile
  paintBoardNoise(board.getContext('2d'), tile, boardHex)
  ctx.drawImage(board, 0, 0, width, height)

  const alpha = Math.min(1, Math.max(0, ink))
  if (alpha <= 0.01) return makeCanvasTexture(canvas)
  if (!isPrintArtworkReady()) {
    throw new Error('Арт печати ещё не загружен (ensurePrintArtwork)')
  }

  const mark = composeMarkCube(colors)
  const markRatio = mark.width / mark.height
  let markH = height * 0.38
  let markW = markH * markRatio
  if (markW > width * 0.52) {
    markW = width * 0.52
    markH = markW / markRatio
  }

  const wordMaxW = width * 0.78
  const wordBlockH = height * 0.16
  const gap = height * 0.035
  const blockH = markH + gap + wordBlockH
  const blockY = (height - blockH) / 2
  const markX = (width - markW) / 2
  const markY = blockY

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.drawImage(mark, markX, markY, markW, markH)
  ctx.restore()

  drawBrandWordmark(ctx, colors, width / 2, markY + markH + gap, wordMaxW, alpha)

  return makeCanvasTexture(canvas)
}

/** Legacy helper kept for any old imports. */
export function createKraftTexture(hex = KRAFT_BOARD, size = 256) {
  return createKraftMaps(hex, size).map
}
