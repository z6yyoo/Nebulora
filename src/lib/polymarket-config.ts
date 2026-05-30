export const POLYMARKET_GAMMA_HOST = 'https://gamma-api.polymarket.com'
export const POLYMARKET_DATA_HOST = 'https://data-api.polymarket.com'
export const POLYMARKET_CLOB_HOST = 'https://clob.polymarket.com'

export const POLYMARKET_COLLATERAL_ASSET = 'pUSD' as const
export type PolymarketCollateralAsset = typeof POLYMARKET_COLLATERAL_ASSET

export const POLYMARKET_REQUEST_TIMEOUT_MS = 10_000

const GAMMA_ENDPOINTS = ['events', 'markets'] as const
const DATA_ENDPOINTS = ['trades', 'positions', 'closed-positions'] as const
const CLOB_READ_ENDPOINTS = [
  'book',
  'books',
  'price',
  'prices',
  'prices-history',
  'midpoint',
  'midpoints',
  'last-trade-price',
  'markets-by-token',
] as const

export const POLYMARKET_READ_ONLY_ENDPOINTS = [
  ...GAMMA_ENDPOINTS,
  ...DATA_ENDPOINTS,
  ...CLOB_READ_ENDPOINTS,
] as const

type PolymarketReadOnlyEndpoint = (typeof POLYMARKET_READ_ONLY_ENDPOINTS)[number]

function getEndpointRoot(endpoint: string): string {
  return endpoint.replace(/^\/+/, '').split('/')[0] ?? ''
}

function hasBlockedPathPattern(endpoint: string): boolean {
  const normalized = endpoint.trim().toLowerCase()
  return (
    normalized.length === 0 ||
    normalized.includes('..') ||
    normalized.includes('\\') ||
    normalized.includes('%2e') ||
    normalized.includes('%2f')
  )
}

export function isAllowedPolymarketReadEndpoint(endpoint: string): boolean {
  if (hasBlockedPathPattern(endpoint)) return false

  const root = getEndpointRoot(endpoint)
  return POLYMARKET_READ_ONLY_ENDPOINTS.includes(root as PolymarketReadOnlyEndpoint)
}

export function resolvePolymarketHost(endpoint: string): string {
  const root = getEndpointRoot(endpoint)

  if (GAMMA_ENDPOINTS.includes(root as (typeof GAMMA_ENDPOINTS)[number])) {
    return POLYMARKET_GAMMA_HOST
  }

  if (DATA_ENDPOINTS.includes(root as (typeof DATA_ENDPOINTS)[number])) {
    return POLYMARKET_DATA_HOST
  }

  if (CLOB_READ_ENDPOINTS.includes(root as (typeof CLOB_READ_ENDPOINTS)[number])) {
    return POLYMARKET_CLOB_HOST
  }

  throw new Error(`Unsupported Polymarket endpoint: ${endpoint}`)
}

export function normalizePolymarketQuery(endpoint: string, params: URLSearchParams): URLSearchParams {
  const normalized = new URLSearchParams(params)

  if (getEndpointRoot(endpoint) === 'prices-history' && normalized.has('token_id') && !normalized.has('market')) {
    normalized.set('market', normalized.get('token_id') ?? '')
    normalized.delete('token_id')
  }

  return normalized
}
