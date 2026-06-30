# Kesher Skills — Google AI Studio Build Mode

This folder contains everything you need to open the Kesher architecture as a shareable agent in **Google AI Studio Build mode**.

---

## What Is Included

| File | Purpose |
|---|---|
| `kesher-system-prompt.txt` | Master system prompt — paste into AI Studio System Instructions |
| `kesher-ai-studio-config.json` | Full config reference: model, safety settings, skill registry |
| `README.md` | This guide |

---

## Quick Start: Open in AI Studio Build Mode

### Step 1 — Open AI Studio Build Mode

Go to [aistudio.google.com](https://aistudio.google.com) and click **Build** in the left sidebar.

### Step 2 — Set System Instructions

1. In the Build mode editor, click **System Instructions** or the pencil icon at the top of the prompt panel.
2. Open `kesher-system-prompt.txt` from this folder.
3. Copy the entire contents and paste into the System Instructions field.
4. Click **Save**.

### Step 3 — Configure the Model

In the right-hand settings panel, set:

| Setting | Value |
|---|---|
| Model | `gemini-2.5-flash` |
| Temperature | `0.2` |
| Top-P | `0.95` |
| Max output tokens | `8192` |

### Step 4 — Set Safety Filters

Set all four safety categories to **Block low and above** for a dating app:

- Harassment: Block low and above
- Hate speech: Block low and above
- Sexually explicit: Block low and above
- Dangerous content: Block low and above

### Step 5 — Share the App

1. Click **Share** in the top-right corner.
2. Set access to **Anyone with the link can use**.
3. Copy the link and share with collaborators.

> **Note:** Collaborators can view and fork the code. Do not paste a real `GEMINI_API_KEY` into the app. AI Studio proxies the key automatically for shared apps.

---

## The 10 Kesher AI Studio Skills

The system prompt encodes all 10 skills. Each skill maps to a section in the prompt:

| # | AI Studio Skill ID | Canonical Codex Skill | Section in Prompt | Status |
|---|---|---|---|---|
| 1 | `kesher-personality-assessment` | `kesher-personality-assessment` | SKILL 1 | Live |
| 2 | `kesher-consent-ux` | `kesher-consent-ux` | SKILL 2 | Live |
| 3 | `kesher-permissioned-sharing` | `kesher-permissioned-sharing` | SKILL 3 | Live |
| 4 | `kesher-ai-runtime-governance` | `kesher-ai-governance` | SKILL 4 | Live |
| 5 | `kesher-privacy-recommendation` | `kesher-private-recommendations` | SKILL 5 | Live |
| 6 | `kesher-why-this-match` | `kesher-personality-why-match` | SKILL 6 | Live |
| 7 | `kesher-israeli-privacy` | `kesher-israeli-privacy` | SKILL 7 | Live |
| 8 | `kesher-psychometric-validation` | `kesher-psychometric-validation` | SKILL 8 | Live governance gate |
| 9 | `kesher-compatibility-reflection` | `kesher-compatibility-reflection` | SKILL 9 | Live |
| 10 | `kesher-dark-pattern-audit` | `kesher-dark-pattern-audit` | SKILL 10 | Live governance gate |

The member-facing personality assessment is now the original Kesher Reflection instrument: 20 Kesher-authored items, deterministic aspect/domain scoring, private-by-default reports, no raw-answer export, no LLM scoring, and no compatibility prediction.

See `docs/operator/skill-inventory.md` for the full repo-local skill map, legacy `.skill` artifacts, and globally installed skill alignment.

---

## Example Prompts to Try in Build Mode

**Test a skill boundary:**
> "Add a compatibility score between two users based on their personality."

The agent should refuse and cite Skill 9: compatibility is reflective, mutual-consent based, and not predictive.

**Build a consent screen:**
> "Build a React consent gate for the personality assessment feature that complies with Israeli Section 11 requirements."

**Generate a Why This Match explanation:**
> "Write a Why This Match explanation for two users who both listed 'family-oriented' and 'Shabbat-observant' in their profiles. User A shared a personality card with User B."

**Check a dark pattern:**
> "Is it okay to pre-check the 'Use my personality for recommendations' toggle by default?"

The agent should refuse and cite Skill 10: all sensitive toggles default off.

---

## Connecting to the GitHub Repo

The full interactive Skills Hub is in the React app at:

```text
src/features/skills/SkillsRouter.tsx
src/features/skills/SkillsHub.tsx
src/features/skills/*.tsx
```

Each skill component is a self-contained interactive reference implementation. The AI Studio system prompt is the shareable, portable version of the same skill knowledge.

---

## Security Notes

- `GEMINI_API_KEY` must remain server-side. See `AGENTS.md` for the full security contract.
- Do not paste a real API key into any AI Studio shared app.
- For personality-sensitive AI calls, use server-side guarded routes and redacted logging.
- Personality reports are private by default and must not expose raw answers, exact hidden scores, or hidden ordering signals.
