'use client'
import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { StarData } from '@/lib/types'
import { formatProbability, formatVolume, getPlatformLabel } from '@/lib/constellation'

interface InstancedStarsProps {
  stars: StarData[]
  allStars: StarData[]
  selectedStar: StarData | null
  onSelectStar: (star: StarData | null) => void
}

const tempMatrix = new THREE.Matrix4()
const tempColor = new THREE.Color()
const ZERO_MATRIX = new THREE.Matrix4().makeScale(0, 0, 0)

const coreSphere = new THREE.SphereGeometry(1, 8, 8)
const glowSphere = new THREE.SphereGeometry(1, 6, 6)

export default function InstancedStars({ stars, allStars, selectedStar, onSelectStar }: InstancedStarsProps) {
  const coreRef = useRef<THREE.InstancedMesh>(null)
  const glowRef = useRef<THREE.InstancedMesh>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const colorsSet = useRef(false)

  // Max count = all markets (never changes after initial load)
  const maxCount = allStars.length

  // Build a visibility set for fast lookup
  const visibleSet = useMemo(() => {
    const set = new Set<string>()
    for (const s of stars) set.add(s.market.id)
    return set
  }, [stars])

  // Map from instanceId to star index in allStars for click handling
  const visibleIdToStar = useMemo(() => {
    const map = new Map<number, StarData>()
    for (let i = 0; i < allStars.length; i++) {
      if (visibleSet.has(allStars[i].market.id)) {
        map.set(i, allStars[i])
      }
    }
    return map
  }, [allStars, visibleSet])

  useEffect(() => {
    colorsSet.current = false
  }, [allStars])

  useFrame(({ clock }) => {
    if (!coreRef.current || !glowRef.current || maxCount === 0) return

    const t = clock.getElapsedTime()

    if (!colorsSet.current) {
      for (let i = 0; i < maxCount; i++) {
        tempColor.set(allStars[i].color)
        coreRef.current.setColorAt(i, tempColor)
        glowRef.current.setColorAt(i, tempColor)
      }
      if (coreRef.current.instanceColor) coreRef.current.instanceColor.needsUpdate = true
      if (glowRef.current.instanceColor) glowRef.current.instanceColor.needsUpdate = true
      colorsSet.current = true
    }

    const groupAngle = t * 0.015
    const cosA = Math.cos(groupAngle)
    const sinA = Math.sin(groupAngle)
    const tiltAngle = t * 0.008
    const cosT = Math.cos(tiltAngle)
    const sinT = Math.sin(tiltAngle)

    for (let i = 0; i < maxCount; i++) {
      const star = allStars[i]
      const isVisible = visibleSet.has(star.market.id)

      if (!isVisible) {
        coreRef.current.setMatrixAt(i, ZERO_MATRIX)
        glowRef.current.setMatrixAt(i, ZERO_MATRIX)
        continue
      }

      const prob = star.market.outcomes[0]?.price || 0.5
      const [bx, by, bz] = star.position

      let x = bx * cosA - bz * sinA
      let y = by
      let z = bx * sinA + bz * cosA

      const y2 = y * cosT - z * sinT
      const z2 = y * sinT + z * cosT
      y = y2
      z = z2

      const phase = i * 1.618
      x += Math.sin(t * 0.3 + phase) * 0.15
      y += Math.cos(t * 0.25 + phase * 1.3) * 0.1
      z += Math.sin(t * 0.2 + phase * 0.7) * 0.12

      const uncertainty = 1 - Math.abs(prob - 0.5) * 2
      const pulse = 1 + Math.sin(t * 0.8 + phase) * 0.06 * uncertainty
      const isHovered = hoveredIdx === i
      const isSelected = selectedStar?.market.id === star.market.id
      const scale = star.size * ((isHovered || isSelected) ? 1.6 : pulse)

      tempMatrix.makeScale(scale, scale, scale)
      tempMatrix.setPosition(x, y, z)
      coreRef.current.setMatrixAt(i, tempMatrix)

      const glowScale = star.size * 2.5 * pulse
      tempMatrix.makeScale(glowScale, glowScale, glowScale)
      tempMatrix.setPosition(x, y, z)
      glowRef.current.setMatrixAt(i, tempMatrix)
    }

    coreRef.current.instanceMatrix.needsUpdate = true
    glowRef.current.instanceMatrix.needsUpdate = true
  })

  const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (e.instanceId !== undefined && visibleIdToStar.has(e.instanceId)) {
      setHoveredIdx(e.instanceId)
      document.body.style.cursor = 'pointer'
    }
  }, [visibleIdToStar])

  const handlePointerOut = useCallback(() => {
    setHoveredIdx(null)
    document.body.style.cursor = 'default'
  }, [])

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (e.instanceId !== undefined) {
      const star = visibleIdToStar.get(e.instanceId)
      if (star) onSelectStar(star)
    }
  }, [visibleIdToStar, onSelectStar])

  const tooltipStar = hoveredIdx !== null ? visibleIdToStar.get(hoveredIdx) || null : (selectedStar || null)

  if (maxCount === 0) return null

  return (
    <>
      <instancedMesh
        ref={coreRef}
        args={[coreSphere, undefined, maxCount]}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        frustumCulled={false}
      >
        <meshBasicMaterial toneMapped={false} transparent opacity={0.95} />
      </instancedMesh>

      <instancedMesh
        ref={glowRef}
        args={[glowSphere, undefined, maxCount]}
        raycast={() => null}
        frustumCulled={false}
      >
        <meshBasicMaterial
          toneMapped={false}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>

      {tooltipStar && (
        <group position={tooltipStar.position}>
          <Html
            center
            distanceFactor={15}
            style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
          >
            <div className="glass-panel-sm px-3 py-2 text-center" style={{ minWidth: 160 }}>
              <div className="text-xs font-medium text-white/90 mb-1 max-w-[200px] truncate">
                {tooltipStar.market.title}
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px]">
                <span className={`px-1.5 py-0.5 rounded-full platform-badge-${tooltipStar.market.platform}`}>
                  {getPlatformLabel(tooltipStar.market.platform)}
                </span>
                <span className="text-white font-mono font-bold">
                  {formatProbability(tooltipStar.market.outcomes[0]?.price || 0.5)}
                </span>
                <span className="text-white/50">
                  {formatVolume(tooltipStar.market.volume24h)}
                </span>
              </div>
            </div>
          </Html>
        </group>
      )}
    </>
  )
}
