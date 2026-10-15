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

## Phase 03 — Exploration
- Status: NOT STARTED
- Files changed:
- Acceptance results:
- Commands/checks and results:
- Known issues:

## Phase 04 — Cinematic polish
- Status: NOT STARTED
- Files changed:
- Acceptance results:
- Commands/checks and results:
- Known issues:

## Phase 05 — Quality and release readiness
- Status: NOT STARTED
- Commands/checks and results:
- Browser verification:
- Asset credits complete:
- Local release readiness:
- External actions awaiting approval:
- Final summary:
