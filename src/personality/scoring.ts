import type { z } from "zod";
import type { ProvenanceLedgerSchema } from "./zodSchemas.ts";

export const PERSONALITY_INSTRUMENT_VERSION = "kesher-reflection-v1";
export const PERSONALITY_SCORE_VERSION = "kesher-aspect-key-v1";
export const PERSONALITY_ITEM_TEXT_SOURCE = "kesher_original" as const;

export type PersonalityDomain =
  | "extraversion"
  | "neuroticism"
  | "agreeableness"
  | "conscientiousness"
  | "openness";

export type PersonalityAspect =
  | "enthusiasm"
  | "assertiveness"
  | "withdrawal"
  | "volatility"
  | "compassion"
  | "politeness"
  | "industriousness"
  | "orderliness"
  | "openness"
  | "intellect";

export interface PersonalityAssessmentItem {
  id: string;
  domain: PersonalityDomain;
  aspect: PersonalityAspect;
  text_en: string;
  text_he: string;
  reverse: boolean;
  item_text_source: typeof PERSONALITY_ITEM_TEXT_SOURCE;
}

export interface PersonalityDomainScore {
  id: PersonalityDomain;
  label_he: string;
  label_en: string;
  score: number;
  band: "lower" | "balanced" | "higher";
  item_count: number;
  aspect_ids: PersonalityAspect[];
  summary_he: string;
  dating_note_he: string;
  evidence_label: "heuristic";
}

export interface PersonalityAspectScore {
  id: PersonalityAspect;
  domain: PersonalityDomain;
  label_he: string;
  label_en: string;
  score: number;
  band: "lower" | "balanced" | "higher";
  item_count: number;
  description_he: string;
  reflection_prompt_he: string;
  evidence_label: "heuristic";
}

export interface PersonalityAssessmentReport {
  instrument_version: string;
  score_version: string;
  item_text_source: typeof PERSONALITY_ITEM_TEXT_SOURCE;
  is_partial: boolean;
  completion: {
    answered: number;
    total: number;
    percent: number;
  };
  privacy: {
    visibility_default: "private";
    raw_answers_stored: false;
    public_trait_scores: false;
    llm_scoring: false;
  };
  domains: PersonalityDomainScore[];
  aspects: PersonalityAspectScore[];
  summary_he: string;
  next_step_he: string;
}

export interface PersonalityAssessmentState {
  answers: Record<string, number>;
  report: PersonalityAssessmentReport | null;
  cascade: (
    action: "reset" | "delete",
    userId: string,
  ) => z.infer<typeof ProvenanceLedgerSchema>;
}

const DOMAIN_LABELS: Record<PersonalityDomain, { he: string; en: string }> = {
  extraversion: { he: "מוחצנות", en: "Extraversion" },
  neuroticism: { he: "רגישות רגשית", en: "Emotional sensitivity" },
  agreeableness: { he: "נעימות", en: "Agreeableness" },
  conscientiousness: { he: "מצפוניות", en: "Conscientiousness" },
  openness: { he: "פתיחות", en: "Openness" },
};

const ASPECT_LABELS: Record<PersonalityAspect, { he: string; en: string }> = {
  enthusiasm: { he: "חום והתלהבות", en: "Enthusiasm" },
  assertiveness: { he: "יוזמה ובהירות", en: "Assertiveness" },
  withdrawal: { he: "רגישות לאי-ודאות", en: "Withdrawal" },
  volatility: { he: "תגובה לשינוי", en: "Volatility" },
  compassion: { he: "קשב רגשי", en: "Compassion" },
  politeness: { he: "כבוד וגבולות", en: "Politeness" },
  industriousness: { he: "התמדה", en: "Industriousness" },
  orderliness: { he: "סדר ותכנון", en: "Orderliness" },
  openness: { he: "דמיון וחוויה", en: "Openness" },
  intellect: { he: "סקרנות רעיונית", en: "Intellect" },
};

const DOMAIN_ASPECTS: Record<PersonalityDomain, PersonalityAspect[]> = {
  extraversion: ["enthusiasm", "assertiveness"],
  neuroticism: ["withdrawal", "volatility"],
  agreeableness: ["compassion", "politeness"],
  conscientiousness: ["industriousness", "orderliness"],
  openness: ["openness", "intellect"],
};

export const KESHER_PERSONALITY_ITEMS: PersonalityAssessmentItem[] = [
  {
    id: "kesher_extraversion_enthusiasm_1",
    domain: "extraversion",
    aspect: "enthusiasm",
    text_en: "I usually bring visible energy into a first conversation.",
    text_he: "בדרך כלל אני מביא/ה אנרגיה נראית לשיחה ראשונה.",
    reverse: false,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_extraversion_enthusiasm_2r",
    domain: "extraversion",
    aspect: "enthusiasm",
    text_en: "I often need time before showing warmth with someone new.",
    text_he: "לרוב אני צריך/ה זמן לפני שאני מראה חום מול אדם חדש.",
    reverse: true,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_extraversion_assertiveness_1",
    domain: "extraversion",
    aspect: "assertiveness",
    text_en: "I am comfortable naming what I want to do next.",
    text_he: "נוח לי לומר מה הייתי רוצה לעשות בהמשך.",
    reverse: false,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_extraversion_assertiveness_2r",
    domain: "extraversion",
    aspect: "assertiveness",
    text_en: "I usually prefer the other person to decide the next step.",
    text_he: "בדרך כלל אני מעדיף/ה שהצד השני יחליט על הצעד הבא.",
    reverse: true,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_neuroticism_withdrawal_1",
    domain: "neuroticism",
    aspect: "withdrawal",
    text_en: "Uncertainty in dating can stay on my mind for a while.",
    text_he: "אי-ודאות בדייטינג יכולה להישאר לי בראש לזמן מה.",
    reverse: false,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_neuroticism_withdrawal_2r",
    domain: "neuroticism",
    aspect: "withdrawal",
    text_en: "I usually recover quickly when a date leaves something unclear.",
    text_he: "בדרך כלל אני מתאושש/ת מהר כשדייט משאיר משהו לא ברור.",
    reverse: true,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_neuroticism_volatility_1",
    domain: "neuroticism",
    aspect: "volatility",
    text_en: "I may react quickly when plans change suddenly.",
    text_he: "לפעמים אני מגיב/ה מהר כשתוכניות משתנות בפתאומיות.",
    reverse: false,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_neuroticism_volatility_2r",
    domain: "neuroticism",
    aspect: "volatility",
    text_en: "I can usually pause before responding when I feel disappointed.",
    text_he: "בדרך כלל אני יכול/ה לעצור לפני תגובה כשאני מאוכזב/ת.",
    reverse: true,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_agreeableness_compassion_1",
    domain: "agreeableness",
    aspect: "compassion",
    text_en: "I notice how the other person is feeling.",
    text_he: "אני שם/ה לב איך הצד השני מרגיש.",
    reverse: false,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_agreeableness_compassion_2r",
    domain: "agreeableness",
    aspect: "compassion",
    text_en: "I can miss emotional cues when I am focused on facts.",
    text_he: "לפעמים אני מפספס/ת רמזים רגשיים כשאני מרוכז/ת בעובדות.",
    reverse: true,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_agreeableness_politeness_1",
    domain: "agreeableness",
    aspect: "politeness",
    text_en: "I try to keep disagreement respectful.",
    text_he: "אני משתדל/ת לשמור על כבוד גם כשיש אי-הסכמה.",
    reverse: false,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_agreeableness_politeness_2r",
    domain: "agreeableness",
    aspect: "politeness",
    text_en: "If I disagree, I may push my point before checking impact.",
    text_he: "כשאני לא מסכים/ה, לפעמים אני דוחף/ת את העמדה לפני בדיקת ההשפעה.",
    reverse: true,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_conscientiousness_industriousness_1",
    domain: "conscientiousness",
    aspect: "industriousness",
    text_en: "I follow through when I say I will plan something.",
    text_he: "כשאני אומר/ת שאארגן משהו, אני נוטה לבצע.",
    reverse: false,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_conscientiousness_industriousness_2r",
    domain: "conscientiousness",
    aspect: "industriousness",
    text_en: "Follow-through can slip when dating plans feel vague.",
    text_he: "לפעמים קשה לי להתמיד כשדברים בדייטינג נשארים עמומים.",
    reverse: true,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_conscientiousness_orderliness_1",
    domain: "conscientiousness",
    aspect: "orderliness",
    text_en: "I like dating plans to have a clear time and place.",
    text_he: "אני אוהב/ת שלתוכניות דייט יש זמן ומקום ברורים.",
    reverse: false,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_conscientiousness_orderliness_2r",
    domain: "conscientiousness",
    aspect: "orderliness",
    text_en: "I am usually comfortable letting plans stay flexible.",
    text_he: "בדרך כלל נוח לי להשאיר תוכניות גמישות.",
    reverse: true,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_openness_openness_1",
    domain: "openness",
    aspect: "openness",
    text_en: "I enjoy discovering unfamiliar ideas or places together.",
    text_he: "אני נהנה/ית לגלות יחד רעיונות או מקומות לא מוכרים.",
    reverse: false,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_openness_openness_2r",
    domain: "openness",
    aspect: "openness",
    text_en: "I usually prefer familiar date formats over new experiences.",
    text_he: "בדרך כלל אני מעדיף/ה פורמט דייט מוכר על פני חוויה חדשה.",
    reverse: true,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_openness_intellect_1",
    domain: "openness",
    aspect: "intellect",
    text_en: "Thoughtful questions help me feel connected.",
    text_he: "שאלות עם מחשבה עוזרות לי להרגיש חיבור.",
    reverse: false,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
  {
    id: "kesher_openness_intellect_2r",
    domain: "openness",
    aspect: "intellect",
    text_en: "I prefer light conversation over abstract questions early on.",
    text_he: "בתחילת היכרות אני מעדיף/ה שיחה קלילה על פני שאלות מופשטות.",
    reverse: true,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
  },
];

function toScore(value: number, reverse: boolean): number {
  const bounded = Math.max(1, Math.min(5, value));
  const scored = reverse ? 6 - bounded : bounded;
  return Math.round(((scored - 1) / 4) * 100);
}

function scoreBand(score: number): "lower" | "balanced" | "higher" {
  if (score < 40) return "lower";
  if (score > 60) return "higher";
  return "balanced";
}

function bandWordHe(band: "lower" | "balanced" | "higher") {
  if (band === "higher") return "גבוהה יחסית";
  if (band === "lower") return "נמוכה יחסית";
  return "מאוזנת";
}

function aspectDescriptionHe(aspect: PersonalityAspect, band: "lower" | "balanced" | "higher") {
  const bandLabel = bandWordHe(band);
  const copy: Record<PersonalityAspect, string> = {
    enthusiasm: `הנטייה שלך להראות חום ואנרגיה בתחילת היכרות נראית ${bandLabel}. זו אינה איכות טובה או רעה, אלא קצב פתיחה שכדאי להכיר.`,
    assertiveness: `הנטייה שלך ליזום, להציע ולהבהיר רצונות נראית ${bandLabel}. בדייטינג זה עשוי להשפיע על מי מחזיק את הצעד הבא.`,
    withdrawal: `הרגישות שלך לאי-ודאות או סימנים עמומים נראית ${bandLabel}. כדאי לקרוא זאת כנטייה לרפלקציה, לא כאבחנה.`,
    volatility: `התגובה שלך לשינוי, אכזבה או חיכוך נראית ${bandLabel}. זה יכול לעזור לבחור קצב תקשורת שמרגיש מכבד.`,
    compassion: `הקשב שלך לרגש ולצרכים של הצד השני נראה ${bandLabel}. זו נקודת פתיחה לשיחה על תמיכה הדדית.`,
    politeness: `הנטייה שלך לשמור על כבוד, גבולות וניסוח זהיר נראית ${bandLabel}. זה עשוי לעזור בשיחות רגישות.`,
    industriousness: `הנטייה שלך להתמיד ולעמוד בהתחייבויות קטנות נראית ${bandLabel}. בדייטינג זה קשור בעיקר לאמינות יומיומית.`,
    orderliness: `הנוחות שלך עם סדר, תיאום ופרטים נראית ${bandLabel}. כדאי לשים לב כמה מבנה עוזר לך להרגיש רגוע/ה.`,
    openness: `הסקרנות שלך לחוויות, מקומות ורעיונות חדשים נראית ${bandLabel}. זה יכול להשפיע על סוג הדייטים שמטעינים אותך.`,
    intellect: `המשיכה שלך לשאלות עומק, למידה ושיחה רעיונית נראית ${bandLabel}. זו הזמנה לבדוק איזה עומק מתאים באיזה שלב.`,
  };
  return copy[aspect];
}

function aspectPromptHe(aspect: PersonalityAspect) {
  const prompts: Record<PersonalityAspect, string> = {
    enthusiasm: "באיזה קצב נוח לך להראות חום בתחילת היכרות?",
    assertiveness: "מתי נכון לך להציע צעד הבא, ומתי להמתין?",
    withdrawal: "איזה סוג בהירות עוזר לך כשיש אי-ודאות?",
    volatility: "מה עוזר לך להגיב מתוך בחירה כשמשהו משתנה?",
    compassion: "איך את/ה רוצה לאזן הקשבה לעצמך ולהקשבה לצד השני?",
    politeness: "איך אפשר לשמור על כבוד בלי להסתיר צורך אמיתי?",
    industriousness: "איזה סימן קטן מראה לך שמישהו עקבי ורציני?",
    orderliness: "כמה תכנון מראש גורם לדייט להרגיש טוב יותר עבורך?",
    openness: "איזו חוויה חדשה מרגישה מסקרנת אבל לא מציפה?",
    intellect: "איזו שאלה עמוקה מתאימה לשלב מוקדם של היכרות?",
  };
  return prompts[aspect];
}

function domainSummaryHe(domain: PersonalityDomain, band: "lower" | "balanced" | "higher") {
  const bandLabel = bandWordHe(band);
  const summaries: Record<PersonalityDomain, string> = {
    extraversion: `דפוס הפתיחה החברתי והיוזמה שלך נראה ${bandLabel}.`,
    neuroticism: `דפוס הרגישות לאי-ודאות ושינוי נראה ${bandLabel}.`,
    agreeableness: `דפוס הקשב, הכבוד וההתחשבות נראה ${bandLabel}.`,
    conscientiousness: `דפוס ההתמדה, התכנון והאמינות נראה ${bandLabel}.`,
    openness: `דפוס הסקרנות, הדמיון ושיחות העומק נראה ${bandLabel}.`,
  };
  return summaries[domain];
}

function domainDatingNoteHe(domain: PersonalityDomain, band: "lower" | "balanced" | "higher") {
  const notes: Record<PersonalityDomain, Record<"lower" | "balanced" | "higher", string>> = {
    extraversion: {
      lower: "ייתכן שקשר טוב עבורך מתחיל בקצב שקט יותר ועם פחות לחץ להפגין התלהבות מיד.",
      balanced: "ייתכן שיש לך גמישות בין פתיחה חמה לבין צורך בזמן התחממות.",
      higher: "ייתכן שיוזמה, אנרגיה וחום מוקדם עוזרים לך לבנות חיבור.",
    },
    neuroticism: {
      lower: "ייתכן שקל לך יחסית להחזיק עמימות בלי למהר לפרש אותה.",
      balanced: "ייתכן שאת/ה נע/ה בין צורך בבהירות לבין יכולת לשאת אי-ודאות.",
      higher: "ייתכן שבהירות, עקביות ועדינות בתקשורת מוקדמת חשובות לך במיוחד.",
    },
    agreeableness: {
      lower: "ייתכן שחשוב לך לשמור מקום לרצונות שלך גם כשיש ציפייה להתגמש.",
      balanced: "ייתכן שיש לך איזון בין התחשבות בצד השני לבין שמירה על גבולות.",
      higher: "ייתכן שקשב, אדיבות ושפה מכבדת הם חלק מרכזי בתחושת הביטחון שלך.",
    },
    conscientiousness: {
      lower: "ייתכן שגמישות וספונטניות חשובות לך יותר מתכנון מוקדם.",
      balanced: "ייתכן שאת/ה מעריך/ה תכנון בסיסי, אבל לא רוצה שהקשר ירגיש נוקשה.",
      higher: "ייתכן שתיאום ברור ועמידה במילה מחזקים אצלך אמון.",
    },
    openness: {
      lower: "ייתכן שמוכר, פשוט ויציב מרגיש נכון יותר בשלבי היכרות ראשונים.",
      balanced: "ייתכן שאת/ה נהנה/ית גם ממוכר וגם מחידוש כשהקצב מתאים.",
      higher: "ייתכן שחוויות חדשות ושיחה עם עומק עוזרות לך להרגיש חי/ה בקשר.",
    },
  };
  return notes[domain][band];
}

export function scoreKesherPersonalityAssessment(
  answers: Record<string, number>,
): PersonalityAssessmentReport {
  const domainScores = new Map<PersonalityDomain, number[]>();
  const aspectScores = new Map<PersonalityAspect, number[]>();

  for (const item of KESHER_PERSONALITY_ITEMS) {
    const answer = answers[item.id];
    if (typeof answer !== "number") continue;

    const existing = domainScores.get(item.domain) ?? [];
    const score = toScore(answer, item.reverse);
    existing.push(score);
    domainScores.set(item.domain, existing);

    const aspectExisting = aspectScores.get(item.aspect) ?? [];
    aspectExisting.push(score);
    aspectScores.set(item.aspect, aspectExisting);
  }

  const aspects = (Object.keys(ASPECT_LABELS) as PersonalityAspect[]).map((aspect) => {
    const matchingItem = KESHER_PERSONALITY_ITEMS.find((item) => item.aspect === aspect);
    const scores = aspectScores.get(aspect) ?? [];
    const score =
      scores.length === 0
        ? 50
        : Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
    const band = scoreBand(score);
    return {
      id: aspect,
      domain: matchingItem?.domain ?? "openness",
      label_he: ASPECT_LABELS[aspect].he,
      label_en: ASPECT_LABELS[aspect].en,
      score,
      band,
      item_count: scores.length,
      description_he: aspectDescriptionHe(aspect, band),
      reflection_prompt_he: aspectPromptHe(aspect),
      evidence_label: "heuristic" as const,
    };
  });

  const domains = (Object.keys(DOMAIN_LABELS) as PersonalityDomain[]).map((domain) => {
    const scores = domainScores.get(domain) ?? [];
    const score =
      scores.length === 0
        ? 50
        : Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
    const band = scoreBand(score);
    return {
      id: domain,
      label_he: DOMAIN_LABELS[domain].he,
      label_en: DOMAIN_LABELS[domain].en,
      score,
      band,
      item_count: scores.length,
      aspect_ids: DOMAIN_ASPECTS[domain],
      summary_he: domainSummaryHe(domain, band),
      dating_note_he: domainDatingNoteHe(domain, band),
      evidence_label: "heuristic" as const,
    };
  });

  const answered = KESHER_PERSONALITY_ITEMS.filter(
    (item) => typeof answers[item.id] === "number",
  ).length;

  const percent = Math.round((answered / KESHER_PERSONALITY_ITEMS.length) * 100);
  const isPartial = answered < KESHER_PERSONALITY_ITEMS.length;

  return {
    instrument_version: PERSONALITY_INSTRUMENT_VERSION,
    score_version: PERSONALITY_SCORE_VERSION,
    item_text_source: PERSONALITY_ITEM_TEXT_SOURCE,
    is_partial: isPartial,
    completion: {
      answered,
      total: KESHER_PERSONALITY_ITEMS.length,
      percent,
    },
    privacy: {
      visibility_default: "private",
      raw_answers_stored: false,
      public_trait_scores: false,
      llm_scoring: false,
    },
    domains,
    aspects,
    summary_he: isPartial
      ? "זהו דוח לא מלא. הוא משקף רק את הפריטים שכבר ענית עליהם, ולכן כדאי להשלים את השאלון לפני שמסתמכים עליו."
      : "זהו דוח פרטי ועדין על נטיות תקשורת ודייטינג. הוא מיועד לרפלקציה אישית ולא לדירוג התאמה.",
    next_step_he: isPartial
      ? "כדאי להשלים את שאר הפריטים כדי לקבל תמונה יציבה יותר."
      : "בחר/י תחום אחד לשיחה עצמית: מה היית רוצה שבן/בת זוג יבינו על הקצב שלך?",
  };
}

export function buildPrivatePersonalityProfileSummary(report: PersonalityAssessmentReport) {
  return {
    schema_version: "1.0" as const,
    report_status: report.is_partial ? "partial" as const : "complete" as const,
    instrument_version: report.instrument_version,
    score_version: report.score_version,
    item_text_source: report.item_text_source,
    summary_he: report.summary_he,
    domains: report.domains.map((domain) => ({
      id: domain.id,
      label_he: domain.label_he,
      label_en: domain.label_en,
      band: domain.band,
      description_he: domain.dating_note_he,
      reflection_prompt_he: domain.aspect_ids
        .map((aspectId) => report.aspects.find((aspect) => aspect.id === aspectId)?.reflection_prompt_he)
        .find(Boolean),
      evidence_label: domain.evidence_label,
    })),
  };
}

export function buildPersonalityExport(state: PersonalityAssessmentState) {
  return {
    report: state.report,
    exported_at: new Date().toISOString(),
    raw_answers_included: false,
  };
}

function createCascadeLedger(action: "reset" | "delete", userId: string) {
  const affectedRecords = [
    "personality_answers",
    "personality_report",
    "personality_share_cards",
    "personality_share_grants",
    "why_match_personality_provenance",
  ];

  if (action === "delete") {
    affectedRecords.push("personality_consent_receipts");
  }

  return {
    id: `personality_${action}_${userId}`,
    user_id: userId,
    action,
    occurred_at: new Date().toISOString(),
    actor: "user" as const,
    raw_payload_logged: false as const,
    affected_records: affectedRecords,
  };
}

export const EMPTY_PERSONALITY_STATE: PersonalityAssessmentState = {
  answers: {},
  report: null,
  cascade: createCascadeLedger,
};
