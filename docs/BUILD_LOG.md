# Build log

Append a dated entry at the end of every phase.

## Phase 00 — Reconnaissance (2026-10-15)
- Status: COMPLETE
- Repository state:
  - Branch `main`, one commit (`394c9a7 Initial commit`) containing only `README.md` (`# temple-3d`). Remote `origin` = github.com/mani-4444/temple-3d.
  - Untracked: the build kit (`CLAUDE.md`, `README_FIRST.md`, `START_AUTONOMOUS_BUILD.md`, `docs/`, `.claude/commands/build-dravida.md`). No `package.json`, no app code, no tests, no existing 3D implementation.
  - Work proceeds on local branch `feat/sanatan-mvp` (created from `main`; nothing pushed).
- Tooling verified:
  - Node v24.18.1, npm 11.16.0, Python 3.11 available. Network access to npm registry and the web works.
  - Google Chrome 155 and Microsoft Edge 155 are installed locally → browser smoke tests can drive the installed Chrome headlessly via `playwright-core` (no browser download needed).
  - No Blender, no `gltf-transform` CLI installed. No browser MCP tools in this session.
  - Relevant Claude Code skill: project command `build-dravida` (used). No other skills needed.
- Decisions:
  - **Product name:** the bootstrap prompt pasted by the user names the product **Sanatan** (the kit docs say "Dravida"). The user-facing site is branded "Sanatan"; docs keep "Dravida" as the kit/codename.
  - **Stack (new app):** Vite + React 19 + TypeScript, React Three Fiber + Drei, Tailwind CSS v4 (Vite plugin), Vitest for unit tests, ESLint (Vite template config). Self-hosted fonts via Fontsource (OFL) to avoid runtime Google Fonts calls.
  - **Camera:** Drei `<CameraControls>` (camera-controls) — gives orbit/dolly/truck, smooth interruptible `setLookAt` transitions, distance/polar limits and target boundary without a custom tween system.
  - **Landmarks:** typed records in `src/data/landmarks.ts`, each bound to a named node in the GLB for highlighting.
  - **Browser verification:** `scripts/smoke.mjs` using `playwright-core` + installed Chrome (SwiftShader WebGL in headless mode).
- Asset research:
  - Searched the web and the public Sketchfab Data API (`/v3/search?downloadable=true`). Viable openly licensed candidates found (license read from each model's API record):
    - "Ancient Hindu temple tower, gopuram" — abhi_soni14 — CC BY 4.0 — 120k faces, 19 MB GLB — description states it was generated with Rodin Gen-1 (AI). https://sketchfab.com/3d-models/ancient-hindu-temple-tower-gopuram-1449065e882445b188f08ca033d25218
    - "gopuram" — rupasmiley018 — CC BY 4.0 — 34k faces, 2.6 MB GLB. https://sketchfab.com/3d-models/gopuram-c7577eeaf44f4deaa0adb24d64ddae42
    - "South Indian Temple - Modular Kit" — rSquare — CC BY 4.0 — 8k faces, low poly, fictional (author: "not based on any real-life temple"). https://sketchfab.com/3d-models/south-indian-temple-modular-kit-25f0176668004faa98ec351e04e58920
  - Other results (CGTrader, Fab, Superhive, Remeshy, MakerWorld) were paid, unlicensed-on-page, or print-only STL — rejected.
- Commands/checks:
  - `curl https://api.sketchfab.com/v3/models/1449065e882445b188f08ca033d25218/download` → HTTP 401 `{"detail":"Authentication credentials were not provided."}`
- Blockers:
  - **Sketchfab downloads require a signed-in account / OAuth token.** Logging in or handling the user's credentials is out of bounds. → Fallback (per `ASSET_STRATEGY.md` hierarchy): author an **original, procedurally generated GLB** of a temple *inspired by* Dravidian architecture with a reproducible build script (`scripts/build-temple-model.mjs`). The project owns it outright, so licensing is unambiguous. It is a stylized, non-photogrammetric model and is documented as such (KI-001). The model URL and landmark data are isolated so a licensed Sketchfab model can be swapped in later.
- Content sources for landmark text (general architectural definitions only, no claims about a specific real temple): Wikipedia — Gopuram, Dravidian architecture, Vimana (architectural feature), Mandapa, Dhvajastambha, Temple tank, Kalasha.

## Phase 01 — Landing foundation (2026-10-15)
- Status: COMPLETE
- Files changed: scaffolded from `npm create vite@latest -- --template react-ts` (configs copied only; repo README kept): `package.json`, `package-lock.json`, `tsconfig*.json`, `vite.config.ts` (+ Tailwind plugin), `.oxlintrc.json`, `.gitignore`, `index.html`, `public/favicon.svg`; new `src/main.tsx`, `src/index.css`, `src/App.tsx`, `src/state/exploration.ts` (+ test), `src/hooks/useReducedMotion.ts`, `src/components/{Header,Hero,AboutDialog,StatusOverlays,ScenePlaceholder}.tsx`, `scripts/smoke.mjs`, `scripts/smoke-scenarios.mjs`.
- Notes: the template now ships **oxlint** (not ESLint) as `npm run lint`; kept as-is. Added scripts `typecheck`, `test`, `smoke`, `build:model`. Loading/error primitives (`LoadingOverlay`, `ErrorNotice`) are ready for Phase 02. The placeholder is a CSS/SVG backdrop (`ScenePlaceholder`) rendered where the canvas will go.
- Acceptance results:
  - Responsive at desktop and mobile — PASS (smoke: 1440×900 and 390×844 screenshots reviewed; no horizontal overflow at 390px; CTA 44px tall and on screen).
  - CTA has real behaviour — PASS (smoke: click/tap switches to exploration mode; "Back to introduction" returns).
  - Placeholder clearly replaceable — PASS (single `<ScenePlaceholder />` stage element in `App.tsx`).
  - Keyboard navigable, focus visible — PASS (smoke: Tab reaches header control, `outline-style: solid`; About dialog opens and closes with Escape).
  - lint/type/build — PASS (`npm run typecheck` exit 0, `npm run lint` 0 findings, `npm test` 4/4, `npm run build` OK, JS 227.7 kB / 71.6 kB gzip).
- Commands/checks and results: `npm run smoke` → 12/12 checks passed (headless Chrome 155).
- Known issues: none new.

## Phase 02 — 3D scene (2026-10-15)
- Status: COMPLETE
- Asset used: `public/models/temple.glb` — original procedural model authored by `scripts/build-temple-model.mjs` (three.js geometry → `GLTFExporter` → glTF-Transform `dedup`/`prune`/`meshopt` with quantization). ~99.9k triangles, 10 top-level nodes, 10 materials (granite, stucco, sculpture, recess, gold, limewash, ochre, paving, earth, water), no image textures (vertex-colour variation × PBR colours). Raw 7.46 MB → **1.55 MB** compressed. Y-up, metres, gateway faces +Z, ~34 m tall gopuram.
- Files changed: `scripts/build-temple-model.mjs`, `public/models/temple.glb`, `src/scene/{TempleCanvas,TempleModel,Lighting,CameraRig,SceneErrorBoundary}.tsx`, `src/data/{temple,types}.ts`, `src/data/model.test.ts`, `src/lib/webgl.ts`, `src/components/NoWebGLNotice.tsx`, `src/App.tsx`, `scripts/smoke-scenarios.mjs`, `package.json` (+ `@gltf-transform/*`, `meshoptimizer` dev deps).
- Decisions: Drei `useGLTF(url, false, true)` — meshopt on, Draco off so no decoder is fetched from a CDN. Reflection environment built locally from `<Lightformer>`s (no HDRI download). Loading progress is real (`useProgress` from the three.js loading manager). Model errors are caught by `SceneErrorBoundary` → HTML error notice with a working retry (`useGLTF.clear` + remount). `hasWebGL()` gates the canvas; unsupported browsers get the placeholder/poster plus an explanatory notice.
- Acceptance results:
  - Real model loads and is visible from the initial camera — PASS (smoke: `data-scene-status="ready"` after 2.5 s in headless Chrome/SwiftShader; screenshots `01-landing-desktop.png`, `02-explore-desktop.png` reviewed).
  - Materials present, orientation correct — PASS (gateway faces the camera, upright; materials named and coloured; unit test asserts nodes/materials). No image textures by design.
  - Loading/failure states work — PASS (smoke: GLB request forced to 404 → alert "The temple model didn’t load"; "Try again" after unrouting → ready).
  - Fallback useful — PASS (smoke: WebGL context creation blocked → `unsupported` state, no canvas, explanatory notice). Poster still image to be captured in Phase 04 once lighting is final.
  - Asset source/licence recorded — PASS (`docs/ASSET_CREDITS.md`).
  - Build/runtime checks — PASS: `typecheck` 0 errors, `lint` 0 findings, `test` 7/7, `build` OK, `smoke` 21/21, no console errors.
- Known issues: JS bundle is 1.33 MB minified (three + R3F + Drei) → Vite >500 kB warning; to address in Phase 05 by lazy-loading the canvas. Sky is pale and the ground's square edge is visible in wide shots → Phase 04. Mobile landing crops the gopuram → Phase 04.

## Phase 03 — Exploration (2026-10-15)
- Status: COMPLETE
- Files changed: `src/data/landmarks.ts` (6 typed landmarks), `src/scene/{CameraRig,TempleModel,Hotspots,TempleCanvas}.tsx`, `src/components/{ExploreHud,LandmarkPanel,Header}.tsx`, `src/App.tsx`, `src/index.css`, `src/data/model.test.ts` (landmark ↔ GLB integrity), `tsconfig.test.json` (+ references; tests excluded from the app tsconfig), `scripts/smoke-scenarios.mjs`.
- Implementation:
  - Free exploration via Drei `CameraControls`: orbit (drag), dolly (wheel/pinch, `dollyToCursor`), truck (right-drag / two-finger), smooth damping; limits `minDistance 6`, `maxDistance 140`, `maxPolarAngle 0.47π` (never below the ground), orbit target clamped to a box around the compound. Keyboard: with the 3D view focused, arrows orbit, Shift+arrows pan, +/− zoom.
  - Six landmarks (gopuram, gopuram crown & kalashas, dhvajastambha, mandapa, vimana, pushkarini), each bound to a named GLB node, with anchor, camera pose, general sourced description, a separate "In this model" note (fictional model, not a historical claim) and source links.
  - Selection from: landmark list (desktop rail / mobile chips), numbered 3D markers (DOM buttons), clicking the model itself (raycast; drags ignored), and prev/next in the panel. Selection → emissive highlight on that node, smooth camera focus, panel. Close button, Escape, Reset view and Introduction keep state consistent (reducer unit-tested).
  - While a landmark is focused only its marker is shown (markers are not depth-occluded). On narrow screens the camera's focal offset lifts the subject above the bottom-sheet panel.
- Acceptance results (all from `npm run smoke`, headless Chrome 155 / SwiftShader, 48/48 checks):
  - Orbit/zoom/pan/reset — PASS (canvas pixel Δ after drag 44.3, wheel 25.6, right-drag 8.0; reset returns to the same view Δ0.02; arrow keys Δ24.9).
  - Each landmark visible/reachable and labelled — PASS (all 6 selected from the list; panel title matches; screenshots `10-landmark-1..6.png` reviewed; unit tests assert each anchor lies on its GLB node and no camera pose is inside a building's bounds).
  - Selection updates highlight, camera, panel — PASS (aria-pressed state, panel title, canvas Δ30–73 per selection; clicking the 3D gopuram selects it; hotspot marker selects Vimana).
  - Panel close and reselect — PASS (close button, Escape, next wraps around).
  - Mobile touch and keyboard UI — PASS (chip tap opens panel; panel stays above the chip strip and below 35% of the viewport; all visible buttons ≥44 px; close by touch).
  - No console errors/build failures — PASS (`typecheck` 0, `lint` 0, `test` 20/20, `build` OK).
- Debugging notes: early canvas comparisons used byte equality and captured HTML overlays and hover highlights, which gave false failures; the smoke helper now hides overlays, parks the cursor, waits two frames and uses a mean pixel-difference metric (changed > 2, same < 0.6). Three r186 removed `PCFSoftShadowMap` (runtime warning) → switched to `PCFShadowMap`.
- Known issues: markers are not occluded by geometry in free orbit (mitigated as above); `THREE.Clock` deprecation warning originates inside R3F (not app code).

## Phase 04 — Cinematic polish (2026-10-15)
- Status: COMPLETE
- Files changed: `src/scene/{Lighting,CameraRig,TempleModel,TempleCanvas,Hotspots}.tsx`, `src/data/temple.ts` (narrow landing/overview poses), `src/components/{LandmarkPanel,Header}.tsx`, `scripts/build-temple-model.mjs` (ground extended to ±420 m, water material) → `public/models/temple.glb` regenerated (still 1.55 MB), new `scripts/perf.mjs`, `scripts/capture-poster.mjs`, `public/images/temple-poster.jpg`, `scripts/smoke-scenarios.mjs`.
- Changes:
  - Atmosphere: replaced Drei `<Sky>` (pale/grey at this sun angle) with a small custom gradient sky shader (dusk zenith → amber horizon + sun glow) whose horizon colour equals the fog colour, so the ground plane dissolves into haze (the square ground edge is no longer visible). Sun lowered to ~14° for longer, warmer shadows.
  - Particles: **deliberately not added** — the haze already carries the mood, and drifting particles would force continuous rendering for decoration (against the brief).
  - Render loop: `frameloop="always"` only while the landing sway is animating; otherwise `demand` (camera-controls and the highlight fade invalidate while they move), so an idle exploration view renders nothing.
  - Composition: dedicated portrait landing pose (whole gopuram above the hero copy); portrait overview looks down the temple axis; exploration widens the lens to 52° on portrait screens; focused subjects are lifted above the mobile bottom sheet; the panel is capped at 26 rem on tablets.
  - Fallback: `temple-poster.jpg` (1600×1000, 100 KB) captured from the real scene on the GPU (`npm run capture:poster`) and shown when WebGL is unavailable.
- Acceptance results:
  - Cinematic mood consistent across states — PASS (screenshots reviewed: landing desktop/mobile/tablet, overview, all 6 focus shots, poster).
  - UI legible and usable — PASS (panels/lists on a 72%-opaque blurred backdrop; hero sits on a vignette; smoke: panel fits viewport at 390×844, 820×1180, 1180×820 and 1440×900; ≥44 px targets on mobile).
  - Reduced motion respected — PASS (smoke: landing frame Δ0.00 over 1.2 s; focus jump Δ0.00 between 0.4 s and 1.9 s; CSS transitions/animations disabled).
  - No functional regressions — PASS (`npm run smoke` 57/57, `npm test` 20/20, typecheck/lint clean, build OK).
  - Performance measured — PASS (`npm run perf`, headless Chrome on this machine's **Intel UHD Graphics (D3D11)**: 63 FPS during the continuously rendered landing shot (vsync-bound), 63 draw calls/frame and ~200k triangles/frame including the shadow pass, 18 MB JS heap, ready in 1.3 s from localhost. SwiftShader software rendering: 2.7 FPS — used for functional checks only).
- Known issues: none new. Discrete-GPU and real mobile-device performance not measured (no device available).

## Phase 05 — Quality and release readiness (2026-10-15)
- Status: COMPLETE (local release readiness); deployment not performed
- Files changed: `src/App.tsx` (lazy-loaded 3D chunk, progress via callback, retry recreates the lazy component), `src/scene/TempleCanvas.tsx` (`ProgressReporter`), `src/scene/cache.ts` (new), `src/scene/Hotspots.tsx` (accessible name includes the visible number), `src/components/AboutDialog.tsx` (exact font credits), `vite.config.ts` (`chunkSizeWarningLimit` for the lazy vendor chunk), `package.json` (`engines`, `axe-core` dev dependency, `perf`/`capture:poster` scripts), `scripts/smoke-scenarios.mjs` (axe-core audits, tablet viewports, poster check, overlay hiding via `display:none`), `README.md` (full rewrite of the one-line stub), `docs/ASSET_CREDITS.md`, `docs/KNOWN_ISSUES.md`, this log.
- Audits:
  - Dependencies: `npm audit` → 0 vulnerabilities. Runtime deps: react, react-dom, three, @react-three/fiber, @react-three/drei, two Fontsource fonts. Everything else is a dev tool.
  - Bundle (evidence: build output): before, a single 1.34 MB / 369 kB gzip chunk. After lazy-loading the scene: entry **246 kB / 78 kB gzip** (landing UI), scene 120 kB / 37 kB gzip, three/R3F/Drei vendor 981 kB / 262 kB gzip (lazy), CSS 33 kB / 7 kB gzip. Model 1.55 MB, poster 100 kB.
  - Accessibility: axe-core 4 (injected by the smoke test) on landing, About dialog, desktop explore + panel, mobile panel → **0 violations** after fixing one serious `label-content-name-mismatch` on the 3D markers.
  - Secrets: no tracked `.env`/key files; `git grep` for key/secret/password/token assignments → none. No environment variables are needed, so no `.env.example` was added.
  - Resource handling: the GLB is cached by `useGLTF`; retry clears the cache and remounts; landmark materials are cloned once (guarded by `userData`), so remounts don't leak clones.
- Commands/checks and results (final run):
  - `npm run typecheck` → exit 0.
  - `npm run lint` (oxlint) → 0 warnings, 0 errors. Two warnings introduced during this phase were fixed rather than suppressed: `static-components` and `exhaustive-deps`.
  - `npm test` → 2 files, 20/20 tests passed.
  - `npm run build` → success.
  - `npm run smoke` → **61/61** checks passed, three consecutive runs (headless Chrome 155, SwiftShader).
  - `npm run perf` → Intel UHD Graphics (D3D11): ready 1.1 s, 68 FPS, 63 draw calls, 199,738 triangles/frame incl. shadows, 16 MB heap.
  - `vite` dev server → `/` 200, `/models/temple.glb` 200 (1,627,188 bytes), `/src/main.tsx` 200.
- Browser verification: automated only, in headless Google Chrome 155 on Windows 11 (SwiftShader for functional checks, the Intel GPU for perf/poster). It covers desktop 1440×900, tablet 820×1180 and 1180×820, and phone 390×844 with touch emulation; landing, CTA, About dialog, all 6 landmarks, list/marker/model-click selection, prev/next/close/Escape, mouse orbit/zoom/pan, keyboard orbit, reset, reduced motion, model 404 + retry, no-WebGL poster fallback, and axe audits. **Not verified:** Safari, Firefox, physical mobile devices, screen-reader walkthroughs (KI-003).
- Asset credits complete: yes (`docs/ASSET_CREDITS.md`: original model, poster and logo; OFL fonts with licence verification; researched but unused CC BY candidates).
- Local release readiness: READY. `npm ci && npm run build` produces a static `dist/` that can be served by any static host. Nothing was pushed, merged or deployed.
- External actions awaiting approval: (1) push branch `feat/sanatan-mvp` / open a PR / merge to `main`; (2) choose and configure a static host and deploy `dist/`; (3) optionally, a human signed into Sketchfab downloads a CC BY model to replace the procedural one (KI-001).
- Final summary: all six phases are complete with recorded evidence. The main limitation is visual fidelity: the temple is an original stylised procedural model (KI-001), because a licensed high-detail model could not be downloaded without an account.
