"use client"

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

type ReducedMotionContextValue = {
  reducedMotion: boolean
}

const ReducedMotionContext = createContext<ReducedMotionContextValue>({
  reducedMotion: false,
})

export function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(query.matches)

    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  const value = useMemo(() => ({ reducedMotion }), [reducedMotion])

  return (
    <ReducedMotionContext.Provider value={value}>
      {children}
    </ReducedMotionContext.Provider>
  )
}

export function useReducedMotionPreference() {
  return useContext(ReducedMotionContext).reducedMotion
}
