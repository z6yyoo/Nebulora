'use client'
import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { StarData, Platform } from '@/lib/types'
import { marketsToStars } from '@/lib/constellation'
import { useMarkets } from '@/hooks/useMarkets'
import StarField from './StarField'
import NebulaBg from './NebulaBg'
import InstancedStars from './InstancedStars'
import GlassOrb from './GlassOrb'
import ConstellationLines from './ConstellationLines'
import DetailPanel from './DetailPanel'
import MarketList from './MarketList'
import HUD from './HUD'
import AboutOverlay from './AboutOverlay'
import WelcomeOverlay from './WelcomeOverlay'

const ROUTE_TO_PLATFORM: Record<string, Platform | 'all'> = {
  '/': 'all',
  '/p': 'polymarket',
  '/k': 'kalshi',
  '/o': 'opinion',
}

function CameraController({ target, active }: { target: [number, number, number] | null; active: boolean }) {
  const { camera } = useThree()
  const targetPos = useRef<THREE.Vector3 | null>(null)
  const returning = useRef(false)

  useFrame(() => {
    if (active && target) {
      const dest = new THREE.Vector3(target[0] * 0.3, target[1] * 0.3, target[2] * 0.3 + 8)
      if (!targetPos.current) targetPos.current = camera.position.clone()
      targetPos.current.lerp(dest, 0.02)
      camera.position.lerp(targetPos.current, 0.05)
      returning.current = true
    } else if (returning.current) {
      returning.current = false
      targetPos.current = null
    }
  })

  return null
}

function SceneContent({
  stars,
  allStars,
  selectedStar,
  onSelectStar,
}: {
  stars: StarData[]
  allStars: StarData[]
  selectedStar: StarData | null
  onSelectStar: (star: StarData | null) => void
}) {
  return (
    <>
      {/* Minimal lighting - only for GlassOrb */}
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={0.3} color="#4466aa" />

      {/* Background */}
      <StarField count={800} />
      <NebulaBg />
      <Stars radius={200} depth={100} count={400} factor={3} saturation={0.3} fade speed={0.5} />

      {/* Constellation lines - 1 draw call */}
      <ConstellationLines stars={stars} />

      {/* All market stars - pre-allocated instanced meshes */}
      <InstancedStars
        stars={stars}
        allStars={allStars}
        selectedStar={selectedStar}
        onSelectStar={onSelectStar}
      />

      {/* Glass orb for selected */}
      {selectedStar && <GlassOrb star={selectedStar} />}

      <CameraController
        target={selectedStar?.position || null}
        active={!!selectedStar}
      />
    </>
  )
}

export default function ConstellationScene() {
  const pathname = usePathname()
  const router = useRouter()
  const [selectedStar, setSelectedStar] = useState<StarData | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAbout, setShowAbout] = useState(false)
  const [entered, setEntered] = useState(false)

  // Derive filter from URL path
  const filter = ROUTE_TO_PLATFORM[pathname] || 'all'

  // Show welcome overlay only on first visit to /
  const showWelcome = pathname === '/' && !entered

  const handleFilterChange = useCallback((f: Platform | 'all') => {
    const routes: Record<Platform | 'all', string> = {
      all: '/',
      polymarket: '/p',
      kalshi: '/k',
      opinion: '/o',
    }
    router.push(routes[f])
  }, [router])

  const handleEnter = useCallback(() => {
    setEntered(true)
  }, [])

  // Auto-enter if navigating directly to a platform route
  useEffect(() => {
    if (pathname !== '/') setEntered(true)
  }, [pathname])

  const { markets, loading, error, refresh } = useMarkets('all')

  // Compute ALL star positions once from full market list (stable positions)
  const allStars = useMemo(() => marketsToStars(markets), [markets])

  // Filter visible stars by platform and search, preserving positions
  const stars = useMemo(() => {
    return allStars.filter(s => {
      if (filter !== 'all' && s.market.platform !== filter) return false
      if (searchQuery && !s.market.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [allStars, filter, searchQuery])

  const handleSelectStar = useCallback((star: StarData | null) => {
    setSelectedStar(prev => {
      if (prev?.market.id === star?.market.id) return null
      return star
    })
  }, [])

  const handleClose = useCallback(() => {
    setSelectedStar(null)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showAbout) setShowAbout(false)
        else setSelectedStar(null)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [showAbout])

  const platformCounts = useMemo(() => ({
    polymarket: markets.filter(m => m.platform === 'polymarket').length,
    kalshi: markets.filter(m => m.platform === 'kalshi').length,
    opinion: markets.filter(m => m.platform === 'opinion').length,
  }), [markets])

  return (
    <div className="w-full h-full relative">
      <Canvas
        style={{ background: '#050510' }}
        gl={{
          antialias: false,
          alpha: false,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
        dpr={[1, 1]}
        raycaster={{ params: { Points: { threshold: 0.5 }, Mesh: {}, Line: { threshold: 1 }, LOD: {}, Sprite: {} } }}
      >
        <PerspectiveCamera makeDefault position={[0, 2, 35]} fov={60} near={0.1} far={500} />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          autoRotate={false}
          minDistance={5}
          maxDistance={100}
          dampingFactor={0.12}
          enableDamping
          rotateSpeed={0.5}
          zoomSpeed={0.8}
        />
        <SceneContent
          stars={stars}
          allStars={allStars}
          selectedStar={selectedStar}
          onSelectStar={handleSelectStar}
        />
      </Canvas>

      {!showWelcome && (
        <HUD
          totalMarkets={markets.length}
          platformCounts={platformCounts}
          filter={filter}
          onFilterChange={handleFilterChange}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loading}
          error={error}
          onRefresh={refresh}
          onShowAbout={() => setShowAbout(true)}
        />
      )}

      {showAbout && <AboutOverlay onClose={() => setShowAbout(false)} />}

      {showWelcome && (
        <WelcomeOverlay
          onEnter={handleEnter}
          marketsLoaded={markets.length}
          loading={loading}
        />
      )}

      {selectedStar && (
        <DetailPanel star={selectedStar} onClose={handleClose} />
      )}

      <MarketList
        stars={stars}
        selectedStar={selectedStar}
        onSelect={handleSelectStar}
      />
    </div>
  )
}
