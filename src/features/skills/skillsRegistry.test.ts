import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  getRecommendedSkillsForSurface,
  getSkillById,
  SKILL_LIVE_ROUTES,
  SKILLS,
} from './skillRegistry';
import { sanitizeSkillEventPayload } from './skillEvents';
import {
  createDefaultSkillState,
  sanitizeOutputRef,
  transitionSkillState,
} from './hooks/useSkillState';
import { AI_FEATURE_REGISTRY } from '@/ai/featureRegistry';

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

describe('Kesher skills registry prototype visibility', () => {
  it('keeps all 35 Kesher skills visible as operationalized experiences', () => {
    expect(SKILLS).toHaveLength(35);
    expect(SKILLS.every((skill) => ['live', 'prototype', 'gated', 'planned'].includes(skill.status))).toBe(true);
  });

  it('gives every visible skill enough metadata to render a details page', () => {
    for (const skill of SKILLS) {
      expect(skill.id).toBeTruthy();
      expect(skill.slug).toBe(skill.id);
      expect(skill.canonicalCodexSkill).toBeTruthy();
      expect(skill.aliases.length).toBeGreaterThan(0);
      expect(skill.title).toBeTruthy();
      expect(skill.shortTitle).toBeTruthy();
      expect(skill.subtitle).toBeTruthy();
      expect(skill.description).toBeTruthy();
      expect(skill.operationalStatus).toBeTruthy();
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
      expect(skill.dataInputs.length).toBeGreaterThan(0);
      expect(skill.dataExclusions.length).toBeGreaterThan(0);
      expect(skill.userActions.length).toBeGreaterThan(0);
      expect(skill.testsRequired.length).toBeGreaterThan(0);
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

  it('promotes legacy planned/reference modules into useful gated or operational fallbacks', () => {
    expect(getSkillById('grounded-search')?.operationalStatus).toBe('gated_dependency');
    expect(getSkillById('image-analysis')?.operationalStatus).toBe('gated_dependency');
    expect(getSkillById('voice-integration')?.operationalStatus).toBe('gated_dependency');
    expect(getSkillById('video-generator')?.operationalStatus).toBe('gated_dependency');
    expect(getSkillById('sparkmatch-dating-app-skill')?.demoModeBehavior).toMatch(/Kesher-safe pattern checker/);
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

  it('keeps image analysis away from attractiveness and protected-trait inference', () => {
    const imageAnalysis = getSkillById('image-analysis');
    expect(imageAnalysis?.summary.toLowerCase()).not.toContain('attractiveness_score');
    expect(imageAnalysis?.dataExclusions).toEqual(
      expect.arrayContaining(['appearance_ranking', 'protected_trait_inference']),
    );
    expect(imageAnalysis?.testsRequired).toEqual(
      expect.arrayContaining(['image_analysis_no_attractiveness', 'protected_trait_inference_blocked']),
    );
  });

  it('keeps consent-requiring AI features default off', () => {
    const consentFeatures = AI_FEATURE_REGISTRY.filter((feature) => feature.requires_consent && feature.user_visible);
    expect(consentFeatures.length).toBeGreaterThan(0);
    expect(consentFeatures.every((feature) => feature.default_enabled === false)).toBe(true);
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

  it('keeps the shareable skills folder in parity with the prototype count', () => {
    const skillDirs = readdirSync('skills', { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .filter((entry) => existsSync(join('skills', entry.name, 'SKILL.md')));

    expect(skillDirs).toHaveLength(35);
  });
});
