export default function SceneLoader() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-[#050510] relative overflow-hidden">
      {/* Animated background dots */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${(i * 37 + 13) % 100}%`,
              top: `${(i * 53 + 7) % 100}%`,
              animationDelay: `${(i * 0.1) % 3}s`,
              animationDuration: `${2 + (i * 0.1) % 3}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center z-10">
        {/* Orbital loader */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-spin" style={{ animationDuration: '3s' }} />
          <div className="absolute inset-2 rounded-full border border-purple-400/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
          <div className="absolute inset-4 rounded-full border border-yellow-400/20 animate-spin" style={{ animationDuration: '1.5s' }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" />
          </div>
        </div>

        <h1 className="text-xl font-semibold text-white/90 tracking-wide mb-1">
          Nebulora
        </h1>
        <p className="text-xs text-white/30 tracking-wider">
          Initializing Nebulora...
        </p>

        {/* Platform indicators */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-[10px] text-white/25">
            <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]/50" />
            Polymarket
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/25">
            <div className="w-1.5 h-1.5 rounded-full bg-[#A855F7]/50" />
            Kalshi
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-white/25">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FACC15]/50" />
            Opinion
          </div>
        </div>
      </div>
    </div>
  )
}
