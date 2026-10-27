"use client"

import { shaderMaterial } from "@react-three/drei"
import { extend, useFrame } from "@react-three/fiber"
import { useMemo, useRef } from "react"
import type { RefObject } from "react"
import type { ShaderMaterial } from "three"

const GradientMaterial = shaderMaterial(
  { uTime: 0, uDepth: 0.62 },
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  `
  uniform float uTime;
  uniform float uDepth;
  varying vec2 vUv;

  void main() {
    float wave = sin((vUv.x + uTime * 0.04) * 6.28318) * 0.08;
    vec3 base = mix(vec3(0.05, 0.08, 0.12), vec3(0.36, 0.92, 0.82), vUv.y + wave);
    vec3 glow = vec3(0.62, 0.82, 1.0) * smoothstep(0.42, 0.92, vUv.x) * uDepth;
    gl_FragColor = vec4(base + glow, 1.0);
  }
  `,
)

extend({ GradientMaterial })

declare module "@react-three/fiber" {
  interface ThreeElements {
    gradientMaterial: {
      ref?: RefObject<ShaderMaterial | null>
      uTime?: number
      uDepth?: number
    }
  }
}

export function ShaderGradientPlane({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const materialRef = useRef<ShaderMaterial>(null)
  const args = useMemo(() => [6, 3.2, 64, 32] as const, [])

  useFrame((state) => {
    if (!materialRef.current || reducedMotion) return
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh position={[0, 0, -1.2]}>
      <planeGeometry args={args} />
      <gradientMaterial ref={materialRef} uDepth={0.62} />
    </mesh>
  )
}
