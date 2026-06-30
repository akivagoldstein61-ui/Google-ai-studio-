import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('Filtering Marketplace skill live contracts', () => {
  it('inspects live discovery candidates rather than hard-coded demo candidates', () => {
    const source = readSource('src/features/skills/FilteringMarketplaceSkill.tsx');

    expect(source).toContain('const currentCandidatePool = useMemo');
    expect(source).toContain('uniqueProfiles([...dailyPicks, ...exploreProfiles])');
    expect(source).toContain('selectedCandidateId');
    expect(source).toContain('Candidate Admissibility Inspector');
    expect(source).toContain('Live Preference Scoring');
    expect(source).toContain('estimateDistanceKm(viewer, candidate)');
    expect(source).toContain('implicitAffinity(tasteState, profileToFeatureTags(candidate))');
    expect(source).toContain('savedViolation = violatesHardFilters(candidate, preferences)');
    expect(source).not.toContain('const candidate = MOCK_PROFILES[0];');
    expect(source).not.toContain('Soft Preference Scoring (Demo)');
    expect(source).not.toContain('demo candidate');
  });
});
