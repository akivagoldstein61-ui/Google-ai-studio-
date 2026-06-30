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

  it('previews pool impact against the full live discovery pool before falling back to seed data', () => {
    const source = readSource('src/features/skills/FilteringMarketplaceSkill.tsx');

    expect(source).toContain('const { user, preferences, setPreferences, dailyPicks, exploreProfiles, trackEvent } = useApp()');
    expect(source).toContain('const candidatePool = useMemo(() => {');
    expect(source).toContain('const live = uniqueProfiles([...dailyPicks, ...exploreProfiles]);\n    return live.length > 0 ? live : MOCK_PROFILES;');
    expect(source).toContain('[dailyPicks, exploreProfiles]');
    expect(source).not.toContain('const candidatePool = exploreProfiles.length > 0 ? exploreProfiles : MOCK_PROFILES');
  });

  it('keeps failed preference saves visible instead of treating them as applied', () => {
    const source = readSource('src/features/skills/FilteringMarketplaceSkill.tsx');

    expect(source).toContain('const [saveError, setSaveError] = useState<string | null>(null);');
    expect(source).toContain('setSaveError(null);');
    expect(source).toContain('await setPreferences(next);');
    expect(source).toContain("console.error('Failed to save filtering marketplace controls', error);");
    expect(source).toContain("setSaveError('Could not save discovery controls. Please try again.');");
    expect(source).toContain('role="alert"');
    expect(source).not.toContain('await Promise.resolve(setPreferences(next));');
  });
});
