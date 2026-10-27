"use client"

import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import type { HTMLAttributes } from "react"
import { springs } from "./motion-tokens"
import { useReducedMotionPreference } from "./reduced-motion-provider"

export function SpatialCard({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
  const reducedMotion = useReducedMotionPreference()
  const pointerX = useMotionValue(0.5)
  const pointerY = useMotionValue(0.5)
  const springX = useSpring(pointerX, springs.card)
  const springY = useSpring(pointerY, springs.card)
  const rotateX = useTransform(springY, [0, 1], [8, -8])
  const rotateY = useTransform(springX, [0, 1], [-10, 10])

  return (
    <motion.div
      {...props}
      style={{
        rotateX: reducedMotion ? 0 : rotateX,
        rotateY: reducedMotion ? 0 : rotateY,
        transformPerspective: 900,
      }}
      onPointerMove={(event) => {
        if (reducedMotion) return
        const rect = event.currentTarget.getBoundingClientRect()
        pointerX.set((event.clientX - rect.left) / rect.width)
        pointerY.set((event.clientY - rect.top) / rect.height)
      }}
      onPointerLeave={() => {
        pointerX.set(0.5)
        pointerY.set(0.5)
      }}
    >
      {children}
    </motion.div>
  )
}
