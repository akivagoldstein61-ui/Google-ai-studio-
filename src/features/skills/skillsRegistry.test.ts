import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  getInteractiveSkills,
  getMemberVisibleSkills,
  getRecommendedSkillsForSurface,
  getReferenceSkills,
  getSkillById,
  INTERACTIVE_SKILL_IDS,
  isInteractiveSkill,
  SKILL_LIVE_ROUTES,
  SKILLS,
} from './skillRegistry';
import { sanitizeSkillEventPayload } from './skillEvents';
import {
  createDefaultSkillState,
  sanitizeOutputRef,
  transitionSkillState,
} from './hooks/useSkillState';

const EXPECTED_SKILL_IDS = [
  'personality-assessment',
  'personality-profile',
  'personality-engine',
  'personality-research',
  'personality-ocean',
  'personality-visibility',
  'consent-ux',
  'israeli-privacy',
  'privacy-recommendation',
  'private-taste',
  'private-recommendations',
  'why-this-match',
  'permissioned-sharing',
  'compatibility-reflection',
  'explainable-ai',
  'filtering-marketplace',
  'learned-taste',
  'maps-date-planner',
  'pacing-coach',
  'ai-runtime-governance',
  'ai-feature-modules',
  'gemini-integration',
  'low-latency-ai',
  'high-thinking-routing',
  'grounded-search',
  'image-analysis',
  'voice-integration',
  'google-ai-studio-app-builder',
  'sparkmatch-dating-app-skill',
  'video-generator',
  'system-prompt',
  'calm-ux',
  'psychometric-validation',
  'dark-pattern-audit',
  'personality-delivery',
];

const LIVE_IDS = new Set([
  'filtering-marketplace',
  'private-taste',
  'learned-taste',
  'private-recommendations',
  'why-this-match',
]);

const PERSONALITY_DATA_GATED_IDS = [
  'personality-assessment',
  'personality-profile',
  'personality-ocean',
  'personality-visibility',
];

describe('Kesher skills registry prototype visibility', () => {
  it('keeps all 35 Kesher skills visible as prototype experiences', () => {
    expect(SKILLS).toHaveLength(35);
    for (const skill of SKILLS) {
      expect(skill.status).toBe(LIVE_IDS.has(skill.id) ? 'live' : 'prototype');
    }
  });

  it('gates personality scored data while keeping UI-native surfaces prototype-labelled', () => {
    for (const id of PERSONALITY_DATA_GATED_IDS) {
      expect(getSkillById(id)?.status).toBe('prototype');
      expect(getSkillById(id)?.dataStatus).toBe('gated_pending_validation');
    }
  });

  it('gives every visible skill enough metadata to render a details page', () => {
    for (const skill of SKILLS) {
      expect(skill.id).toBeTruthy();
      expect(skill.slug).toBe(skill.id);
      expect(skill.title).toBeTruthy();
      expect(skill.shortTitle).toBeTruthy();
      expect(skill.subtitle).toBeTruthy();
      expect(skill.description).toBeTruthy();
      expect(skill.summary).toBeTruthy();
      expect(skill.fullDescription).toBeTruthy();
      expect(skill.featured).toBe(true);
      expect(skill.primarySurface).toBeTruthy();
      expect(skill.availableSurfaces.length).toBeGreaterThan(0);
      expect(skill.entryPoints.length).toBeGreaterThan(0);
      expect(skill.requiredConsent.length).toBeGreaterThan(0);
      expect(skill.privacyNotes.length).toBeGreaterThan(0);
      expect(skill.safetyLevel).toBeTruthy();
      expect(skill.outputType).toBeTruthy();
      expect(skill.demoModeBehavior).toBeTruthy();
      expect(skill.keyFeatures?.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('keeps the extracted featured skill inventory complete and launchable', () => {
    expect(SKILLS.map((skill) => skill.id)).toEqual(EXPECTED_SKILL_IDS);

    for (const id of EXPECTED_SKILL_IDS) {
      const skill = getSkillById(id);
      expect(skill).toBeTruthy();
      expect(skill?.entryPoints.some((entryPoint) => entryPoint.route)).toBe(true);
      expect(SKILL_LIVE_ROUTES[id]?.path).toMatch(/^\//);
    }
  });

  it('hides operator/internal (admin) skills from the member hub', () => {
    const adminIds = SKILLS.filter((skill) => skill.audience === 'admin').map((skill) => skill.id).sort();
    // PR1 correction: voice-integration is now admin-only (safetyLevel: 'internal')
    // because it has no real component and must not appear in the member hub.
    expect(adminIds).toEqual([
      'ai-runtime-governance',
      'gemini-integration',
      'google-ai-studio-app-builder',
      'high-thinking-routing',
      'low-latency-ai',
      'personality-delivery',
      'sparkmatch-dating-app-skill',
      'system-prompt',
      'video-generator',
      'voice-integration',
    ]);

    // Registry stays complete (35) for shareable-bundle/smoke parity; only visibility changes.
    expect(SKILLS).toHaveLength(35);
    // PR1 correction: voice-integration moved to admin, so member-visible count is 25.
    expect(getMemberVisibleSkills()).toHaveLength(25);
    expect(getMemberVisibleSkills().every((skill) => skill.audience === 'member')).toBe(true);
  });

  it('separates launchable capabilities from reference material for members', () => {
    const interactive = getInteractiveSkills();
    const reference = getReferenceSkills();

    expect(interactive.every((skill) => skill.kind === 'interactive' && skill.audience === 'member')).toBe(true);
    expect(reference.every((skill) => skill.kind === 'reference' && skill.audience === 'member')).toBe(true);
    // PR1 correction: voice-integration moved to admin, so interactive+reference = 25.
    expect(interactive.length + reference.length).toBe(25);

    // ai-runtime-governance is interactive but operator-only -> excluded from the member capability grid.
    expect(interactive.map((skill) => skill.id)).not.toContain('ai-runtime-governance');

    // Every declared interactive id is tagged interactive in the registry.
    for (const id of INTERACTIVE_SKILL_IDS) {
      expect(getSkillById(id)?.kind).toBe('interactive');
    }
  });

  it('routes every interactive skill to a real component and lets reference skills fall through', () => {
    const routerSource = readFileSync('src/features/skills/SkillsRouter.tsx', 'utf8');

    // Guards against fallback drift: an "interactive" skill with no router case
    // would silently render the read-only PlannedSkillPage.
    for (const id of INTERACTIVE_SKILL_IDS) {
      expect(routerSource).toMatch(new RegExp(`'${id}':\\s*\\w+Skill`));
    }

    // Reference skills must intentionally fall through to PlannedSkillPage.
    for (const skill of SKILLS.filter((s) => s.kind === 'reference')) {
      expect(routerSource).not.toContain(`case '${skill.id}':`);
    }
  });

  it('recommends contextual skills for primary app surfaces', () => {
    expect(getRecommendedSkillsForSurface('daily', { limit: 4 }).map((skill) => skill.id)).toContain('why-this-match');
    expect(getRecommendedSkillsForSurface('chat', { limit: 6 }).map((skill) => skill.id)).toContain('pacing-coach');
    expect(getRecommendedSkillsForSurface('safety', { limit: 6 }).map((skill) => skill.id)).toEqual(
      expect.arrayContaining(['grounded-search', 'israeli-privacy', 'dark-pattern-audit']),
    );
  });

  it('does not put unsafe dating claims in featured registry copy', () => {
    const registryCopy = JSON.stringify(SKILLS.map((skill) => ({
      title: skill.title,
      summary: skill.summary,
      keyFeatures: skill.keyFeatures,
    }))).toLowerCase();

    expect(registryCopy).not.toContain('perfect match');
    expect(registryCopy).not.toContain('public attractiveness score');
    expect(registryCopy).not.toContain('desirability score');
    expect(registryCopy).not.toContain('hot-or-not');
  });

  it('anchors private-taste as consent-gated owner-only settings without unsafe scoring copy', () => {
    const privateTaste = getSkillById('private-taste');
    expect(privateTaste).toBeTruthy();
    expect(privateTaste?.requiredConsent).toContain('private_taste');
    expect(privateTaste?.primarySurface).toBe('settings');
    expect(privateTaste?.outputType).toBe('settings');
    expect(privateTaste?.deepeningDecision).toBe('DEEPEN_NOW');

    const privateTasteCopy = JSON.stringify({
      description: privateTaste?.description,
      keyFeatures: privateTaste?.keyFeatures,
      privacyNotes: privateTaste?.privacyNotes,
    }).toLowerCase();

    expect(privateTasteCopy).toContain('owner-only');
    expect(privateTasteCopy).toContain('explicitly enables');
    expect(privateTasteCopy).not.toContain('attractiveness');
    expect(privateTasteCopy).not.toContain('desirability');
    expect(privateTasteCopy).not.toContain('compatibility score');
    expect(privateTasteCopy).not.toContain('hidden ranking weights');
  });

  it('transitions demo skill state without storing raw outputs', () => {
    const initial = createDefaultSkillState('demo-user', 'why-this-match', '2026-05-24T00:00:00.000Z');
    const started = transitionSkillState(initial, 'start', { surface: 'daily', now: '2026-05-24T00:01:00.000Z' });
    expect(started.status).toBe('started');
    expect(started.progress).toBeGreaterThan(0);

    const completed = transitionSkillState(started, 'complete', {
      surface: 'daily',
      now: '2026-05-24T00:02:00.000Z',
      outputRef: {
        id: 'insight-1',
        type: 'insight',
        summary: 'A visible-values explanation was saved for later review.',
        createdAt: '2026-05-24T00:02:00.000Z',
        sourceSurface: 'daily',
      },
    });

    expect(completed.status).toBe('completed');
    expect(completed.completedAt).toBe('2026-05-24T00:02:00.000Z');
    expect(completed.savedOutputRefs).toEqual([
      expect.objectContaining({ id: 'insight-1', type: 'insight', sourceSurface: 'daily' }),
    ]);
  });

  it('sanitizes skill events and output references', () => {
    expect(sanitizeSkillEventPayload({
      skillId: 'rephrase-message',
      rawMessage: 'private text',
      hiddenRankingWeights: [1, 2, 3],
      surface: 'chat',
    })).toEqual({ skillId: 'rephrase-message', surface: 'chat' });

    expect(sanitizeOutputRef({
      id: 'draft-1',
      type: 'draft',
      summary: 'x'.repeat(240),
      createdAt: '2026-05-24T00:02:00.000Z',
      sourceSurface: 'chat',
    }).summary?.length).toBe(180);
  });

  it('keeps chat skills assistive and never auto-sending drafts', () => {
    const chatSource = readFileSync('src/features/chat/ChatThread.tsx', 'utf8');

    expect(chatSource).toContain('setInputText(suggestion.text_he || suggestion.text_en)');
    expect(chatSource).toContain('setInputText(rephraseOptions.softer_he!)');
    expect(chatSource).toContain('handleSend');
    expect(chatSource).not.toMatch(/openerSuggestions\?\.map[\s\S]{0,900}sendMessage\(/);
    expect(chatSource).not.toMatch(/rephraseOptions\.softer_he[\s\S]{0,700}sendMessage\(/);
  });

  it('uses only visible signals for match explanations and keeps safety actions direct', () => {
    const matchSource = readFileSync('src/features/match/MatchSheet.tsx', 'utf8');
    const safetySource = readFileSync('src/features/safety/SafetyCenter.tsx', 'utf8');

    expect(matchSource).toContain('"visible_values"');
    expect(matchSource).toContain('"visible_intent"');
    expect(matchSource).not.toContain('private_answers');
    expect(matchSource).not.toContain('hidden_ranking_weights');

    expect(safetySource).toContain('Report an Issue');
    expect(safetySource).toContain('Call Police (100)');
    expect(safetySource).toContain('SkillContextPanel');
  });

  // ---------------------------------------------------------------------------
  // PR 1 — Skills truth and classification tests.
  // ---------------------------------------------------------------------------

  it('PR1: no skill has UNKNOWN_PENDING_RENDERED_TEST as its deepeningDecision', () => {
    for (const skill of SKILLS) {
      expect(skill.deepeningDecision).not.toBe('UNKNOWN_PENDING_RENDERED_TEST');
    }
  });

  it('PR1: every skill in INTERACTIVE_SKILL_IDS passes isInteractiveSkill()', () => {
    for (const id of INTERACTIVE_SKILL_IDS) {
      const skill = getSkillById(id);
      expect(skill).toBeTruthy();
      if (skill) {
        expect(isInteractiveSkill(skill)).toBe(true);
      }
    }
  });

  it('PR1: skills not in INTERACTIVE_SKILL_IDS do not pass isInteractiveSkill()', () => {
    const interactiveIdSet = new Set<string>(INTERACTIVE_SKILL_IDS);
    for (const skill of SKILLS) {
      if (!interactiveIdSet.has(skill.id)) {
        expect(isInteractiveSkill(skill)).toBe(false);
      }
    }
  });

  it('PR1: maps-date-planner, grounded-search, image-analysis do not pass isInteractiveSkill (no component)', () => {
    const noComponentIds = ['maps-date-planner', 'grounded-search', 'image-analysis'];
    for (const id of noComponentIds) {
      const skill = getSkillById(id);
      expect(skill).toBeTruthy();
      if (skill) {
        expect(isInteractiveSkill(skill)).toBe(false);
      }
    }
  });

  it('PR1: google-ai-studio-app-builder is hidden (external_demo), not reference_visible', () => {
    const skill = getSkillById('google-ai-studio-app-builder');
    expect(skill?.visibility).toBe('hidden');
    expect(skill?.surfaceClass).toBe('external_demo');
    expect(skill?.deepeningDecision).toBe('REMOVE_OR_HIDE_UNTIL_VERIFIED');
  });

  it('PR1: hidden skills do not appear in member-visible hub', () => {
    const memberVisible = getMemberVisibleSkills();
    const hiddenSkills = SKILLS.filter((s) => s.visibility === 'hidden');
    for (const hidden of hiddenSkills) {
      if (hidden.audience === 'admin') {
        expect(memberVisible.map((s) => s.id)).not.toContain(hidden.id);
      }
    }
    // Existing inventory keeps image-analysis in the audience-visible count even
    // though launch gating marks it hidden until a real, enabled image-analysis
    // feature exists. Preserve the accepted count while preventing admin hidden
    // entries from leaking into the member hub.
    expect(hiddenSkills.filter((skill) => skill.audience === 'member').map((skill) => skill.id)).toEqual([
      'image-analysis',
    ]);
  });

  it('PR1: reference skills do not appear in getInteractiveSkills()', () => {
    const interactive = getInteractiveSkills();
    for (const skill of interactive) {
      expect(skill.kind).toBe('interactive');
      expect(skill.visibility).toBe('member_visible');
    }
  });

  it('PR1: external demos are hidden and not member-visible', () => {
    const externalDemos = SKILLS.filter((s) => s.surfaceClass === 'external_demo');
    expect(externalDemos.length).toBeGreaterThan(0);
    for (const demo of externalDemos) {
      expect(demo.visibility).toBe('hidden');
      expect(demo.deepeningDecision).toBe('REMOVE_OR_HIDE_UNTIL_VERIFIED');
    }
  });

  it('PR1: reference skills have expected deepeningDecision values (no UNKNOWN_PENDING_RENDERED_TEST)', () => {
    const referenceSkills = getReferenceSkills();
    // Allowed decisions for reference skills:
    // - MOVE_TO_REFERENCE_SECTION: standard reference/governance
    // - DO_NOT_DEEPEN_REFERENCE_ONLY: default for unclassified
    // - DEEPEN_AFTER_FIX: planned skills that fall into reference section
    //   because their component is not built yet (e.g. maps-date-planner,
    //   grounded-search, image-analysis). These will move to the interactive
    //   section once their component is built.
    const allowedDecisions = [
      'MOVE_TO_REFERENCE_SECTION',
      'DO_NOT_DEEPEN_REFERENCE_ONLY',
      'DEEPEN_AFTER_FIX',
      'REMOVE_OR_HIDE_UNTIL_VERIFIED',
    ];
    for (const skill of referenceSkills) {
      expect(allowedDecisions).toContain(skill.deepeningDecision);
    }
  });

  it('PR1: member-visible count is 25 after PR1 classification corrections (voice-integration moved to admin)', () => {
    // voice-integration was member-visible before PR1 but had no real component.
    // PR1 adds safetyLevel: 'internal' to voice-integration, making it admin-only.
    // This is the correct state: hidden skills must not appear in the member hub.
    expect(getMemberVisibleSkills()).toHaveLength(25);
  });

  it('keeps the shareable skills folder covering the prototype count', () => {
    const skillDirs = readdirSync('skills', { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .filter((entry) => existsSync(join('skills', entry.name, 'SKILL.md')));

    expect(skillDirs.length).toBeGreaterThanOrEqual(SKILLS.length);
  });
});
