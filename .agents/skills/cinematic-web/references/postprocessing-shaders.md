# Post-Processing And Shaders

Use this reference when adding bloom, depth of field, chromatic aberration, vignette, shader planes, tone mapping, or custom materials.

## Default Stack

1. Tone mapping and color management.
2. Selective bloom only for emissive materials or named layers.
3. Subtle vignette.
4. Depth of field only with an intentional focal plane.
5. Chromatic aberration only at the edges and at very low strength.

## Discipline

- Never stack every effect because the package exposes it.
- Post-processing should support composition, not hide weak lighting.
- Tune with real content, not empty placeholder geometry.
- Commit final constants and disable debug controls in production.
- Disable or simplify expensive passes on mobile.

## Amateur Tells

- Global bloom over text.
- Heavy chromatic aberration across product UI.
- Depth of field that blurs the thing users need to inspect.
- Vignette so strong it becomes the page design.
- Multiple full-screen passes on low-power devices.

## Selective Bloom Pattern

```tsx
<EffectComposer multisampling={0}>
  <SelectiveBloom
    lights={[keyLightRef]}
    selection={bloomSelection}
    intensity={0.7}
    luminanceThreshold={0.35}
    luminanceSmoothing={0.18}
  />
  <Vignette eskil={false} offset={0.18} darkness={0.42} />
</EffectComposer>
```

## Shader Plane Checklist

- Name uniforms by meaning, not by experiment number.
- Keep time-based motion subtle.
- Add reduced-motion behavior for time uniforms.
- Avoid shader text if the text needs to remain accessible.
- Test color banding on real displays when using gradients.

## Tuning Workflow

1. Add Leva or local constants during development.
2. Tune against final or representative assets.
3. Record selected values in the motion or scene spec.
4. Remove debug UI from production.
5. Verify mobile and reduced-motion paths.
