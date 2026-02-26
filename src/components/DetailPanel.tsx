'use client'
import { StarData } from '@/lib/types'
import { formatProbability, formatVolume, getPlatformLabel } from '@/lib/constellation'

interface DetailPanelProps {
  star: StarData
  onClose: () => void
}

export default function DetailPanel({ star, onClose }: DetailPanelProps) {
  const market = star.market
  const prob = market.outcomes[0]?.price || 0.5

  return (
    <div className="detail-panel absolute top-1/2 right-4 -translate-y-1/2 z-20 w-80 max-h-[80vh] overflow-y-auto">
      <div className="glass-panel p-5">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/30 hover:text-white/70 transition-colors text-sm"
        >
          ✕
        </button>

        {/* Platform badge */}
        <div className="mb-3">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium platform-badge-${market.platform}`}>
            {getPlatformLabel(market.platform)}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-sm font-semibold text-white/90 mb-3 pr-6 leading-tight">
          {market.title}
        </h2>

        {/* Main probability */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-bold font-mono" style={{ color: star.color }}>
              {formatProbability(prob)}
            </span>
            <span className="text-xs text-white/40">
              {market.outcomes[0]?.label || 'Yes'}
            </span>
          </div>

          {/* Probability bar */}
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${prob * 100}%`,
                background: `linear-gradient(90deg, ${star.color}88, ${star.color})`,
              }}
            />
          </div>
        </div>

        {/* Outcomes */}
        <div className="mb-4">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Outcomes</div>
          <div className="space-y-1.5">
            {market.outcomes.slice(0, 8).map((outcome, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs text-white/70 truncate max-w-[180px]">
                  {outcome.label}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${outcome.price * 100}%`,
                        backgroundColor: star.color,
                        opacity: 0.6 + outcome.price * 0.4,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-white/60 w-10 text-right">
                    {formatProbability(outcome.price)}
                  </span>
                </div>
              </div>
            ))}
            {market.outcomes.length > 8 && (
              <div className="text-[10px] text-white/30 text-center">
                +{market.outcomes.length - 8} more
              </div>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="glass-panel-sm p-2">
            <div className="text-[10px] text-white/40">24h Volume</div>
            <div className="text-sm font-mono text-white/80">{formatVolume(market.volume24h)}</div>
          </div>
          <div className="glass-panel-sm p-2">
            <div className="text-[10px] text-white/40">Total Volume</div>
            <div className="text-sm font-mono text-white/80">{formatVolume(market.volume)}</div>
          </div>
          {market.liquidity != null && market.liquidity > 0 && (
            <div className="glass-panel-sm p-2">
              <div className="text-[10px] text-white/40">Liquidity</div>
              <div className="text-sm font-mono text-white/80">{formatVolume(market.liquidity)}</div>
            </div>
          )}
          {market.endDate && (
            <div className="glass-panel-sm p-2">
              <div className="text-[10px] text-white/40">Ends</div>
              <div className="text-xs text-white/80">
                {new Date(market.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {market.description && (
          <div className="mb-4">
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Description</div>
            <p className="text-xs text-white/50 leading-relaxed line-clamp-4">
              {market.description}
            </p>
          </div>
        )}

        {/* Constellation data */}
        <div className="mb-4">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Constellation Data</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
            <div className="text-white/30">Orbit radius</div>
            <div className="text-white/60 font-mono">{star.orbitRadius.toFixed(1)}</div>
            <div className="text-white/30">Orbit speed</div>
            <div className="text-white/60 font-mono">{(star.orbitSpeed * 1000).toFixed(1)}x</div>
            <div className="text-white/30">Brightness</div>
            <div className="text-white/60 font-mono">{(star.brightness * 100).toFixed(0)}%</div>
            <div className="text-white/30">Category</div>
            <div className="text-white/60 capitalize">{star.category}</div>
          </div>
        </div>

        {/* Link to platform */}
        <a
          href={market.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:brightness-110"
          style={{
            background: `${star.color}20`,
            border: `1px solid ${star.color}40`,
            color: star.color,
          }}
        >
          View on {getPlatformLabel(market.platform)} ↗
        </a>
      </div>
    </div>
  )
}
