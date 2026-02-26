'use client'
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { createNebulaTexture } from '@/lib/textures'

export default function NebulaBg() {
  const ref = useRef<THREE.Points>(null)

  const texture = useMemo(() => createNebulaTexture(128), [])

  const [positions, colors, sizes] = useMemo(() => {
    const count = 200
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const sz = new Float32Array(count)

    const nebulaColors = [
      [0.15, 0.1, 0.4],
      [0.1, 0.15, 0.5],
      [0.2, 0.05, 0.3],
      [0.05, 0.2, 0.3],
    ]

    for (let i = 0; i < count; i++) {
      const r = 30 + Math.random() * 100
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.4
      pos[i * 3 + 2] = r * Math.cos(phi)

      const c = nebulaColors[Math.floor(Math.random() * nebulaColors.length)]
      col[i * 3] = c[0] + Math.random() * 0.1
      col[i * 3 + 1] = c[1] + Math.random() * 0.1
      col[i * 3 + 2] = c[2] + Math.random() * 0.1

      sz[i] = 8 + Math.random() * 20
    }

    return [pos, col, sz]
  }, [])

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.005
      ref.current.rotation.x += delta * 0.002
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        map={texture}
        size={20}
        vertexColors
        transparent
        opacity={0.12}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}
