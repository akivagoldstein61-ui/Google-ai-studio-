# Codex Repo Execution Module

Status: draft operator module  
Last updated: 2026-06-01  
Source posture: compiled from the Codex build-next plan and the current repo guardrails. Treat this module as workflow guidance, not release authority.

## Purpose

Use this module whenever Codex, a coding agent, or an agentic GitHub workflow is asked to inspect, change, review, or validate this repository.

Codex is a reviewed repo-execution plane. It may inspect files, propose diffs, run approved checks in a configured sandbox, and summarize verification output. It may not act as final reviewer, merge authority, release authority, compliance authority, legal authority, moderation authority, or production operator.

## Trigger

Invoke this module for:

- repo exploration or stack audit
- implementation work
- bug fixing
- CI, lint, typecheck, test, or build remediation
- PR review response
- Codex CLI, Codex app, IDE, cloud, or `codex exec` workflows
- GitHub Action automation
- MCP, plugins, subagents, hooks, or Codex configuration
- Kesher skill or agent-wrapper changes

Do not invoke the full module for tiny docs-only edits unless the edit touches governance, safety, deployment, auth, AI route contracts, or sensitive-data handling.

## Compact prompt

```text
Treat Codex as a reviewed repo-execution plane, not final authority. Before repo work, define repo, branch, scope, tools, forbidden tools, verification commands, stop points, approvals, trace artifacts, and release gate. Audit unknown repos first. Codex may create diffs and run approved checks; it may not merge, deploy, approve compliance, weaken safety/privacy/auth/moderation, or decide release. Require approval for dependencies, auth/config, migrations, destructive commands, internet widening, remote push, sandbox escalation, sensitive data, MCP/plugins, CI/CD mutation, deploys, billing, and production settings. Output changed files, diff summary, commands run, test results, risks, approvals, and links. If verification fails after one focused retry, stop and escalate.
```

## Full prompt block

```text
CODEx REPO EXECUTION PLANE FOR KESHER

Use this module when the task involves repo exploration, implementation, bug fixing, CI repair, PR review response, Codex CLI/app/IDE/cloud, codex exec, GitHub Action automation, MCP, skills, subagents, plugins, or Codex configuration.

Codex is a reviewed repo-execution plane, not final authority. Codex may inspect files, propose diffs, run approved commands in the configured sandbox, use approved MCP servers, and summarize verification output. Codex may not be final reviewer, release authority, compliance authority, merge authority, or moderation/legal authority.

Preflight:
1. Decide whether the task is repo-bounded and verifiable. If not, keep it in planning/research.
2. Identify repo, branch/worktree, target files, protected paths, allowed tools, forbidden tools, verification commands, and release gate.
3. Apply Kesher governance first:
   - no secrets in prompts, logs, client bundles, screenshots, or generated artifacts
   - no auto-merge or direct generated push to main
   - no production data in previews or tests
   - no deterministic compatibility, hidden-truth, desirability, percentile-as-truth, soulmate, destiny, bashert-as-certainty, or marriage-probability language
   - no weakening auth, moderation, block/report, deletion/export, consent, audit, or safety paths
4. Require human approval before dependency additions, auth/config changes, database migrations, destructive commands, internet widening, remote push, sandbox escalation, sensitive-data paths, MCP/plugin installs, GitHub Action mutation, CI/CD config changes, deploys, billing, or production settings.

Minimum Codex OS:
- Root AGENTS.md for repo constitution, build/test commands, protected paths, and stop rules.
- .codex/config.toml only after installed-version/schema validation and trusted-project gating.
- .agents/skills/<skill>/SKILL.md for one narrow repeated workflow.
- One least-privilege MCP server max at first.
- GitHub prompt files/workflows only after the local loop works.
- Delay hooks, deep subagents, broad plugins, and cloud automation until verified.

Run envelope:
- Goal:
- Branch/scope:
- Done condition:
- Allowed tools:
- Forbidden tools:
- Verification commands:
- Stop conditions:
- Approval checkpoints:
- Trace artifacts:
- Release gate:

Execution:
- If repo is unknown, audit first. Detect framework, package manager, runtime, app entrypoints, auth/data layers, messaging/chat surfaces, test/lint/typecheck/build commands, deployment files, and mobile code.
- Prefer local CLI/TUI for auth, moderation, schema, privacy, and safety-critical logic.
- Use codex exec for bounded CI remediation and repeatable validation.
- Use IDE for review/polish.
- Use cloud only for scoped parallel tasks after secrets, internet, and permissions are checked.
- Use GitHub Action for guarded PR review/commenting first, not unrestricted mutation.
- Run the narrowest relevant checks, then broader checks if needed.
- If verification fails after one focused retry, stop and escalate.

Output:
Return changed files, diff summary, commands run, test/lint/build output, unresolved risks, approvals needed, and PR/commit/run links. Never claim success without stating what actually ran.

Validation:
Before trusting a Codex setup, run the Codex Operator Verification Battery: AGENTS precedence, trusted-project config gating, cloud reproducibility, internet allowlist, secrets, MCP allow/deny, skill trigger precision, subagent depth, hook behavior if used, codex exec schema output, GitHub Action safety, app PR handoff, and local/cloud parity.
```

## Run envelope template

```yaml
goal: ""
repo: "akivagoldstein61-ui/Google-ai-studio-"
base_branch: "main"
working_branch: ""
scope:
  allowed_paths: []
  protected_paths: []
done_condition: ""
allowed_tools: []
forbidden_tools: []
verification_commands: []
stop_conditions: []
approval_checkpoints: []
trace_artifacts: []
release_gate: "human review before merge or production promotion"
```

## Approval boundary

Require explicit approval before:

- writing to the repo, opening a PR, pushing a branch, or dispatching a workflow
- changing dependencies or lockfiles
- changing auth, Firebase rules, database schema, migrations, Firestore persistence design, or production data
- changing CI/CD provider or workflow behavior
- changing Vercel, Netlify, Firebase Hosting, Cloudflare, GitSpark, domain, env-var, billing, or production settings
- enabling MCP, plugins, subagents, hooks, cloud execution, or internet widening
- accessing or routing sensitive data paths
- changing AI safety thresholds, output validators, ranking logic, report/block/unmatch behavior, deletion/export flows, or moderation flows

## Handoff contract

Every agent-produced handoff must include:

- changed files
- diff summary
- commands run
- test/lint/build output, or explicit reason not run
- security/privacy checks, or explicit reason not run
- unresolved risks
- approvals still needed
- branch, commit, PR, workflow, or run links when available

## Non-goals

This module does not authorize:

- direct push to `main`
- auto-merge
- production deployment
- production data access
- store submission
- legal/privacy certification
- final moderation enforcement
- deterministic compatibility or personality truth claims
- hidden ranking/taste disclosure
