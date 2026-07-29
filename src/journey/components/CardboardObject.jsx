import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import {
  buildCardboardSheet,
  buildPizzaBox,
  buildRscBox,
  createBoardMaterials,
  disposeObject3D,
  findByRole,
  KRAFT_HEX,
} from '../../lib/cardboard-kit'
import {
  BOX_TYPES,
  EVO_PIZZA_GATE,
  EVO_PIZZA_SPIN,
  PRINT_MODES,
  RSC_BOX_TYPES,
  SECTIONS,
  clamp01,
  lerp,
  sectionProgress,
  smoothstep,
} from '../data/story'
import {
  createPrintTexture,
  ensurePrintArtwork,
  isPrintArtworkReady,
  RSC_FACE_ASPECT,
} from '../materials/kraft'
import { configState, subscribeConfig } from '../state/configStore'

const DISPLAY_SCALE = 0.78
const PIZZA_SCALE = 0.7

/** Narrow / tablet: shrink the object so flaps and UI stay inside the frame. */
function viewportFit(width, height) {
  if (width < 420) return 0.52
  if (width < 720) return 0.6
  // iPad / tablet portrait (e.g. 1024×1366) — desktop scale fills the column
  if (width < 1100 || (width <= 1366 && height >= width * 0.95)) return 0.68
  return 1
}

/**
 * Journey 3D:
 * Ready RSC box from start → size morph (display/gift/mailer/…) → pizza box.
 */
export function CardboardObject({ progress }) {
  const root = useRef()
  const sheetWrap = useRef()
  const rscWrap = useRef()
  const pizzaWrap = useRef()
  const glow = useRef()
  const configRef = useRef({ ...configState })
  const printMeta = useRef({ ink: -1, mode: -1, art: false, board: 'kraft' })
  const bakedMaps = useRef({ logo: null })
  const boardMode = useRef('kraft')
  const artReady = useRef(false)

  const sheetMats = useMemo(() => createBoardMaterials(KRAFT_HEX, { size: 256, anisotropy: 8 }), [])
  const boxMats = useMemo(() => createBoardMaterials(KRAFT_HEX, { size: 256, anisotropy: 8 }), [])
  const whiteMats = useMemo(() => createBoardMaterials('#E8E2D6', { size: 256, anisotropy: 8 }), [])

  const sheet = useMemo(() => buildCardboardSheet(sheetMats), [sheetMats])
  const rsc = useMemo(() => buildRscBox(boxMats), [boxMats])
  const pizza = useMemo(() => buildPizzaBox(boxMats), [boxMats])

  const rscFlaps = useMemo(
    () => ({
      front: findByRole(rsc, 'flapFront'),
      back: findByRole(rsc, 'flapBack'),
      left: findByRole(rsc, 'flapLeft'),
      right: findByRole(rsc, 'flapRight'),
      closedTop: findByRole(rsc, 'closedTop'),
    }),
    [rsc],
  )
  const pizzaLid = useMemo(() => findByRole(pizza, 'pizzaLid'), [pizza])

  const damp = useRef({
    sheet: 0,
    box: 1,
    pizza: 0,
    open: 0,
    close: 0,
    printInk: 0,
    printMode: 1,
    glow: 0,
    sx: 1,
    sy: 1,
    sz: 1,
  })

  useEffect(() => subscribeConfig((s) => {
    configRef.current = { ...s }
  }), [])

  useEffect(() => {
    let alive = true
    ensurePrintArtwork().then(() => {
      if (!alive) return
      artReady.current = true
      printMeta.current = { ink: -1, mode: -1, art: false, board: 'kraft' }
    })
    return () => {
      alive = false
    }
  }, [])

  useEffect(
    () => () => {
      disposeObject3D(sheet)
      disposeObject3D(rsc)
      disposeObject3D(pizza)
      sheetMats.dispose()
      boxMats.dispose()
      whiteMats.dispose()
      bakedMaps.current.logo?.dispose()
    },
    [sheet, rsc, pizza, sheetMats, boxMats, whiteMats],
  )

  useFrame((frame, delta) => {
    const p = progress.current ?? 0
    const evoP = sectionProgress(p, SECTIONS.evolution.start, SECTIONS.evolution.end)
    const printP = sectionProgress(p, SECTIONS.printing.start, SECTIONS.printing.end)
    const appP = sectionProgress(p, SECTIONS.applications.start, SECTIONS.applications.end)
    const trustP = sectionProgress(p, SECTIONS.trust.start, SECTIONS.trust.end)
    const finP = sectionProgress(p, SECTIONS.finale.start, SECTIONS.finale.end)
    const hero = sectionProgress(p, SECTIONS.hero.start, SECTIONS.hero.end)

    // Ready RSC box on the home screen (no flat sheet)
    let tSheet = 0
    let tBox = 1
    let tPizza = 0
    let tOpen = 0
    let tClose = 0
    let tInk = 0
    let tMode = 1
    let tGlow = 0
    let sx = 1
    let sy = 1
    let sz = 1
    let wantWhite = false

    if (p >= SECTIONS.evolution.start) {
      tSheet = 0
      // morph RSC → pizza in → hold + spin on remaining scroll
      const rscEvo = smoothstep(0, EVO_PIZZA_GATE, evoP)
      const pizzaIn = smoothstep(EVO_PIZZA_GATE, EVO_PIZZA_SPIN, evoP)

      const n = RSC_BOX_TYPES.length
      const evoIndex = rscEvo * Math.max(1, n - 1)
      const i0 = Math.floor(evoIndex)
      const i1 = Math.min(n - 1, i0 + 1)
      const et = evoIndex - i0
      const a = RSC_BOX_TYPES[i0]
      const b = RSC_BOX_TYPES[i1]
      const base = RSC_BOX_TYPES[0]
      sx = lerp(a.w / base.w, b.w / base.w, et)
      sy = lerp(a.h / base.h, b.h / base.h, et)
      sz = lerp(a.d / base.d, b.d / base.d, et)

      tPizza = pizzaIn
      tBox = 1 - pizzaIn
      // Brand lockup on RSC walls and pizza lid throughout evolution
      tMode = 1
      tInk = 0.92
    }

    if (p >= SECTIONS.printing.start && p < SECTIONS.applications.start) {
      tSheet = 0
      tBox = 1
      tPizza = 0
      // Logo visible from the first chip («1 цвет»)
      tInk = 0.95
      tMode = Math.min(3, Math.floor(printP * 4))
      sx = 1
      sy = 1
      sz = 1
    }

    if (p >= SECTIONS.applications.start && p < SECTIONS.configurator.start) {
      tOpen = smoothstep(0.05, 0.55, appP)
      tSheet = 0
      tBox = 1
      tPizza = 0
      tInk = 0.55
      sx = 1
      sy = 1
      sz = 1
    }

    if (p >= SECTIONS.configurator.start && p < SECTIONS.trust.start) {
      const cfg = configRef.current
      const base = RSC_BOX_TYPES[0]
      sx = cfg.width / base.w
      sy = cfg.height / base.h
      sz = cfg.depth / base.d
      tSheet = 0
      tBox = 1
      tPizza = 0
      tOpen = 0.12
      wantWhite = cfg.board === 'white'
      const mode = PRINT_MODES.find((m) => m.id === cfg.printing) || PRINT_MODES[1]
      tInk = 0.9
      tMode = Math.max(0, PRINT_MODES.indexOf(mode))
    }

    // Same breakpoints as viewportFit / journey compact layout
    const compactUi =
      frame.size.width < 1100 ||
      (frame.size.width <= 1366 && frame.size.height >= frame.size.width * 0.95)

    if (p >= SECTIONS.trust.start && p < SECTIONS.finale.start) {
      tSheet = 0
      tBox = 1
      tPizza = 0
      tOpen = 0
      tClose = 0
      sx = 0.92
      sy = 0.88
      sz = 0.92
      // Desktop: plain kraft for overlay readability; tablet/phone keep brand mark
      tMode = 1
      tInk = compactUi ? 0.9 : 0
    }

    if (p >= SECTIONS.finale.start) {
      tGlow = smoothstep(0.2, 0.8, finP)
      tOpen = 0
      // Minors then majors fold inward — closed shipping box for the CTA
      tClose = smoothstep(0.08, 0.62, finP)
      tSheet = 0
      tBox = 1
      tPizza = 0
      sx = 1.05
      sy = 1.05
      sz = 1.05
      tMode = 1
      tInk = compactUi ? 0.85 : 0
    }

    const s = damp.current
    s.sheet = THREE.MathUtils.damp(s.sheet, tSheet, 8, delta)
    s.box = THREE.MathUtils.damp(s.box, tBox, 8, delta)
    s.pizza = THREE.MathUtils.damp(s.pizza, tPizza, 7, delta)
    s.open = THREE.MathUtils.damp(s.open, tOpen, 6, delta)
    s.close = THREE.MathUtils.damp(s.close, tClose, tClose > s.close ? 5.5 : 10, delta)
    if (tClose < 0.01 && s.close < 0.06) s.close = 0
    s.printInk = THREE.MathUtils.damp(s.printInk, tInk, tInk > s.printInk + 0.2 ? 12 : 5, delta)
    s.glow = THREE.MathUtils.damp(s.glow, tGlow, 5, delta)
    s.sx = THREE.MathUtils.damp(s.sx, sx, 6, delta)
    s.sy = THREE.MathUtils.damp(s.sy, sy, 6, delta)
    s.sz = THREE.MathUtils.damp(s.sz, sz, 6, delta)
    s.printMode = tMode

    const showSheet = s.sheet >= s.box && s.sheet >= s.pizza && s.sheet > 0.35
    const showPizza = !showSheet && s.pizza >= s.box && s.pizza > 0.35
    const showRsc = !showSheet && !showPizza && s.box > 0.2
    const fit = viewportFit(frame.size.width, frame.size.height)
    const rscScale = DISPLAY_SCALE * fit
    const pizzaScale = PIZZA_SCALE * fit
    const sheetScale = 0.72 * fit

    if (sheetWrap.current) {
      sheetWrap.current.visible = showSheet
      sheetWrap.current.scale.setScalar(sheetScale)
      sheetWrap.current.position.y = -0.02
      sheetWrap.current.rotation.x = -0.12
      sheetWrap.current.rotation.z = 0.08
    }

    if (rscWrap.current) {
      rscWrap.current.visible = showRsc
      rscWrap.current.scale.set(s.sx * rscScale, s.sy * rscScale, s.sz * rscScale)
      rscWrap.current.position.y = -0.02
      // Keep printed front facing the camera once flexo ink appears
      if (showRsc && s.printInk > 0.05) {
        const faceYaw = Math.atan2(frame.camera.position.x, frame.camera.position.z)
        const parentYaw = root.current?.rotation.y ?? 0
        rscWrap.current.rotation.y = THREE.MathUtils.damp(
          rscWrap.current.rotation.y,
          faceYaw - parentYaw,
          3.2,
          delta,
        )
      }
    }

    if (pizzaWrap.current) {
      pizzaWrap.current.visible = showPizza
      pizzaWrap.current.scale.setScalar(pizzaScale)
      pizzaWrap.current.position.y = -0.02
      // Face camera, then scroll-driven spin through the extra pizza stretch
      const faceYaw = Math.atan2(frame.camera.position.x, frame.camera.position.z)
      const parentYaw = root.current?.rotation.y ?? 0
      const spinP = sectionProgress(p, SECTIONS.evolution.start, SECTIONS.evolution.end)
      const spin = smoothstep(EVO_PIZZA_SPIN, 1, spinP)
      pizzaWrap.current.rotation.y = faceYaw - parentYaw + spin * Math.PI * 1.35
      pizzaWrap.current.rotation.x = spin * 0.12
    }

    const nextBoard = wantWhite ? 'white' : 'kraft'
    if (boardMode.current !== nextBoard) {
      boardMode.current = nextBoard
      rematerialize(rsc, nextBoard === 'white' ? whiteMats : boxMats)
      rematerialize(pizza, nextBoard === 'white' ? whiteMats : boxMats)
    }

    const open = s.open
    const close = s.close
    const majorOpen = smoothstep(0, 0.62, open)
    const minorOpen = smoothstep(0.38, 1, open)
    // Finale: animate shut, then swap to flush closedTop (no crooked hinge seams).
    const shutting = close > 0.05
    const lidSwap = smoothstep(0.78, 0.96, close)
    const minorClose = smoothstep(0, 0.5, close)
    const majorClose = smoothstep(0.4, 1, close)
    const rscH = rsc.userData.dims.H
    const rscT = rsc.userData.dims.t
    const showClosed = lidSwap > 0.5
    const showHinges = !showClosed

    if (rscFlaps.left) {
      rscFlaps.left.visible = showHinges
      rscFlaps.left.rotation.z = shutting
        ? lerp(rscFlaps.left.userData.restZ, rscFlaps.left.userData.closedZ, minorClose)
        : lerp(rscFlaps.left.userData.restZ, rscFlaps.left.userData.openZ, minorOpen)
      rscFlaps.left.position.set(-(rsc.userData.dims.L / 2 - rscT), rscH, 0)
    }
    if (rscFlaps.right) {
      rscFlaps.right.visible = showHinges
      rscFlaps.right.rotation.z = shutting
        ? lerp(rscFlaps.right.userData.restZ, rscFlaps.right.userData.closedZ, minorClose)
        : lerp(rscFlaps.right.userData.restZ, rscFlaps.right.userData.openZ, minorOpen)
      rscFlaps.right.position.set(rsc.userData.dims.L / 2 - rscT, rscH, 0)
    }
    if (rscFlaps.front) {
      rscFlaps.front.visible = showHinges
      rscFlaps.front.rotation.x = shutting
        ? lerp(rscFlaps.front.userData.restX, rscFlaps.front.userData.closedX, majorClose)
        : lerp(rscFlaps.front.userData.restX, rscFlaps.front.userData.openX, majorOpen)
      rscFlaps.front.position.set(0, rscH + (shutting ? majorClose * rscT : 0), rsc.userData.dims.W / 2 - rscT)
    }
    if (rscFlaps.back) {
      rscFlaps.back.visible = showHinges
      rscFlaps.back.rotation.x = shutting
        ? lerp(rscFlaps.back.userData.restX, rscFlaps.back.userData.closedX, majorClose)
        : lerp(rscFlaps.back.userData.restX, rscFlaps.back.userData.openX, majorOpen)
      rscFlaps.back.position.set(0, rscH + (shutting ? majorClose * rscT : 0), -(rsc.userData.dims.W / 2 - rscT))
    }
    if (rscFlaps.closedTop) {
      rscFlaps.closedTop.visible = showClosed
      rscFlaps.closedTop.position.y = rscH
    }
    if (pizzaLid) {
      pizzaLid.rotation.x = lerp(pizzaLid.userData.restX, pizzaLid.userData.openX, open)
    }

    const boardKey = boardMode.current
    const artOk = artReady.current || isPrintArtworkReady()
    const inkQ = Math.round(clamp01(s.printInk) * 24) / 24
    const needBake =
      printMeta.current.ink !== inkQ ||
      printMeta.current.mode !== s.printMode ||
      printMeta.current.board !== boardKey ||
      (artOk && !printMeta.current.art)
    const canBake = inkQ <= 0.01 || artOk
    if (needBake && canBake) {
      const mode = PRINT_MODES[s.printMode] || PRINT_MODES[1]
      const boardHex = boardKey === 'white' ? '#E8E2D6' : KRAFT_HEX
      const activeLogo = boardKey === 'white' ? whiteMats.logo : boxMats.logo
      const nextLogo = createPrintTexture(mode.colors, inkQ, 1024, boardHex, RSC_FACE_ASPECT)
      activeLogo.map = nextLogo
      activeLogo.needsUpdate = true
      if (bakedMaps.current.logo) bakedMaps.current.logo.dispose()
      bakedMaps.current.logo = nextLogo

      printMeta.current = {
        ink: inkQ,
        mode: s.printMode,
        art: artOk || inkQ <= 0.01,
        board: boardKey,
      }
    }

    if (glow.current) {
      glow.current.intensity = s.glow * 5
      glow.current.position.set(0, 0.55, 0)
    }

    if (root.current) {
      const orbit =
        0.7 +
        evoP * 0.7 +
        printP * 0.9 +
        frame.clock.elapsedTime * 0.018 * (0.4 + (1 - hero) * 0.45)
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, orbit, 2.2, delta)
      root.current.rotation.x = THREE.MathUtils.damp(
        root.current.rotation.x,
        0.16 - s.open * 0.06 - s.close * 0.1,
        2.8,
        delta,
      )
      root.current.position.y = THREE.MathUtils.damp(
        root.current.position.y,
        0.08 + trustP * 0.1 + finP * 0.05,
        4,
        delta,
      )
    }
  })

  return (
    <group ref={root}>
      <group ref={sheetWrap}>
        <primitive object={sheet} />
      </group>
      <group ref={rscWrap} visible={false}>
        <primitive object={rsc} />
      </group>
      <group ref={pizzaWrap} visible={false}>
        <primitive object={pizza} />
      </group>
      <pointLight ref={glow} color="#ffb070" intensity={0} distance={3.5} decay={2} />
    </group>
  )
}

function rematerialize(root, board) {
  root.traverse((obj) => {
    if (!obj.isMesh) return
    if (Array.isArray(obj.material) && obj.material.length === 6) {
      const logoOnY = obj.material[2] !== obj.material[0]
      const logoOnBack = obj.material[5] !== obj.material[0] && obj.material[4] === obj.material[0]
      if (logoOnY) {
        obj.material = [
          board.plain,
          board.plain,
          board.logo,
          board.plain,
          board.plain,
          board.plain,
        ]
      } else if (logoOnBack) {
        obj.material = [
          board.plain,
          board.plain,
          board.plain,
          board.plain,
          board.plain,
          board.logo,
        ]
      } else {
        obj.material = [
          board.plain,
          board.plain,
          board.plain,
          board.plain,
          board.logo,
          board.plain,
        ]
      }
      return
    }
    if (!obj.userData.boardSlot) {
      const hex = obj.material?.color?.getHex?.() ?? 0xffffff
      if (hex === 0xcfc7bb) obj.userData.boardSlot = 'crease'
      else if (hex === 0xd8d2c8) obj.userData.boardSlot = 'inner'
      else if (hex === 0xf2f2f2) obj.userData.boardSlot = 'side'
      else obj.userData.boardSlot = 'plain'
    }
    obj.material = board[obj.userData.boardSlot] || board.plain
  })
}
