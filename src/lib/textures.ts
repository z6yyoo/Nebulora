import * as THREE from 'three'

// Generate a soft circular glow texture procedurally
export function createGlowTexture(size = 64): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const center = size / 2
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)')
  gradient.addColorStop(0.5, 'rgba(255,255,255,0.3)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// Generate a soft nebula particle texture
export function createNebulaTexture(size = 128): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const center = size / 2
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center)
  gradient.addColorStop(0, 'rgba(255,255,255,0.4)')
  gradient.addColorStop(0.3, 'rgba(255,255,255,0.15)')
  gradient.addColorStop(0.7, 'rgba(255,255,255,0.05)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}
