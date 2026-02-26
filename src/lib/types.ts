export type Platform = 'polymarket' | 'kalshi' | 'opinion'

export interface Outcome {
  label: string
  price: number
  tokenId?: string
}

export interface Market {
  id: string
  platform: Platform
  title: string
  description?: string
  category?: string
  imageUrl?: string
  url: string
  outcomes: Outcome[]
  volume: number
  volume24h: number
  liquidity?: number
  status: 'active' | 'closed' | 'resolved'
  createdAt?: string
  endDate?: string
  slug?: string
  extra?: Record<string, unknown>
}

export interface PriceHistory {
  timestamp: number
  price: number
}

export interface OrderBookEntry {
  price: number
  size: number
}

export interface OrderBook {
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
}

export interface Trade {
  id?: string
  price: number
  size: number
  side: 'buy' | 'sell'
  timestamp: number
  outcome?: string
}

// 3D constellation types
export interface StarData {
  market: Market
  position: [number, number, number]
  orbitRadius: number
  orbitSpeed: number
  size: number
  color: string
  brightness: number
  particleCount: number
  category: string
}

export type CategoryColors = Record<string, string>

export const PLATFORM_COLORS: Record<Platform, string> = {
  polymarket: '#3B82F6',
  kalshi: '#A855F7',
  opinion: '#FACC15',
}

export const CATEGORY_ORBIT_COLORS: CategoryColors = {
  politics: '#4488ff',
  crypto: '#ffaa00',
  sports: '#44ff88',
  science: '#ff44aa',
  economics: '#ff4444',
  entertainment: '#aa44ff',
  default: '#6688cc',
}
