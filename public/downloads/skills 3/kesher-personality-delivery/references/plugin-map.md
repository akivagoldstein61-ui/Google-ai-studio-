# Personality Delivery Plugin Map

Use plugins only when the task needs them.

- Superpowers: planning, systematic debugging, TDD, verification discipline for larger personality changes.
- Browser Use: open localhost, test onboarding/settings/discovery flows, inspect screenshots and interaction states.
- GitHub: inspect remote repo, issues, PRs, branches, or prepare review/publish steps when approved.
- CircleCI: inspect CI config, builds, and failures when CI status matters.
- CodeRabbit: request or address AI code review when preparing a PR or review pass.
- Netlify: manage or inspect Netlify deploys/config only if the app is deployed there.
- Vercel: manage or inspect Vercel deploys/config only if the app is deployed there.
- Cloudflare: use for Workers, caching, edge functions, or Cloudflare platform concerns.
- Neon Postgres: use if personality persistence or audit storage moves to Neon/Postgres. Current repo uses Firebase-facing services, so do not invent a Neon dependency.
- Expo: use for React Native/Expo parity work if personality flows are ported to mobile.
- Build iOS Apps: use for native iOS SwiftUI/App Intents parity, simulator debugging, or iOS performance work.
- Build macOS Apps: use for native macOS companion/admin tooling, packaging, or desktop app debugging.
- Quicknode: use only if a concrete web3/blockchain requirement is added. It is not part of the current personality architecture.
- YepCode: use only if approved external workflow automation is requested. Do not route product logic through it by default.
