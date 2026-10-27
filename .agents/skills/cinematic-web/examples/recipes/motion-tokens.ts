export const eases = {
  emphasizedOut: [0.16, 1, 0.3, 1],
  preciseInOut: [0.65, 0, 0.35, 1],
  softOut: [0.22, 1, 0.36, 1],
  snapOut: [0.34, 1.56, 0.64, 1],
} as const

export const springs = {
  micro: { type: "spring", stiffness: 700, damping: 44, mass: 0.55 },
  control: { type: "spring", stiffness: 520, damping: 38, mass: 0.75 },
  card: { type: "spring", stiffness: 360, damping: 34, mass: 0.9 },
  panel: { type: "spring", stiffness: 240, damping: 30, mass: 1.15 },
  heroObject: { type: "spring", stiffness: 120, damping: 26, mass: 1.8 },
} as const

export const durations = {
  instant: 0.08,
  micro: 0.14,
  quick: 0.22,
  normal: 0.36,
  deliberate: 0.62,
  cinematic: 1.1,
} as const

export const stagger = {
  tight: 0.035,
  normal: 0.065,
  editorial: 0.095,
  cinematic: 0.14,
} as const

export const scroll = {
  cinematicScrub: 0.85,
  pinnedHero: "320%",
  parallax: {
    background: 0.24,
    midground: 0.52,
    foreground: 0.92,
  },
} as const

export const reducedMotion = {
  fadeDuration: durations.micro,
  disableParallax: true,
  disableContinuousMotion: true,
} as const

export type MotionEase = keyof typeof eases
export type MotionSpring = keyof typeof springs
export type MotionDuration = keyof typeof durations
