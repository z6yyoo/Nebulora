'use client'
import dynamic from 'next/dynamic'
import SceneLoader from '@/components/SceneLoader'

const ConstellationScene = dynamic(
  () => import('@/components/ConstellationScene'),
  { ssr: false, loading: () => <SceneLoader /> }
)

export default function SceneShell() {
  return (
    <main className="fixed inset-0 w-full h-screen overflow-hidden">
      <ConstellationScene />
    </main>
  )
}
