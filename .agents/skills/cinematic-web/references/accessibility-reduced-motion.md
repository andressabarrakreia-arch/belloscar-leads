# Accessibility And Reduced Motion

Use this reference whenever adding motion, scroll effects, canvas, parallax, pinned sections, or animated text.

## Core Rules

- Respect `prefers-reduced-motion`.
- Preserve the same information order in reduced-motion mode.
- Do not rely on motion as the only way to communicate state.
- Avoid scroll traps and keyboard traps in pinned sections.
- Keep focus indicators visible.
- Keep text real HTML whenever it needs to be read, selected, translated, or indexed.

## Reduced-Motion Patterns

- Replace long movement with quick opacity transitions.
- Replace continuous ambient motion with static poses.
- Replace scrubbed camera motion with still compositions.
- Replace parallax with stacked static layers.
- Replace animated counters with final values.
- Pause videos and canvases unless the user opts in.

## Implementation Hook

```ts
export function useReducedMotionPreference() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(query.matches)

    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  return reduced
}
```

## Pinned Scroll Accessibility

- Keep pinned content keyboard reachable.
- Avoid focus moving while the page scrolls.
- Do not hide content from assistive tech only because it is visually offscreen.
- Provide a shorter mobile path when pinning would dominate the page.

## Canvas Accessibility

- Overlay important copy as HTML.
- Give the canvas an accessible label only when it communicates meaningful content.
- Hide decorative canvases from assistive tech.
- Provide a static equivalent for meaningful 3D diagrams.
