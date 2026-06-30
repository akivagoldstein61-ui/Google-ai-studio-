/**
 * Kesher Entitlement Service (client-side)
 *
 * Reads and caches the user's subscription entitlement from the server.
 * All gate checks must be confirmed server-side; this is for UI rendering only.
 */
import { authFetch } from './authFetch';

export type SubscriptionTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled';

export interface Entitlement {
  uid: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  expiresAt: string | null;
  trialUsed: boolean;
  features: string[];
  updatedAt: string;
}

const PREMIUM_FEATURE_LABELS: Record<string, string> = {
  unlimited_picks: 'Unlimited Daily Picks',
  compatibility_reflection: 'Compatibility Reflection',
  deeper_share_cards: 'Deeper Share Cards',
  advanced_explore_filters: 'Advanced Explore Filters',
  date_planner_full: 'Full Date Planner',
  voice_sessions: 'Voice Sessions',
};

let cachedEntitlement: Entitlement | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getEntitlement(): Promise<Entitlement> {
  if (cachedEntitlement && Date.now() < cacheExpiry) {
    return cachedEntitlement;
  }
  try {
    const res = await authFetch('/api/billing/entitlement');
    const data = await res.json();
    if (data.ok && data.entitlement) {
      cachedEntitlement = data.entitlement;
      cacheExpiry = Date.now() + CACHE_TTL_MS;
      return data.entitlement;
    }
  } catch (_) { /* fall through to free tier */ }
  return buildFreeEntitlement();
}

export function invalidateEntitlementCache(): void {
  cachedEntitlement = null;
  cacheExpiry = 0;
}

export async function isPremium(): Promise<boolean> {
  const e = await getEntitlement();
  return e.tier === 'premium' && (e.status === 'active' || e.status === 'trial');
}

export async function hasFeature(feature: string): Promise<boolean> {
  const e = await getEntitlement();
  return e.features.includes(feature);
}

export async function startTrial(): Promise<Entitlement> {
  const res = await authFetch('/api/billing/start-trial', { method: 'POST' });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error ?? 'Failed to start trial');
  invalidateEntitlementCache();
  return data.entitlement;
}

export async function cancelSubscription(): Promise<Entitlement> {
  const res = await authFetch('/api/billing/cancel', { method: 'POST' });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error ?? 'Failed to cancel');
  invalidateEntitlementCache();
  return data.entitlement;
}

export function getPremiumFeatureLabels(): Record<string, string> {
  return PREMIUM_FEATURE_LABELS;
}

function buildFreeEntitlement(): Entitlement {
  return {
    uid: '',
    tier: 'free',
    status: 'active',
    expiresAt: null,
    trialUsed: false,
    features: ['daily_picks_5', 'basic_share_cards', 'why_this_match', 'bio_coach', 'message_openers', 'pacing_coach'],
    updatedAt: new Date().toISOString(),
  };
}
