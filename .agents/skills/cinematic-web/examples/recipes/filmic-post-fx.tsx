"use client"

import {
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  Vignette,
} from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import { useReducedMotionPreference } from "./reduced-motion-provider"

export function FilmicPostFX() {
  const reducedMotion = useReducedMotionPreference()

  if (reducedMotion) return null

  return (
    <EffectComposer multisampling={0}>
      <DepthOfField focusDistance={0.035} focalLength={0.045} bokehScale={1.2} />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={[0.00045, 0.0003]}
      />
      <Vignette eskil={false} offset={0.2} darkness={0.38} />
    </EffectComposer>
  )
}
