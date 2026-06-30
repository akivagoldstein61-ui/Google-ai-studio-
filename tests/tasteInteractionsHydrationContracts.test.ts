import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('persisted taste interaction hydration contracts', () => {
  it('server exposes owner-only taste interactions as hydrated summaries plus ids', () => {
    const source = readSource('server/tasteRoutes.ts');

    expect(source).toContain("router.get('/interactions'");
    expect(source).toContain('interactionIds[field] = ids');
    expect(source).toContain('summarizeInteractionValue(value)');
    expect(source).toContain('summarizeProfileForTaste(profile)');
    expect(source).toContain("doc('interactions')");
    expect(source).toContain('tasteInteractions: interactionsSnap?.exists');
  });

  it('client hydrates persisted interaction summaries before learned-taste recompute uses them', () => {
    const app = readSource('src/context/AppContext.tsx');
    const service = readSource('src/services/discoveryService.ts');
    const skill = readSource('src/features/skills/LearnedTasteSkill.tsx');

    expect(service).toContain("getTasteInteractions() {");
    expect(service).toContain("apiFetch('/api/taste/interactions')");
    expect(app).toContain('type TasteInteractions = {');
    expect(app).toContain('normalizeTasteInteractions(interactionsResponse.interactions)');
    expect(app).toContain('setInteractions(normalizeTasteInteractions');
    expect(app).toContain("discoveryService.recordTasteEvent('taste_pause', undefined, { paused: true, optedOut: true })");
    expect(app).toContain('createEmptyInteractions()');
    expect(app).not.toContain('moreLikeThis: [...interactions.moreLikeThis, profileId]');
    expect(app).not.toContain('lessLikeThis: [...interactions.lessLikeThis, profileId]');
    expect(skill).toContain('aiService.analyzeTasteProfile(interactions, tasteProfile)');
  });
});
