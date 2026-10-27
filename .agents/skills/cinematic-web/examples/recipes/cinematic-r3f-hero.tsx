"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Float, Environment } from "@react-three/drei"
import { Suspense, useRef } from "react"
import type { Group } from "three"
import { useReducedMotionPreference } from "./reduced-motion-provider"

export function CinematicR3FHero() {
  const reducedMotion = useReducedMotionPreference()

  if (reducedMotion) {
    return <div className="hero-poster" aria-hidden="true" />
  }

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.45, 6.4], fov: 38 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <Scene />
      </Suspense>
    </Canvas>
  )
}

function Scene() {
  const groupRef = useRef<Group>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * 0.08
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.06
  })

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 6]} intensity={2.4} />
      <Float speed={0.8} rotationIntensity={0.18} floatIntensity={0.22}>
        <group ref={groupRef}>
          <mesh position={[0, 0, 0]}>
            <icosahedronGeometry args={[1.25, 3]} />
            <meshStandardMaterial color="#d9fbff" roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh position={[0.75, -0.25, 0.65]}>
            <boxGeometry args={[0.56, 0.56, 0.08]} />
            <meshStandardMaterial color="#7cf7c6" emissive="#1f8f73" emissiveIntensity={0.8} />
          </mesh>
        </group>
      </Float>
      <Environment preset="city" />
    </>
  )
}
