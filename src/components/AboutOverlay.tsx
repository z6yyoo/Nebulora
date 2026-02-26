'use client'

interface AboutOverlayProps {
  onClose: () => void
}

export default function AboutOverlay({ onClose }: AboutOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-[#0a0a1a]/90 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Decorative top gradient */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-white/90 tracking-wide">
                Nebulora
              </h2>
              <p className="text-xs text-white/40 mt-0.5">
                Prediction Market Observatory
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:bg-white/10 hover:text-white/70 transition-all flex items-center justify-center text-sm"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 text-xs text-white/60 leading-relaxed">
            <p>
              Nebulora visualizes live prediction markets as a 3D star constellation.
              Each star represents a real market — its <span className="text-white/80">size reflects trading volume</span>,
              its <span className="text-white/80">brightness reflects price certainty</span>,
              and its <span className="text-white/80">color indicates the platform</span>.
            </p>

            {/* Platforms */}
            <div className="space-y-2">
              <h3 className="text-[11px] text-white/50 font-medium">Data Sources</h3>
              <div className="grid gap-2">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-white/70 font-medium">Polymarket</div>
                    <div className="text-white/40 mt-0.5">Crypto-native prediction market on Polygon. Binary and multi-outcome markets across politics, crypto, sports, and more.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#A855F7] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-white/70 font-medium">Kalshi</div>
                    <div className="text-white/40 mt-0.5">US-regulated event contracts exchange. CFTC-regulated markets on economics, politics, weather, and world events.</div>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FACC15] mt-0.5 shrink-0" />
                  <div>
                    <div className="text-white/70 font-medium">Opinion Labs</div>
                    <div className="text-white/40 mt-0.5">Mobile-first opinion trading platform. Community-driven markets on trending topics and current events.</div>
                  </div>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="space-y-2">
              <h3 className="text-[11px] text-white/50 font-medium">How It Works</h3>
              <div className="space-y-1.5 text-white/40">
                <div className="flex items-center gap-2">
                  <span className="text-white/20">-</span>
                  Stars are positioned by category, forming natural clusters
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/20">-</span>
                  Constellation lines connect nearby markets
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/20">-</span>
                  Click any star to see market details, price history, and order book
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/20">-</span>
                  Filter by platform using tabs or navigate to /p, /k, /o
                </div>
              </div>
            </div>

            {/* Theme */}
            <div className="pt-3 border-t border-white/5 text-white/30 text-[10px]">
              Markets are uncertain. Stars are distant. Both emit signals we try to interpret.
              Nebulora maps the collective uncertainty of prediction markets into a cosmic
              visualization — a nebula of speculation and probability.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
