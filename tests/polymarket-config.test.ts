import { describe, expect, it } from 'vitest'

import {
  isAllowedPolymarketReadEndpoint,
  normalizePolymarketQuery,
  POLYMARKET_CLOB_HOST,
  POLYMARKET_COLLATERAL_ASSET,
  POLYMARKET_DATA_HOST,
  POLYMARKET_GAMMA_HOST,
  resolvePolymarketHost,
} from '../src/lib/polymarket-config'

describe('polymarket config', () => {
  it('routes read-only endpoints to current public v2 hosts', () => {
    expect(resolvePolymarketHost('events')).toBe(POLYMARKET_GAMMA_HOST)
    expect(resolvePolymarketHost('trades')).toBe(POLYMARKET_DATA_HOST)
    expect(resolvePolymarketHost('price')).toBe(POLYMARKET_CLOB_HOST)
    expect(resolvePolymarketHost('prices-history')).toBe(POLYMARKET_CLOB_HOST)
    expect(resolvePolymarketHost('book')).toBe(POLYMARKET_CLOB_HOST)
  })

  it('allows public read-only endpoints and blocks trading/auth endpoints', () => {
    expect(isAllowedPolymarketReadEndpoint('markets/123')).toBe(true)
    expect(isAllowedPolymarketReadEndpoint('prices-history')).toBe(true)
    expect(isAllowedPolymarketReadEndpoint('order')).toBe(false)
    expect(isAllowedPolymarketReadEndpoint('orders')).toBe(false)
    expect(isAllowedPolymarketReadEndpoint('auth/api-key')).toBe(false)
    expect(isAllowedPolymarketReadEndpoint('../events')).toBe(false)
  })

  it('keeps pUSD as the displayed Polymarket collateral asset', () => {
    expect(POLYMARKET_COLLATERAL_ASSET).toBe('pUSD')
  })

  it('normalizes legacy token_id to market for prices-history', () => {
    const params = normalizePolymarketQuery('prices-history', new URLSearchParams({ token_id: 'token-1' }))

    expect(params.get('market')).toBe('token-1')
    expect(params.has('token_id')).toBe(false)
  })
})
