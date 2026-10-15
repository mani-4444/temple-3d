# Phase 05 — Quality and release readiness

## Goal
Leave the project stable, documented and ready for a human-approved release.

## Tasks
1. Audit dependencies, model/texture sizes, resource cleanup and error handling.
2. Run the actual available lint, type check, tests and production build.
3. Test primary flows in a browser if available.
4. Test responsive layout, keyboard navigation, reduced motion, loading failure, and mobile controls.
5. Fix issues introduced by the project work. Do not hide existing failures; document them.
6. Finish README with prerequisites, install/run/build commands, architecture overview and feature list.
7. Finalize `docs/ASSET_CREDITS.md`, `docs/BUILD_LOG.md`, and `docs/KNOWN_ISSUES.md`.
8. Confirm secrets are not tracked and `.env.example` contains names only if environment variables are actually required.
9. Prepare a release summary and list of manual steps.

## Constraints
Do not push, merge, deploy, purchase, or change production infrastructure without explicit approval. Do not claim a browser test or deployment occurred unless it did.

## Acceptance
- [ ] Production build succeeds or blocker is documented with actual output.
- [ ] Relevant tests/checks and results recorded.
- [ ] Main flows verified or clearly marked not run.
- [ ] README and asset credits are complete.
- [ ] Known issues and limitations are honest.
- [ ] Final report distinguishes local readiness from deployment.
