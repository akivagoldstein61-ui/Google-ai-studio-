import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('Explore filter drawer live contracts', () => {
  it('previews filters against the full live discovery pool', () => {
    const source = readSource('src/features/discovery/ExploreScreen.tsx');

    expect(source).toContain('const { dailyPicks, exploreProfiles, preferences, setPreferences, resetTasteProfile } = useApp()');
    expect(source).toContain('const filterCandidatePool = useMemo(');
    expect(source).toContain('() => uniqueProfiles([...dailyPicks, ...exploreProfiles])');
    expect(source).toContain('profiles={filterCandidatePool}');
    expect(source).toContain('function uniqueProfiles(profiles: Profile[]): Profile[]');
    expect(source).not.toContain('profiles={exploreProfiles}');
  });

  it('waits for preference persistence before closing the drawer', () => {
    const source = readSource('src/features/discovery/ExploreScreen.tsx');

    expect(source).toContain('onApply={async (prefs) => {');
    expect(source).toContain('await setPreferences(prefs);');
    expect(source).toContain('const [saving, setSaving] = useState(false);');
    expect(source).toContain('const [saveError, setSaveError] = useState<string | null>(null);');
    expect(source).toContain('const handleApply = async () => {');
    expect(source).toContain('await onApply({');
    expect(source).toContain('disabled={saving}');
    expect(source).toContain("{saving ? 'Saving...' : 'Apply Filters'}");
    expect(source).toContain('Could not save filters. Please try again.');
    expect(source).not.toContain('onApply={(prefs) => { setPreferences(prefs); setShowFilters(false); }}');
  });

  it('waits for private taste reset persistence and keeps the drawer open on failure', () => {
    const source = readSource('src/features/discovery/ExploreScreen.tsx');

    expect(source).toContain('onResetTaste: () => Promise<void> | void');
    expect(source).toContain('const handleResetTaste = async () => {');
    expect(source).toContain('await onResetTaste();');
    expect(source).toContain('onClose();');
    expect(source).toContain('Could not reset taste learning. Please try again.');
    expect(source).toContain('onClick={handleResetTaste}');
    expect(source).not.toContain('onResetTaste();\n                onClose();');
  });
});
