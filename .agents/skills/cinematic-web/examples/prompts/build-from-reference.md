# Build From Reference

```text
/cinematic-web build a cinematic SaaS hero for a security analytics product.

Reference qualities:
- Huly-style full-viewport illustrated scene
- Linear-style restraint and precision
- Stripe-style gradient lighting

Assets:
- Use public/models/orbital-dashboard.glb
- If missing, create a placeholder scene with simple primitives and mark final asset needs.

Choreography:
- Pin hero for 320vh
- Use GSAP ScrollTrigger scrub: 0.85
- Timeline labels: intro, assemble, reveal, handoff
- Camera z: 7.2 -> 5.1
- Main object rotation y: -0.25 -> 0.18
- Background parallax: 0.25
- Foreground parallax: 0.85

Motion:
- Use shared motion tokens.
- Heavy 3D objects settle slower than text.
- Text stagger 0.06s.
- Avoid default ease.

Post:
- Selective bloom only on emissive nodes.
- Subtle vignette.
- No global chromatic aberration over text.

Performance:
- Clamp DPR.
- Lazy-load canvas.
- Provide reduced-motion fallback.
```
