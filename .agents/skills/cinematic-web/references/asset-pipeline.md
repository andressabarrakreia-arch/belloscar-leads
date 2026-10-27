# Asset Pipeline

Use this reference when importing, generating, optimizing, or requesting assets for cinematic web work.

## Asset Strategy

Classify every flagship asset:

- Existing: already in the repo or provided by the user.
- Placeholder: built for prototype clarity only.
- Needed: must be created by design, 3D, brand, or product.
- Final owner: person or workflow responsible for production quality.

## Blender To glTF

- Prefer `.glb` for packaged delivery.
- Export only required meshes, materials, cameras, lights, and animations.
- Bake lighting when it improves performance and visual consistency.
- Expect some shaders, simulations, and particles to need custom handoff or baking.
- Inspect every GLB before shipping.

## Spline

Use Spline when a designer-owned 3D scene is the source of truth.

- Keep scene variables documented.
- Trigger interactions from code only when the ownership model is clear.
- Provide a fallback while the Spline runtime loads.
- Avoid treating Spline as a dumping ground for unoptimized scenes.

## Rive

Use Rive for interactive vector animation with state machines.

- Name inputs and state machines clearly.
- Keep runtime controls in a small adapter component.
- Preserve reduced-motion semantics.
- Use it for product diagrams, expressive controls, and branded motion systems.

## glTF Optimization

Workflow:

1. Inspect the model.
2. Decide whether the problem is geometry, texture weight, animations, materials, or draw calls.
3. Prune unused data.
4. Compress geometry and textures.
5. Re-inspect and compare visual quality.

Useful commands:

```bash
node scripts/inspect-gltf.mjs public/models/hero.glb
node scripts/optimize-gltf.mjs public/models/hero.glb public/models/hero.optimized.glb --compress meshopt --texture webp --size 1024
```

## Asset Notes To Report

```md
Asset assumptions:
- Placeholder crystal cluster is procedural and not final brand art.
- Final production should replace it with a designed GLB under 2 MB compressed.
- Emissive surfaces are named `Bloom_*` for selective bloom.
```
