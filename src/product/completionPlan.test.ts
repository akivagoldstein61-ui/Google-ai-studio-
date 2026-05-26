import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  ADDED_PRODUCT_SKILLS,
  DEEPENED_EXISTING_SKILLS,
  PRODUCT_COMPLETION_GATES,
  RECOMMENDED_PRODUCT_PLUGINS,
  getCompletionStatusCounts,
  getLaunchBlockingGates,
  getP0CompletionSkills,
} from './completionPlan';

const productDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(productDir, '../..');

describe('product completion plan', () => {
  it('registers the eight product-completion skills requested for final-product readiness', () => {
    expect(ADDED_PRODUCT_SKILLS.map((skill) => skill.id)).toEqual([
      'kesher-identity-verification',
      'kesher-match-lifecycle',
      'kesher-trust-safety-ops',
      'kesher-notifications',
      'kesher-subscription-entitlements',
      'kesher-ai-evaluation-observability',
      'kesher-data-rights-retention',
      'kesher-release-readiness',
    ]);
  });

  it('backs every added skill with an installable local skill folder', () => {
    for (const skill of ADDED_PRODUCT_SKILLS) {
      expect(existsSync(resolve(repoRoot, skill.ownerSkill))).toBe(true);
    }
  });

  it('keeps P0 completion skills attached to acceptance criteria and implementation surfaces', () => {
    const p0Skills = getP0CompletionSkills();

    expect(p0Skills.length).toBeGreaterThan(0);
    for (const skill of p0Skills) {
      expect(skill.acceptanceCriteria.length).toBeGreaterThanOrEqual(3);
      expect(skill.implementationSurfaces.length).toBeGreaterThanOrEqual(3);
      expect(skill.requiredPlugins.length).toBeGreaterThan(0);
    }
  });

  it('tracks launch gates for the full product plan, including missing commercial and notification work', () => {
    const gateIds = PRODUCT_COMPLETION_GATES.map((gate) => gate.id);
    const counts = getCompletionStatusCounts();

    expect(gateIds).toEqual([
      'auth_onboarding_verification',
      'real_discovery_marketplace',
      'match_chat_lifecycle',
      'trust_safety_operations',
      'ai_runtime_governance',
      'payments_entitlements',
      'notification_delivery',
      'observability_release_gates',
    ]);
    expect(counts.missing).toBe(2);
    expect(getLaunchBlockingGates()).toHaveLength(PRODUCT_COMPLETION_GATES.length);
  });

  it('keeps deepened existing skills tied to concrete production deltas', () => {
    expect(DEEPENED_EXISTING_SKILLS).toHaveLength(10);
    for (const skill of DEEPENED_EXISTING_SKILLS) {
      expect(skill.productionDelta.length).toBeGreaterThan(0);
      expect(skill.acceptanceCriteria.length).toBeGreaterThan(0);
    }
  });

  it('keeps the recommended plugin set tied to delivery, deployment, and compliance work', () => {
    expect(RECOMMENDED_PRODUCT_PLUGINS.map((plugin) => plugin.id)).toEqual(
      expect.arrayContaining(['github', 'vercel', 'build-web-apps', 'google-ai-studio-app-builder']),
    );
  });
});
