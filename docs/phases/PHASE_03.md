# Phase 03 — Free-roam controls and landmarks

## Goal
Make the temple genuinely explorable.

## Tasks
1. Add orbit, zoom and pan with useful min/max limits and reset.
2. Create typed landmark data with stable IDs, titles, summaries, target positions, camera poses, and optional source/credit metadata.
3. Implement four to six landmarks that correspond to actual visible model features.
4. Implement clickable hotspots or a companion accessible landmark list.
5. On selection, highlight the landmark, smoothly focus the camera, and open a contextual panel.
6. Ensure panel close, reset, and switching landmarks keep state consistent.
7. Support keyboard interaction for HTML controls and touch-friendly targets.
8. Prevent camera focus poses from going inside geometry where reasonably possible.

## Constraints
Use orbit-based exploration for this MVP; don't implement full first-person collision physics. Avoid putting rapidly changing camera coordinates in React state each frame.

## Acceptance
- [ ] Orbit/zoom/pan/reset work.
- [ ] Each landmark is visible/reachable and correctly labeled.
- [ ] Selection updates highlight, camera, and panel.
- [ ] Panel can close and another landmark can be selected.
- [ ] Mobile touch and keyboard-accessible UI work.
- [ ] No new console errors or build failures.
