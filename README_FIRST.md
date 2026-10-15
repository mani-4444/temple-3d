# Dravida — Claude Code Autonomous Build Kit

This kit is designed for a hands-off build of a cinematic, free-roam 3D South Indian Dravidian temple experience.

## Start here

1. Copy the contents of this kit into the root of your project repository. If the repository already has a `CLAUDE.md`, merge the instructions rather than blindly replacing existing project rules.
2. Open Claude Code in the repository root.
3. Paste the one-time bootstrap prompt in `START_AUTONOMOUS_BUILD.md`.
4. Let Claude work through `docs/IMPLEMENTATION_PLAN.md` and the phase prompts in `docs/phases/`.
5. Review the final `docs/BUILD_LOG.md`, `docs/KNOWN_ISSUES.md`, and `docs/ASSET_CREDITS.md`.

The bootstrap prompt is the only prompt you need to paste manually. Claude Code cannot begin merely because files were copied; the initial turn must be started in Claude Code.

## Included documents

- `CLAUDE.md` — persistent project rules for Claude Code.
- `START_AUTONOMOUS_BUILD.md` — one-time bootstrap prompt.
- `docs/PROJECT_BRIEF.md` — product definition and scope.
- `docs/IMPLEMENTATION_PLAN.md` — phased implementation sequence and dependencies.
- `docs/ARCHITECTURE.md` — target technical design and folder structure.
- `docs/ASSET_STRATEGY.md` — model selection, licensing, optimization and fallback.
- `docs/QUALITY_GATES.md` — testing, accessibility, performance and release criteria.
- `docs/AUTONOMOUS_EXECUTION.md` — autonomy rules, checkpoints and stop conditions.
- `docs/phases/PHASE_00.md` through `PHASE_05.md` — phase-specific instructions.
- `docs/BUILD_LOG.md` and `docs/KNOWN_ISSUES.md` — templates for transparent reporting.
- `.claude/commands/build-dravida.md` — optional reusable slash command if the local Claude Code setup supports project commands.

## Important boundaries

Claude may inspect and modify project files, install normal project dependencies, research and use assets with suitable licenses, run local checks, and fix issues within the stated scope. It must not expose secrets, delete unrelated work, run destructive commands, incur paid services or purchases, bypass access controls, or claim an unverified test/deployment succeeded.

By default, it must not push commits, merge branches, publish a deployment, or perform other external/irreversible actions without explicit approval. If an operation requires unavailable credentials, human-only consent, payment, or a decision that cannot be safely inferred, it must document the blocker and continue with independent work.
