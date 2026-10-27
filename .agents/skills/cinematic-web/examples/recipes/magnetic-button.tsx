"use client"

import { motion, useMotionValue, useSpring } from "motion/react"
import type { HTMLMotionProps } from "motion/react"
import { springs } from "./motion-tokens"
import { useReducedMotionPreference } from "./reduced-motion-provider"

type MagneticButtonProps = HTMLMotionProps<"button"> & {
  strength?: number
}

export function MagneticButton({
  children,
  strength = 18,
  onMouseMove,
  onMouseLeave,
  ...props
}: MagneticButtonProps) {
  const reducedMotion = useReducedMotionPreference()
  const x = useSpring(useMotionValue(0), springs.control)
  const y = useSpring(useMotionValue(0), springs.control)

  return (
    <motion.button
      {...props}
      style={{ x, y }}
      onMouseMove={(event) => {
        onMouseMove?.(event)
        if (reducedMotion) return

        const rect = event.currentTarget.getBoundingClientRect()
        const localX = event.clientX - rect.left - rect.width / 2
        const localY = event.clientY - rect.top - rect.height / 2

        x.set((localX / rect.width) * strength)
        y.set((localY / rect.height) * strength)
      }}
      onMouseLeave={(event) => {
        onMouseLeave?.(event)
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.button>
  )
}
