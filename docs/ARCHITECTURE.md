# Architecture

## Preferred stack
For a new app: Vite + React + TypeScript, React Three Fiber, Drei, and Tailwind CSS. Use the existing stack if it is already suitable. Add only dependencies that are needed and compatible.

## Responsibilities
- Application shell: page composition, landing/exploration mode, responsive layout.
- 3D Canvas: renderer, scene, loading/error boundary, and fallback.
- Temple scene: model, lights, ground, environment, optional subtle effects.
- Camera controller: default pose, target pose, focus transitions and reset.
- Exploration state: selected landmark, selected/closed panel, interaction mode.
- Landmark data: typed records for id, title, summary, model-relative position, camera position, camera target, and optional attribution/source.
- UI: navigation, CTA, control hint, hotspot list, landmark panel, reset and close actions.

## Suggested folder structure
Adapt to the existing repository:
```text
src/
  app/
    App.tsx
    ExperiencePage.tsx
  components/
    layout/
    exploration/
    ui/
  scene/
    TempleCanvas.tsx
    TempleScene.tsx
    TempleModel.tsx
    Lighting.tsx
    CameraController.tsx
  data/
    landmarks.ts
  hooks/
    useExploration.ts
  styles/
public/
  models/
  textures/
  images/
docs/
```

## As built (adapted)
```text
scripts/
  build-temple-model.mjs   # authors public/models/temple.glb (original asset)
  smoke.mjs                # headless Chrome smoke test + screenshots
src/
  main.tsx, App.tsx        # shell: landing ↔ explore mode, WebGL detection
  components/              # HTML UI: Header, Hero, LandmarkPanel, LandmarkList, LoadingOverlay, …
  scene/                   # R3F: TempleCanvas, TempleScene, TempleModel, Lighting, CameraRig, Hotspots
  data/landmarks.ts        # typed landmark records + model config
  state/exploration.ts     # reducer for mode / selection (unit tested)
  hooks/                   # useReducedMotion, etc.
  lib/webgl.ts             # WebGL support detection
```
Camera movement is owned by Drei `<CameraControls>` (camera-controls). React only stores *which* landmark is selected; `CameraRig` reacts to that and calls `setLookAt(..., animate)` imperatively.

## State boundaries
- React state owns UI mode, selected landmark, panel visibility and loading/error status.
- Camera transforms and frame-by-frame animation should remain in Three.js/R3F refs or controllers rather than triggering React renders each frame.
- Keep landmark content separate from presentation.
- Use stable IDs; avoid hard-coded duplicate landmark logic across components.

## Rendering principles
- Use one main Canvas unless a clear need for multiple exists.
- Avoid rebuilding the scene on every UI state change.
- Dispose resources correctly when replacing models.
- Avoid expensive post-processing by default.
- Use demand rendering only when compatible with all active animations and controls; otherwise use a deliberate render strategy.
- Make the initial camera framing intentional and test it at common aspect ratios.
