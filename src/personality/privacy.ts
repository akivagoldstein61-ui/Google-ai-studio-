export const FORBIDDEN_PERSONALITY_FIELDS = [
  "compatibility_score",
  "soulmate_score",
  "marriage_probability",
  "desirability_score",
  "public_trait_rank",
  "raw_trait_public",
  "auto_send",
  "diagnosis",
  "protected_trait_inference",
  "hidden_personality_rank",
] as const;

const REDACTED_VALUE = "[REDACTED]";

const REDACTED_LOG_KEYS = new Set([
  "answers",
  "rawAnswers",
  "raw_answers",
  "assessmentAnswers",
  "assessment_answers",
  "personalityAnswers",
  "personality_answers",
  "messageDraft",
  "message_draft",
  "rawMessage",
  "raw_message",
  "rawMessages",
  "raw_messages",
  "draftText",
  "draft_text",
  "prompt",
  "contents",
]);

export type ForbiddenPersonalityField =
  (typeof FORBIDDEN_PERSONALITY_FIELDS)[number];

export function assertNoForbiddenPersonalityFields(
  value: unknown,
  path: string[] = [],
): void {
  if (!value || typeof value !== "object") return;

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      assertNoForbiddenPersonalityFields(item, [...path, String(index)]),
    );
    return;
  }

  for (const [key, nestedValue] of Object.entries(value)) {
    if (FORBIDDEN_PERSONALITY_FIELDS.includes(key as ForbiddenPersonalityField)) {
      const fieldPath = [...path, key].join(".");
      throw new Error(`Forbidden personality field '${key}' at '${fieldPath}'.`);
    }
    assertNoForbiddenPersonalityFields(nestedValue, [...path, key]);
  }
}

export function redactPersonalityLogPayload<T>(payload: T): T {
  if (!payload || typeof payload !== "object") return payload;

  if (Array.isArray(payload)) {
    return payload.map((item) => redactPersonalityLogPayload(item)) as T;
  }

  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      REDACTED_LOG_KEYS.has(key)
        ? REDACTED_VALUE
        : redactPersonalityLogPayload(value),
    ]),
  ) as T;
}

export function safePersonalityLog(
  logType: string,
  payload: Record<string, unknown>,
): string {
  return JSON.stringify({
    log_type: logType,
    ...redactPersonalityLogPayload(payload),
  });
}
