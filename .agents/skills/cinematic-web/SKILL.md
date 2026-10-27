---
name: cinematic-web
description: Build or upgrade high-end animated websites, SaaS landing pages, cinematic hero sections, scroll-driven storytelling, WebGL/R3F scenes, shader/post-processing polish, Motion/GSAP/Lenis interactions, or Huly/Linear/Vercel/Stripe/Basement-inspired marketing pages. Use for requests mentioning cinematic websites, agency-grade landing pages, WebGL hero sections, R3F, Three.js, GSAP ScrollTrigger, Lenis, Motion or Framer Motion, shader effects, post-processing, Awwwards, scroll animation, parallax, 3D hero, micro-interactions, or making a site feel premium. Enforces art-direction intake, asset-first implementation, motion tokens, scroll choreography, post-processing discipline, performance budgets, and reduced-motion fallbacks.
---

# Cinematic Web

Treat high-end website animation as a creative-development system, not a pile of animation snippets.

Convert vague requests like "make it cinematic" into:

1. Art direction
2. Asset strategy
3. Motion language
4. Scroll choreography
5. Rendering and post-processing plan
6. Performance and accessibility budget
7. Implementation
8. Review loop

## Workflow

1. Inspect the existing app stack, routing model, rendering boundaries, and styling system.
2. Identify whether the project is DOM-only, Motion-based, GSAP-based, R3F/WebGL-based, Spline-based, Rive/Lottie-based, or mixed.
3. Create or update shared motion tokens before adding new animation behavior.
4. Draft an art-direction brief unless the user explicitly asks for a quick implementation.
5. Choose the smallest pipeline that can achieve the concept with the available assets.
6. Use exact choreography: scroll distance, pin length, scrub value, labels, stagger values, camera positions, material values, easing, and spring constants.
7. Instrument before polishing with markers, performance overlays, tunable constants, screenshots, or budget checks.
8. Provide reduced-motion and low-power fallbacks for every flagship animation.
9. Verify desktop, mobile, and reduced-motion behavior before calling the work finished.

## Decision Matrix

- Use CSS for tiny hover, focus, and opacity/transform effects.
- Use Motion for React for state-driven UI, layout transitions, shared elements, gestures, and micro-interactions.
- Use GSAP ScrollTrigger for pinned stories, long timelines, and precise scroll choreography.
- Use Lenis when scroll feel and WebGL/DOM synchronization are part of the experience.
- Use R3F/drei when the hero is a true 3D scene or shader composition.
- Use Spline when a designer-owned interactive 3D scene is the source of truth.
- Use Rive for interactive vector animation and state machines.
- Use video, image sequences, or static media when real-time WebGL would exceed the performance budget.

## Quality Bar

A result is not acceptable if it:

- Uses default easing everywhere.
- Applies global bloom to the entire scene without selection.
- Animates layout properties when transform/opacity would work.
- Ships a heavy GLB without inspection or compression guidance.
- Has no reduced-motion path.
- Depends on one giant client component with no lazy loading.
- Looks impressive only on the developer machine.

## Motion Tokens

Before implementation, create a shared motion system with:

- Eases
- Springs
- Durations
- Staggers
- Scroll scrub values
- Parallax ratios
- Reduced-motion substitutions

Use `examples/recipes/motion-tokens.ts` as a starter.

## References To Load As Needed

- Art direction and intake: `references/creative-direction.md`
- Reference analysis without copying famous sites: `references/reference-analysis.md`
- Easing, springs, mass, and choreography: `references/motion-language.md`
- GSAP + Lenis scroll systems: `references/scroll-choreography.md`
- R3F scene architecture: `references/r3f-webgl-scenes.md`
- Bloom, DoF, chromatic aberration, vignette, shaders, and tone mapping: `references/postprocessing-shaders.md`
- Blender, Spline, Rive, and glTF handoff: `references/asset-pipeline.md`
- Stack selection: `references/stack-decision-matrix.md`
- Performance budgets and mobile fallbacks: `references/performance-budgets.md`
- Reduced motion and accessibility: `references/accessibility-reduced-motion.md`
- Final review: `references/qa-rubric.md`

## Output Requirements

When implementing, report:

1. Files changed
2. Motion tokens added or reused
3. Choreography summary with numbers
4. Asset assumptions
5. Performance risks and mitigations
6. Reduced-motion behavior
7. How to run and verify
