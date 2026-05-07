/**
 * Kesher three-layer observance model.
 *
 * Layer 1: Self-Description (public Hebrew label)
 * Layer 2: Practice Bundles (private compatibility — Shabbat, Kashrut, Community, Family)
 * Layer 3: Private Compatibility (handled by learnedTaste.ts)
 *
 * Per kesher-personality-ocean and kesher-observance-layer skills.
 */

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 1: PUBLIC SELF-DESCRIPTION LABELS (Hebrew)
// ─────────────────────────────────────────────────────────────────────────────

export interface SelfDescriptionLabel {
  id: string;
  he: string;
  en: string;
  description: string;
}

export const SELF_DESCRIPTION_LABELS: SelfDescriptionLabel[] = [
  { id: 'haredi',           he: 'חרדי',             en: 'Haredi',                 description: 'Ultra-Orthodox' },
  { id: 'haredi_moderni',   he: 'חרדי מודרני',      en: 'Modern Haredi',          description: 'Modern Haredi' },
  { id: 'dati_leumi_torani',he: 'דתי לאומי תורני', en: 'Dati Leumi Torani',      description: 'Torah-observant National Religious' },
  { id: 'dati_leumi',       he: 'דתי לאומי',       en: 'Dati Leumi',             description: 'National Religious' },
  { id: 'dati',             he: 'דתי',             en: 'Dati',                   description: 'Religious' },
  { id: 'dati_lite',        he: 'דתי לייט',        en: 'Dati Lite',              description: 'Lightly Religious' },
  { id: 'masorti_dati',     he: 'מסורתי דתי',      en: 'Masorti (religious-leaning)', description: 'Traditional, religious-leaning' },
  { id: 'masorti',          he: 'מסורתי',          en: 'Masorti',                description: 'Traditional' },
  { id: 'hiloni_masorti',   he: 'חילוני מסורתי',   en: 'Hiloni-Masorti',         description: 'Secular with traditional ties' },
  { id: 'hiloni',           he: 'חילוני',          en: 'Hiloni',                 description: 'Secular' },
  { id: 'datlash',          he: 'דתל"ש',           en: 'Datlash',                description: 'Formerly religious' },
  { id: 'baal_teshuva',     he: 'בעל/בעלת תשובה',  en: 'Baal/Ba\'alat Teshuva',  description: 'Returnee to observance' },
  { id: 'breslov',          he: 'ברסלב',           en: 'Breslov',                description: 'Breslov Hasidic' },
  { id: 'chabad',           he: 'חב״ד',            en: 'Chabad',                 description: 'Chabad Lubavitch' },
];

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2: PRACTICE BUNDLES
// ─────────────────────────────────────────────────────────────────────────────

export type PracticeArea = 'shabbat' | 'kashrut' | 'community' | 'family';

export interface PracticeOption {
  id: string;
  area: PracticeArea;
  he: string;
  en: string;
  /** Higher number = stricter/more involved practice. Used for floor checks only. */
  intensity: number;
}

export const PRACTICE_BUNDLES: PracticeOption[] = [
  // Shabbat
  { id: 'shomer_shabbat',      area: 'shabbat',  he: 'שומר שבת',                en: 'Fully observe Shabbat',           intensity: 3 },
  { id: 'shomer_masoret',      area: 'shabbat',  he: 'שומר מסורת שבת',          en: 'Some Shabbat traditions',         intensity: 2 },
  { id: 'hiloni_shomer_shabbat', area: 'shabbat', he: 'חילוני שומר שבת',        en: 'Secular but Shabbat-aware',       intensity: 1 },
  { id: 'lo_shomer_shabbat',   area: 'shabbat',  he: 'לא שומר שבת',             en: 'Do not observe Shabbat',          intensity: 0 },

  // Kashrut
  { id: 'mehadrin',            area: 'kashrut',  he: 'מהדרין',                  en: 'Strict kashrut',                  intensity: 3 },
  { id: 'kasher',              area: 'kashrut',  he: 'כשר',                     en: 'Standard kashrut',                intensity: 2 },
  { id: 'kasher_babayit',      area: 'kashrut',  he: 'כשר בבית',                en: 'Kosher at home only',             intensity: 1 },
  { id: 'lo_kasher',           area: 'kashrut',  he: 'לא כשר',                  en: 'Do not keep kosher',              intensity: 0 },

  // Community
  { id: 'mitpalel_yom_yom',    area: 'community',he: 'מתפלל יומיום',            en: 'Pray daily (minyan)',             intensity: 3 },
  { id: 'mitpalel_shabbatot',  area: 'community',he: 'מתפלל בשבתות וחגים',     en: 'Pray on Shabbat & holidays',      intensity: 2 },
  { id: 'beit_knesset_paam',   area: 'community',he: 'מגיע לבית כנסת מדי פעם',  en: 'Attend synagogue occasionally',   intensity: 1 },
  { id: 'pail_bakehila',       area: 'community',he: 'פעיל בקהילה',             en: 'Community-involved',              intensity: 2 },
  { id: 'lo_magia',            area: 'community',he: 'לא מגיע לבית כנסת',       en: 'Do not attend synagogue',         intensity: 0 },

  // Family
  { id: 'rotze_yeladim',       area: 'family',   he: 'רוצה ילדים',              en: 'Wants children',                  intensity: 2 },
  { id: 'yesh_yeladim',        area: 'family',   he: 'יש ילדים',                en: 'Has children',                    intensity: 2 },
  { id: 'patuach_lenosafim',   area: 'family',   he: 'פתוח לילדים נוספים',      en: 'Open to more children',           intensity: 2 },
  { id: 'lo_rotze_yeladim',    area: 'family',   he: 'לא רוצה ילדים',           en: 'Does not want children',          intensity: 0 },
];

export interface ObservanceProfile {
  selfDescriptionId: string;       // Layer 1
  practiceIds: string[];           // Layer 2 (multi-select across areas)
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPATIBILITY HELPERS (private compat layer feeds into rankers)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the count of areas where the two profiles meet at compatible
 * intensities. Used by the ranking authority — never displayed verbatim.
 */
export function practiceAreaAlignment(a: ObservanceProfile, b: ObservanceProfile): {
  alignedAreas: PracticeArea[];
  totalAreas: number;
} {
  const aIntensities = areaIntensities(a.practiceIds);
  const bIntensities = areaIntensities(b.practiceIds);
  const areas: PracticeArea[] = ['shabbat', 'kashrut', 'community', 'family'];
  const alignedAreas: PracticeArea[] = [];
  for (const area of areas) {
    const ai = aIntensities[area];
    const bi = bIntensities[area];
    if (ai == null || bi == null) continue;
    if (Math.abs(ai - bi) <= 1) alignedAreas.push(area);
  }
  return { alignedAreas, totalAreas: areas.length };
}

function areaIntensities(practiceIds: string[]): Partial<Record<PracticeArea, number>> {
  const out: Partial<Record<PracticeArea, number>> = {};
  for (const id of practiceIds) {
    const opt = PRACTICE_BUNDLES.find(p => p.id === id);
    if (!opt) continue;
    if (out[opt.area] == null || (out[opt.area] ?? -1) < opt.intensity) {
      out[opt.area] = opt.intensity;
    }
  }
  return out;
}

export function findLabel(id: string): SelfDescriptionLabel | undefined {
  return SELF_DESCRIPTION_LABELS.find(l => l.id === id);
}

export function findPractice(id: string): PracticeOption | undefined {
  return PRACTICE_BUNDLES.find(p => p.id === id);
}
