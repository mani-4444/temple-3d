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

## Phase 01 — Landing foundation
- Status: NOT STARTED
- Files changed:
- Acceptance results:
- Commands/checks and results:
- Known issues:

## Phase 02 — 3D scene
- Status: NOT STARTED
- Asset used:
- Files changed:
- Acceptance results:
- Commands/checks and results:
- Known issues:

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
