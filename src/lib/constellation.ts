import { Market, StarData, PLATFORM_COLORS } from './types'

// Convert market data to 3D star positioning
export function marketsToStars(markets: Market[]): StarData[] {
  const maxVolume = Math.max(...markets.map(m => m.volume24h || 1), 1)

  return markets.map((market, i) => {
    const prob = market.outcomes[0]?.price || 0.5
    const volumeNorm = Math.min((market.volume24h || 0) / maxVolume, 1)

    // Orbit radius based on probability distance from 50% (uncertain = outer, certain = inner)
    const certainty = Math.abs(prob - 0.5) * 2 // 0 = uncertain, 1 = certain
    const orbitRadius = 8 + (1 - certainty) * 18 // 8..26

    // Spread stars in a sphere using golden ratio
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    const theta = goldenAngle * i
    const phi = Math.acos(1 - 2 * (i + 0.5) / Math.max(markets.length, 1))

    const x = orbitRadius * Math.sin(phi) * Math.cos(theta)
    const y = orbitRadius * Math.sin(phi) * Math.sin(theta) * 0.6 // Flatten to ellipsoid
    const z = orbitRadius * Math.cos(phi)

    // Star size based on volume (bigger = more volume)
    const size = 0.15 + volumeNorm * 0.6

    // Orbit speed: uncertain markets orbit slowly, certain ones faster
    const orbitSpeed = 0.002 + certainty * 0.008

    // Brightness: high probability = bright, 50% = dim pulse
    const brightness = 0.3 + certainty * 0.7

    // Particle count based on volume
    const particleCount = Math.floor(3 + volumeNorm * 15)

    // Color based on platform
    const color = PLATFORM_COLORS[market.platform]

    // Determine category for orbit color grouping
    const cat = (market.category || '').toLowerCase()
    let category = 'default'
    if (cat.includes('politic') || cat.includes('election') || cat.includes('government')) category = 'politics'
    else if (cat.includes('crypto') || cat.includes('bitcoin') || cat.includes('token')) category = 'crypto'
    else if (cat.includes('sport') || cat.includes('nba') || cat.includes('nfl')) category = 'sports'
    else if (cat.includes('science') || cat.includes('climate') || cat.includes('tech')) category = 'science'
    else if (cat.includes('econ') || cat.includes('finance') || cat.includes('fed') || cat.includes('gdp')) category = 'economics'
    else if (cat.includes('entertain') || cat.includes('movie') || cat.includes('music')) category = 'entertainment'

    return {
      market,
      position: [x, y, z] as [number, number, number],
      orbitRadius,
      orbitSpeed,
      size,
      color,
      brightness,
      particleCount,
      category,
    }
  })
}

export function formatProbability(price: number): string {
  return `${Math.round(price * 100)}%`
}

export function formatVolume(vol: number): string {
  if (vol >= 1_000_000) return `$${(vol / 1_000_000).toFixed(1)}M`
  if (vol >= 1_000) return `$${(vol / 1_000).toFixed(0)}K`
  return `$${vol.toFixed(0)}`
}

export function getPlatformLabel(platform: string): string {
  switch (platform) {
    case 'polymarket': return 'Polymarket'
    case 'kalshi': return 'Kalshi'
    case 'opinion': return 'Opinion'
    default: return platform
  }
}
