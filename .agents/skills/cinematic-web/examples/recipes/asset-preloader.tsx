"use client"

import { useGLTF, useTexture } from "@react-three/drei"

const modelPaths = ["/models/hero.glb", "/models/orbital-dashboard.glb"]
const texturePaths = ["/textures/noise.webp", "/textures/soft-ramp.webp"]

export function preloadCinematicAssets() {
  for (const path of modelPaths) {
    useGLTF.preload(path)
  }

  for (const path of texturePaths) {
    useTexture.preload(path)
  }
}

export function AssetPreloader() {
  preloadCinematicAssets()
  return null
}
