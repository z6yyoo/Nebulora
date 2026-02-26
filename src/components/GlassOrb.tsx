'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { StarData } from '@/lib/types'

// 3D glass orb that appears when a market is selected
export default function GlassOrb({ star }: { star: StarData }) {
  const outerRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const ringRef = useRef<THREE.Mesh>(null)

  const color = new THREE.Color(star.color)
  const prob = star.market.outcomes[0]?.price || 0.5

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.3
      outerRef.current.rotation.x = Math.sin(t * 0.2) * 0.1
    }

    if (innerRef.current) {
      // Inner sphere scales with probability
      innerRef.current.scale.setScalar(0.3 + prob * 0.65)
      const mat = innerRef.current.material as THREE.MeshStandardMaterial
      mat.emissiveIntensity = 1 + Math.sin(t * 2) * 0.3
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5
      ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.3) * 0.1
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* Outer glass shell */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[2, 24, 24]} />
        <meshStandardMaterial
          color="#ffffff"
          metalness={0.1}
          roughness={0}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Inner energy core */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          toneMapped={false}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Orbital ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[2.3, 0.02, 6, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Second ring */}
      <mesh rotation={[Math.PI / 3, 0, Math.PI / 6]}>
        <torusGeometry args={[2.5, 0.015, 6, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Point light from core */}
      <pointLight color={color} intensity={3} distance={10} />
    </group>
  )
}
