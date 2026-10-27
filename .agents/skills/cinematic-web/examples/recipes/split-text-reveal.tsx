"use client"

import { motion } from "motion/react"
import { eases, stagger } from "./motion-tokens"
import { useReducedMotionPreference } from "./reduced-motion-provider"

export function SplitTextReveal({ text }: { text: string }) {
  const reducedMotion = useReducedMotionPreference()
  const words = text.split(" ")

  return (
    <span aria-label={text}>
      {words.map((word, index) => (
        <motion.span
          aria-hidden="true"
          key={`${word}-${index}`}
          style={{ display: "inline-block", overflow: "hidden" }}
        >
          <motion.span
            style={{ display: "inline-block" }}
            initial={reducedMotion ? { opacity: 0 } : { y: "105%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{
              duration: reducedMotion ? 0.12 : 0.58,
              delay: reducedMotion ? 0 : index * stagger.normal,
              ease: eases.emphasizedOut,
            }}
          >
            {word}
            {index < words.length - 1 ? "\u00a0" : ""}
          </motion.span>
        </motion.span>
      ))}
    </span>
  )
}
