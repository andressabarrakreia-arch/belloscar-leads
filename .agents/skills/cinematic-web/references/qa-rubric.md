# QA Rubric

Use this reference before final delivery of a cinematic web implementation.

## Creative Direction

- The visual metaphor is named.
- The asset assumptions are explicit.
- The page does not copy the reference site.
- The first viewport communicates the product or offer.
- The next section is hinted below the fold.

## Motion

- Shared motion tokens exist or were reused.
- Major choreography has labels and numbers.
- Large objects feel heavier than text and controls.
- Ambient motion does not fight reading.
- Reduced-motion behavior is implemented and described.

## Scroll

- Pinned ranges are intentional.
- There is one main timeline per story section.
- ScrollTrigger markers are removed or disabled in production.
- Touch, wheel, and trackpad scrolling work.
- Keyboard users are not trapped.

## WebGL

- Canvas is lazy-loaded where appropriate.
- DPR is clamped.
- GLB assets are inspected or marked as needing inspection.
- Post-processing is selective.
- Mobile and low-power fallbacks exist.

## Performance

- LCP, INP, and CLS risks are named.
- Heavy dependencies are split from the critical path.
- Assets have budgets.
- Debug tooling is not shipped to production.

## Delivery Summary

Report:

1. Files changed
2. Motion tokens added or reused
3. Choreography summary with numbers
4. Asset assumptions
5. Performance risks and mitigations
6. Reduced-motion behavior
7. How to run and verify
