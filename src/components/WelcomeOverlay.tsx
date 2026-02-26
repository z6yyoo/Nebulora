'use client'

interface WelcomeOverlayProps {
  onEnter: () => void
  marketsLoaded: number
  loading: boolean
}

export default function WelcomeOverlay({ onEnter, marketsLoaded, loading }: WelcomeOverlayProps) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      {/* Semi-transparent backdrop over the scene */}
      <div className="absolute inset-0 bg-[#050510]/70 backdrop-blur-[2px]" />

      <div className="relative z-10 text-center max-w-md mx-4">
        {/* Title */}
        <h1 className="text-4xl font-bold text-white/95 tracking-wider mb-2">
          Nebulora
        </h1>
        <p className="text-sm text-white/40 mb-8 tracking-wide">
          Prediction Market Observatory
        </p>

        {/* Description */}
        <p className="text-xs text-white/35 leading-relaxed mb-8 max-w-sm mx-auto">
          Explore live prediction markets from Polymarket, Kalshi, and Opinion Labs
          as a 3D constellation of stars. Each star is a real market — its size, brightness,
          and color reveal volume, certainty, and platform.
        </p>

        {/* Platform indicators */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-1.5 text-[11px] text-white/30">
            <div className="w-2 h-2 rounded-full bg-[#3B82F6]/70" />
            Polymarket
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/30">
            <div className="w-2 h-2 rounded-full bg-[#A855F7]/70" />
            Kalshi
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-white/30">
            <div className="w-2 h-2 rounded-full bg-[#FACC15]/70" />
            Opinion
          </div>
        </div>

        {/* Enter button */}
        <button
          onClick={onEnter}
          className="group relative px-8 py-3 rounded-full bg-white/[0.08] border border-white/15 text-sm text-white/80 font-medium tracking-wide hover:bg-white/[0.14] hover:border-white/25 hover:text-white transition-all duration-300"
        >
          <span className="relative z-10">
            {loading ? 'Loading markets...' : `Enter Observatory`}
          </span>
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-white/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

        {/* Market count */}
        {marketsLoaded > 0 && (
          <p className="mt-4 text-[10px] text-white/20 font-mono">
            {marketsLoaded} markets tracked
          </p>
        )}
      </div>
    </div>
  )
}
