# Performance Budgets

Use this reference when adding animation, WebGL, post-processing, heavy media, or when reviewing final work.

## Page Targets

- LCP: <= 2.5s
- INP: <= 200ms
- CLS: <= 0.1
- No animation should block first meaningful content.
- The first viewport should remain meaningful without JavaScript.

## WebGL Targets

- Clamp DPR: 1-1.5 on mobile, 1-2 on desktop.
- Avoid more than one expensive post-processing chain.
- Avoid unbounded particles.
- Avoid runtime-generated heavy geometry.
- Use instancing for repeated objects.
- Inspect every GLB before shipping.
- Provide a non-WebGL fallback.

## Asset Targets

- Hero GLB: aim for <= 2 MB compressed, justify anything larger.
- Individual texture: aim for <= 1024px unless close inspection demands more.
- Poster image: provide responsive sizes.
- Video: avoid autoplaying huge files above the fold unless it is the product.
- Fonts: limit families and weights.

## Bundle Targets

- Keep the WebGL stack out of the default route chunk where possible.
- Lazy-load R3F, drei, post-processing, Spline, and Rive.
- Avoid making the whole page a client component.
- Split demo controls and debug tools from production code.

## Review Checklist

- Run Lighthouse or equivalent for page-level vitals.
- Inspect bundle output if the framework supports it.
- Check asset sizes with `scripts/check-performance-budget.mjs`.
- Test mobile viewport and reduced-motion mode.
- Confirm animation does not degrade typing, clicking, or scrolling.
