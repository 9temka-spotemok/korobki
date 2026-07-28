import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import {
  createFluteEdgeTexture,
  createKraftMaps,
  createKraftMaterial,
  KRAFT_BOARD,
} from '../materials/kraft'

export const SHEET_LENGTH = 1.55
export const SHEET_WIDTH = 1.12
export const SHEET_TOTAL_H = 0.07

/**
 * Hero corrugated sheet — constructor-style kraft face, flute only on cut edge.
 */
export function CorrugatedSheet({
  length = SHEET_LENGTH,
  width = SHEET_WIDTH,
  castShadow = true,
}) {
  const maps = useMemo(() => createKraftMaps(KRAFT_BOARD, 256), [])
  const edgeMap = useMemo(() => createFluteEdgeTexture(256), [])

  const faceMat = useMemo(() => {
    const m = createKraftMaterial(KRAFT_BOARD, { maps })
    m.transparent = true
    m.opacity = 1
    return m
  }, [maps])

  // Solid kraft for vertical faces — never bright white from HDR
  const sideMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: KRAFT_BOARD,
        roughness: 0.94,
        metalness: 0,
        envMapIntensity: 0,
        transparent: true,
        opacity: 1,
      }),
    [],
  )

  // Cut-edge with kraft / flute / kraft sandwich stripes
  const fluteEdgeMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: edgeMap,
        color: 0xffffff,
        roughness: 0.96,
        metalness: 0,
        envMapIntensity: 0,
        transparent: true,
        opacity: 1,
      }),
    [edgeMap],
  )

  // Multi-material box: kraft top/bottom, kraft sides, flute-edge front/back
  // order: +x -x +y -y +z -z
  const bodyMats = useMemo(
    () => [sideMat, sideMat, faceMat, faceMat, fluteEdgeMat, fluteEdgeMat],
    [sideMat, faceMat, fluteEdgeMat],
  )

  useEffect(
    () => () => {
      maps.map.dispose()
      edgeMap.dispose()
      faceMat.dispose()
      sideMat.dispose()
      fluteEdgeMat.dispose()
    },
    [maps, edgeMap, faceMat, sideMat, fluteEdgeMat],
  )

  const h = SHEET_TOTAL_H

  return (
    <group>
      <mesh
        castShadow={castShadow}
        receiveShadow
        position={[0, h / 2, 0]}
        material={bodyMats}
      >
        <boxGeometry args={[length, h, width]} />
      </mesh>

      {/* Extra near-edge flute strip — thicker, clearly readable sandwich */}
      <mesh
        castShadow={castShadow}
        position={[0, h / 2, width / 2 + 0.001]}
        material={fluteEdgeMat}
      >
        <planeGeometry args={[length * 0.98, h * 0.92]} />
      </mesh>
      <mesh
        castShadow={castShadow}
        position={[0, h / 2, -(width / 2 + 0.001)]}
        rotation={[0, Math.PI, 0]}
        material={fluteEdgeMat}
      >
        <planeGeometry args={[length * 0.98, h * 0.92]} />
      </mesh>
    </group>
  )
}
