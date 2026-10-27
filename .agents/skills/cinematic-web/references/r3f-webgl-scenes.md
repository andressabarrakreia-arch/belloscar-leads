# R3F And WebGL Scenes

Use this reference when building a Three.js, React Three Fiber, drei, shader, or WebGL hero.

## Production Module Shape

```txt
components/hero-scene/
├── HeroCanvas.tsx
├── Scene.tsx
├── CameraRig.tsx
├── Lights.tsx
├── Model.tsx
├── Materials.ts
├── PostFX.tsx
├── useSceneProgress.ts
├── useReducedScene.ts
└── SceneFallback.tsx
```

## Rules

- Dynamically import the canvas in Next.js.
- Do not put the whole landing page in a client component just because the hero uses WebGL.
- Clamp DPR.
- Use `Suspense` and meaningful fallbacks.
- Use `useGLTF.preload` for important assets.
- Use GLTFJSX for complex assets.
- Reuse geometries and materials.
- Use instancing for repeated meshes.
- Mutate refs in `useFrame`; do not spam React state in the render loop.
- Use `frameloop="demand"` for mostly static scenes.
- Provide image, video, or DOM fallback for mobile and reduced motion.

## Canvas Defaults

```tsx
<Canvas
  dpr={[1, 1.75]}
  camera={{ position: [0, 0.4, 6.4], fov: 38 }}
  gl={{ antialias: true, powerPreference: "high-performance" }}
>
  <Suspense fallback={null}>
    <Scene />
  </Suspense>
</Canvas>
```

## Camera Choreography

- Use a dedicated `CameraRig`.
- Separate scroll progress from render loop mutation.
- Interpolate camera, target, and focal distance with named constants.
- Keep scroll progress in refs or external stores when possible.

## Mobile Fallbacks

- Use a static poster image for low-power devices.
- Reduce particle counts.
- Disable expensive post-processing.
- Clamp DPR to 1-1.5.
- Avoid first-load GLB downloads that block meaningful content.

## Common Mistakes

- Creating materials inside `useFrame`.
- Calling React state setters every frame.
- Loading large GLBs in the first critical render path.
- Using global post-processing to compensate for poor lighting.
- Forgetting that text over canvas still needs contrast and readability.
