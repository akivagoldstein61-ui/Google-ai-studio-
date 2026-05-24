---
applyTo: "**"
---

# Kesher Product Constitution

Kesher is a **dignity-first, trust-forward, serious-intent dating app** for Israel.
Hebrew-first. Privacy-forward. Finite discovery. Assistive AI only. Calm and premium.

## What Kesher Is

- Finite Daily Picks + controlled Explore — not infinite casino swipe
- Values-first matching — observance, intent, life stage
- Hebrew/RTL primary UX, English supported
- AI as assistive tool (draft helper, safety scan, icebreaker suggestions) — never impersonating
- Safety as a first-class feature, visible and dignified

## What Kesher Is Not (Hard Stops)

Do not implement, enable, or suggest any of the following:

| Forbidden mechanic | Why |
|---|---|
| Public attractiveness scores or hot-or-not | Degrades dignity |
| AI auto-sending messages | Impersonation / trust violation |
| Protected-trait inference from photos (race, religion, ethnicity) | Privacy + discrimination |
| Casino swipe loop / infinite scroll engagement trap | Anti-product thesis |
| Hidden ranking manipulation or opaque filter overrides | Deceptive |
| Match-to-message paywall for mutual matches | Anti-user |
| Safety / report / block feature paywalls | Anti-user |
| Delete-account maze | Anti-user |
| AI claiming certainty about compatibility or romantic outcome | Misleading |
| Anonymous random chat | Trust violation |

## Core Product Screens

- **Daily Picks** — finite, calm, quality over quantity
- **Explore** — browsable, filtered, finite, not infinite scroll
- **Inbox / ChatThread** — message-first, safety visible
- **Settings** — accessible, not buried
- **Safety Center** — prominent, not buried, not paywalled
- **AI Trust Hub** — explains AI features, shows what data is used
- **Private Taste Profile** — user-controlled, exportable, deletable
- **Personality / Dimension screens** — values and intent, not attractiveness scoring
- **Admin screens** — least-privilege, auditable

## AI in the Product

- AI drafts copy suggestions; **user must explicitly send**
- Safety Scan flags potential issues; explanation is shown; user decides
- Why-Match explains reasoning using verified signals only
- Evidence labels must be shown: VERIFIED · INFERRED · HEURISTIC · UNKNOWN
- AI never claims it knows the user will like someone
- AI features are opt-in and explained in the AI Trust Hub
- Every AI feature must be in `featureRegistry.ts` before being shipped

## Hebrew / RTL Requirements

- All user-facing strings support Hebrew and RTL layout
- Touch targets and accessibility preserved in RTL
- Date pickers, inputs, and modals tested in RTL mode
- Do not hardcode LTR-only assumptions in layout or animation

## Report / Block / Safety

- Report and block affordances must be reachable in ≤ 2 taps from any user profile or chat thread
- Deletion and export flows must be easy to find
- Safety actions must work for free users
- Off-platform-contact warnings must appear before sharing contact info
