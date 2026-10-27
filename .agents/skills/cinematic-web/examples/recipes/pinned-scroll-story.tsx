"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { scroll } from "./motion-tokens"
import { useReducedMotionPreference } from "./reduced-motion-provider"

gsap.registerPlugin(ScrollTrigger)

export function PinnedScrollStory() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const reducedMotion = useReducedMotionPreference()

  useLayoutEffect(() => {
    if (!sectionRef.current || reducedMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${scroll.pinnedHero}`,
          scrub: scroll.cinematicScrub,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      tl.addLabel("intro")
        .fromTo(
          ".story-copy",
          { autoAlpha: 0, y: 32 },
          { autoAlpha: 1, y: 0, stagger: 0.06 },
          "intro",
        )
        .addLabel("assemble")
        .to(".story-layer-background", { yPercent: -18, ease: "none" }, "assemble")
        .to(".story-layer-mid", { yPercent: -34, ease: "none" }, "assemble")
        .to(".story-layer-foreground", { yPercent: -58, ease: "none" }, "assemble")
        .addLabel("focus")
        .to(".story-product", { scale: 1.08, rotate: 0, ease: "none" }, "focus")
        .addLabel("handoff")
        .to(".story-copy", { autoAlpha: 0.82, y: -18, ease: "none" }, "handoff")
    }, sectionRef)

    return () => ctx.revert()
  }, [reducedMotion])

  return (
    <section ref={sectionRef} className="story-section">
      <div className="story-layer story-layer-background" />
      <div className="story-layer story-layer-mid" />
      <div className="story-product" />
      <div className="story-layer story-layer-foreground" />
      <div className="story-copy">
        <p>Intro</p>
        <h2>The system assembles around the work.</h2>
      </div>
    </section>
  )
}
