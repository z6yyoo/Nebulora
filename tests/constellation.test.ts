import { describe, expect, it } from 'vitest'

import { formatVolume } from '../src/lib/constellation'

describe('formatVolume', () => {
  it('keeps generic markets in dollar display', () => {
    expect(formatVolume(500)).toBe('$500')
    expect(formatVolume(12_400)).toBe('$12K')
    expect(formatVolume(1_200_000)).toBe('$1.2M')
  })

  it('uses pUSD wording for Polymarket displayed volume', () => {
    expect(formatVolume(500, 'pUSD')).toBe('500 pUSD')
    expect(formatVolume(12_400, 'pUSD')).toBe('12K pUSD')
    expect(formatVolume(1_200_000, 'pUSD')).toBe('1.2M pUSD')
  })
})
