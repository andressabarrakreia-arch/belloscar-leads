"use client"

import { EffectComposer, SelectiveBloom, Vignette } from "@react-three/postprocessing"
import { useCallback, useRef, useState } from "react"
import type { Mesh, PointLight } from "three"

export function SelectiveBloomScene() {
  const lightRef = useRef<PointLight>(null)
  const [selection, setSelection] = useState<Mesh[]>([])
  const registerBloomMesh = useCallback((node: Mesh | null) => {
    if (!node) return
    setSelection((current) => (current.includes(node) ? current : [node]))
  }, [])

  return (
    <>
      <pointLight ref={lightRef} position={[2, 2, 4]} intensity={36} />
      <mesh position={[-0.9, 0, 0]}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="#f7f2e8" roughness={0.42} />
      </mesh>
      <mesh
        ref={registerBloomMesh}
        position={[0.9, 0, 0]}
      >
        <sphereGeometry args={[0.42, 48, 48]} />
        <meshStandardMaterial color="#8fffe6" emissive="#50f5d0" emissiveIntensity={2.2} />
      </mesh>
      <EffectComposer multisampling={0}>
        <SelectiveBloom
          lights={lightRef.current ? [lightRef.current] : []}
          selection={selection}
          intensity={0.7}
          luminanceThreshold={0.35}
          luminanceSmoothing={0.18}
        />
        <Vignette eskil={false} offset={0.18} darkness={0.42} />
      </EffectComposer>
    </>
  )
}
