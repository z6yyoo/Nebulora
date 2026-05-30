import { afterEach, describe, expect, it } from 'vitest'

import {
  getTradingRuntimeConfig,
  parseRealTradingFlag,
  postRealOrderNoop,
  RealTradingDisabledError,
  REAL_TRADING_ENV_KEY,
} from '../src/lib/trading-config'

describe('trading config', () => {
  const originalFlag = process.env[REAL_TRADING_ENV_KEY]

  afterEach(() => {
    if (originalFlag == null) {
      delete process.env[REAL_TRADING_ENV_KEY]
    } else {
      process.env[REAL_TRADING_ENV_KEY] = originalFlag
    }
  })

  it('defaults real trading to disabled', () => {
    delete process.env[REAL_TRADING_ENV_KEY]

    expect(parseRealTradingFlag(undefined)).toBe(false)
    expect(getTradingRuntimeConfig()).toMatchObject({
      realTradingEnabled: false,
      mode: 'read-only-noop',
      collateralAsset: 'pUSD',
      builderCode: null,
    })
  })

  it('keeps the money path as a no-op that cannot post an order', async () => {
    await expect(postRealOrderNoop({
      tokenId: 'token-1',
      side: 'BUY',
      amountPusd: 10,
      price: 0.42,
      idempotencyKey: 'intent-1',
    })).rejects.toBeInstanceOf(RealTradingDisabledError)
  })
})
