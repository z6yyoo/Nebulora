import type { Metadata } from 'next'
import './globals.css'
import SceneShell from '@/components/SceneShell'

export const metadata: Metadata = {
  title: 'Nebulora | Living Market Observatory',
  description: 'Immersive 3D visualization of global prediction markets from Polymarket, Kalshi, and Opinion',
  icons: {
    icon: [
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SceneShell />
        {children}
      </body>
    </html>
  )
}
