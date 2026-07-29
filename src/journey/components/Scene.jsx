import { ContactShadows, Environment } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Suspense } from 'react'
import * as THREE from 'three'
import { CardboardObject } from './CardboardObject'
import { BG, SECTIONS, sectionProgress } from '../data/story'

/** Flat kraft ground — same tone as scene BG, no room walls/corners. */
function StudioGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color={BG} roughness={1} metalness={0} />
    </mesh>
  )
}

const CAM_TARGET = new THREE.Vector3(0, 0.28, 0)

function CameraRig({ progress }) {
  useFrame((state, delta) => {
    const p = progress.current ?? 0
    const fold = sectionProgress(p, SECTIONS.fold.start, SECTIONS.fold.end)
    const fin = sectionProgress(p, SECTIONS.finale.start, SECTIONS.finale.end)
    const cfg = sectionProgress(p, SECTIONS.configurator.start, SECTIONS.configurator.end)
    const w = state.size.width
    const h = state.size.height
    const phone = w < 480
    const mobile = w < 720
    const tablet = !mobile && (w < 1100 || (w <= 1366 && h >= w * 0.95))
    const zMul = phone ? 1.55 : mobile ? 1.38 : tablet ? 1.24 : 1
    const yLift = phone ? 0.28 : mobile ? 0.16 : tablet ? 0.1 : 0

    const zoom = (2.95 - fold * 0.12 + cfg * 0.12 - fin * 0.55) * zMul
    const y = 1.35 - fold * 0.28 - fin * 0.18 + yLift
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
      <fog attach="fog" args={[BG, 10, 22]} />

      <ambientLight intensity={0.68} color="#fff4e8" />
      <directionalLight
        castShadow
        position={[3.8, 6.2, 2.8]}
        intensity={1.7}
        color="#fff1dc"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00025}
        shadow-normalBias={0.035}
        shadow-camera-far={18}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight position={[-3.2, 2.5, -2.5]} intensity={0.5} color="#d8c8b4" />
      <spotLight
        position={[1.5, 4.2, 3]}
        intensity={0.65}
        angle={0.5}
        penumbra={0.85}
        color="#ffe2c0"
      />

      <Suspense fallback={null}>
        <Environment preset="warehouse" environmentIntensity={0.16} />
      </Suspense>

      <StudioGround />
      <CardboardObject progress={progress} />

      <ContactShadows
        position={[0, -0.49, 0]}
        opacity={0.22}
        scale={10}
        blur={4.2}
        far={2.8}
        color="#8a7460"
      />

      <CameraRig progress={progress} />
    </>
  )
}
