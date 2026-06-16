# Kesher — Artifact Triage (PR 0, non-destructive)

> **Nothing is deleted in PR 0.** This is a catalog + recommendation only. Each item carries an action label for a *later, separately-approved* PR. Commit `506e27e`.
>
> Actions: `KEEP` · `GENERATED_EXPORT` · `MOVE_LATER` · `DELETE_LATER` · `VERIFY_FIRST`.

## 1. Duplicate / shadow skill artifacts

| Path | Observed | Risk | Action | Approval | Notes |
|---|---|---|---|---|---|
| `skills/kesher-personality-ocean (1).skill` | Byte-identical duplicate of `kesher-personality-ocean.skill` (same blob sha) | Inventory confusion | `DELETE_LATER` | yes | Keep `kesher-personality-ocean.skill` + the dir |
| `skills/*.skill` (flat exports alongside `skills/*/` dirs) | Flat `.skill` bundles parallel to canonical dirs | Drift between flat export and dir SKILL.md | `GENERATED_EXPORT` / `VERIFY_FIRST` | yes | Confirm produced by `scripts/build-shareable-skills.mjs`; treat dir as source |
| `skills/sparkmatch-dating-app-skill.*`, `skills/video-generator.*` | External, non-Kesher packages also surfaced as Hub skills #29/#30 | Mislabeled as member skills | `MOVE_LATER` (to reference) | yes | See REFERENCE_SKILLS.md |

## 2. Stale root-level scratch / patch / test files

| Path | Observed | Risk | Action | Approval |
|---|---|---|---|---|
| `patch.ts`, `patch_service.ts`, `patch_service2.ts`, `patch_services.js` | Ad-hoc one-off patch scripts at repo root | Confusing; not referenced by build | `VERIFY_FIRST` → `DELETE_LATER` | yes |
| `test_duplicate_keys.js`, `test_genai.js`, `test_ping.js` | Loose manual test scripts (not Vitest) | Not in test runner; rot risk | `VERIFY_FIRST` → `DELETE_LATER` | yes |
| `index.mjs` | Loose entry-ish file at root | Unclear ownership vs `server.ts` | `VERIFY_FIRST` | yes |
| `files.zip` (73 KB) | Binary blob committed to repo | Repo bloat; unknown contents | `VERIFY_FIRST` → `DELETE_LATER` | yes |
| `kesher-ai-studio-prompt.txt`, `kesher-skills-full.md` (59 KB) | Generated prompt/skill dumps | Stale-doc drift | `KEEP` (docs) / `VERIFY_FIRST` | no |

## 3. Parallel app trees

| Path | Observed | Risk | Action | Approval |
|---|---|---|---|---|
| `src/` | The live React app (App.tsx, features, ai, services) | — | `KEEP` | — |
| `api/` | Vercel serverless catch-all (`api/[...path].ts` per `vercel.json`) | — | `KEEP` (deploy surface) | — |
| `app/` | Separate top-level `app/` dir | Possible stale/alt scaffold | `VERIFY_FIRST` | yes |
| `kesher-app/` | Separate top-level `kesher-app/` dir | Possible duplicate/alt prototype | `VERIFY_FIRST` | yes |

## 4. Deploy config

| Path | Observed | Risk | Action | Approval |
|---|---|---|---|---|
| `vercel.json` | Active: SPA + `api/[...path].ts`, `/__version`, headers | — | `KEEP` | — |
| `netlify.toml` | Second deploy target config | Dual-deploy drift / confusion | `VERIFY_FIRST` (which target is canonical?) | yes |
| `.vercelignore` | Controls what ships to Vercel | Risk of stripping `src/features/skills` | `KEEP` + verify via `check:vercel-upload` | no |

## 5. Docs claiming older counts

| Path | Observed | Risk | Action | Approval |
|---|---|---|---|---|
| `docs/skills-hub-integration-inventory.md` | Pre-existing inventory; may carry stale counts | Conflicts with `docs/skills/INVENTORY.md` | `MOVE_LATER` / annotate as superseded | no |
| `docs/target-architecture.md` | Non-authoritative future vision | Already labeled non-authoritative | `KEEP` | — |
| `CLAUDE.md` (pre-PR0) | Stale models/auth/matching/route facts | Corrected in PR 0 | `KEEP` (now corrected) | — |

## 6. Hooks / component path variants

| Path | Observed | Risk | Action | Approval |
|---|---|---|---|---|
| `src/features/skills/useSkillState.ts` **and** `src/features/skills/hooks/useSkillState.ts` | Two `useSkillState` paths; `SkillsHub`/`SkillsRouter` import from `./hooks/useSkillState`; root-level `useSkillState.ts` also present | Shadow/duplicate hook | `VERIFY_FIRST` → reconcile to one path | yes |
| `src/ai/evals/` | **Missing** dir referenced by `aiFeatureRegistry.ts` fixture paths | Broken contract reference | `VERIFY_FIRST` (add fixtures in PR 5/6) | no |

> **Reminder:** PR 0 changes nothing here. Each `*_LATER` / `VERIFY_FIRST` item becomes a scoped task with its own approval.
