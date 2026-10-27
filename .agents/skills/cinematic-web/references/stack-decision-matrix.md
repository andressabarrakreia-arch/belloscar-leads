# Stack Decision Matrix

Use this reference when choosing between CSS, Motion, GSAP, Lenis, R3F, Spline, Rive, video, or image sequences.

## Choose CSS When

- The interaction is hover, focus, active, or a tiny reveal.
- The animation uses transform and opacity only.
- The state model is simple.
- The effect must be zero-dependency.

## Choose Motion For React When

- Animation is tied to React state.
- Layout transitions or shared elements matter.
- Gestures or drag interactions matter.
- The page needs accessible micro-interactions.

## Choose GSAP ScrollTrigger When

- A section pins for a long scroll range.
- A single timeline controls many elements.
- Scroll labels, scrub, snap, or precise start/end values matter.
- DOM and canvas state need choreographed scroll progress.

## Choose Lenis When

- Smooth scroll feel is part of the brand.
- Scroll-linked WebGL and DOM animation need synchronization.
- Trackpad, wheel, and touch feel inconsistent without it.

## Choose R3F/Three.js When

- The hero is actually 3D or shader-based.
- Camera choreography matters.
- The product metaphor benefits from depth, light, or materials.
- Assets can be optimized and fallbacks are possible.

## Choose Spline When

- Designers own the 3D scene.
- The scene is already authored in Spline.
- Runtime code only needs to trigger variables, transitions, or events.

## Choose Rive When

- Interactive vector state machines are central.
- The animation must remain sharp, lightweight, and brand-controlled.
- Designers own the motion file.

## Choose Video Or Image Sequence When

- Real-time WebGL would exceed the budget.
- The visual is fixed and does not need interaction.
- The team can render high-quality frames offline.
- Mobile reliability matters more than live 3D control.
