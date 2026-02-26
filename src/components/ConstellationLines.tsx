'use client'
import { useMemo } from 'react'
import * as THREE from 'three'
import { StarData } from '@/lib/types'

// Connect nearby stars of the same platform with faint lines - single draw call
export default function ConstellationLines({ stars }: { stars: StarData[] }) {
  const { positions, colors } = useMemo(() => {
    const posArray: number[] = []
    const colArray: number[] = []

    // Group by platform
    const grouped: Record<string, StarData[]> = {}
    for (const star of stars) {
      const key = star.market.platform
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(star)
    }

    const tempColor = new THREE.Color()

    for (const [, group] of Object.entries(grouped)) {
      const maxDist = 12
      const connected = new Set<string>()

      for (let i = 0; i < group.length; i++) {
        const distances: { j: number; dist: number }[] = []
        for (let j = 0; j < group.length; j++) {
          if (i === j) continue
          const a = group[i].position
          const b = group[j].position
          const dist = Math.sqrt(
            (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
          )
          if (dist < maxDist) distances.push({ j, dist })
        }

        distances.sort((a, b) => a.dist - b.dist)
        for (const { j } of distances.slice(0, 2)) {
          const key = [Math.min(i, j), Math.max(i, j)].join('-')
          if (connected.has(key)) continue
          connected.add(key)

          tempColor.set(group[i].color)
          const a = group[i].position
          const b = group[j].position

          posArray.push(a[0], a[1], a[2], b[0], b[1], b[2])
          colArray.push(tempColor.r, tempColor.g, tempColor.b, tempColor.r, tempColor.g, tempColor.b)
        }
      }
    }

    return {
      positions: new Float32Array(posArray),
      colors: new Float32Array(colArray),
    }
  }, [stars])

  if (positions.length === 0) return null

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.08}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  )
}
