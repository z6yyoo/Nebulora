'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Market, Platform } from '@/lib/types'

const MAX_REASONABLE_SPREAD = 0.5
const ILLIQUID_ASK_THRESHOLD = 0.95
const LOW_PRICE_ASK_CEILING = 0.5
const VALID_PRICE_MIN = 0.001
const VALID_PRICE_MAX = 0.999

function getPolymarketPrice(m: Record<string, unknown>): number {
  const bid = m.bestBid as number | null
  const ask = m.bestAsk as number | null
  const spread = (bid != null && ask != null) ? ask - bid : 1

  if (bid != null && ask != null && spread < MAX_REASONABLE_SPREAD) {
    return (bid + ask) / 2
  }
  if (bid != null && bid > 0 && bid < 1) return bid
  if (ask != null && ask > 0 && ask < ILLIQUID_ASK_THRESHOLD) return ask
  if (ask != null && ask >= ILLIQUID_ASK_THRESHOLD && (bid == null || bid === 0)) return 0

  const rawPrices = m.outcomePrices as string | null
  if (rawPrices && rawPrices !== '[]') {
    try {
      const p = JSON.parse(rawPrices)
      const yesPrice = parseFloat(p[0] || '0')
      if (yesPrice > VALID_PRICE_MIN && yesPrice < VALID_PRICE_MAX) return yesPrice
    } catch { /* ignore */ }
  }
  if (bid === 0 && ask === 1) return 0
  if (ask != null && ask > 0 && ask < LOW_PRICE_ASK_CEILING) return ask
  return 0
}

async function fetchPolymarketViaProxy(limit: number, offset: number): Promise<Market[]> {
  const res = await fetch(
    `/api/polymarket?endpoint=events&active=true&closed=false&limit=${limit}&offset=${offset}&order=volume24hr&ascending=false`
  )
  if (!res.ok) throw new Error('Failed to fetch Polymarket data')
  const events = await res.json()
  if (!Array.isArray(events)) return []

  const markets: Market[] = []
  for (const event of events) {
    if (!event.markets || event.markets.length === 0) continue
    const hasOpenMarkets = event.markets.some((m: Record<string, unknown>) => !m.closed)
    if (!hasOpenMarkets) continue

    const primaryMarket = event.markets[0]
    let outcomes: { label: string; price: number; tokenId?: string }[] = []

    try {
      const labels = JSON.parse(primaryMarket.outcomes || '[]')
      const prices = JSON.parse(primaryMarket.outcomePrices || '[]')
      const tokens = JSON.parse(primaryMarket.clobTokenIds || '[]')

      if (event.markets.length > 1) {
        const activeSubMarkets = event.markets.filter((m: Record<string, unknown>) => !m.closed)
        const marketsToUse = activeSubMarkets.length > 0 ? activeSubMarkets : event.markets

        outcomes = marketsToUse.map((m: Record<string, unknown>) => {
          const t = JSON.parse((m.clobTokenIds as string) || '[]')
          const price = getPolymarketPrice(m)
          return {
            label: (m.groupItemTitle as string) || (m.question as string) || 'Option',
            price,
            tokenId: t[0] as string,
          }
        })
        const seen = new Map<string, number>()
        outcomes = outcomes.filter((o, i) => {
          const key = o.label
          if (seen.has(key)) {
            const prevIdx = seen.get(key)!
            if (outcomes[prevIdx].price === 0 && o.price > 0) outcomes[prevIdx] = o
            return false
          }
          seen.set(key, i)
          return true
        })
        outcomes.sort((a, b) => b.price - a.price)
      } else {
        outcomes = labels.map((label: string, i: number) => ({
          label,
          price: parseFloat(prices[i] || '0'),
          tokenId: tokens[i],
        }))
      }
    } catch {
      outcomes = [{ label: 'Yes', price: 0.5 }, { label: 'No', price: 0.5 }]
    }

    markets.push({
      id: String(event.id),
      platform: 'polymarket',
      title: event.title,
      description: event.description,
      imageUrl: event.image,
      url: `https://polymarket.com/event/${event.slug}`,
      outcomes,
      volume: event.volume || 0,
      volume24h: event.volume24hr || 0,
      liquidity: event.liquidity || 0,
      status: 'active',
      createdAt: event.startDate,
      endDate: event.endDate,
      slug: event.slug,
      extra: {
        conditionId: primaryMarket.conditionId,
        clobTokenIds: primaryMarket.clobTokenIds,
      },
    })
  }
  return markets
}

async function fetchKalshiViaProxy(limit: number, cursor?: string): Promise<{ markets: Market[]; cursor?: string }> {
  let url = `/api/kalshi?endpoint=events&status=open&limit=${limit}&with_nested_markets=true`
  if (cursor) url += `&cursor=${cursor}`

  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch Kalshi data')
  const data = await res.json()

  const markets: Market[] = []
  for (const event of data.events || []) {
    const eventMarkets = event.markets || []
    if (eventMarkets.length === 0) continue

    const primary = eventMarkets[0]
    let outcomes: { label: string; price: number; tokenId?: string }[]

    if (eventMarkets.length === 1) {
      const yesBid = primary.yes_bid_dollars ? parseFloat(primary.yes_bid_dollars) : (primary.yes_bid || 0) / 100
      const yesAsk = primary.yes_ask_dollars ? parseFloat(primary.yes_ask_dollars) : (primary.yes_ask || 0) / 100
      const yesPrice = (yesBid > 0 && yesAsk > 0) ? (yesBid + yesAsk) / 2 : (yesAsk || yesBid || 0.5)
      outcomes = [
        { label: 'Yes', price: yesPrice, tokenId: primary.ticker },
        { label: 'No', price: 1 - yesPrice, tokenId: primary.ticker },
      ]
    } else {
      outcomes = eventMarkets.slice(0, 10).map((m: Record<string, unknown>) => {
        const bid = m.yes_bid_dollars ? parseFloat(m.yes_bid_dollars as string) : ((m.yes_bid as number) || 0) / 100
        const ask = m.yes_ask_dollars ? parseFloat(m.yes_ask_dollars as string) : ((m.yes_ask as number) || 0) / 100
        const price = (bid > 0 && ask > 0) ? (bid + ask) / 2 : (ask || bid || 0)
        const label = (m.yes_sub_title as string) || (m.subtitle as string) || (m.title as string) || 'Option'
        return { label: label.length > 60 ? label.substring(0, 57) + '...' : label, price, tokenId: m.ticker as string }
      })
    }

    const totalVolume = eventMarkets.reduce((s: number, m: Record<string, unknown>) => s + ((m.volume as number) || 0), 0)

    markets.push({
      id: event.event_ticker,
      platform: 'kalshi',
      title: event.title + (event.sub_title ? ` - ${event.sub_title}` : ''),
      category: event.category,
      url: `https://kalshi.com/markets/${event.event_ticker}`,
      outcomes,
      volume: totalVolume,
      volume24h: eventMarkets.reduce((s: number, m: Record<string, unknown>) => s + ((m.volume_24h as number) || 0), 0),
      liquidity: eventMarkets.reduce((s: number, m: Record<string, unknown>) => s + (parseFloat((m.liquidity_dollars as string) || '0')), 0),
      status: 'active',
      endDate: primary.close_time,
      slug: event.event_ticker,
      extra: { seriesTicker: event.series_ticker, primaryTicker: primary.ticker },
    })
  }

  return { markets, cursor: data.cursor }
}

async function fetchOpinionViaProxy(limit: number, page: number): Promise<Market[]> {
  const res = await fetch(
    `/api/opinion?endpoint=topic&sortBy=5&chainId=56&limit=${limit}&status=2&isShow=1&topicType=2&page=${page}&indicatorType=0&excludePin=1`
  )
  if (!res.ok) throw new Error('Failed to fetch Opinion data')
  const data = await res.json()

  if (data.error) throw new Error(data.error)
  const items = data.result?.list || []
  if (!Array.isArray(items)) return []

  return items.map((topic: Record<string, unknown>) => {
    const children = (topic.childList || []) as Record<string, unknown>[]
    const outcomes: { label: string; price: number; tokenId?: string }[] = []

    if (children.length > 1) {
      for (const child of children.slice(0, 10)) {
        const yesBuy = parseFloat((child.yesBuyPrice as string) || '0')
        const noBuy = parseFloat((child.noBuyPrice as string) || '0')
        const price = yesBuy > 0 ? yesBuy : (noBuy > 0 ? 1 - noBuy : 0.5)
        outcomes.push({
          label: (child.title as string) || 'Option',
          price,
          tokenId: child.yesPos as string,
        })
      }
      outcomes.sort((a, b) => b.price - a.price)
    } else if (children.length === 1) {
      const child = children[0]
      const yesBuy = parseFloat((child.yesBuyPrice as string) || '0')
      const noBuy = parseFloat((child.noBuyPrice as string) || '0')
      const yesPrice = yesBuy > 0 ? yesBuy : (noBuy > 0 ? 1 - noBuy : 0.5)
      outcomes.push(
        { label: (child.yesLabel as string) || 'Yes', price: yesPrice, tokenId: child.yesPos as string },
        { label: (child.noLabel as string) || 'No', price: 1 - yesPrice, tokenId: child.noPos as string },
      )
    } else {
      const yesBuy = parseFloat((topic.yesBuyPrice as string) || '0')
      const noBuy = parseFloat((topic.noBuyPrice as string) || '0')
      const yesPrice = yesBuy > 0 ? yesBuy : (noBuy > 0 ? 1 - noBuy : 0.5)
      outcomes.push({ label: 'Yes', price: yesPrice }, { label: 'No', price: 1 - yesPrice })
    }

    const cutoffTime = topic.cutoffTime as number
    const endDate = cutoffTime ? new Date(cutoffTime * 1000).toISOString() : undefined
    const labels = (topic.labelName || []) as string[]

    return {
      id: String(topic.topicId),
      platform: 'opinion' as const,
      title: (topic.title as string) || (topic.titleShort as string) || '',
      description: (topic.abstract as string) || (topic.content as string) || '',
      category: labels.find((l: string) => l && l.trim()) || undefined,
      imageUrl: (topic.thumbnailUrl as string) || undefined,
      url: `https://app.opinion.trade/topic/${topic.topicId}`,
      outcomes,
      volume: parseFloat(String(topic.volume || 0)),
      volume24h: parseFloat(String(topic.volume24h || 0)),
      status: 'active' as const,
      endDate,
      slug: String(topic.topicId),
      extra: { chainId: topic.chainId, topicType: topic.topicType },
    }
  })
}

export function useMarkets(platform: Platform | 'all' = 'all') {
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchAll = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    const results: Market[] = []
    const errors: string[] = []

    const platforms: Platform[] = platform === 'all' ? ['polymarket', 'kalshi', 'opinion'] : [platform]

    const promises = platforms.map(async (p) => {
      try {
        switch (p) {
          case 'polymarket': {
            // Fetch more to filter later
            const page1 = await fetchPolymarketViaProxy(50, 0)
            const page2 = await fetchPolymarketViaProxy(50, 50)
            return [...page1, ...page2]
          }
          case 'kalshi': {
            // Fetch multiple pages via cursor
            const { markets: page1, cursor: c1 } = await fetchKalshiViaProxy(50)
            const { markets: page2 } = c1 ? await fetchKalshiViaProxy(50, c1) : { markets: [] }
            return [...page1, ...page2]
          }
          case 'opinion': {
            const page1 = await fetchOpinionViaProxy(20, 1)
            const page2 = await fetchOpinionViaProxy(20, 2)
            const page3 = await fetchOpinionViaProxy(20, 3)
            return [...page1, ...page2, ...page3]
          }
        }
      } catch (e) {
        errors.push(`${p}: ${e instanceof Error ? e.message : 'Unknown error'}`)
        return []
      }
    })

    const allResults = await Promise.allSettled(promises)

    if (controller.signal.aborted) return

    for (const r of allResults) {
      if (r.status === 'fulfilled' && r.value) {
        results.push(...r.value)
      }
    }

    // Filter: only active markets with leading probability between 5-95%
    // Prefer interesting markets (not resolved/certain)
    const filtered = results.filter(m => {
      if (m.status !== 'active') return false
      const leadPrice = m.outcomes[0]?.price ?? 0.5
      // Exclude near-certain (>95%) and near-zero (<5%) markets
      if (leadPrice > 0.95 || leadPrice < 0.05) return false
      return true
    })

    filtered.sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0))
    setMarkets(filtered)

    if (errors.length > 0 && results.length === 0) {
      setError(errors.join('; '))
    }

    setLoading(false)
  }, [platform])

  useEffect(() => {
    fetchAll()
    // Refresh every 60 seconds
    const interval = setInterval(fetchAll, 60000)
    return () => {
      clearInterval(interval)
      abortRef.current?.abort()
    }
  }, [fetchAll])

  return { markets, loading, error, refresh: fetchAll }
}
