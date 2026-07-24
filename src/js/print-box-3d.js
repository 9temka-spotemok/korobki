import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const BOX_PRESETS = {
  pair: {
    kind: 'rsc',
    logoScale: 0.4,
  },
  single: {
    kind: 'pizza',
    logoScale: 0.46,
  },
  sheet: {
    kind: 'sheet',
    logoScale: 0.36,
  },
}

function buildLogoSvg(color1, color2, color3) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250" width="200" height="250">
  <g fill="${color1}">
    <circle cx="100" cy="92" r="64"/>
  </g>
  <g fill="${color3}">
    <path d="M100 22c-38.7 0-70 31.3-70 70s31.3 70 70 70 70-31.3 70-70-31.3-70-70-70zm0 14c31 0 56 25 56 56s-25 56-56 56-56-25-56-56 25-56 56-56z" fill-rule="evenodd"/>
    <path d="M100 34v112M48 70l104 44M48 118l104-44" stroke="${color3}" stroke-width="3.2" stroke-linecap="round" fill="none" opacity="0.85"/>
    <circle cx="78" cy="72" r="11"/>
    <circle cx="118" cy="64" r="9"/>
    <circle cx="128" cy="104" r="12"/>
    <circle cx="74" cy="112" r="8"/>
    <circle cx="100" cy="96" r="7"/>
    <path d="M56 94c0-7 6-12 12-12s12 5 12 12v4H56v-4zm4 4h16v10c0 2-2 4-4 4h-8c-2 0-4-2-4-4V98z"/>
    <path d="M132 78c0-6 5-11 11-11s11 5 11 11v3h-22v-3zm3 3h16v9c0 2-2 3-3 3h-10c-2 0-3-1-3-3V81z"/>
    <path d="M90 54c6-10 14-10 18-2 2 4 0 10-4 14-6 6-12 4-16-2-2-4-2-8 2-10z"/>
    <path d="M142 120c-8-6-8-14-2-18 4-2 10 0 14 4 6 6 4 12-2 16-4 2-8 2-10-2z"/>
    <ellipse cx="108" cy="128" rx="5" ry="3.5" transform="rotate(-20 108 128)"/>
    <ellipse cx="62" cy="80" rx="4.5" ry="3" transform="rotate(30 62 80)"/>
  </g>
  <g fill="${color2}">
    <text x="100" y="210" text-anchor="middle" font-family="Oswald, Arial Black, sans-serif" font-size="52" font-weight="700" letter-spacing="0.02em">PIZZA</text>
    <rect x="42" y="220" width="116" height="8" rx="3"/>
    <path d="M28 198c4-8 10-8 12-2 1 3-1 7-4 9-4 3-8 2-10-2-1-3 0-5 2-5z"/>
    <circle cx="172" cy="204" r="4"/>
    <path d="M160 188c6 2 10 8 8 12" stroke="${color2}" stroke-width="3" stroke-linecap="round" fill="none"/>
  </g>
</svg>`
}

function loadSvgImage(svgMarkup) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Не удалось собрать SVG логотипа для 3D-текстуры'))
    }
    img.src = url
  })
}

function hexToRgb(hex) {
  const h = hex.replace('#', '')
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  }
}

function fiberNoise(x, y) {
  const s = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return s - Math.floor(s)
}

function paintBoardNoise(ctx, size, boxHex) {
  const { r, g, b } = hexToRgb(boxHex)
  const image = ctx.createImageData(size, size)
  const data = image.data
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const n = (fiberNoise(x, y) - 0.5) * 18
      const o = (y * size + x) * 4
      data[o] = Math.min(255, Math.max(0, r + n))
      data[o + 1] = Math.min(255, Math.max(0, g + n * 0.85))
      data[o + 2] = Math.min(255, Math.max(0, b + n * 0.65))
      data[o + 3] = 255
    }
  }
  ctx.putImageData(image, 0, 0)
}

function hexToRgbTuple(hex) {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function isInkPixel(r, g, b, a) {
  if (a < 28) return false
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
  if (lum > 242 && max - min < 18) return false
  return true
}

/**
 * Разбор макета на до 3 красок: цветные кластеры или тона по яркости.
 * labels: 0 — пусто, 1/2/3 — слоты База / Текст / Контур.
 */
function analyzeArtworkLayers(img) {
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  if (!iw || !ih) {
    throw new Error('У изображения макета нет размеров')
  }

  const maxSide = 280
  const scale = Math.min(1, maxSide / Math.max(iw, ih))
  const w = Math.max(1, Math.round(iw * scale))
  const h = Math.max(1, Math.round(ih * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) {
    throw new Error('2D canvas недоступен для разбора макета')
  }
  ctx.drawImage(img, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)
  const n = w * h
  const labels = new Uint8Array(n)
  const alphas = new Uint8Array(n)
  const inkIdx = []
  let chromaSum = 0

  for (let i = 0; i < n; i += 1) {
    const o = i * 4
    const r = data[o]
    const g = data[o + 1]
    const b = data[o + 2]
    const a = data[o + 3]
    alphas[i] = a
    if (!isInkPixel(r, g, b, a)) continue
    inkIdx.push(i)
    chromaSum += Math.max(r, g, b) - Math.min(r, g, b)
  }

  if (!inkIdx.length) {
    throw new Error('В макете нет непрозрачных цветных пикселей для печати')
  }

  const avgChroma = chromaSum / inkIdx.length
  const samples = []
  const step = Math.max(1, Math.floor(inkIdx.length / 1800))
  for (let s = 0; s < inkIdx.length; s += step) {
    const i = inkIdx[s]
    const o = i * 4
    samples.push([data[o], data[o + 1], data[o + 2], i])
  }

  const useLumaBands = avgChroma < 14 || samples.length < 8
  if (useLumaBands) {
    const lums = inkIdx.map((i) => {
      const o = i * 4
      return 0.2126 * data[o] + 0.7152 * data[o + 1] + 0.0722 * data[o + 2]
    })
    const sorted = lums.slice().sort((a, b) => a - b)
    const q1 = sorted[Math.floor(sorted.length * 0.33)]
    const q2 = sorted[Math.floor(sorted.length * 0.66)]
    inkIdx.forEach((i, nI) => {
      const lum = lums[nI]
      // тёмный → текст, средний → контур, светлый → база
      if (lum <= q1) labels[i] = 2
      else if (lum <= q2) labels[i] = 3
      else labels[i] = 1
    })
    return { w, h, labels, alphas }
  }

  const k = Math.min(3, samples.length)
  const centers = []
  for (let c = 0; c < k; c += 1) {
    const p = samples[Math.floor((c * samples.length) / k)]
    centers.push([p[0], p[1], p[2]])
  }

  for (let iter = 0; iter < 8; iter += 1) {
    const sums = Array.from({ length: k }, () => [0, 0, 0, 0])
    samples.forEach((p) => {
      let best = 0
      let bestD = Infinity
      for (let c = 0; c < k; c += 1) {
        const dr = p[0] - centers[c][0]
        const dg = p[1] - centers[c][1]
        const db = p[2] - centers[c][2]
        const d = dr * dr + dg * dg + db * db
        if (d < bestD) {
          bestD = d
          best = c
        }
      }
      sums[best][0] += p[0]
      sums[best][1] += p[1]
      sums[best][2] += p[2]
      sums[best][3] += 1
    })
    for (let c = 0; c < k; c += 1) {
      if (!sums[c][3]) continue
      centers[c][0] = sums[c][0] / sums[c][3]
      centers[c][1] = sums[c][1] / sums[c][3]
      centers[c][2] = sums[c][2] / sums[c][3]
    }
  }

  const counts = new Array(k).fill(0)
  const assign = new Int8Array(n).fill(-1)
  inkIdx.forEach((i) => {
    const o = i * 4
    const r = data[o]
    const g = data[o + 1]
    const b = data[o + 2]
    let best = 0
    let bestD = Infinity
    for (let c = 0; c < k; c += 1) {
      const dr = r - centers[c][0]
      const dg = g - centers[c][1]
      const db = b - centers[c][2]
      const d = dr * dr + dg * dg + db * db
      if (d < bestD) {
        bestD = d
        best = c
      }
    }
    assign[i] = best
    counts[best] += 1
  })

  // Крупнейший кластер → База, затем Текст, затем Контур
  const order = counts
    .map((count, idx) => ({ count, idx }))
    .sort((a, b) => b.count - a.count)
    .map((item) => item.idx)
  const slotOfCluster = new Array(k)
  order.forEach((clusterIdx, rank) => {
    slotOfCluster[clusterIdx] = rank + 1
  })

  inkIdx.forEach((i) => {
    labels[i] = slotOfCluster[assign[i]]
  })

  return { w, h, labels, alphas }
}

function drawRecoloredArtwork(ctx, analysis, size, scale, color1, color2, color3) {
  const maxW = size * scale
  const maxH = size * scale
  const ratio = analysis.w / analysis.h
  let w = maxW
  let h = w / ratio
  if (h > maxH) {
    h = maxH
    w = h * ratio
  }
  const x0 = Math.round((size - w) / 2)
  const y0 = Math.round((size - h) / 2)
  const dw = Math.max(1, Math.round(w))
  const dh = Math.max(1, Math.round(h))

  const overlay = document.createElement('canvas')
  overlay.width = dw
  overlay.height = dh
  const octx = overlay.getContext('2d')
  if (!octx) {
    throw new Error('2D canvas недоступен для перекраски макета')
  }
  const out = octx.createImageData(dw, dh)
  const c1 = hexToRgbTuple(color1)
  const c2 = hexToRgbTuple(color2)
  const c3 = hexToRgbTuple(color3)
  const colors = [null, c1, c2, c3]

  for (let y = 0; y < dh; y += 1) {
    const sy = Math.min(analysis.h - 1, Math.floor((y * analysis.h) / dh))
    for (let x = 0; x < dw; x += 1) {
      const sx = Math.min(analysis.w - 1, Math.floor((x * analysis.w) / dw))
      const si = sy * analysis.w + sx
      const slot = analysis.labels[si]
      if (!slot) continue
      const rgb = colors[slot]
      const o = (y * dw + x) * 4
      out.data[o] = rgb[0]
      out.data[o + 1] = rgb[1]
      out.data[o + 2] = rgb[2]
      out.data[o + 3] = analysis.alphas[si]
    }
  }
  octx.putImageData(out, 0, 0)
  ctx.drawImage(overlay, x0, y0, dw, dh)
}

async function createFaceTexture({
  boxHex,
  logo1,
  logo2,
  logo3,
  withLogo,
  logoScale,
  artworkImage = null,
  artworkAnalysis = null,
  size = 512,
  anisotropy = 4,
}) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('2D canvas недоступен для текстуры короба')
  }

  paintBoardNoise(ctx, size, boxHex)

  if (withLogo) {
    if (artworkImage && artworkAnalysis) {
      drawRecoloredArtwork(
        ctx,
        artworkAnalysis,
        size,
        Math.min(0.82, logoScale + 0.28),
        logo1,
        logo2,
        logo3,
      )
    } else if (!artworkImage) {
      const img = await loadSvgImage(buildLogoSvg(logo1, logo2, logo3))
      const logoW = size * logoScale
      const logoH = logoW * (250 / 200)
      const x = (size - logoW) / 2
      const y = (size - logoH) / 2 - size * 0.02
      ctx.drawImage(img, x, y, logoW, logoH)
    } else {
      throw new Error('Макет загружен без разбора на краски')
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = anisotropy
  texture.needsUpdate = true
  return texture
}

function createCardboardMaterial(map, { roughness = 0.92, color = 0xffffff } = {}) {
  return new THREE.MeshStandardMaterial({
    map,
    color,
    roughness,
    metalness: 0,
  })
}

function addPanel(group, { w, h, d, material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0 }) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  mesh.position.set(x, y, z)
  mesh.rotation.set(rx, ry, rz)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return mesh
}

/** Тонкая панель: логотип на верхней грани (+Y). */
function addLogoPanel(group, { w, h, d, logoMat, plainMat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0 }) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [
    plainMat,
    plainMat,
    logoMat,
    plainMat,
    plainMat,
    plainMat,
  ])
  mesh.position.set(x, y, z)
  mesh.rotation.set(rx, ry, rz)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return mesh
}

/** Тонкая панель: логотип на передней грани (+Z). */
function addFrontLogoPanel(group, { w, h, d, logoMat, plainMat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0 }) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [
    plainMat,
    plainMat,
    plainMat,
    plainMat,
    logoMat,
    plainMat,
  ])
  mesh.position.set(x, y, z)
  mesh.rotation.set(rx, ry, rz)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return mesh
}

/** Классическая коробка для пиццы: поддон, тонкие бортики, крышка с клапанами. */
function buildPizzaBox(mats) {
  const group = new THREE.Group()
  const size = 1.78
  const wallH = 0.165
  const t = 0.016
  const half = size / 2
  const inner = size - t * 2
  const lidOverhang = 0.018
  const lidSize = size + lidOverhang * 2
  const flapH = wallH * 0.98
  const lockW = 0.36
  const lockH = 0.055

  // Дно
  addPanel(group, {
    w: size,
    h: t,
    d: size,
    material: mats.plain,
    y: t / 2,
  })

  // Бортики поддона
  addPanel(group, {
    w: size,
    h: wallH,
    d: t,
    material: mats.side,
    y: t + wallH / 2,
    z: half - t / 2,
  })
  addPanel(group, {
    w: size,
    h: wallH,
    d: t,
    material: mats.side,
    y: t + wallH / 2,
    z: -(half - t / 2),
  })
  addPanel(group, {
    w: t,
    h: wallH,
    d: inner,
    material: mats.side,
    x: half - t / 2,
    y: t + wallH / 2,
  })
  addPanel(group, {
    w: t,
    h: wallH,
    d: inner,
    material: mats.side,
    x: -(half - t / 2),
    y: t + wallH / 2,
  })

  // Кромка среза на бортиках
  ;[
    { w: size, d: t * 1.3, x: 0, z: half - t / 2 },
    { w: size, d: t * 1.3, x: 0, z: -(half - t / 2) },
    { w: t * 1.3, d: inner, x: half - t / 2, z: 0 },
    { w: t * 1.3, d: inner, x: -(half - t / 2), z: 0 },
  ].forEach((edge) => {
    addPanel(group, {
      w: edge.w,
      h: t * 0.7,
      d: edge.d,
      material: mats.crease,
      x: edge.x,
      y: t + wallH + t * 0.15,
      z: edge.z,
    })
  })

  // Крышка приоткрыта: видна конструкция и печать сверху
  const lidGroup = new THREE.Group()
  const hingeZ = -(half + lidOverhang * 0.25)
  lidGroup.position.set(0, t + wallH, hingeZ)
  lidGroup.rotation.x = -0.32

  addLogoPanel(lidGroup, {
    w: lidSize,
    h: t,
    d: lidSize,
    logoMat: mats.logo,
    plainMat: mats.plain,
    y: t / 2,
    z: lidSize / 2,
  })

  // Передний клапан
  addPanel(lidGroup, {
    w: lidSize - t * 2.4,
    h: flapH,
    d: t,
    material: mats.side,
    y: -flapH / 2 + t * 0.25,
    z: lidSize - t / 2,
    rx: 0.08,
  })

  // Боковые клапаны (тонкие, слегка разведены)
  const sideFlapW = wallH * 0.88
  addPanel(lidGroup, {
    w: t,
    h: sideFlapW,
    d: lidSize - t * 3.4,
    material: mats.inner,
    x: lidSize / 2 - t / 2,
    y: -sideFlapW / 2 + t * 0.2,
    z: lidSize / 2,
    rz: -0.12,
  })
  addPanel(lidGroup, {
    w: t,
    h: sideFlapW,
    d: lidSize - t * 3.4,
    material: mats.inner,
    x: -(lidSize / 2 - t / 2),
    y: -sideFlapW / 2 + t * 0.2,
    z: lidSize / 2,
    rz: 0.12,
  })

  // Язычок-замок
  addPanel(lidGroup, {
    w: lockW,
    h: lockH,
    d: t * 0.95,
    material: mats.side,
    y: -flapH + lockH * 0.25,
    z: lidSize + t * 0.25,
    rx: 0.15,
  })

  // Прорезь замка на переднем бортике
  addPanel(group, {
    w: lockW * 1.2,
    h: t * 0.85,
    d: t * 1.35,
    material: mats.inner,
    y: t + wallH * 0.42,
    z: half - t * 0.15,
  })

  group.add(lidGroup)
  return group
}

/**
 * Гофроящик FEFCO 0201 (RSC): полый корпус, нижние клапаны закрыты,
 * верхние слегка приоткрыты, печать на передней стенке.
 */
function buildRscBox(mats) {
  const group = new THREE.Group()
  const L = 1.62 // длина по X
  const W = 1.18 // ширина по Z
  const H = 0.98 // высота корпуса
  const t = 0.016
  const gap = 0.012
  const majorLen = W / 2 - gap / 2 // клапаны спереди/сзади
  const minorLen = L / 2 - gap / 2 // клапаны слева/справа
  const wallInset = t

  // Передняя стенка с логотипом
  addFrontLogoPanel(group, {
    w: L,
    h: H,
    d: t,
    logoMat: mats.logo,
    plainMat: mats.plain,
    y: H / 2,
    z: W / 2 - t / 2,
  })

  // Задняя стенка
  addPanel(group, {
    w: L,
    h: H,
    d: t,
    material: mats.side,
    y: H / 2,
    z: -(W / 2 - t / 2),
  })

  // Боковые стенки
  addPanel(group, {
    w: t,
    h: H,
    d: W - t * 2,
    material: mats.side,
    x: L / 2 - t / 2,
    y: H / 2,
  })
  addPanel(group, {
    w: t,
    h: H,
    d: W - t * 2,
    material: mats.side,
    x: -(L / 2 - t / 2),
    y: H / 2,
  })

  // Производственный шов на одном углу
  addPanel(group, {
    w: t * 1.8,
    h: H * 0.96,
    d: t * 1.1,
    material: mats.crease,
    x: -(L / 2 - t * 1.1),
    y: H / 2,
    z: W / 2 - t * 1.2,
  })

  // Кромка среза по верху корпуса (линия сгиба клапанов)
  ;[
    { w: L, d: t * 1.25, x: 0, z: W / 2 - t / 2 },
    { w: L, d: t * 1.25, x: 0, z: -(W / 2 - t / 2) },
    { w: t * 1.25, d: W - t * 2, x: L / 2 - t / 2, z: 0 },
    { w: t * 1.25, d: W - t * 2, x: -(L / 2 - t / 2), z: 0 },
  ].forEach((edge) => {
    addPanel(group, {
      w: edge.w,
      h: t * 0.65,
      d: edge.d,
      material: mats.crease,
      x: edge.x,
      y: H + t * 0.1,
      z: edge.z,
    })
  })

  // ——— Нижние клапаны (закрыты) ———
  // Малые (боковые) — снизу
  addPanel(group, {
    w: minorLen * 0.92,
    h: t,
    d: W - t * 2.4,
    material: mats.inner,
    x: -(L / 2 - minorLen / 2 - wallInset),
    y: t / 2,
  })
  addPanel(group, {
    w: minorLen * 0.92,
    h: t,
    d: W - t * 2.4,
    material: mats.inner,
    x: L / 2 - minorLen / 2 - wallInset,
    y: t / 2,
  })
  // Большие (перед/зад) — поверх
  addPanel(group, {
    w: L - t * 2.2,
    h: t,
    d: majorLen,
    material: mats.plain,
    y: t * 1.15,
    z: W / 2 - majorLen / 2 - t * 0.4,
  })
  addPanel(group, {
    w: L - t * 2.2,
    h: t,
    d: majorLen,
    material: mats.plain,
    y: t * 1.15,
    z: -(W / 2 - majorLen / 2 - t * 0.4),
  })

  // ——— Верхние малые клапаны (почти закрыты) ———
  const minorTop = new THREE.Group()
  minorTop.position.set(-(L / 2 - t), H, 0)
  minorTop.rotation.z = 0.08
  addPanel(minorTop, {
    w: minorLen * 0.9,
    h: t,
    d: W - t * 2.6,
    material: mats.inner,
    x: -minorLen * 0.45,
    y: t / 2,
  })
  group.add(minorTop)

  const minorTopR = new THREE.Group()
  minorTopR.position.set(L / 2 - t, H, 0)
  minorTopR.rotation.z = -0.08
  addPanel(minorTopR, {
    w: minorLen * 0.9,
    h: t,
    d: W - t * 2.6,
    material: mats.inner,
    x: minorLen * 0.45,
    y: t / 2,
  })
  group.add(minorTopR)

  // ——— Верхние большие клапаны (приоткрыты, видна конструкция) ———
  const flapFront = new THREE.Group()
  flapFront.position.set(0, H, W / 2 - t)
  flapFront.rotation.x = -0.48
  addPanel(flapFront, {
    w: L - t * 2.2,
    h: t,
    d: majorLen,
    material: mats.plain,
    y: t / 2,
    z: -majorLen / 2,
  })
  // Лёгкий «усик» кромки на клапане
  addPanel(flapFront, {
    w: L - t * 2.6,
    h: t * 0.55,
    d: t * 0.9,
    material: mats.crease,
    y: t * 0.2,
    z: -majorLen + t * 0.4,
  })
  group.add(flapFront)

  const flapBack = new THREE.Group()
  flapBack.position.set(0, H, -(W / 2 - t))
  flapBack.rotation.x = 0.42
  addPanel(flapBack, {
    w: L - t * 2.2,
    h: t,
    d: majorLen,
    material: mats.plain,
    y: t / 2,
    z: majorLen / 2,
  })
  addPanel(flapBack, {
    w: L - t * 2.6,
    h: t * 0.55,
    d: t * 0.9,
    material: mats.crease,
    y: t * 0.2,
    z: majorLen - t * 0.4,
  })
  group.add(flapBack)

  return group
}

/** Профиль гофры (волна) для торца листа. */
function makeFluteProfile(width, amp, periods, thickness) {
  const segs = periods * 10
  const shape = new THREE.Shape()
  const outer = []
  const inner = []
  for (let i = 0; i <= segs; i += 1) {
    const u = i / segs
    const x = (u - 0.5) * width
    const y = Math.sin(u * periods * Math.PI * 2) * amp
    outer.push({ x, y: y + thickness / 2 })
    inner.push({ x, y: y - thickness / 2 })
  }
  shape.moveTo(outer[0].x, outer[0].y)
  for (let i = 1; i < outer.length; i += 1) {
    shape.lineTo(outer[i].x, outer[i].y)
  }
  for (let i = inner.length - 1; i >= 0; i -= 1) {
    shape.lineTo(inner[i].x, inner[i].y)
  }
  shape.closePath()
  return shape
}

/** Один лист трёхслойного гофрокартона: лайнеры + видимая волна на торцах. */
function buildCardboardSheet(mats) {
  const group = new THREE.Group()
  const length = 2.05
  const width = 1.28
  const linerT = 0.011
  const fluteAmp = 0.026
  const fluteThick = 0.0045
  const periods = 13
  const coreH = fluteAmp * 2
  const totalH = linerT * 2 + coreH

  // Нижний лайнер
  addPanel(group, {
    w: length,
    h: linerT,
    d: width,
    material: mats.plain,
    y: linerT / 2,
  })

  // Гофр (экструзия профиля — на торцах видна волна)
  const fluteShape = makeFluteProfile(width, fluteAmp, periods, fluteThick)
  const fluteGeo = new THREE.ExtrudeGeometry(fluteShape, {
    depth: length,
    bevelEnabled: false,
    curveSegments: 1,
  })
  const flute = new THREE.Mesh(fluteGeo, mats.inner)
  flute.rotation.y = Math.PI / 2
  flute.position.set(-length / 2, linerT + fluteAmp, 0)
  flute.castShadow = true
  flute.receiveShadow = true
  group.add(flute)

  // Верхний лайнер с печатью
  addLogoPanel(group, {
    w: length,
    h: linerT,
    d: width,
    logoMat: mats.logo,
    plainMat: mats.plain,
    y: linerT + coreH + linerT / 2,
  })

  // Тонкие кромки лайнеров на «глухих» торцах (параллельно гофре)
  ;[-1, 1].forEach((side) => {
    addPanel(group, {
      w: length,
      h: totalH,
      d: linerT * 0.55,
      material: mats.crease,
      y: totalH / 2,
      z: side * (width / 2 - linerT * 0.15),
    })
  })

  return group
}

function buildBoxByKind(kind, mats) {
  if (kind === 'pizza') return buildPizzaBox(mats)
  if (kind === 'rsc') return buildRscBox(mats)
  if (kind === 'sheet') return buildCardboardSheet(mats)
  throw new Error(`Неизвестный тип модели: ${kind}`)
}

function frameCameraForKind(kind, camera, controls) {
  if (kind === 'pizza') {
    controls.target.set(0, 0.22, 0.1)
    camera.position.set(1.85, 1.85, 2.35)
    return
  }
  if (kind === 'sheet') {
    controls.target.set(0, 0.06, 0)
    camera.position.set(1.45, 1.05, 1.75)
    return
  }
  controls.target.set(0, 0.55, 0.05)
  camera.position.set(2.35, 1.85, 2.95)
}

/**
 * Интерактивная 3D-коробка для демо печати.
 * @param {HTMLElement} host
 */
export function createPrintBox3D(host) {
  if (!host) {
    throw new Error('Нет контейнера для 3D-демо печати')
  }

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf3efe8)

  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 40)
  camera.position.set(2.45, 1.95, 2.7)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  host.appendChild(renderer.domElement)
  renderer.domElement.className = 'print-demo__canvas'
  renderer.domElement.setAttribute('aria-hidden', 'true')

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.minDistance = 1.5
  controls.maxDistance = 6.5
  controls.maxPolarAngle = Math.PI * 0.49
  controls.target.set(0, 0.2, 0)

  const hemi = new THREE.HemisphereLight(0xfff6ea, 0x8a7a68, 1.05)
  scene.add(hemi)

  const key = new THREE.DirectionalLight(0xfff2e4, 1.2)
  key.position.set(3.2, 5.2, 2.4)
  key.castShadow = true
  key.shadow.mapSize.set(1024, 1024)
  key.shadow.camera.near = 0.5
  key.shadow.camera.far = 18
  key.shadow.camera.left = -4
  key.shadow.camera.right = 4
  key.shadow.camera.top = 4
  key.shadow.camera.bottom = -4
  scene.add(key)

  const fill = new THREE.DirectionalLight(0xdde7f2, 0.38)
  fill.position.set(-2.8, 2.2, -2.2)
  scene.add(fill)

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(3.4, 64),
    new THREE.MeshStandardMaterial({
      color: 0xe7e1d7,
      roughness: 1,
      metalness: 0,
    }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.001
  ground.receiveShadow = true
  scene.add(ground)

  const boxGroup = new THREE.Group()
  scene.add(boxGroup)

  let boxRoot = null
  let textures = []
  let materials = []
  let boxType = 'pair'
  let colors = {
    box: '#E9EAE9',
    logo1: '#006CB3',
    logo2: '#2A2926',
    logo3: '#EE7523',
  }
  /** @type {HTMLImageElement | null} */
  let artworkImage = null
  /** @type {{ w: number, h: number, labels: Uint8Array, alphas: Uint8Array } | null} */
  let artworkAnalysis = null
  let rebuildToken = 0
  let rebuildTimer = 0
  let raf = 0
  let disposed = false
  let framedType = null

  const resize = () => {
    const w = host.clientWidth
    const h = host.clientHeight
    if (w < 2 || h < 2) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
  }

  const clearBox = () => {
    if (!boxRoot) return
    boxGroup.remove(boxRoot)
    const geos = new Set()
    boxRoot.traverse((obj) => {
      if (!obj.isMesh) return
      geos.add(obj.geometry)
    })
    geos.forEach((g) => g.dispose())
    materials.forEach((m) => m.dispose())
    textures.forEach((t) => t.dispose())
    materials = []
    textures = []
    boxRoot = null
  }

  const rebuildBox = async () => {
    const token = ++rebuildToken
    const preset = BOX_PRESETS[boxType]
    if (!preset) {
      throw new Error(`Неизвестный тип короба: ${boxType}`)
    }

    const maxAniso = renderer.capabilities.getMaxAnisotropy()
    const faceOpts = {
      boxHex: colors.box,
      logo1: colors.logo1,
      logo2: colors.logo2,
      logo3: colors.logo3,
      logoScale: preset.logoScale,
      artworkImage,
      artworkAnalysis,
    }
    const [plainMap, logoMap, sideMap] = await Promise.all([
      createFaceTexture({
        ...faceOpts,
        withLogo: false,
        size: 256,
        anisotropy: Math.min(4, maxAniso),
      }),
      createFaceTexture({
        ...faceOpts,
        withLogo: true,
        size: 1024,
        anisotropy: Math.min(8, maxAniso),
      }),
      createFaceTexture({
        ...faceOpts,
        withLogo: false,
        size: 256,
        anisotropy: Math.min(4, maxAniso),
      }),
    ])

    if (disposed || token !== rebuildToken) {
      plainMap.dispose()
      logoMap.dispose()
      sideMap.dispose()
      return
    }

    clearBox()
    textures = [plainMap, logoMap, sideMap]

    const plain = createCardboardMaterial(plainMap)
    const logo = createCardboardMaterial(logoMap)
    const side = createCardboardMaterial(sideMap, { color: 0xf2f2f2 })
    const inner = createCardboardMaterial(plainMap, { color: 0xd8d2c8, roughness: 0.96 })
    const crease = createCardboardMaterial(sideMap, { color: 0xcfc7bb, roughness: 0.98 })
    materials = [plain, logo, side, inner, crease]

    const mats = { plain, logo, side, inner, crease }
    boxRoot = buildBoxByKind(preset.kind, mats)
    boxGroup.add(boxRoot)

    if (framedType !== boxType) {
      framedType = boxType
      frameCameraForKind(preset.kind, camera, controls)
      controls.update()
    }
  }

  const tick = () => {
    if (disposed) return
    raf = requestAnimationFrame(tick)
    controls.update()
    renderer.render(scene, camera)
  }

  const observer = new ResizeObserver(resize)
  observer.observe(host)
  resize()
  tick()

  const scheduleRebuild = () => {
    window.clearTimeout(rebuildTimer)
    return new Promise((resolve, reject) => {
      rebuildTimer = window.setTimeout(() => {
        rebuildBox().then(resolve).catch(reject)
      }, 40)
    })
  }

  const api = {
    setColors(next) {
      colors = { ...colors, ...next }
      return scheduleRebuild()
    },
    setBoxType(nextType) {
      if (!BOX_PRESETS[nextType]) {
        throw new Error(`Неизвестный тип короба: ${nextType}`)
      }
      boxType = nextType
      return scheduleRebuild()
    },
    /**
     * Свой макет (Image) или null — вернуть демо Pizza.
     * @param {HTMLImageElement | null} image
     */
    setArtwork(image) {
      artworkImage = image
      artworkAnalysis = image ? analyzeArtworkLayers(image) : null
      return scheduleRebuild()
    },
    dispose() {
      disposed = true
      window.clearTimeout(rebuildTimer)
      cancelAnimationFrame(raf)
      observer.disconnect()
      clearBox()
      ground.geometry.dispose()
      ground.material.dispose()
      controls.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement)
      }
    },
  }

  scheduleRebuild()
  return api
}
