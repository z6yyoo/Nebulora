import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { GET } from '../src/app/api/polymarket/route'
import {
  POLYMARKET_CLOB_HOST,
  POLYMARKET_DATA_HOST,
  POLYMARKET_REQUEST_TIMEOUT_MS,
} from '../src/lib/polymarket-config'

function request(query: string): NextRequest {
  return new NextRequest(`http://localhost/api/polymarket?${query}`)
}

describe('polymarket proxy route', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('fetches CLOB prices-history with the v2 market query parameter', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ history: [] })))

    const response = await GET(request('endpoint=prices-history&token_id=token-1'))

    expect(response.status).toBe(200)
    expect(fetch).toHaveBeenCalledWith(
      `${POLYMARKET_CLOB_HOST}/prices-history?market=token-1`,
      expect.objectContaining({ next: { revalidate: 30 } }),
    )
  })

  it('fetches Data API read-only endpoints from the current public host', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify([])))

    const response = await GET(request('endpoint=trades&limit=10'))

    expect(response.status).toBe(200)
    expect(fetch).toHaveBeenCalledWith(
      `${POLYMARKET_DATA_HOST}/trades?limit=10`,
      expect.objectContaining({ next: { revalidate: 30 } }),
    )
  })

  it('rejects trading endpoints before fetch is called', async () => {
    const response = await GET(request('endpoint=order'))

    expect(response.status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns a server error when the upstream fetch fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('network down'))

    const response = await GET(request('endpoint=price&token_id=token-1&side=BUY'))
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('network down')
  })

  it('returns a gateway timeout when the upstream request exceeds the guard timer', async () => {
    vi.useFakeTimers()
    vi.mocked(fetch).mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      const signal = init?.signal
      if (signal instanceof AbortSignal) {
        signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      }
    }))

    const responsePromise = GET(request('endpoint=book&token_id=token-1'))
    await vi.advanceTimersByTimeAsync(POLYMARKET_REQUEST_TIMEOUT_MS)
    const response = await responsePromise

    expect(response.status).toBe(504)
  })
})
