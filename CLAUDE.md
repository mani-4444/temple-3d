# Dravida project instructions

## Mission
Build a portfolio-quality, cinematic, immersive 3D website for exploring a South Indian Dravidian temple. The temple model is the centerpiece. The MVP uses orbit-based free exploration, clickable architectural landmarks, smooth camera focus, and contextual information panels.

## Before coding
- Read `README_FIRST.md`, `docs/PROJECT_BRIEF.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/ARCHITECTURE.md`, `docs/ASSET_STRATEGY.md`, `docs/QUALITY_GATES.md`, and `docs/AUTONOMOUS_EXECUTION.md`.
- Inspect the actual repository and current Git state before changing anything.
- Preserve existing project conventions and working features. Do not overwrite user work or replace the app wholesale without evidence it is necessary.
- Use installed Claude Code skills/tools only when relevant; do not install random skills or tools without a clear benefit.
- Record assumptions and decisions in project docs.

## Preferred stack
Prefer the existing compatible stack. For a new app, use Vite + React + TypeScript, React Three Fiber, Drei, and Tailwind CSS. Use Three.js directly only where it materially helps. Keep UI and 3D scene concerns separate.

## Product scope
- Cinematic landing scene and working “Explore Temple” transition.
- One real, properly licensed GLB/GLTF temple asset.
- Orbit/zoom/pan controls with sensible bounds and a reset action.
- Four to six data-driven architectural hotspots.
- Smooth camera focus and contextual information panel.
- Loading progress, error state, and a graceful non-WebGL fallback.
- Responsive desktop and mobile UI, keyboard-accessible HTML controls, reduced-motion support.
- Asset credits and clear setup instructions.

Do not add accounts, a backend, AI API calls, multiplayer, VR, payments, or complex first-person collision systems to the MVP.

## Implementation discipline
- Execute phases in order using `docs/phases/PHASE_00.md` through `PHASE_05.md`.
- Work autonomously within the approved scope; do not pause for routine styling or implementation choices.
- Make small, coherent changes. Avoid overengineering, speculative abstractions, unnecessary dependencies, and unrelated refactors.
- Keep all key interactions real; never create decorative controls that imply unsupported behavior.
- Use typed data for landmarks. Keep camera logic and UI state modular.
- If the repository is already implemented, adapt the plan instead of duplicating its structure.
- Do not use a generated still image as a substitute for the required interactive 3D model.

## Asset and truthfulness rules
- Verify asset source, license, attribution requirements, model integrity, scale, orientation, and texture availability.
- Never claim historical facts about a real temple without reliable supporting sources. If using a fictional/composite temple, label it as inspired by Dravidian architecture.
- Do not scrape, bypass paywalls, or use assets whose rights are unclear. If a suitable model cannot be obtained lawfully, use an openly licensed model or create a clearly documented temporary fallback and record the limitation.
- Never commit API keys, tokens, passwords, or `.env` secrets. Do not request secret values in chat. Use `.env.example` only for non-secret variable names when needed.

## Verification
- Discover the scripts in `package.json` before running checks.
- Run available lint, type checks, tests, and production build after each phase.
- Run the app in a browser or available browser tooling when possible and test the user flows.
- Fix regressions introduced by the current phase. Do not conceal failed or unavailable checks.
- Update `docs/BUILD_LOG.md`, `docs/KNOWN_ISSUES.md`, and asset credits.
- A phase is complete only when its acceptance criteria are met or remaining blockers are explicitly documented.

## Git and external actions
- Inspect `git status` before editing. Never discard user changes or use destructive reset/clean commands.
- Local branches and commits may be prepared only if they do not risk existing work. Do not push, merge, publish, deploy, purchase assets, create paid services, or trigger irreversible external actions without explicit approval.
- If a phase requires an external action that is not approved or cannot be completed safely, leave a clear command/checklist for the user and continue with safe local work.

## Completion report
At the end, report what was built, commands and checks actually run, their real results, asset sources/licenses, how to run the app, deployment readiness, and known limitations. Never report a success you did not verify.
