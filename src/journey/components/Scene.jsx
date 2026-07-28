import { ContactShadows, Environment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Suspense, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { CardboardObject } from './CardboardObject'
import { SECTIONS, sectionProgress } from '../data/story'

const BG = '#12100e'
const BG_WARM = '#1a1612'

/** Soft radial floor + kraft-wash backdrop — workshop atmosphere, not flat black. */
function StudioAtmosphere() {
  const floorMap = useMemo(() => {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size * 0.5)
    g.addColorStop(0, '#1c1814')
    g.addColorStop(0.45, '#14110f')
    g.addColorStop(0.78, '#10100e')
    g.addColorStop(1, BG)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    // faint fiber noise
    const img = ctx.getImageData(0, 0, size, size)
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (Math.random() - 0.5) * 6
      img.data[i] = Math.min(255, Math.max(0, img.data[i] + n))
      img.data[i + 1] = Math.min(255, Math.max(0, img.data[i + 1] + n * 0.85))
      img.data[i + 2] = Math.min(255, Math.max(0, img.data[i + 2] + n * 0.65))
    }
    ctx.putImageData(img, 0, 0)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  const backMap = useMemo(() => {
    const w = 8
    const h = 512
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    const g = ctx.createLinearGradient(0, 0, 0, h)
    g.addColorStop(0, '#1f1a16')
    g.addColorStop(0.35, BG_WARM)
    g.addColorStop(0.7, '#14110f')
    g.addColorStop(1, BG)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  return (
    <group>
      {/* Curved backdrop — warm kraft falloff behind the object */}
      <mesh position={[0, 1.1, -4.2]} rotation={[0, 0, 0]}>
        <planeGeometry args={[16, 9]} />
        <meshBasicMaterial map={backMap} depthWrite={false} />
      </mesh>
      {/* Soft side washes */}
      <mesh position={[-5.2, 1.0, -1.2]} rotation={[0, Math.PI / 2.4, 0]}>
        <planeGeometry args={[8, 7]} />
        <meshBasicMaterial color="#161310" transparent opacity={0.85} depthWrite={false} />
      </mesh>
      <mesh position={[5.4, 1.0, -1.0]} rotation={[0, -Math.PI / 2.5, 0]}>
        <planeGeometry args={[8, 7]} />
        <meshBasicMaterial color="#15120f" transparent opacity={0.8} depthWrite={false} />
      </mesh>
      {/* Floor disc with soft edge into void */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <circleGeometry args={[6.2, 80]} />
        <meshStandardMaterial map={floorMap} roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}

function PaperDust() {
  const points = useRef()
  const count = 120
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      arr[i * 3] = (Math.random() - 0.5) * 7
      arr[i * 3 + 1] = Math.random() * 3.5 - 0.2
      arr[i * 3 + 2] = (Math.random() - 0.5) * 7
    }
    return arr
  }, [])

  useFrame((state) => {
    if (!points.current) return
    points.current.rotation.y = state.clock.elapsedTime * 0.015
    const attr = points.current.geometry.attributes.position
    for (let i = 0; i < count; i += 1) {
      const y = attr.getY(i)
      attr.setY(i, y > 3.2 ? -0.3 : y + 0.0015 + Math.sin(state.clock.elapsedTime * 0.7 + i) * 0.0005)
    }
    attr.needsUpdate = true
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.012}
        color="#c9a87c"
        transparent
        opacity={0.28}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

const CAM_TARGET = new THREE.Vector3(0, 0.28, 0)

function CameraRig({ progress }) {
  useFrame((state, delta) => {
    const p = progress.current ?? 0
    const fold = sectionProgress(p, SECTIONS.fold.start, SECTIONS.fold.end)
    const mfg = sectionProgress(p, SECTIONS.manufacturing.start, SECTIONS.manufacturing.end)
    const fin = sectionProgress(p, SECTIONS.finale.start, SECTIONS.finale.end)
    const cfg = sectionProgress(p, SECTIONS.configurator.start, SECTIONS.configurator.end)
    const w = state.size.width
    const h = state.size.height
    const phone = w < 480
    const mobile = w < 720
    const tablet = !mobile && (w < 1100 || (w <= 1366 && h >= w * 0.95))
    // Pull camera back on phone/tablet — object scale is also reduced in CardboardObject
    const zMul = phone ? 1.55 : mobile ? 1.38 : tablet ? 1.24 : 1
    const yLift = phone ? 0.28 : mobile ? 0.16 : tablet ? 0.1 : 0

    // On phone/tablet skip hard manufacturing close-up — it clips open flaps
    const mfgZoom = mobile || tablet ? 0.06 : 0.22
    const zoom = (2.95 - fold * 0.12 - mfg * mfgZoom + cfg * 0.12 - fin * 0.55) * zMul
    const y = 1.35 - fold * 0.28 + mfg * (mobile || tablet ? 0.08 : 0.22) - fin * 0.18 + yLift
    CAM_TARGET.y = 0.1 + fold * 0.22 + fin * 0.12 - (mobile || tablet ? 0.06 : 0)
    state.camera.position.x = THREE.MathUtils.damp(
      state.camera.position.x,
      0.55 + fold * 0.35 + Math.sin(p * Math.PI * 2) * 0.1,
      2.4,
      delta,
    )
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, y, 2.4, delta)
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, zoom, 2.4, delta)
    state.camera.lookAt(CAM_TARGET)
  })
  return null
}

export function Scene({ progress }) {
  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 5.5, 13]} />

      <ambientLight intensity={0.42} color="#d4c4ae" />
      <directionalLight
        castShadow
        position={[3.8, 6.2, 2.8]}
        intensity={2.35}
        color="#ffe0c0"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00025}
        shadow-normalBias={0.035}
        shadow-camera-far={18}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight position={[-3.2, 2.5, -2.5]} intensity={0.45} color="#b8a898" />
      <spotLight
        position={[1.5, 4.2, 3]}
        intensity={1.1}
        angle={0.5}
        penumbra={0.85}
        color="#ffc090"
      />
      <pointLight position={[0, 0.8, 1.8]} intensity={0.35} color="#ffb07a" />

      <Suspense fallback={null}>
        <Environment preset="warehouse" environmentIntensity={0.14} />
      </Suspense>

      <StudioAtmosphere />
      <CardboardObject progress={progress} />
      <PaperDust />

      <ContactShadows
        position={[0, -0.49, 0]}
        opacity={0.48}
        scale={10}
        blur={3.6}
        far={2.8}
        color="#050403"
      />

      <CameraRig progress={progress} />
    </>
  )
}
