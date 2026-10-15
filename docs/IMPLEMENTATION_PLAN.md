# Implementation plan — Dravida

## Execution policy
Execute phases sequentially. Each phase must leave the app in a buildable state. Adapt to the actual repository instead of blindly enforcing this template.

## Phase 00 — Reconnaissance and planning
- Inspect files, Git state, scripts, framework versions, styling conventions, existing tests, browser tooling, and installed skills.
- Identify the minimal compatible stack; preserve existing dependencies if adequate.
- Research candidate temple models and license terms.
- Define initial asset budget and fallback strategy.
- Finalize architecture, phase-specific criteria, and build log.
**Exit:** repository state and decisions documented; no unrequested app code changed in this phase.

## Phase 01 — Landing page foundation
- Create/refine the responsive hero and page shell.
- Implement navigation, headline, CTA, loading/poster placeholder, control hints and accessible UI states.
- Use the chosen visual direction consistently.
- Keep the scene placeholder replaceable without a rewrite.
**Exit:** responsive page builds; CTA changes state or enters a clearly defined placeholder exploration mode; controls have real behavior.

## Phase 02 — 3D scene and asset integration
- Add or adapt React Three Fiber/Drei only as needed.
- Integrate a real, licensed GLB/GLTF model.
- Correct scale, orientation, camera framing, material appearance, lighting, ground and environment.
- Add loading progress, failure UI, and a static fallback.
- Check model/texture size and browser console.
**Exit:** real model renders and loads reliably, or a documented blocker plus honest temporary fallback is recorded.

## Phase 03 — Free-roam exploration
- Implement orbit/zoom/pan with sensible constraints and reset.
- Define four to six typed landmark records with model-relative positions and sourced/context-safe descriptions.
- Implement raycast/hotspot selection, camera focus transitions, highlight and information panel.
- Make HTML UI usable by keyboard and touch.
**Exit:** all listed interactions work on desktop; core flows work on mobile.

## Phase 04 — Cinematic polish
- Refine lighting, material response, environment, optional subtle particles/haze, transitions and hover/focus feedback.
- Avoid heavy post-processing unless measured and necessary.
- Respect reduced-motion settings and avoid needless render loops.
- Test composition at narrow and wide breakpoints.
**Exit:** cohesive cinematic appearance with no major interaction or readability regressions.

## Phase 05 — Quality and release readiness
- Audit dependencies, asset sizes, accessibility, responsiveness, errors and loading.
- Run available lint/type/test/build scripts.
- Test user flows in browser if tooling exists.
- Improve performance based on evidence.
- Finalize README, setup instructions, asset credits, known issues and build log.
**Exit:** release checklist has evidence for each criterion; remaining blockers are explicit. Deployment/push/merge remain approval-gated.

## Adaptations to the actual repository (Phase 00, 2026-10-15)
- The repository contained no app, so Phase 01 scaffolds a new Vite + React + TypeScript app at the repo root (preserving `README.md`, `CLAUDE.md` and `docs/`).
- Asset downloads from Sketchfab require login (HTTP 401), so Phase 02 integrates an **original procedurally authored GLB** built by `scripts/build-temple-model.mjs` (Node + three.js `GLTFExporter`). It is labeled in the UI and docs as *inspired by* Dravidian architecture — not a specific historic temple. The GLB has named nodes per landmark (`gopuram`, `dhvajastambha`, `mandapa`, `vimana`, `pushkarini`, `prakara`, …) which Phase 03 uses for highlighting.
- The poster/fallback image is a screenshot of the real 3D scene captured by the smoke-test script (not a generated illustration).
- Browser verification uses `playwright-core` driving the locally installed Chrome (`npm run smoke`).
- Product name in UI: **Sanatan** (per the user's bootstrap prompt).

## Architecture
See `ARCHITECTURE.md`.

## Asset policy
See `ASSET_STRATEGY.md`.

## Quality gates
See `QUALITY_GATES.md`.

## Autonomy and safety
See `AUTONOMOUS_EXECUTION.md`.
