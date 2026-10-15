# Phase 02 — Real 3D temple scene

## Goal
Render the actual temple model with a reliable loading and fallback experience.

## Tasks
1. Use the verified licensed model recorded in `docs/ASSET_CREDITS.md`.
2. Add/adapt React Three Fiber and Drei only if compatible and needed.
3. Integrate GLB/GLTF; verify textures, scale, origin, orientation and camera framing.
4. Set up lighting, shadows and environment to support the model rather than obscure it.
5. Add meaningful loading progress and clear load failure handling.
6. Provide a static fallback or graceful unsupported-WebGL state.
7. Test model load and browser console if tooling exists; record model size and optimization needs.

## Constraints
Do not present a static image or primitives as the final interactive model. Do not use assets with unverified rights. Do not add heavy post-processing by default.

## Acceptance
- [ ] Real model loads in the app and is visible from the initial camera.
- [ ] Textures/materials are present and orientation is correct.
- [ ] Loading/failure states work.
- [ ] Fallback is useful.
- [ ] Asset source/license/attribution is recorded.
- [ ] Build and runtime checks pass or blockers are documented honestly.
