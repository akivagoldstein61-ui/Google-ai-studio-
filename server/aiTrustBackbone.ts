import { outputValidators } from "../src/ai/outputValidators.js";

export type RiskLevel = "low" | "medium" | "high" | "uncertain";

export interface Provenance {
  feature_id: string;
  model_route: string;
  generated_at: string;
  adapter_version: string;
}

export interface AIDisclosure {
  ai_generated: true;
  label: string;
  requires_user_review: boolean;
}

export interface ScamWarningScaffold {
  show_warning: boolean;
  severity: "info" | "warn" | "critical";
  title: string;
  bullets: string[];
}

export interface TrustEnvelope {
  provenance: Provenance;
  disclosure: AIDisclosure;
  safety?: {
    risk_level: RiskLevel;
    categories: string[];
  };
  scam_warning?: ScamWarningScaffold;
}

interface RequestValidation<T> {
  ok: true;
  value: T;
}

function badRequest(message: string): never {
  throw new Error(`Bad request: ${message}`);
}

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    badRequest(`${field} is required`);
  }
  return value.trim();
}

function optionalString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function getPayloadObject(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    badRequest("request body must be an object");
  }
  return body as Record<string, unknown>;
}

export function validateBioCoachRequest(body: unknown): RequestValidation<{
  bio_raw: string;
  tone: string;
  values: string;
  dealbreakers: string;
  length: string;
}> {
  const payload = getPayloadObject(body);
  return {
    ok: true,
    value: {
      bio_raw: requiredString(payload.bio_raw, "bio_raw"),
      tone: optionalString(payload.tone) || "warm",
      values: optionalString(payload.values),
      dealbreakers: optionalString(payload.dealbreakers),
      length: optionalString(payload.length) || "medium",
    },
  };
}

export function validateWhyMatchRequest(body: unknown): RequestValidation<{
  user_profile: unknown;
  candidate_profile: unknown;
  signals: string[];
}> {
  const payload = getPayloadObject(body);
  if (!payload.user_profile) badRequest("user_profile is required");
  if (!payload.candidate_profile) badRequest("candidate_profile is required");

  const signals = Array.isArray(payload.signals)
    ? payload.signals.filter((x): x is string => typeof x === "string")
    : [];

  return {
    ok: true,
    value: {
      user_profile: payload.user_profile,
      candidate_profile: payload.candidate_profile,
      signals,
    },
  };
}

function parseOptionalIsoDate(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value !== "string") badRequest("time must be an ISO date string");
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) badRequest("time must be parseable as a date");
  return new Date(timestamp).toISOString();
}

export function validateDatePlannerRequest(body: unknown): RequestValidation<{
  area: string;
  time: string;
  preferences: string;
  budget: string;
}> {
  const payload = getPayloadObject(body);
  return {
    ok: true,
    value: {
      area: requiredString(payload.area, "area"),
      time: parseOptionalIsoDate(payload.time),
      preferences: optionalString(payload.preferences),
      budget: optionalString(payload.budget),
    },
  };
}

export function validateSafetyClassifierRequest(body: unknown): RequestValidation<{
  message_text: string;
  context: string;
}> {
  const payload = getPayloadObject(body);
  return {
    ok: true,
    value: {
      message_text: requiredString(payload.message_text, "message_text"),
      context: optionalString(payload.context),
    },
  };
}

function baseTrust(feature_id: string, model_route: string): TrustEnvelope {
  return {
    provenance: {
      feature_id,
      model_route,
      generated_at: new Date().toISOString(),
      adapter_version: "phase1-v1",
    },
    disclosure: {
      ai_generated: true,
      label: "AI-assisted suggestion",
      requires_user_review: true,
    },
  };
}

function applyValuesSafePhrasing(text: string): string {
  return text
    .replace(/\bperfect match\b/gi, "strong alignment")
    .replace(/\bguaranteed\b/gi, "likely")
    .replace(/\bdefinitely\b/gi, "probably");
}

export function classifySafety(messageText: string): {
  risk_level: RiskLevel;
  categories: string[];
  recommended_action:
    | "allow"
    | "warn"
    | "user_nudge"
    | "block_and_report"
    | "needs_human_review";
  short_rationale: string;
} {
  const text = messageText.toLowerCase();

  const containsScam = /(wire transfer|bitcoin|crypto|gift card|send money|western union|bank details)/.test(text);
  const containsThreat = /(kill|hurt you|rape|follow you home)/.test(text);
  const containsHarassment = /(idiot|worthless|stupid)/.test(text);

  if (containsThreat) {
    return {
      risk_level: "high",
      categories: ["danger"],
      recommended_action: "block_and_report",
      short_rationale: "Potential threat language detected.",
    };
  }

  if (containsScam) {
    return {
      risk_level: "high",
      categories: ["scam"],
      recommended_action: "warn",
      short_rationale: "Possible financial scam indicators detected.",
    };
  }

  if (containsHarassment) {
    return {
      risk_level: "medium",
      categories: ["harassment"],
      recommended_action: "user_nudge",
      short_rationale: "Hostile phrasing detected.",
    };
  }

  return {
    risk_level: "low",
    categories: ["none"],
    recommended_action: "allow",
    short_rationale: "No major risk indicators detected.",
  };
}

export function buildScamWarningScaffold(classification: {
  risk_level: RiskLevel;
  categories: string[];
}): ScamWarningScaffold {
  const isScam = classification.categories.includes("scam");
  if (!isScam) {
    return {
      show_warning: false,
      severity: "info",
      title: "No scam warning",
      bullets: [],
    };
  }

  return {
    show_warning: true,
    severity: classification.risk_level === "high" ? "critical" : "warn",
    title: "Possible scam pattern",
    bullets: [
      "Avoid sending money, gift cards, or crypto.",
      "Keep conversations in-app until trust is established.",
      "Report this chat if pressure or urgency increases.",
    ],
  };
}

export function adaptBioCoachResponse(output: unknown, model_route: string) {
  const data = outputValidators.validateBioCoach(output);
  return {
    ...data,
    trust: baseTrust("bio_coach", model_route),
  };
}

export function adaptWhyMatchResponse(output: unknown, model_route: string) {
  const raw = (output && typeof output === "object" ? output : {}) as Record<
    string,
    unknown
  >;
  const normalized = {
    reasons_he: (Array.isArray(raw.reasons_he)
      ? raw.reasons_he
      : Array.isArray(raw.reasons)
        ? raw.reasons
        : []
    ).map((reason) =>
      typeof reason === "string" ? applyValuesSafePhrasing(reason) : reason
    ),
    first_question_he:
      typeof raw.first_question_he === "string"
        ? applyValuesSafePhrasing(raw.first_question_he)
        : typeof raw.first_question === "string"
          ? applyValuesSafePhrasing(raw.first_question)
          : "",
    gentle_clarification_he:
      typeof raw.gentle_clarification_he === "string"
        ? applyValuesSafePhrasing(raw.gentle_clarification_he)
        : typeof raw.gentle_clarification === "string"
          ? applyValuesSafePhrasing(raw.gentle_clarification)
          : "",
  };

  const data = outputValidators.validateWhyMatch(normalized) as {
    reasons_he: string[];
    first_question_he: string;
    gentle_clarification_he?: string;
  };

  return {
    ...data,
    reasons: data.reasons_he,
    first_question: data.first_question_he,
    gentle_clarification: data.gentle_clarification_he || "",
    trust: baseTrust("why_match", model_route),
  };
}

export function adaptDatePlannerResponse(output: unknown, model_route: string) {
  const data = outputValidators.validateDatePlanner(output);
  return {
    ...data,
    trust: {
      ...baseTrust("date_planner", model_route),
      disclosure: {
        ai_generated: true as const,
        label: "AI-assisted ideas (verify venue details)",
        requires_user_review: true,
      },
    },
  };
}

export function adaptSafetyClassification(
  classification: ReturnType<typeof classifySafety>,
  model_route: string
) {
  return {
    ...classification,
    trust: {
      ...baseTrust("safety_classifier", model_route),
      safety: {
        risk_level: classification.risk_level,
        categories: classification.categories,
      },
      scam_warning: buildScamWarningScaffold(classification),
    },
  };
}
