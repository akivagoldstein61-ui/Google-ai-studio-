---
applyTo: "src/**/*.{ts,tsx,css}"
---

# Kesher Frontend / RTL Conventions

## Stack

- React 19 with hooks, no class components
- Vite 6 with `@/*` path aliases (`tsconfig.json` → `moduleResolution: "bundler"`)
- Tailwind CSS v4 (no v3 `@apply` patterns unless already used in file)
- TypeScript strict mode
- `src/types/index.ts` — canonical domain types; prefer over `src/types.ts`

## Routing

React Router v7 is the router. Never use `useState` for navigation.
Preserve all registered routes; never delete a route silently.
Routes: `/`, `/prototype`, `/skills-hub`, `/demo?demo=1`, plus all feature routes in `App.tsx`.

## Component Conventions

- Functional components only
- Props typed inline or via named interface in same file
- Co-locate styles with components (Tailwind classes); no separate CSS modules unless already present
- `AppContext.tsx` is the app-state provider; do not introduce a second global store without approval
- `authFetch` for all authenticated API calls; never call `/api/ai/*` with raw `fetch` sans token

## RTL / Hebrew Requirements

- Use `dir="rtl"` on Hebrew content containers
- Tailwind logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`) instead of `ml-*`/`mr-*`/`pl-*`/`pr-*` where text directionality matters
- Test layouts in RTL viewport; do not assume LTR-only positional logic
- Icon placement must be verified in RTL (back arrows, chevrons flip)
- Form inputs: `text-align: start` not `text-align: left`

## Accessibility

- All interactive elements have accessible labels (`aria-label`, `aria-labelledby`, or visible text)
- Mobile touch targets ≥ 44×44px
- Color contrast meets WCAG AA (4.5:1 text, 3:1 UI components)
- Focus ring visible in keyboard navigation
- Do not hide report/block/safety affordances behind hover-only states

## AI UI Rules

- AI-generated suggestions are shown as **drafts** — user must click "Send"
- Show evidence labels: `VERIFIED` · `INFERRED` · `HEURISTIC` · `UNKNOWN`
- Never display raw AI output without running through output validators
- AI Trust Hub must remain accessible from Settings

## Design Direction — Velvet Clarity

Warm · calm · intimate · hopeful · premium · restrained.
Palette: warm neutrals, soft gold accents, generous whitespace.
Typography: readable, not decorative. Hebrew fonts must render cleanly.
No neon, no casino gradients, no trophy/streak/score gamification UI.

## Validation

```bash
npm run lint          # TypeScript + ESLint
npm run typecheck     # tsc --noEmit
npm run test          # Vitest unit tests
npm run test:rtl      # RTL snapshot tests
npm run build         # Vite production build
```

Run all five before proposing a UI PR.
