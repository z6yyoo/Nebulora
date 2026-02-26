'use client'
import { Platform } from '@/lib/types'
import { getPlatformLabel } from '@/lib/constellation'

interface HUDProps {
  totalMarkets: number
  platformCounts: Record<Platform, number>
  filter: Platform | 'all'
  onFilterChange: (f: Platform | 'all') => void
  searchQuery: string
  onSearchChange: (q: string) => void
  loading: boolean
  error: string | null
  onRefresh: () => void
  onShowAbout: () => void
}

export default function HUD({
  totalMarkets,
  platformCounts,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  loading,
  error,
  onRefresh,
  onShowAbout,
}: HUDProps) {
  const platforms: (Platform | 'all')[] = ['all', 'polymarket', 'kalshi', 'opinion']

  return (
    <>
      {/* Top-left: Title + Stats */}
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-semibold text-white/90 tracking-wide">
            Nebulora
          </h1>
          <button
            onClick={onShowAbout}
            className="w-5 h-5 rounded-full bg-white/5 border border-white/15 text-[10px] text-white/40 hover:bg-white/10 hover:text-white/70 transition-all flex items-center justify-center"
            title="About Nebulora"
          >
            ?
          </button>
        </div>
        <p className="text-xs text-white/40 mb-3">
          Prediction Market Observatory
        </p>

        {/* Platform filter pills */}
        <div className="flex gap-1.5 mb-3">
          {platforms.map(p => (
            <button
              key={p}
              onClick={() => onFilterChange(p)}
              className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-200 ${
                filter === p
                  ? p === 'all'
                    ? 'bg-white/20 text-white border border-white/30'
                    : `platform-badge-${p}`
                  : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10'
              }`}
            >
              {p === 'all' ? 'All' : getPlatformLabel(p)}
              <span className="ml-1 opacity-60">
                {p === 'all' ? totalMarkets : platformCounts[p]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search markets..."
            className="w-56 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/80 placeholder-white/30 outline-none focus:border-white/25 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Top-right: Status */}
      <div className="absolute top-4 right-4 z-10 text-right">
        <div className="glass-panel-sm px-3 py-2">
          <div className="flex items-center gap-2 text-[10px] text-white/50">
            <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : error ? 'bg-red-400' : 'bg-green-400'}`} />
            {loading ? 'Syncing...' : error ? 'Partial data' : 'Live'}
          </div>
          <div className="text-xs text-white/70 mt-1 font-mono">
            {totalMarkets} markets tracked
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="mt-1 text-[10px] text-white/30 hover:text-white/60 transition-colors disabled:opacity-30"
          >
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Bottom-left: Controls hint */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="text-[10px] text-white/20 space-y-0.5">
          <div>Drag to rotate • Scroll to zoom</div>
          <div>Click star for details • ESC to close</div>
        </div>
      </div>

      {/* Bottom-right: Legend */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="glass-panel-sm px-3 py-2 text-[10px] space-y-1">
          <div className="text-white/40 font-medium mb-1">Legend</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="text-white/50">Polymarket</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#A855F7]" />
            <span className="text-white/50">Kalshi</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#FACC15]" />
            <span className="text-white/50">Opinion</span>
          </div>
          <div className="text-white/30 mt-1 pt-1 border-t border-white/5">
            Size = Volume • Brightness = Certainty
          </div>
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div className="absolute top-16 right-4 z-20 glass-panel-sm px-3 py-2 text-[10px] text-yellow-300/80 max-w-xs">
          ⚠ {error}
        </div>
      )}
    </>
  )
}
