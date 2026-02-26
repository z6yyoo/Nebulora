'use client'
import { useState } from 'react'
import { StarData } from '@/lib/types'
import { formatProbability, formatVolume, getPlatformLabel } from '@/lib/constellation'

interface MarketListProps {
  stars: StarData[]
  selectedStar: StarData | null
  onSelect: (star: StarData) => void
}

export default function MarketList({ stars, selectedStar, onSelect }: MarketListProps) {
  const [expanded, setExpanded] = useState(false)

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 glass-panel-sm px-4 py-2 text-xs text-white/50 hover:text-white/80 transition-colors"
      >
        ☰ Market List ({stars.length})
      </button>
    )
  }

  return (
    <div className="market-list absolute bottom-0 left-0 right-0 z-20 max-h-[40vh]">
      <div className="glass-panel mx-4 mb-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
          <span className="text-xs text-white/60 font-medium">
            Market List ({stars.length})
          </span>
          <button
            onClick={() => setExpanded(false)}
            className="text-white/30 hover:text-white/60 text-xs"
          >
            ✕
          </button>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto max-h-[35vh] px-2 py-1">
          {stars.map((star) => {
            const prob = star.market.outcomes[0]?.price || 0.5
            const isActive = selectedStar?.market.id === star.market.id
            return (
              <button
                key={`${star.market.platform}-${star.market.id}`}
                onClick={() => onSelect(star)}
                className={`w-full text-left px-3 py-2 rounded-lg mb-0.5 flex items-center gap-3 transition-all duration-150 ${
                  isActive
                    ? 'bg-white/10 border border-white/15'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* Platform dot */}
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: star.color }}
                />

                {/* Market info */}
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-white/80 truncate">
                    {star.market.title}
                  </div>
                  <div className="text-[9px] text-white/30">
                    {getPlatformLabel(star.market.platform)} • {formatVolume(star.market.volume24h)} 24h
                  </div>
                </div>

                {/* Probability */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-xs font-mono font-bold" style={{ color: star.color }}>
                    {formatProbability(prob)}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
