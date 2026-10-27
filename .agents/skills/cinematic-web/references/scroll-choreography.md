# Scroll Choreography

Use this reference when creating pinned sections, long scroll stories, parallax, GSAP ScrollTrigger timelines, or Lenis synchronization.

## Flagship Defaults

- Pin range: 240vh-420vh
- Scrub: 0.6-1.2 for cinematic scenes
- Timeline labels: intro, assemble, reveal, focus, handoff
- Background parallax: 0.15-0.35
- Midground parallax: 0.35-0.65
- Foreground parallax: 0.75-1.15
- Text stagger: 0.045s-0.08s
- Debug markers: on during tuning, off before shipping

## Good Pattern

Use one pinned container, one scrubbed timeline, named labels, and shared state.

```ts
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: sectionRef.current,
    start: "top top",
    end: "+=320%",
    scrub: 0.85,
    pin: true,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  },
})

tl.addLabel("intro")
  .fromTo(cameraState, { z: 7.2 }, { z: 5.4, ease: "none" }, "intro")
  .addLabel("assemble")
  .to(".hero-layer-mid", { yPercent: -18, ease: "none" }, "assemble")
  .addLabel("reveal")
  .to(".hero-copy", { autoAlpha: 1, y: 0, stagger: 0.06 }, "reveal")
```

## Bad Pattern

Avoid five unrelated ScrollTriggers all fighting over transforms in the same viewport.

## Lenis Sync Pattern

```ts
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })

lenis.on("scroll", ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)
```

## Narrative Chapters

- Intro: establish composition and product promise.
- Assemble: bring modules into spatial relationship.
- Reveal: expose the key product or message.
- Focus: slow down and make a claim legible.
- Handoff: settle into the next section, avoiding abrupt dead stops.

## QA

- Refresh on viewport changes with `invalidateOnRefresh`.
- Confirm pinned sections do not trap keyboard users.
- Test touch scrolling, wheel scrolling, and trackpad scrolling.
- Confirm mobile falls back to shorter or static choreography when needed.
