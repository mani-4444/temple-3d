# Phase 04 — Cinematic polish

## Goal
Refine atmosphere and motion without compromising usability or performance.

## Tasks
1. Tune lighting, material response, ground and environment.
2. Add restrained haze/particles only if they help the composition and perform well.
3. Refine transitions, hover/focus states, panel motion and landing-to-exploration transition.
4. Verify typography, contrast and UI positioning over the scene.
5. Honor reduced-motion settings and avoid unnecessary continuous animation.
6. Test at mobile, tablet and desktop aspect ratios.
7. Remove dead code introduced by this phase; avoid unrelated refactors.

## Constraints
No excessive bloom, expensive post-processing, constant animation for decoration, or changes that break landmark selection.

## Acceptance
- [ ] Cinematic mood is consistent across states.
- [ ] UI remains legible and usable.
- [ ] Reduced-motion preference is respected.
- [ ] No functional regressions.
- [ ] Performance is measured or limitations are documented.
