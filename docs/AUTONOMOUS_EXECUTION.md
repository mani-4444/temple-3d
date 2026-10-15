# Autonomous execution protocol

## Work without routine supervision
The agent should choose reasonable defaults, resolve ordinary implementation questions, and continue through all independent phases without asking for routine approval.

## Allowed within scope
- Read and edit project files.
- Add conventional open-source dependencies needed for the MVP.
- Research public docs and candidate assets.
- Download assets only when allowed by the source and license.
- Run local development, lint, type checks, tests and production builds.
- Make reversible implementation decisions and document them.
- Fix bugs introduced by its own changes.

## Approval required
- Push to a remote, merge branches, publish a deployment, or change production infrastructure.
- Buy assets, create paid services, incur metered usage, or accept paid terms.
- Delete unrelated files, discard user changes, rewrite Git history, or run destructive cleanup.
- Expose, rotate, transmit, or modify credentials and secrets.
- Make irreversible external changes or bypass access controls.

## Safe command behavior
- Inspect command effects before execution.
- Never use `git reset --hard`, `git clean -fd`, broad recursive deletion, or equivalent destructive actions on an unknown workspace.
- Inspect `git status` and diffs before and after phases.
- Do not overwrite files with uncommitted user changes.
- Do not retry the same failed operation repeatedly. Diagnose the cause and make at most a reasonable safe alternative attempt.
- Avoid installing unrelated global tools or executing opaque downloaded scripts.

## Network and tools
Verify whether browsing, downloading, browser automation, and required skills are available. Do not assume availability. If blocked, continue offline work that does not depend on them and document the blocker.

## Blocker protocol
When blocked:
1. Record the exact failed command/action and result.
2. Identify what depends on it.
3. Continue all independent work.
4. Use a safe alternative only if it does not violate licensing, scope, cost, or security constraints.
5. Leave the smallest necessary manual action for the user.

## End-of-phase record
For each phase, record:
- Files changed
- Acceptance criteria status and evidence
- Commands run and actual exit/results
- Browser checks performed or not available
- Known regressions or limitations
- Next phase and dependencies

## Final status
Distinguish local build readiness from deployed status. A successful local build is not proof of a successful deployment. Do not push, merge, or deploy without approval.
