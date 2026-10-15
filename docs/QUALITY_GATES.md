# Quality gates and acceptance tests

## Required checks
Discover commands from `package.json`; do not assume every script exists.
- Lint
- TypeScript type check
- Unit/component tests if configured
- Production build
- Browser smoke test if browser tooling is available

## User-flow checks
1. Initial page loads and shows a useful state while the model is loading.
2. Successful model load transitions to the usable scene.
3. Model load failure displays a clear error and fallback.
4. Explore CTA works.
5. Orbit, zoom, pan and reset work.
6. Each landmark can be selected and has a meaningful panel.
7. Camera focus transitions do not leave controls stuck or the camera inside geometry.
8. Panel close/reset returns to a sensible state.
9. Keyboard navigation and focus indicators work for HTML controls.
10. Mobile viewport remains usable; hotspots and panels do not block all controls.
11. Reduced-motion preference suppresses nonessential motion.
12. No new console errors, broken assets, or runtime exceptions.

## Performance goals
These are targets, not guarantees:
- Aim for smooth 30–60 FPS on representative hardware.
- Avoid needlessly large textures, excessive draw calls, continuous idle effects and expensive post-processing.
- Measure before adding optimization complexity.
- Show loading progress or meaningful feedback for large assets.
- Provide a usable fallback when WebGL is unavailable.

## Accessibility and content
- Buttons have clear accessible names.
- Keyboard focus is visible.
- Text contrast and panel readability are adequate over the scene.
- Core controls are not mouse-only.
- Respect reduced-motion preferences.
- Do not present fictional/composite details as verified history.
- Provide asset credits and setup instructions.

## Release status vocabulary
- PASS: executed and evidence supports success.
- FAIL: executed and failed.
- BLOCKED: could not execute due to a documented dependency or capability.
- NOT RUN: not attempted.
Never mark a check PASS based only on code inspection if execution was required.
