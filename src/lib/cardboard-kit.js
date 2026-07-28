/**
 * Shared cardboard geometries + board materials used by:
 * - print.html constructor (`print-box-3d.js`)
 * - journey.html cinematic scene (`CardboardObject.jsx`)
 */
import * as THREE from 'three'

export const KRAFT_HEX = '#B79477'

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

/** Soft kraft fiber — same as constructor `paintBoardNoise`. */
export function paintBoardNoise(ctx, size, boxHex) {
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

export function createBoardMap(boxHex = KRAFT_HEX, { size = 256, anisotropy = 4 } = {}) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  paintBoardNoise(ctx, size, boxHex)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = anisotropy
  texture.needsUpdate = true
  return texture
}

export function createCardboardMaterial(map, { roughness = 0.92, color = 0xffffff } = {}) {
  return new THREE.MeshStandardMaterial({
    map,
    color,
    roughness,
    metalness: 0,
  })
}

/** Full material set matching the print constructor recipe. */
export function createBoardMaterials(boxHex = KRAFT_HEX, { size = 256, anisotropy = 4 } = {}) {
  const plainMap = createBoardMap(boxHex, { size, anisotropy })
  const logoMap = createBoardMap(boxHex, { size, anisotropy })
  const sideMap = createBoardMap(boxHex, { size, anisotropy })
  const plain = createCardboardMaterial(plainMap)
  const logo = createCardboardMaterial(logoMap)
  const side = createCardboardMaterial(sideMap, { color: 0xf2f2f2 })
  const inner = createCardboardMaterial(plainMap, { color: 0xd8d2c8, roughness: 0.96 })
  const crease = createCardboardMaterial(sideMap, { color: 0xcfc7bb, roughness: 0.98 })
  return {
    plain,
    logo,
    side,
    inner,
    crease,
    maps: [plainMap, logoMap, sideMap],
    dispose() {
      ;[plain, logo, side, inner, crease].forEach((m) => m.dispose())
      plainMap.dispose()
      logoMap.dispose()
      sideMap.dispose()
    },
  }
}

export function addPanel(group, { w, h, d, material, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0 }) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  mesh.position.set(x, y, z)
  mesh.rotation.set(rx, ry, rz)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return mesh
}

/** Thin panel: logo on +Y. */
export function addLogoPanel(group, {
  w,
  h,
  d,
  logoMat,
  plainMat,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
}) {
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

/** Thin panel: logo on +Z. */
export function addFrontLogoPanel(group, {
  w,
  h,
  d,
  logoMat,
  plainMat,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
}) {
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

/** Thin panel: logo on −Z (back wall). */
export function addBackLogoPanel(group, {
  w,
  h,
  d,
  logoMat,
  plainMat,
  x = 0,
  y = 0,
  z = 0,
  rx = 0,
  ry = 0,
  rz = 0,
}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [
    plainMat,
    plainMat,
    plainMat,
    plainMat,
    plainMat,
    logoMat,
  ])
  mesh.position.set(x, y, z)
  mesh.rotation.set(rx, ry, rz)
  mesh.castShadow = true
  mesh.receiveShadow = true
  group.add(mesh)
  return mesh
}

/** Pizza box — same as print constructor. */
export function buildPizzaBox(mats) {
  const group = new THREE.Group()
  group.userData.kind = 'pizza'
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

  addPanel(group, { w: size, h: t, d: size, material: mats.plain, y: t / 2 })
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

  const lidGroup = new THREE.Group()
  lidGroup.userData.role = 'pizzaLid'
  const hingeZ = -(half + lidOverhang * 0.25)
  lidGroup.position.set(0, t + wallH, hingeZ)
  lidGroup.rotation.x = -0.32
  lidGroup.userData.restX = -0.32
  lidGroup.userData.openX = -1.15

  addLogoPanel(lidGroup, {
    w: lidSize,
    h: t,
    d: lidSize,
    logoMat: mats.logo,
    plainMat: mats.plain,
    y: t / 2,
    z: lidSize / 2,
  })

  addPanel(lidGroup, {
    w: lidSize - t * 2.4,
    h: flapH,
    d: t,
    material: mats.side,
    y: -flapH / 2 + t * 0.25,
    z: lidSize - t / 2,
    rx: 0.08,
  })

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

  addPanel(lidGroup, {
    w: lockW,
    h: lockH,
    d: t * 0.95,
    material: mats.side,
    y: -flapH + lockH * 0.25,
    z: lidSize + t * 0.25,
    rx: 0.15,
  })

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
 * FEFCO 0201 RSC — simple BoxGeometry panels (constructor style).
 * One kraft material on all faces; flaps hinge on outer top edges.
 * No ExtrudeGeometry / caps / knuckles (those caused smeared UVs and gaps).
 */
export function buildRscBox(mats) {
  const group = new THREE.Group()
  group.userData.kind = 'rsc'
  const L = 1.62
  const W = 1.18
  const H = 0.98
  const t = 0.018
  const gap = 0.02
  const majorLen = W / 2 - gap / 2
  const minorLen = L / 2 - gap / 2
  // Rest = flared outward past vertical (fully open look). Finale → 0 (flat closed).
  const openRest = Math.PI / 2 + 0.62
  const openWide = Math.PI / 2 + 1.05
  const mat = mats.plain

  group.userData.dims = { L, W, H, t, majorLen, minorLen }

  // Walls — same plain kraft (tinted "side" material caused half-smeared look)
  addFrontLogoPanel(group, {
    w: L,
    h: H,
    d: t,
    logoMat: mats.logo,
    plainMat: mat,
    y: H / 2,
    z: W / 2 - t / 2,
  })
  addBackLogoPanel(group, {
    w: L,
    h: H,
    d: t,
    logoMat: mats.logo,
    plainMat: mat,
    y: H / 2,
    z: -(W / 2 - t / 2),
  })
  addPanel(group, {
    w: t,
    h: H,
    d: W - t * 2,
    material: mat,
    x: L / 2 - t / 2,
    y: H / 2,
  })
  addPanel(group, {
    w: t,
    h: H,
    d: W - t * 2,
    material: mat,
    x: -(L / 2 - t / 2),
    y: H / 2,
  })

  // Bottom (closed)
  addPanel(group, {
    w: minorLen * 0.96,
    h: t,
    d: W - t * 2.2,
    material: mat,
    x: -(L / 2 - minorLen / 2 - t),
    y: t / 2,
  })
  addPanel(group, {
    w: minorLen * 0.96,
    h: t,
    d: W - t * 2.2,
    material: mat,
    x: L / 2 - minorLen / 2 - t,
    y: t / 2,
  })
  addPanel(group, {
    w: L - t * 2,
    h: t,
    d: majorLen,
    material: mat,
    y: t * 1.05,
    z: W / 2 - majorLen / 2 - t * 0.35,
  })
  addPanel(group, {
    w: L - t * 2,
    h: t,
    d: majorLen,
    material: mat,
    y: t * 1.05,
    z: -(W / 2 - majorLen / 2 - t * 0.35),
  })

  /**
   * Top flaps: hinge on INNER rim, board extends toward opening.
   * 0° = closed flat on top; ~90° = open upright (default); >90° = flared open.
   */
  const majorW = L - t * 3.2
  const minorD = W - t * 3.2

  const flapFront = new THREE.Group()
  flapFront.userData.role = 'flapFront'
  flapFront.userData.closedX = 0
  flapFront.userData.restX = openRest
  flapFront.userData.openX = openWide
  flapFront.position.set(0, H, W / 2 - t)
  flapFront.rotation.x = openRest
  addPanel(flapFront, {
    w: majorW,
    h: t,
    d: majorLen,
    material: mat,
    y: t / 2,
    z: -majorLen / 2,
  })
  group.add(flapFront)

  const flapBack = new THREE.Group()
  flapBack.userData.role = 'flapBack'
  flapBack.userData.closedX = 0
  flapBack.userData.restX = -openRest
  flapBack.userData.openX = -openWide
  flapBack.position.set(0, H, -(W / 2 - t))
  flapBack.rotation.x = -openRest
  addPanel(flapBack, {
    w: majorW,
    h: t,
    d: majorLen,
    material: mat,
    y: t / 2,
    z: majorLen / 2,
  })
  group.add(flapBack)

  const flapLeft = new THREE.Group()
  flapLeft.userData.role = 'flapLeft'
  flapLeft.userData.closedZ = 0
  flapLeft.userData.restZ = openRest
  flapLeft.userData.openZ = openWide
  flapLeft.position.set(-(L / 2 - t), H, 0)
  flapLeft.rotation.z = openRest
  addPanel(flapLeft, {
    w: minorLen * 0.92,
    h: t,
    d: minorD,
    material: mat,
    x: (minorLen * 0.92) / 2,
    y: t / 2,
  })
  group.add(flapLeft)

  const flapRight = new THREE.Group()
  flapRight.userData.role = 'flapRight'
  flapRight.userData.closedZ = 0
  flapRight.userData.restZ = -openRest
  flapRight.userData.openZ = -openWide
  flapRight.position.set(L / 2 - t, H, 0)
  flapRight.rotation.z = -openRest
  addPanel(flapRight, {
    w: minorLen * 0.92,
    h: t,
    d: minorD,
    material: mat,
    x: -(minorLen * 0.92) / 2,
    y: t / 2,
  })
  group.add(flapRight)

  /**
   * Perfectly flush closed lid for finale — swapped in when close finishes.
   * Avoids hinge-angle / stack seams that look crooked when lids fold shut.
   */
  const closedTop = new THREE.Group()
  closedTop.userData.role = 'closedTop'
  closedTop.visible = false
  closedTop.position.set(0, H, 0)
  // Outer footprint matches walls (flush rim)
  const lidL = L
  const lidW = W
  const seam = 0.006
  // Minors under (full depth, half length each)
  addPanel(closedTop, {
    w: lidL / 2 - seam / 2,
    h: t,
    d: lidW - t * 0.35,
    material: mat,
    x: -(lidL / 4 + seam / 4),
    y: t / 2,
  })
  addPanel(closedTop, {
    w: lidL / 2 - seam / 2,
    h: t,
    d: lidW - t * 0.35,
    material: mat,
    x: lidL / 4 + seam / 4,
    y: t / 2,
  })
  // Majors on top (full length, half depth each) — classic RSC stack
  addPanel(closedTop, {
    w: lidL - t * 0.2,
    h: t,
    d: lidW / 2 - seam / 2,
    material: mat,
    y: t * 1.5,
    z: lidW / 4 + seam / 4,
  })
  addPanel(closedTop, {
    w: lidL - t * 0.2,
    h: t,
    d: lidW / 2 - seam / 2,
    material: mat,
    y: t * 1.5,
    z: -(lidW / 4 + seam / 4),
  })
  group.add(closedTop)

  return group
}

/** Flute profile for sheet edge. */
export function makeFluteProfile(width, amp, periods, thickness) {
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

/** Hero / constructor sheet footprint (shared with foldable blank morph). */
export const SHEET_LENGTH = 2.05
export const SHEET_WIDTH = 1.28
export const SHEET_LINER_T = 0.011
export const SHEET_FLUTE_AMP = 0.026
export const SHEET_TOTAL_H = SHEET_LINER_T * 2 + SHEET_FLUTE_AMP * 2

/** RSC body dims (same as buildRscBox). */
export const RSC_L = 1.62
export const RSC_W = 1.18
export const RSC_H = 0.98
export const RSC_T = 0.016

/** Triple-wall sheet with visible flute extrusion — same as print constructor. */
export function buildCardboardSheet(mats) {
  const group = new THREE.Group()
  group.userData.kind = 'sheet'
  const length = SHEET_LENGTH
  const width = SHEET_WIDTH
  const linerT = SHEET_LINER_T
  const fluteAmp = SHEET_FLUTE_AMP
  const fluteThick = 0.0045
  const periods = 13
  const coreH = fluteAmp * 2
  const totalH = SHEET_TOTAL_H
  group.userData.dims = { length, width, totalH }

  addPanel(group, {
    w: length,
    h: linerT,
    d: width,
    material: mats.plain,
    y: linerT / 2,
  })

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

  addLogoPanel(group, {
    w: length,
    h: linerT,
    d: width,
    logoMat: mats.logo,
    plainMat: mats.plain,
    y: linerT + coreH + linerT / 2,
  })

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

/**
 * Hinged RSC walls/flaps for journey fold — NO separate bottom.
 * Hero sheet stays as the bottom so the board doesn't "swap".
 * Parts: userData.parts = { front, back, left, right }; each has .userData.flap / .panel
 */
export function buildFoldableRsc(mats) {
  const group = new THREE.Group()
  group.userData.kind = 'foldable-rsc'
  // Board thickness matched to hero sheet so arms feel like the same carton
  const L = RSC_L
  const W = RSC_W
  const H = RSC_H
  const t = SHEET_TOTAL_H * 0.85
  const gap = 0.01
  const majorLen = W / 2 - gap / 2
  const minorLen = L / 2 - gap / 2
  const sideDepth = W - t * 2
  const mat = mats.plain
  const crease = mats.crease

  group.userData.dims = { L, W, H, t, majorLen, minorLen }

  const makeWall = ({
    role,
    x,
    z,
    axis,
    sign,
    panelW,
    panelD,
    flapLen,
    flapKind,
  }) => {
    const hinge = new THREE.Group()
    hinge.userData.role = role
    hinge.userData.axis = axis
    hinge.userData.sign = sign
    hinge.userData.baseX = x
    hinge.userData.baseZ = z
    hinge.position.set(x, t, z)

    const panel = new THREE.Mesh(new THREE.BoxGeometry(panelW, H, panelD), mat)
    panel.castShadow = true
    panel.receiveShadow = true
    panel.userData.baseW = panelW
    panel.userData.baseD = panelD
    if (role === 'front') panel.position.set(0, H / 2, -t / 2)
    else if (role === 'back') panel.position.set(0, H / 2, t / 2)
    else if (role === 'right') panel.position.set(-t / 2, H / 2, 0)
    else panel.position.set(t / 2, H / 2, 0)
    hinge.userData.panel = panel
    hinge.add(panel)

    const flap = new THREE.Group()
    flap.userData.role = `${role}Flap`
    flap.position.set(0, H, 0)
    const fw = flapKind === 'major' ? L - t * 2.2 : t
    const fh = flapLen
    const fd = flapKind === 'major' ? t : sideDepth - t * 0.6
    const flapMesh = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, fd), mat)
    flapMesh.castShadow = true
    flapMesh.receiveShadow = true
    flapMesh.userData.baseW = fw
    flapMesh.userData.baseD = fd
    flapMesh.userData.baseH = fh
    if (role === 'front') flapMesh.position.set(0, fh / 2, -t / 2)
    else if (role === 'back') flapMesh.position.set(0, fh / 2, t / 2)
    else if (role === 'right') flapMesh.position.set(-t / 2, fh / 2, 0)
    else flapMesh.position.set(t / 2, fh / 2, 0)
    flap.userData.mesh = flapMesh
    flap.add(flapMesh)

    const lip = new THREE.Mesh(
      new THREE.BoxGeometry(
        flapKind === 'major' ? L - t * 2.6 : t * 0.9,
        t * 0.55,
        flapKind === 'major' ? t * 0.9 : sideDepth - t,
      ),
      crease,
    )
    lip.castShadow = true
    if (role === 'front') lip.position.set(0, fh - t * 0.2, -t / 2)
    else if (role === 'back') lip.position.set(0, fh - t * 0.2, t / 2)
    else if (role === 'right') lip.position.set(-t / 2, fh - t * 0.2, 0)
    else lip.position.set(t / 2, fh - t * 0.2, 0)
    flap.add(lip)

    hinge.userData.flap = flap
    hinge.add(flap)
    group.add(hinge)
    return hinge
  }

  const front = makeWall({
    role: 'front',
    x: 0,
    z: W / 2,
    axis: 'x',
    sign: 1,
    panelW: L,
    panelD: t,
    flapLen: majorLen,
    flapKind: 'major',
  })
  const back = makeWall({
    role: 'back',
    x: 0,
    z: -W / 2,
    axis: 'x',
    sign: -1,
    panelW: L,
    panelD: t,
    flapLen: majorLen,
    flapKind: 'major',
  })
  const right = makeWall({
    role: 'right',
    x: L / 2,
    z: 0,
    axis: 'z',
    sign: -1,
    panelW: t,
    panelD: sideDepth,
    flapLen: minorLen * 0.9,
    flapKind: 'minor',
  })
  const left = makeWall({
    role: 'left',
    x: -L / 2,
    z: 0,
    axis: 'z',
    sign: 1,
    panelW: t,
    panelD: sideDepth,
    flapLen: minorLen * 0.9,
    flapKind: 'minor',
  })

  // Display / open pose (no lid close on foldable): sides out, majors ajar — like finished RSC
  const majorAjar = Math.PI / 2 - 0.42
  front.userData.flap.userData.rest = -majorAjar
  front.userData.flap.userData.open = 0.35
  back.userData.flap.userData.rest = majorAjar
  back.userData.flap.userData.open = -0.35
  // Minor flaps: horizontal outward (open), not tucked over the opening
  left.userData.flap.userData.rest = Math.PI / 2 - 0.06
  left.userData.flap.userData.open = Math.PI / 2 - 0.06
  right.userData.flap.userData.rest = -(Math.PI / 2 - 0.06)
  right.userData.flap.userData.open = -(Math.PI / 2 - 0.06)

  group.userData.parts = { front, back, left, right }
  return group
}

/**
 * @param foldAmt 0 flat → 1 walls up
 * @param lidAmt 0 coplanar with wall → 1 open display pose (NOT closed over the box)
 * @param openAmt unused for foldable display (kept for API compat)
 * @param footprintMorph 0 sheet footprint → 1 RSC footprint (hinges track the hero sheet)
 */
export function setFoldablePose(root, foldAmt, lidAmt = 0, openAmt = 0, footprintMorph = 1) {
  const parts = root.userData.parts
  if (!parts) return
  const { L, W, H, t } = root.userData.dims
  const curL = lerpNum(SHEET_LENGTH, L, footprintMorph)
  const curW = lerpNum(SHEET_WIDTH, W, footprintMorph)
  const curT = lerpNum(SHEET_TOTAL_H, t, footprintMorph)
  const wallAngle = (1 - foldAmt) * (Math.PI / 2)
  const { front, back, left, right } = parts

  front.position.set(0, curT, curW / 2)
  back.position.set(0, curT, -curW / 2)
  right.position.set(curL / 2, curT, 0)
  left.position.set(-curL / 2, curT, 0)

  front.rotation.set(front.userData.sign * wallAngle, 0, 0)
  back.rotation.set(back.userData.sign * wallAngle, 0, 0)
  right.rotation.set(0, 0, right.userData.sign * wallAngle)
  left.rotation.set(0, 0, left.userData.sign * wallAngle)

  // Stretch front/back width and side depth with footprint
  const fitPanel = (wall, kind) => {
    const panel = wall.userData.panel
    if (!panel) return
    if (kind === 'major') {
      panel.scale.set(curL / panel.userData.baseW, 1, curT / panel.userData.baseD)
      if (wall.userData.role === 'front') panel.position.set(0, H / 2, -curT / 2)
      else panel.position.set(0, H / 2, curT / 2)
    } else {
      const sideD = Math.max(curT * 2, curW - curT * 2)
      panel.scale.set(curT / panel.userData.baseW, 1, sideD / panel.userData.baseD)
      if (wall.userData.role === 'right') panel.position.set(-curT / 2, H / 2, 0)
      else panel.position.set(curT / 2, H / 2, 0)
    }
    const flap = wall.userData.flap
    const mesh = flap?.userData.mesh
    if (mesh) {
      const halfH = mesh.userData.baseH / 2
      if (kind === 'major') {
        mesh.scale.set(curL / mesh.userData.baseW, 1, curT / mesh.userData.baseD)
        if (wall.userData.role === 'front') mesh.position.set(0, halfH, -curT / 2)
        else mesh.position.set(0, halfH, curT / 2)
      } else {
        const sideD = Math.max(curT * 2, curW - curT * 2)
        mesh.scale.set(curT / mesh.userData.baseW, 1, sideD / mesh.userData.baseD)
        if (wall.userData.role === 'right') mesh.position.set(-curT / 2, halfH, 0)
        else mesh.position.set(curT / 2, halfH, 0)
      }
    }
  }

  fitPanel(front, 'major')
  fitPanel(back, 'major')
  fitPanel(left, 'minor')
  fitPanel(right, 'minor')

  // Settle to open display as walls finish — lids do not close over the opening
  const settle = smoothstepNum(0.55, 1, Math.max(lidAmt, foldAmt))

  const poseFlap = (wall, axis) => {
    const flap = wall.userData.flap
    const angle = lerpNum(0, flap.userData.rest, settle)
    if (axis === 'x') flap.rotation.set(angle, 0, 0)
    else flap.rotation.set(0, 0, angle)
    flap.position.y = H
  }

  poseFlap(front, 'x')
  poseFlap(back, 'x')
  poseFlap(left, 'z')
  poseFlap(right, 'z')
  void openAmt

  return { curL, curW, curT }
}

function lerpNum(a, b, t) {
  return a + (b - a) * t
}

function clamp01(v) {
  return Math.min(1, Math.max(0, v))
}

function smoothstepNum(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

export function buildBoxByKind(kind, mats) {
  if (kind === 'pizza') return buildPizzaBox(mats)
  if (kind === 'rsc') return buildRscBox(mats)
  if (kind === 'sheet') return buildCardboardSheet(mats)
  throw new Error(`Неизвестный тип модели: ${kind}`)
}

export function findByRole(root, role) {
  let hit = null
  root.traverse((obj) => {
    if (obj.userData?.role === role) hit = obj
  })
  return hit
}

export function disposeObject3D(root) {
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose()
  })
}
