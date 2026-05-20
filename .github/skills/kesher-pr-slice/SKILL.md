# Kesher PR Slice Skill

**Purpose**: Decompose a body of work into small, independently deployable, independently revertable vertical slices suitable for Kesher's GitHub review process.

---

## When to Use This Skill

Invoke when:
- You have a verified repo audit and need to plan implementation
- A task is too large to fit in a single small PR
- A user asks "break this into slices" or "sequence this work"

---

## Trigger

> "Break this into PR slices" / "Sequence this work" / "Plan the implementation" / "What's the next slice?"

---

## Slice Format

Each slice must include:

```
## Slice N — [Name]

**Objective**: One sentence. What changes and why.

**Impacted files**:
- `path/to/file.ts` — what changes
(max ~5 files; justify if more)

**Acceptance criteria**:
- [ ] Specific testable behavior
- [ ] Validation command: `npm run ...`

**Validation matrix**:
| Command | Expected result |
|---------|----------------|
| `npx vitest run` | All N tests pass |
| `npx tsc --noEmit` | 0 errors |
| `npx vite build` | Build succeeds |

**Rollback**: One sentence on how to revert.

**Approval gate**: Yes/No — reason if Yes.
```

---

## Sequencing Rules

1. Auth before persistence
2. Persistence before matching
3. Each slice deployable independently
4. No slice silently changes architecture

---

## Approval Gate Triggers

Mark **requires approval** if the slice touches:
- `src/ai/policies.ts` safety thresholds
- Firestore schema
- Auth provider / auth flow
- Matching / ranking algorithm
- Router library introduction
- New external dependency (cloud service, DB, framework)

---

## Output

1. Executive summary (2–3 sentences)
2. Ordered slice list (use format above)
3. Dependency graph (which slices block which)
4. Open questions requiring user decision

End with: **"Awaiting approval before implementing."**

---

## Must Not

- Produce a single "build everything" slice
- Start implementing before explicit approval
- Sequence work that isn't supported by current repo state
