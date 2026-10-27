# Motion Language

Use this reference when defining motion tokens, transitions, micro-interactions, text reveals, page sections, or cinematic object movement.

## Principles

- Big or heavy objects move slower and settle longer.
- Text reveals faster than large scene objects.
- Exits are often faster than entrances.
- Repeated sections share the same easing language.
- Scroll motion uses named chapters, not independent triggers everywhere.
- One page should not mix many easing personalities.
- Motion should make cause and hierarchy legible.

## Starter Tokens

```ts
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
```

## Timing Ranges

- Button hover: 0.12s-0.22s
- Small popover: 0.16s-0.28s
- Card entrance: 0.28s-0.48s
- Panel entrance: 0.42s-0.72s
- Hero object entrance: 0.8s-1.4s
- Text stagger: 0.035s-0.095s
- Editorial stagger: 0.095s-0.14s

## Choreography Rules

- Give every flagship sequence labels: intro, assemble, reveal, focus, handoff.
- Avoid one-off `duration: 0.5` decisions. Pull from tokens.
- Do not animate top, left, width, height, or filter blur in hot paths when transform/opacity can do the job.
- Use z-depth, scale, opacity, and light intensity together for cinematic reveals.
- Make hover motion smaller than scroll or hero motion.
- Keep ambient motion slow enough that it does not steal reading attention.

## Reduced-Motion Substitutions

- Replace long transforms with opacity fades under 0.2s.
- Replace scrubbed camera motion with static key frame states.
- Replace continuous rotation with a fixed pose.
- Replace parallax with layered static composition.
- Keep information order and focus states intact.
