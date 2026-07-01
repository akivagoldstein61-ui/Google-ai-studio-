import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { SKILLS, INTERACTIVE_SKILL_IDS, INTERACTIVE_SURFACE_CLASSES, isInteractiveSkill } from './skillRegistry';
import { AI_FEATURE_REGISTRY } from '../../ai/featureRegistry';
import { FEATURE_FLAGS } from '../../ai/featureFlags';

/**
 * Skills Hub inventory + truth-label consistency.
 *
 * PR 0 added the inventory crosswalk; PR 1 added surfaceClass/visibility/
 * deepeningDecision truth labels and reference separation. These tests verify
 * the registry and labels stay self-consistent. They assert classification and
 * launch-gating invariants only — NOT behavioral completion of any skill.
 */

const SURFACE_CLASSES = [
  'member_interactive', 'settings_control', 'trust_safety',
  'reference', 'research', 'operator', 'legal_privacy',
  'platform_vendor', 'external_demo', 'hidden_until_verified',
];
const VISIBILITIES = ['member_visible', 'reference_visible', 'hidden'];
const DEEPENING_DECISIONS = [
  'DEEPEN_NOW', 'DEEPEN_AFTER_FIX', 'DO_NOT_DEEPEN_REFERENCE_ONLY',
  'MOVE_TO_REFERENCE_SECTION', 'REMOVE_OR_HIDE_UNTIL_VERIFIED', 'UNKNOWN_PENDING_RENDERED_TEST',
];
const REFERENCE_CLASSES = ['reference', 'research', 'operator', 'legal_privacy', 'platform_vendor'];

const flagKeyFor = (featureKey: string) => `ENABLE_AI_${featureKey.toUpperCase()}`;

describe('Skills Hub inventory consistency (PR 0: inventory only, not behavior)', () => {
  it('keeps exactly 35 visible skills with explicit launch statuses', () => {
    expect(SKILLS).toHaveLength(35);
    expect(SKILLS.every((s) => s.status === 'prototype' || s.status === 'live')).toBe(true);
  });

  it('has unique visible skill ids', () => {
    const ids = SKILLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has unique canonical skillIds among visible entries', () => {
    const skillIds = SKILLS.map((s) => s.skillId).filter((v): v is string => Boolean(v));
    expect(new Set(skillIds).size).toBe(skillIds.length);
  });

  it('maps every visible skillId to an existing skills/<skillId>/SKILL.md package', () => {
    const missing = SKILLS
      .filter((s) => s.skillId)
      .filter((s) => !existsSync(join('skills', s.skillId as string, 'SKILL.md')))
      .map((s) => `${s.id} -> skills/${s.skillId}/SKILL.md`);
    expect(missing).toEqual([]);
  });

  it('uses only AI feature keys that exist in AI_FEATURE_REGISTRY', () => {
    const featureIds = new Set(AI_FEATURE_REGISTRY.map((f) => f.id));
    const unknown = SKILLS
      .filter((s) => s.aiFeatureKey)
      .filter((s) => !featureIds.has(s.aiFeatureKey as string))
      .map((s) => `${s.id} -> ${s.aiFeatureKey}`);
    expect(unknown).toEqual([]);
  });

  it('gives every visible skill at least one entry point with an in-app route', () => {
    const routeless = SKILLS
      .filter((s) => !s.entryPoints.some((p) => p.route && p.route.startsWith('/')))
      .map((s) => s.id);
    expect(routeless).toEqual([]);
  });

  it('now links every visible skill to a canonical skillId (PR 1 backfill)', () => {
    const withoutSkillId = SKILLS.filter((s) => !s.skillId).map((s) => s.id);
    expect(withoutSkillId).toEqual([]);
  });
});

describe('Skills Hub truth labels (PR 1: reference separation)', () => {
  it('gives every skill a valid surfaceClass', () => {
    const invalid = SKILLS.filter((s) => !SURFACE_CLASSES.includes(s.surfaceClass)).map((s) => s.id);
    expect(invalid).toEqual([]);
  });

  it('gives every skill a valid visibility', () => {
    const invalid = SKILLS.filter((s) => !VISIBILITIES.includes(s.visibility)).map((s) => s.id);
    expect(invalid).toEqual([]);
  });

  it('gives every skill a valid deepeningDecision', () => {
    const invalid = SKILLS.filter((s) => !DEEPENING_DECISIONS.includes(s.deepeningDecision)).map((s) => s.id);
    expect(invalid).toEqual([]);
  });

  it('keeps reference/research/operator/legal/platform items reference_visible unless they have a real router case', () => {
    // PR1 correction: skills with reference surfaceClasses (reference, research, operator,
    // legal_privacy, platform_vendor) are normally reference_visible. However, some of
    // these skills have real SkillsRouter cases (they are in INTERACTIVE_SKILL_IDS) and
    // are launchable by members or admins. Those are allowed to be member_visible.
    // Examples: israeli-privacy (legal_privacy), psychometric-validation (research),
    //           dark-pattern-audit (reference), ai-runtime-governance (operator).
    const interactiveIdSet = new Set<string>(INTERACTIVE_SKILL_IDS);
    const wrong = SKILLS
      .filter((s) => REFERENCE_CLASSES.includes(s.surfaceClass))
      // Exclude skills with a real router case — they may be member_visible.
      .filter((s) => !interactiveIdSet.has(s.id))
      .filter((s) => s.visibility !== 'reference_visible')
      .map((s) => `${s.id}:${s.visibility}`);
    expect(wrong).toEqual([]);
  });

  it('PR1: reference-class skills with router cases have member_visible or reference_visible (not hidden)', () => {
    const interactiveIdSet = new Set<string>(INTERACTIVE_SKILL_IDS);
    const wrong = SKILLS
      .filter((s) => REFERENCE_CLASSES.includes(s.surfaceClass))
      .filter((s) => interactiveIdSet.has(s.id))
      .filter((s) => s.visibility === 'hidden')
      .map((s) => `${s.id}:${s.visibility}`);
    expect(wrong).toEqual([]);
  });

  it('hides hidden_until_verified and external_demo items from the member Hub', () => {
    const wrong = SKILLS
      .filter((s) => s.surfaceClass === 'hidden_until_verified' || s.surfaceClass === 'external_demo')
      .filter((s) => s.visibility !== 'hidden')
      .map((s) => `${s.id}:${s.visibility}`);
    expect(wrong).toEqual([]);
  });

  it('keeps DEEPEN_NOW items member-visible and interactive', () => {
    const wrong = SKILLS
      .filter((s) => s.deepeningDecision === 'DEEPEN_NOW')
      .filter((s) => !(s.visibility === 'member_visible' && INTERACTIVE_SURFACE_CLASSES.includes(s.surfaceClass)))
      .map((s) => s.id);
    expect(wrong).toEqual([]);
  });

  it('renders MOVE_TO_REFERENCE_SECTION items as reference, not interactive', () => {
    const wrong = SKILLS
      .filter((s) => s.deepeningDecision === 'MOVE_TO_REFERENCE_SECTION')
      .filter((s) => s.visibility !== 'reference_visible' || isInteractiveSkill(s))
      .map((s) => s.id);
    expect(wrong).toEqual([]);
  });

  it('hides REMOVE_OR_HIDE_UNTIL_VERIFIED items', () => {
    const wrong = SKILLS
      .filter((s) => s.deepeningDecision === 'REMOVE_OR_HIDE_UNTIL_VERIFIED')
      .filter((s) => s.visibility !== 'hidden')
      .map((s) => s.id);
    expect(wrong).toEqual([]);
  });

  it('never surfaces an AI-flag-disabled feature as a member-visible interactive skill', () => {
    const leaking = SKILLS
      .filter((s) => s.aiFeatureKey)
      .filter((s) => (FEATURE_FLAGS as Record<string, boolean>)[flagKeyFor(s.aiFeatureKey as string)] === false)
      .filter((s) => s.visibility === 'member_visible' || isInteractiveSkill(s))
      .map((s) => s.id);
    expect(leaking).toEqual([]);
  });
});
