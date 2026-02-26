import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        cosmos: {
          bg: '#050510',
          card: 'rgba(15, 15, 40, 0.8)',
          border: 'rgba(100, 100, 255, 0.15)',
          glow: 'rgba(100, 150, 255, 0.3)',
        },
        platform: {
          polymarket: '#7B3FE4',
          kalshi: '#00D4AA',
          opinion: '#FF6B35',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

export default config
