# Verification Checklist

- [ ] App builds and compiles successfully.
- [ ] Preview renders without breaking.
- [ ] Bio coach generates drafts.
- [ ] Safety scan validates messages before sending.
- [ ] Date planner opens and handles location safely.
- [ ] AI routes fail calmly in strict mode without an auth token.
- [ ] AI routes function in explicit `prototype` mode.
- [ ] No client-side secrets introduced (checked `.env` and `src/`).
- [ ] Camera permission removed from `metadata.json`.
- [ ] Geolocation requested narrowly.
- [ ] No banned vocabulary introduced in UI.
- [ ] No schema mismatch or duplicate-key warnings revived.
