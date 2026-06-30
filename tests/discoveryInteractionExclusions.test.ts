import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('discovery interaction exclusion contracts', () => {
  it('removes previously acted-on profiles from discovery pools before ranking', () => {
    const server = readSource('server/discoveryRoutes.ts');

    expect(server).toContain('loadInteractionExclusions(viewerUid)');
    expect(server).toContain('normalizeInteractionExclusions');
    expect(server).toContain('excludesInteractedCandidate(profile, interactionExclusions)');
    expect(server).toContain('interactionExclusionsApplied');
    expect(server).toContain('likedUserIds');
    expect(server).toContain('passedUserIds');
    expect(server).toContain('matchedUserIds');
    expect(server).toContain('hiddenUserIds');
    expect(server).toContain('dismissedUserIds');
    expect(server).toContain('input.likes');
    expect(server).toContain('input.passes');
    expect(server).toContain('input.matches');
    expect(server).toContain('input.hidden');
    expect(server).toContain('input.dismissed');
  });

  it('loads the acted-on candidate directly before writing live interaction and taste state', () => {
    const server = readSource('server/discoveryRoutes.ts');

    expect(server).toContain('async function loadCandidateForInteraction(profileId: string): Promise<Profile | null>');
    expect(server).toContain("db.collection('users').doc(profileId).get()");
    expect(server).toContain("for (const field of ['uid', 'id'])");
    expect(server).toContain(".where(field, '==', profileId)");
    expect(server).toContain('const tasteEventAlreadyRecorded = req.body?.tasteEventAlreadyRecorded === true;');
    expect(server).toContain('const candidate = await loadCandidateForInteraction(profileId);');
    expect(server).toContain("error: 'Like candidate profile was not loaded'");
    expect(server).toContain("error: 'Pass candidate profile was not loaded'");
    expect(server).toContain('async function buildDiscoveryTasteStateSnapshot');
    expect(server).toContain('candidateFeatures.length === 0');
    expect(server).not.toContain('const candidatePool = await loadCandidatePool(viewerUid, { includeInteracted: true });');
    expect(server).not.toContain('candidateFeatures: candidate ? profileToFeatureTags(candidate) : []');
  });

  it('does not serve seeded demo candidates or default viewers for authenticated live discovery loading failures', () => {
    const server = readSource('server/discoveryRoutes.ts');

    expect(server).toContain('allowDemoFallback?: boolean');
    expect(server).toContain("const allowDemoFallback = req.authContext?.mode === 'local-dev-mock';");
    expect(server).toContain("error: 'Discovery candidate persistence unavailable'");
    expect(server).toContain("error: req.uid ? 'Discovery viewer profile was not loaded' : 'Authentication required'");
    expect(server).toContain('async function loadViewer(uid: string | undefined, options: ViewerLoadOptions = {}): Promise<Profile | null>');
    expect(server).toContain('if (!uid) return options.allowDemoFallback ? fallback : null;');
    expect(server).toContain('if (!db) return options.allowDemoFallback ? fallback : null;');
    expect(server).toContain('if (!snap?.exists) return options.allowDemoFallback ? fallback : null;');
    expect(server).toContain('async function loadCandidatePool(viewerUid: string | undefined, options: CandidatePoolOptions = {}): Promise<Profile[] | null>');
    expect(server).toContain('if (!db) return options.allowDemoFallback ? demoCandidatePool() : null;');
    expect(server).toContain('if (!snap) return options.allowDemoFallback ? demoCandidatePool() : null;');
    expect(server).toContain('if (profiles.length === 0) return options.allowDemoFallback ? demoCandidatePool() : [];');
    expect(server).not.toContain('if (!uid) return fallback;');
    expect(server).not.toContain('if (!db) return fallback;');
    expect(server).not.toContain('if (!snap?.exists) return fallback;');
    expect(server).not.toContain('if (!db) return demoCandidatePool();');
    expect(server).not.toContain('if (profiles.length === 0) return demoCandidatePool();');
    expect(server).not.toContain('const outboundLikes = new Set<string>();');
  });

  it('commits discovery action interaction and taste writes atomically', () => {
    const server = readSource('server/discoveryRoutes.ts');

    expect(server).toContain("res.status(503).json({ error: 'Discovery interaction persistence unavailable', persisted: false })");
    expect(server).toContain('const interactionRef = db.collection(\'users\').doc(viewerUid).collection(PRIVATE_COLLECTION).doc(\'interactions\');');
    expect(server).toContain('const batch = db.batch();');
    expect(server).toContain('batch.set(interactionRef, {');
    expect(server).toContain('likes: FieldValue.arrayUnion(profileId)');
    expect(server).toContain('passes: FieldValue.arrayUnion(profileId)');
    expect(server).toContain("const tasteStateRef = db.collection('users').doc(viewerUid).collection(PRIVATE_COLLECTION).doc('taste_state');");
    expect(server).toContain('batch.set(tasteStateRef, tasteStateSnapshot, { merge: false });');
    expect(server).toContain('const persisted = await batch.commit().then(() => true).catch(() => false);');
    expect(server).toContain("res.status(500).json({ error: 'Discovery like was not fully persisted', profileId, persisted: false })");
    expect(server).toContain("res.status(500).json({ error: 'Discovery pass was not fully persisted', profileId, persisted: false })");
    expect(server).toContain('res.json({ success: true, isMatch, match, persisted: true, tastePersisted: true })');
    expect(server).toContain('res.json({ success: true, profileId, persisted: true, tastePersisted: true })');
    expect(server).not.toContain('const interactionPersisted = await db');
    expect(server).not.toContain(".doc('interactions')\n    .set({\n      likes: FieldValue.arrayUnion(profileId)");
    expect(server).not.toContain(".doc('interactions')\n    .set({\n      passes: FieldValue.arrayUnion(profileId)");
  });

  it('verifies reciprocal likes before committing match records with the action batch', () => {
    const server = readSource('server/discoveryRoutes.ts');
    const likeRoute = server.slice(server.indexOf("router.post('/like'"), server.indexOf("router.post('/pass'"));
    const reciprocalReadIndex = likeRoute.indexOf('const reciprocalSnap = await db');
    const firstBatchIndex = likeRoute.indexOf('const batch = db.batch();');

    expect(reciprocalReadIndex).toBeGreaterThanOrEqual(0);
    expect(firstBatchIndex).toBeGreaterThanOrEqual(0);
    expect(reciprocalReadIndex).toBeLessThan(firstBatchIndex);
    expect(likeRoute).toContain("res.status(500).json({ error: 'Could not verify reciprocal like', profileId, persisted: false })");
    expect(likeRoute).toContain("batch.set(db.collection('matches').doc(match.id), match, { merge: true });");
    expect(likeRoute).toContain("batch.set(db.collection('conversations').doc(match.id), {");
    expect(likeRoute).toContain("res.status(500).json({ error: 'Discovery like was not fully persisted', profileId, persisted: false })");
    expect(likeRoute).not.toContain("const matchPersisted = await db.collection('matches')");
    expect(likeRoute).not.toContain("const conversationPersisted = await db.collection('conversations')");
  });

  it('reports explicit taste preparation failures before discovery actions write anything', () => {
    const server = readSource('server/discoveryRoutes.ts');
    const likeTastePrepareIndex = server.indexOf("tasteStateSnapshot = await buildDiscoveryTasteStateSnapshot(viewerUid, 'like', candidate)");
    const likeBatchIndex = server.indexOf('const match = isMatch ? buildMatch');
    const passTastePrepareIndex = server.indexOf("tasteStateSnapshot = await buildDiscoveryTasteStateSnapshot(viewerUid, 'pass', candidate)");
    const passBatchIndex = server.lastIndexOf('const interactionRef = db.collection(\'users\').doc(viewerUid).collection(PRIVATE_COLLECTION).doc(\'interactions\');');

    expect(server).toContain('): Promise<ReturnType<typeof serializeTasteState> | null>');
    expect(server).toContain("tasteStateSnapshot = await buildDiscoveryTasteStateSnapshot(viewerUid, 'like', candidate)");
    expect(server).toContain("tasteStateSnapshot = await buildDiscoveryTasteStateSnapshot(viewerUid, 'pass', candidate)");
    expect(server).toContain("res.status(500).json({ error: 'Like taste state was not prepared', profileId, persisted: false })");
    expect(server).toContain("res.status(500).json({ error: 'Pass taste state was not prepared', profileId, persisted: false })");
    expect(likeTastePrepareIndex).toBeGreaterThanOrEqual(0);
    expect(likeBatchIndex).toBeGreaterThanOrEqual(0);
    expect(likeTastePrepareIndex).toBeLessThan(likeBatchIndex);
    expect(passTastePrepareIndex).toBeGreaterThanOrEqual(0);
    expect(passBatchIndex).toBeGreaterThanOrEqual(0);
    expect(passTastePrepareIndex).toBeLessThan(passBatchIndex);
    expect(server).not.toContain('persistDiscoveryTasteState');
    expect(server).not.toContain("await persistDiscoveryTasteState(viewerUid, 'like', candidate);");
    expect(server).not.toContain("await persistDiscoveryTasteState(viewerUid, 'pass', candidate);");
  });

  it('counts only successfully persisted discovery exposure impressions', () => {
    const server = readSource('server/discoveryRoutes.ts');

    expect(server).toContain('.then(() => true).catch(() => false)');
    expect(server).not.toContain('.catch(() => null);\n    return true;');
  });
});
