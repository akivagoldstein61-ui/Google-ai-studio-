import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { SKILLS } from './skillRegistry';
import { AI_FEATURE_REGISTRY } from '../../ai/featureRegistry';
import { FEATURE_FLAGS } from '../../ai/featureFlags';

/**
 * PR 0 — INVENTORY CONSISTENCY ONLY.
 *
 * These tests verify that the Skills Hub registry, the canonical skills/*
 * packages, and the AI feature registry stay in agreement. They intentionally
 * do NOT assert behavioral completion or "deepening" of any skill. Where a real
 * drift exists today (e.g. visible skills missing a `skillId` link, or AI
 * features disabled by flag but still surfaced), the drift is captured as a
 * documented snapshot constant so the test fails loudly only if the drift
 * CHANGES — not to force a runtime/registry change inside PR 0.
 *
 * See docs/skills/INVENTORY.md for the human-readable crosswalk.
 */

// Visible skills that omit the `skillId` field even though a canonical package
// exists (see docs/skills/INVENTORY.md §D). PR 1 will add the links.
const VISIBLE_SKILLS_WITHOUT_SKILLID = [
  'grounded-search',          // canonical dir: skills/kesher-grounded-search
  'image-analysis',           // canonical dir: skills/kesher-image-analysis
  'sparkmatch-dating-app-skill', // canonical dir: skills/sparkmatch-dating-app-skill (external)
  'video-generator',          // canonical dir: skills/video-generator (external)
  'voice-integration',        // canonical dir: skills/kesher-voice-integration
].sort();

// Visible skills whose AI feature is disabled by FEATURE_FLAGS but are still
// surfaced as interactive cards (PR 1 hides/labels them as reference).
const KNOWN_FLAG_OFF_VISIBLE = ['video-generator', 'voice-integration'].sort();

const flagKeyFor = (featureKey: string) => `ENABLE_AI_${featureKey.toUpperCase()}`;

describe('Skills Hub inventory consistency (PR 0: inventory only, not behavior)', () => {
  it('keeps exactly 35 visible prototype skills', () => {
    expect(SKILLS).toHaveLength(35);
    expect(SKILLS.every((s) => s.status === 'prototype')).toBe(true);
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

  it('documents the visible skills currently missing a canonical skillId link (PR 1 will link)', () => {
    const withoutSkillId = SKILLS.filter((s) => !s.skillId).map((s) => s.id).sort();
    expect(withoutSkillId).toEqual(VISIBLE_SKILLS_WITHOUT_SKILLID);
  });

  it('flags AI-flag-disabled features still surfaced as interactive skills (PR 1 hides/labels)', () => {
    const flagOffVisible = SKILLS
      .filter((s) => s.aiFeatureKey)
      .filter((s) => {
        const flagKey = flagKeyFor(s.aiFeatureKey as string);
        return (FEATURE_FLAGS as Record<string, boolean>)[flagKey] === false;
      })
      .map((s) => s.id)
      .sort();
    // Snapshot of known drift; if this set changes, update INVENTORY.md + PR 1 plan.
    expect(flagOffVisible).toEqual(KNOWN_FLAG_OFF_VISIBLE);
  });
});
