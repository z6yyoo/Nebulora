import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.polymarket.com' },
      { protocol: 'https', hostname: '**.kalshi.com' },
      { protocol: 'https', hostname: '**.opinion.trade' },
    ],
  },
}

export default nextConfig
