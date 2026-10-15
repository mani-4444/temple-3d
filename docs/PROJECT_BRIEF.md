# Project brief — Dravida

## Vision
A cinematic, immersive web experience that lets visitors explore a South Indian Dravidian temple in interactive 3D.

## Target users
Portfolio reviewers, developers, design-minded visitors, and people curious about Indian temple architecture.

## Design direction
- Cinematic, immersive, warm and reverent.
- Golden-hour lighting, deep stone tones, restrained haze and particles.
- Elegant editorial typography and clear visual hierarchy.
- Avoid visual clutter, excessive glow, generic dashboard styling, and distracting animation.
- Do not imply that a fictional/composite model represents a specific historic temple.

## MVP requirements
1. Responsive landing/hero screen with a working Explore action.
2. One real GLB/GLTF temple model with appropriate rights.
3. Orbit, zoom and pan controls with safe limits and reset.
4. Four to six selectable landmarks adapted to the model.
5. Selecting a landmark smoothly focuses the camera, highlights the landmark and opens an information panel.
6. Loading progress, model failure handling, and a non-WebGL fallback.
7. Keyboard-accessible UI controls, visible focus, reduced-motion support.
8. Mobile usability, asset credits, README, and reproducible setup.
9. No fake controls, unverified claims, or hidden paid services.

## Non-goals
No backend, user accounts, payment flows, AI runtime API, multiplayer, VR, full walking/collision simulation, or custom photogrammetry pipeline in this version.

## Success criteria
A first-time visitor can load the page, enter exploration, orient around the model, select each landmark, read its description, reset the camera, and use the main UI on mobile. The production build succeeds, assets are credited, and limitations are clearly documented.
