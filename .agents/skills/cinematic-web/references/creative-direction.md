# Creative Direction

Use this reference when a request is vague, visual, brand-led, or asks for a premium/cinematic feel.

## Rule

Do not skip the art-direction brief unless the user explicitly asks for a quick implementation.

## Art Direction Brief

Fill this before choosing libraries or writing animation code:

```md
# Art Direction Brief

## Brand feeling
Three adjectives only.

## Visual metaphor
One concrete metaphor.

## Reference qualities
- Reference:
- Extracted quality:
- What not to copy:

## Hero asset strategy
- Existing asset:
- Needed asset:
- Placeholder asset:
- Final production asset owner:

## Scene composition
- Foreground:
- Midground:
- Background:
- Camera:
- Light source:
- Focal plane:

## Motion intent
- Heavy objects:
- Light objects:
- User-controlled motion:
- Ambient motion:
- Exit/settle behavior:

## Non-goals
- No random floating cards
- No default parallax
- No unmotivated rotation
- No post-processing that hides weak composition
```

## Creative Constraints

- Use three brand adjectives, not a mood board of adjectives.
- Choose one visual metaphor. If there are two metaphors, decide which one leads.
- Tie every major movement to the metaphor.
- Name the hero asset strategy before implementation.
- Identify what is prototype-only and what needs bespoke production work.

## Asset-First Questions

Ask or infer:

- Is there a logo, product UI, 3D model, illustration, video, or brand library?
- Are there reference frames the user wants to evoke?
- Can the experience use placeholders, or must it match final production quality now?
- Is the flagship visual DOM, image/video, WebGL, Spline, Rive, or a hybrid?
- What should be visible above the fold on mobile?

## Composition Checks

- The first viewport should make the product, brand, or offer obvious.
- The hero should hint at the next section on desktop and mobile.
- Text should not sit in a decorative card unless the product surface calls for it.
- Backgrounds should support hierarchy, not become the hierarchy.
- Effects should reveal product value or brand feeling, not merely decorate empty space.

## Prototype Honesty

When assets are missing, say so in implementation notes:

```md
Asset assumptions:
- Placeholder orbital UI panels stand in for final product renders.
- Final art direction needs a custom GLB or exported Spline scene.
- Current lighting and bloom values are tuned for placeholder geometry and should be retuned against final assets.
```
