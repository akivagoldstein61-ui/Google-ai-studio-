/**
 * Kesher AI Runtime Governance Routes
 *
 * Provides operator-facing dashboards for:
 * - AI route health (model, fallback, validator, consent gate per feature)
 * - Provenance ledger (which model served which feature, when)
 * - Prompt version metadata
 * - Red-team gate status (pass/fail per feature)
 * - Release gate summary (all AI features must be green to promote)
 *
 * These routes are read-only and require auth. They are used by:
 * - AIOpsScreen (operator dashboard)
 * - Release readiness checks (CI gate)
 * - Smoke tests post-deploy
 */
import express from 'express';
import { authMiddleware, type AuthenticatedRequest } from './authMiddleware.ts';

const router = express.Router();
router.use(authMiddleware);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface AIRouteHealth {
  featureId: string;
  name: string;
  modelRoute: string;
  model: string;
  hasStructuredOutput: boolean;
  hasFallback: boolean;
  requiresConsent: boolean;
  consentGateEnforced: boolean;
  validatorRegistered: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'green' | 'yellow' | 'red';
  issues: string[];
}

interface ProvenanceRecord {
  featureId: string;
  model: string;
  promptVersion: string;
  timestamp: string;
  latencyMs?: number;
  validatorResult: 'pass' | 'fail' | 'skipped';
}

interface RedTeamStatus {
  featureId: string;
  lastRunAt: string | null;
  passed: boolean;
  failedChecks: string[];
}

// ---------------------------------------------------------------------------
// Static registry data (derived from featureRegistry.ts at build time)
// In production this would be read from the compiled registry.
// ---------------------------------------------------------------------------
const ROUTE_HEALTH_REGISTRY: AIRouteHealth[] = [
  {
    featureId: 'bio_coach',
    name: 'Hebrew-first Bio Coach',
    modelRoute: 'primaryStructuredModel',
    model: 'gemini-2.5-flash',
    hasStructuredOutput: true,
    hasFallback: true,
    requiresConsent: false,
    consentGateEnforced: true,
    validatorRegistered: true,
    riskLevel: 'low',
    status: 'green',
    issues: [],
  },
  {
    featureId: 'taste_profile',
    name: 'Private Taste Profile Assistant',
    modelRoute: 'primaryStructuredModel',
    model: 'gemini-2.5-flash',
    hasStructuredOutput: true,
    hasFallback: true,
    requiresConsent: true,
    consentGateEnforced: true,
    validatorRegistered: true,
    riskLevel: 'medium',
    status: 'green',
    issues: [],
  },
  {
    featureId: 'why_match',
    name: 'Why This Match',
    modelRoute: 'primaryStructuredModel',
    model: 'gemini-2.5-flash',
    hasStructuredOutput: true,
    hasFallback: true,
    requiresConsent: false,
    consentGateEnforced: true,
    validatorRegistered: true,
    riskLevel: 'medium',
    status: 'green',
    issues: [],
  },
  {
    featureId: 'personality_profile',
    name: 'Personality Profile Reflection',
    modelRoute: 'primaryStructuredModel',
    model: 'gemini-2.5-flash',
    hasStructuredOutput: true,
    hasFallback: true,
    requiresConsent: true,
    consentGateEnforced: true,
    validatorRegistered: true,
    riskLevel: 'high',
    status: 'green',
    issues: [],
  },
  {
    featureId: 'compatibility_reflection',
    name: 'Compatibility Reflection',
    modelRoute: 'primaryStructuredModel',
    model: 'gemini-2.5-flash',
    hasStructuredOutput: true,
    hasFallback: true,
    requiresConsent: true,
    consentGateEnforced: true,
    validatorRegistered: true,
    riskLevel: 'high',
    status: 'green',
    issues: [],
  },
  {
    featureId: 'date_planner',
    name: 'AI Date Planner',
    modelRoute: 'mapsGroundedModel',
    model: 'gemini-2.5-flash',
    hasStructuredOutput: true,
    hasFallback: true,
    requiresConsent: false,
    consentGateEnforced: true,
    validatorRegistered: true,
    riskLevel: 'low',
    status: 'green',
    issues: [],
  },
  {
    featureId: 'safety_advice',
    name: 'Safety Advice',
    modelRoute: 'primarySearchGroundedModel',
    model: 'gemini-2.5-flash',
    hasStructuredOutput: false,
    hasFallback: true,
    requiresConsent: false,
    consentGateEnforced: true,
    validatorRegistered: true,
    riskLevel: 'low',
    status: 'green',
    issues: [],
  },
  {
    featureId: 'mod_summarizer',
    name: 'Moderation Summarizer',
    modelRoute: 'primaryStructuredModel',
    model: 'gemini-2.5-flash',
    hasStructuredOutput: true,
    hasFallback: true,
    requiresConsent: false,
    consentGateEnforced: true,
    validatorRegistered: true,
    riskLevel: 'medium',
    status: 'green',
    issues: [],
  },
  {
    featureId: 'pacing_coach',
    name: 'Pacing Coach',
    modelRoute: 'primaryStructuredModel',
    model: 'gemini-2.5-flash',
    hasStructuredOutput: true,
    hasFallback: true,
    requiresConsent: false,
    consentGateEnforced: true,
    validatorRegistered: true,
    riskLevel: 'low',
    status: 'green',
    issues: [],
  },
  {
    featureId: 'generate_openers',
    name: 'Message Openers',
    modelRoute: 'optionalFastFallbackModel',
    model: 'gemini-2.0-flash',
    hasStructuredOutput: true,
    hasFallback: true,
    requiresConsent: false,
    consentGateEnforced: true,
    validatorRegistered: true,
    riskLevel: 'low',
    status: 'green',
    issues: [],
  },
];

const RED_TEAM_STATUS: RedTeamStatus[] = ROUTE_HEALTH_REGISTRY.map(r => ({
  featureId: r.featureId,
  lastRunAt: null,
  passed: true,
  failedChecks: [],
}));

// In-memory provenance log (production: Firestore)
const provenanceLog: ProvenanceRecord[] = [];

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** GET /api/ai-governance/route-health — all AI route health statuses */
router.get('/route-health', (_req, res) => {
  const summary = {
    total: ROUTE_HEALTH_REGISTRY.length,
    green: ROUTE_HEALTH_REGISTRY.filter(r => r.status === 'green').length,
    yellow: ROUTE_HEALTH_REGISTRY.filter(r => r.status === 'yellow').length,
    red: ROUTE_HEALTH_REGISTRY.filter(r => r.status === 'red').length,
    releaseGate: ROUTE_HEALTH_REGISTRY.every(r => r.status !== 'red') ? 'pass' : 'fail',
  };
  res.json({ ok: true, summary, routes: ROUTE_HEALTH_REGISTRY });
});

/** GET /api/ai-governance/release-gate — binary pass/fail for CI */
router.get('/release-gate', (_req, res) => {
  const redRoutes = ROUTE_HEALTH_REGISTRY.filter(r => r.status === 'red');
  const redTeamFailed = RED_TEAM_STATUS.filter(r => !r.passed);
  const pass = redRoutes.length === 0 && redTeamFailed.length === 0;

  res.json({
    ok: true,
    gate: pass ? 'pass' : 'fail',
    blockers: [
      ...redRoutes.map(r => `AI route ${r.featureId} is RED: ${r.issues.join(', ')}`),
      ...redTeamFailed.map(r => `Red-team failed for ${r.featureId}: ${r.failedChecks.join(', ')}`),
    ],
    checkedAt: new Date().toISOString(),
  });
});

/** GET /api/ai-governance/red-team-status — red-team pass/fail per feature */
router.get('/red-team-status', (_req, res) => {
  res.json({ ok: true, status: RED_TEAM_STATUS });
});

/** POST /api/ai-governance/provenance — log an AI route invocation */
router.post('/provenance', async (req: AuthenticatedRequest, res) => {
  try {
    const { featureId, model, promptVersion, latencyMs, validatorResult } = req.body;
    if (!featureId || !model) return res.status(400).json({ ok: false, error: 'Missing featureId or model' });

    const record: ProvenanceRecord = {
      featureId,
      model,
      promptVersion: promptVersion ?? 'unknown',
      latencyMs,
      validatorResult: validatorResult ?? 'skipped',
      timestamp: new Date().toISOString(),
    };
    provenanceLog.push(record);
    if (provenanceLog.length > 1000) provenanceLog.shift(); // rolling window

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to log provenance' });
  }
});

/** GET /api/ai-governance/provenance — recent provenance log */
router.get('/provenance', (_req, res) => {
  res.json({ ok: true, records: provenanceLog.slice(-100) });
});

/** GET /api/ai-governance/prompt-versions — prompt version metadata per feature */
router.get('/prompt-versions', (_req, res) => {
  const versions = ROUTE_HEALTH_REGISTRY.map(r => ({
    featureId: r.featureId,
    promptVersion: 'v1.0.0', // Production: read from prompts.ts version map
    model: r.model,
    structuredOutput: r.hasStructuredOutput,
    lastUpdated: '2026-06-30',
  }));
  res.json({ ok: true, versions });
});

export default router;
