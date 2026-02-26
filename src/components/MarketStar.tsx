'use client'
import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { StarData } from '@/lib/types'
import { formatProbability, formatVolume, getPlatformLabel } from '@/lib/constellation'

interface MarketStarProps {
  star: StarData
  onClick: (star: StarData) => void
  isSelected: boolean
  globalTime: number
}

// Shared geometries - created once, reused by all stars
const coreGeo = new THREE.SphereGeometry(1, 10, 10)
const hitGeo = new THREE.SphereGeometry(1, 6, 6)
const glowGeo = new THREE.SphereGeometry(1, 8, 8)

export default function MarketStar({ star, onClick, isSelected, globalTime }: MarketStarProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const color = useMemo(() => new THREE.Color(star.color), [star.color])
  const prob = star.market.outcomes[0]?.price || 0.5

  useFrame(() => {
    if (!groupRef.current) return

    // Orbit motion
    const t = globalTime * star.orbitSpeed
    groupRef.current.position.x = star.position[0] + Math.sin(t) * 0.5
    groupRef.current.position.y = star.position[1] + Math.cos(t * 1.3) * 0.3
    groupRef.current.position.z = star.position[2] + Math.sin(t * 0.7) * 0.4

    // Pulse for uncertain markets
    if (meshRef.current) {
      const uncertainty = 1 - Math.abs(prob - 0.5) * 2
      const pulse = 1 + Math.sin(globalTime * 0.003 * (1 + uncertainty * 3)) * 0.1 * uncertainty
      const targetScale = (hovered || isSelected) ? star.size * 1.8 : star.size * pulse
      const s = meshRef.current.scale.x
      const newS = s + (targetScale - s) * 0.1
      meshRef.current.scale.setScalar(newS)
    }

    // Glow pulse
    if (glowRef.current) {
      const glowPulse = 0.6 + Math.sin(globalTime * 0.004) * 0.2
      glowRef.current.scale.setScalar(star.size * 3 * glowPulse)
    }
  })

  return (
    <group ref={groupRef} position={star.position}>
      {/* Hit area */}
      <mesh
        geometry={hitGeo}
        scale={star.size * 3}
        onClick={(e) => { e.stopPropagation(); onClick(star) }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default' }}
      >
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Core */}
      <mesh ref={meshRef} geometry={coreGeo} scale={star.size}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={star.brightness * 2}
          toneMapped={false}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Glow */}
      <mesh ref={glowRef} geometry={glowGeo}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Tooltip - only when hovered/selected */}
      {(hovered || isSelected) && (
        <Html
          center
          distanceFactor={15}
          style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
        >
          <div className="glass-panel-sm px-3 py-2 text-center" style={{ minWidth: 160 }}>
            <div className="text-xs font-medium text-white/90 mb-1 max-w-[200px] truncate">
              {star.market.title}
            </div>
            <div className="flex items-center justify-center gap-2 text-[10px]">
              <span className={`px-1.5 py-0.5 rounded-full platform-badge-${star.market.platform}`}>
                {getPlatformLabel(star.market.platform)}
              </span>
              <span className="text-white font-mono font-bold">
                {formatProbability(prob)}
              </span>
              <span className="text-white/50">
                {formatVolume(star.market.volume24h)}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
