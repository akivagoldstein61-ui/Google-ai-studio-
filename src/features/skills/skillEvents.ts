import type { SkillEventName } from './types';

export const SKILL_EVENT_NAMES: readonly SkillEventName[] = [
  'skill_viewed',
  'skill_started',
  'skill_completed',
  'skill_applied',
  'skill_dismissed',
  'skill_recommended',
  'skill_consent_viewed',
  'skill_consent_accepted',
  'skill_consent_declined',
];

const SENSITIVE_KEY_PATTERN = /(raw|message|answer|token|secret|evidence|photo|address|prompt|gemini|firebase|credential|moderation|ranking|weight)/i;

type SanitizedPayload = Record<string, string | number | boolean | null | string[]>;

const sanitizeValue = (value: unknown): SanitizedPayload[string] | undefined => {
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    const strings = value.filter((item): item is string => typeof item === 'string').slice(0, 12);
    return strings.length ? strings : undefined;
  }
  return undefined;
};

export const sanitizeSkillEventPayload = (payload?: Record<string, unknown>): SanitizedPayload => {
  if (!payload) return {};

  return Object.entries(payload).reduce<SanitizedPayload>((safe, [key, value]) => {
    if (SENSITIVE_KEY_PATTERN.test(key)) return safe;
    const sanitized = sanitizeValue(value);
    if (sanitized !== undefined) safe[key] = sanitized;
    return safe;
  }, {});
};

export const emitSkillEvent = (
  trackEvent: ((eventName: string, eventData?: Record<string, unknown>) => void) | undefined,
  eventName: SkillEventName,
  payload?: Record<string, unknown>,
) => {
  if (!SKILL_EVENT_NAMES.includes(eventName)) return;
  trackEvent?.(eventName, sanitizeSkillEventPayload(payload));
};
