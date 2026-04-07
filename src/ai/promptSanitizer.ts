/**
 * Prompt Input Sanitizer
 *
 * Sanitizes user-provided text before interpolation into AI prompt templates.
 * Goals: prevent prompt injection, bound input length, strip dangerous characters,
 * while preserving readable Hebrew and English text.
 */

/** Max lengths per field type. Conservative defaults. */
const FIELD_LIMITS: Record<string, number> = {
  bio: 2000,
  message: 1000,
  topic: 500,
  short: 200,
  profile: 5000,
  reports: 10000,
};

/**
 * Regex matching dangerous invisible and control characters.
 * Preserves normal whitespace (space, tab, newline) and Hebrew characters.
 */
const INVISIBLE_CHARS =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF\uFFF0-\uFFFF]/g;

/**
 * Patterns that look like prompt role markers or injection attempts.
 * Replaced with bracketed versions to neutralize without destroying readability.
 */
const ROLE_MARKERS =
  /\b(SYSTEM|USER|ASSISTANT|HUMAN|AI|INSTRUCTION|IGNORE PREVIOUS|DISREGARD|OVERRIDE)\s*:/gi;

/**
 * Sanitize a user-provided text string for safe prompt interpolation.
 *
 * - Strips dangerous invisible/control characters
 * - Normalizes excessive whitespace
 * - Neutralizes role-marker patterns
 * - Truncates to maxLen
 * - Preserves Hebrew, English, emoji, and normal punctuation
 */
export function sanitizeText(
  input: unknown,
  maxLen: number = FIELD_LIMITS.short
): string {
  if (input === null || input === undefined) return '';
  const raw = typeof input === 'string' ? input : String(input);

  let cleaned = raw
    // Remove dangerous invisible characters
    .replace(INVISIBLE_CHARS, '')
    // Normalize runs of whitespace (preserve single newlines for readability)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    // Neutralize role markers
    .replace(ROLE_MARKERS, '[$1]')
    .trim();

  // Truncate to max length
  if (cleaned.length > maxLen) {
    cleaned = cleaned.slice(0, maxLen) + '…';
  }

  return cleaned;
}

/**
 * Sanitize an object before JSON.stringify interpolation into prompts.
 * Recursively sanitizes all string values and bounds total serialized length.
 */
export function sanitizeObject(
  input: unknown,
  maxTotalLen: number = FIELD_LIMITS.profile
): string {
  if (input === null || input === undefined) return '{}';

  const sanitized = deepSanitize(input);
  let serialized = JSON.stringify(sanitized);

  if (serialized.length > maxTotalLen) {
    serialized = serialized.slice(0, maxTotalLen) + '…[truncated]';
  }

  return serialized;
}

function deepSanitize(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    return sanitizeText(value, FIELD_LIMITS.bio);
  }

  if (Array.isArray(value)) {
    return value.slice(0, 100).map(deepSanitize);
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    const entries = Object.entries(value as Record<string, unknown>);
    for (const [key, val] of entries.slice(0, 50)) {
      result[sanitizeText(key, FIELD_LIMITS.short)] = deepSanitize(val);
    }
    return result;
  }

  return value;
}

/** Convenience aliases for common field types */
export const sanitize = {
  bio: (input: unknown) => sanitizeText(input, FIELD_LIMITS.bio),
  message: (input: unknown) => sanitizeText(input, FIELD_LIMITS.message),
  topic: (input: unknown) => sanitizeText(input, FIELD_LIMITS.topic),
  short: (input: unknown) => sanitizeText(input, FIELD_LIMITS.short),
  profile: (input: unknown) => sanitizeObject(input, FIELD_LIMITS.profile),
  reports: (input: unknown) => sanitizeObject(input, FIELD_LIMITS.reports),
};
