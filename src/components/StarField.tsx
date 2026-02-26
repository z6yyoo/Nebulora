'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createGlowTexture } from '@/lib/textures'

export default function StarField({ count = 3000 }: { count?: number }) {
  const meshRef = useRef<THREE.Points>(null)

  const texture = useMemo(() => createGlowTexture(64), [])

  const [positions, sizes, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    const col = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const r = 50 + Math.random() * 150
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)

      sz[i] = 0.5 + Math.random() * 2

      const temp = Math.random()
      col[i * 3] = 0.7 + temp * 0.3
      col[i * 3 + 1] = 0.7 + temp * 0.2
      col[i * 3 + 2] = 0.8 + (1 - temp) * 0.2
    }

    return [pos, sz, col]
  }, [count])

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.008
      meshRef.current.rotation.x += delta * 0.003
    }
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={1.5}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}
