export const IPIP_BFAS_SCORING_VERSION = 'ipip-bfas-100-v1';
export const IPIP_BFAS_SOURCE_URL = 'https://ipip.ori.org/BFASKeys.htm';

export type IpipBfasDomain =
  | 'Neuroticism'
  | 'Agreeableness'
  | 'Conscientiousness'
  | 'Extraversion'
  | 'Openness';

export type IpipBfasAspect =
  | 'Volatility'
  | 'Withdrawal'
  | 'Compassion'
  | 'Politeness'
  | 'Industriousness'
  | 'Orderliness'
  | 'Enthusiasm'
  | 'Assertiveness'
  | 'Intellect'
  | 'Openness';

export type IpipBfasKey = '+' | '-';
export type IpipBfasBand = 'low' | 'mid' | 'high';
export type IpipBfasQualityFlag = 'incomplete' | 'straightlining' | 'out_of_range';
export type EvidenceLabel = 'HEURISTIC';

export interface IpipBfasItem {
  id: string;
  domain: IpipBfasDomain;
  aspect: IpipBfasAspect;
  keyed: IpipBfasKey;
  text: string;
}

export interface IpipBfasAggregate {
  rawAverage: number | null;
  displayValue: number | null;
  itemCount: number;
  answeredCount: number;
}

export interface IpipBfasDisplayBand {
  band: IpipBfasBand;
  tendency: string;
}

export interface IpipBfasResult {
  instrumentType: 'ipip_bfas_100';
  scoringVersion: typeof IPIP_BFAS_SCORING_VERSION;
  evidenceLabel: EvidenceLabel;
  sourceUrl: typeof IPIP_BFAS_SOURCE_URL;
  complete: boolean;
  qualityFlags: IpipBfasQualityFlag[];
  itemScores: Record<string, number>;
  aspectScores: Record<IpipBfasAspect, IpipBfasAggregate>;
  domainScores: Record<IpipBfasDomain, IpipBfasAggregate>;
  aspectBands: Record<IpipBfasAspect, IpipBfasDisplayBand>;
  domainBands: Record<IpipBfasDomain, IpipBfasDisplayBand>;
}

export const IPIP_BFAS_DOMAINS: IpipBfasDomain[] = [
  'Neuroticism',
  'Agreeableness',
  'Conscientiousness',
  'Extraversion',
  'Openness',
];

export const IPIP_BFAS_ASPECTS: IpipBfasAspect[] = [
  'Volatility',
  'Withdrawal',
  'Compassion',
  'Politeness',
  'Industriousness',
  'Orderliness',
  'Enthusiasm',
  'Assertiveness',
  'Intellect',
  'Openness',
];

export const IPIP_BFAS_ITEMS: IpipBfasItem[] = [
  { id: 'ipip_bfas_001', domain: 'Neuroticism', aspect: 'Volatility', keyed: '+', text: 'Get angry easily.' },
  { id: 'ipip_bfas_002', domain: 'Neuroticism', aspect: 'Volatility', keyed: '+', text: 'Get upset easily.' },
  { id: 'ipip_bfas_003', domain: 'Neuroticism', aspect: 'Volatility', keyed: '+', text: 'Change my mood a lot.' },
  { id: 'ipip_bfas_004', domain: 'Neuroticism', aspect: 'Volatility', keyed: '+', text: 'Am a person whose moods go up and down easily.' },
  { id: 'ipip_bfas_005', domain: 'Neuroticism', aspect: 'Volatility', keyed: '+', text: 'Get easily agitated.' },
  { id: 'ipip_bfas_006', domain: 'Neuroticism', aspect: 'Volatility', keyed: '+', text: 'Can be stirred up easily.' },
  { id: 'ipip_bfas_007', domain: 'Neuroticism', aspect: 'Volatility', keyed: '-', text: 'Rarely get irritated.' },
  { id: 'ipip_bfas_008', domain: 'Neuroticism', aspect: 'Volatility', keyed: '-', text: 'Keep my emotions under control.' },
  { id: 'ipip_bfas_009', domain: 'Neuroticism', aspect: 'Volatility', keyed: '-', text: 'Rarely lose my composure.' },
  { id: 'ipip_bfas_010', domain: 'Neuroticism', aspect: 'Volatility', keyed: '-', text: 'Am not easily annoyed.' },
  { id: 'ipip_bfas_011', domain: 'Neuroticism', aspect: 'Withdrawal', keyed: '+', text: 'Am filled with doubts about things.' },
  { id: 'ipip_bfas_012', domain: 'Neuroticism', aspect: 'Withdrawal', keyed: '+', text: 'Feel threatened easily.' },
  { id: 'ipip_bfas_013', domain: 'Neuroticism', aspect: 'Withdrawal', keyed: '+', text: 'Worry about things.' },
  { id: 'ipip_bfas_014', domain: 'Neuroticism', aspect: 'Withdrawal', keyed: '+', text: 'Am easily discouraged.' },
  { id: 'ipip_bfas_015', domain: 'Neuroticism', aspect: 'Withdrawal', keyed: '+', text: 'Become overwhelmed by events.' },
  { id: 'ipip_bfas_016', domain: 'Neuroticism', aspect: 'Withdrawal', keyed: '+', text: 'Am afraid of many things.' },
  { id: 'ipip_bfas_017', domain: 'Neuroticism', aspect: 'Withdrawal', keyed: '-', text: 'Seldom feel blue.' },
  { id: 'ipip_bfas_018', domain: 'Neuroticism', aspect: 'Withdrawal', keyed: '-', text: 'Feel comfortable with myself.' },
  { id: 'ipip_bfas_019', domain: 'Neuroticism', aspect: 'Withdrawal', keyed: '-', text: 'Rarely feel depressed.' },
  { id: 'ipip_bfas_020', domain: 'Neuroticism', aspect: 'Withdrawal', keyed: '-', text: 'Am not embarrassed easily.' },
  { id: 'ipip_bfas_021', domain: 'Agreeableness', aspect: 'Compassion', keyed: '+', text: "Feel others' emotions." },
  { id: 'ipip_bfas_022', domain: 'Agreeableness', aspect: 'Compassion', keyed: '+', text: "Inquire about others' well-being." },
  { id: 'ipip_bfas_023', domain: 'Agreeableness', aspect: 'Compassion', keyed: '+', text: "Sympathize with others' feelings." },
  { id: 'ipip_bfas_024', domain: 'Agreeableness', aspect: 'Compassion', keyed: '+', text: "Take an interest in other people's lives." },
  { id: 'ipip_bfas_025', domain: 'Agreeableness', aspect: 'Compassion', keyed: '+', text: 'Like to do things for others.' },
  { id: 'ipip_bfas_026', domain: 'Agreeableness', aspect: 'Compassion', keyed: '-', text: "Am not interested in other people's problems." },
  { id: 'ipip_bfas_027', domain: 'Agreeableness', aspect: 'Compassion', keyed: '-', text: "Can't be bothered with other's needs." },
  { id: 'ipip_bfas_028', domain: 'Agreeableness', aspect: 'Compassion', keyed: '-', text: 'Am indifferent to the feelings of others.' },
  { id: 'ipip_bfas_029', domain: 'Agreeableness', aspect: 'Compassion', keyed: '-', text: 'Take no time for others.' },
  { id: 'ipip_bfas_030', domain: 'Agreeableness', aspect: 'Compassion', keyed: '-', text: "Don't have a soft side." },
  { id: 'ipip_bfas_031', domain: 'Agreeableness', aspect: 'Politeness', keyed: '+', text: 'Respect authority.' },
  { id: 'ipip_bfas_032', domain: 'Agreeableness', aspect: 'Politeness', keyed: '+', text: 'Hate to seem pushy.' },
  { id: 'ipip_bfas_033', domain: 'Agreeableness', aspect: 'Politeness', keyed: '+', text: 'Avoid imposing my will on others.' },
  { id: 'ipip_bfas_034', domain: 'Agreeableness', aspect: 'Politeness', keyed: '+', text: 'Rarely put people under pressure.' },
  { id: 'ipip_bfas_035', domain: 'Agreeableness', aspect: 'Politeness', keyed: '-', text: 'Insult people.' },
  { id: 'ipip_bfas_036', domain: 'Agreeableness', aspect: 'Politeness', keyed: '-', text: 'Believe that I am better than others.' },
  { id: 'ipip_bfas_037', domain: 'Agreeableness', aspect: 'Politeness', keyed: '-', text: 'Take advantage of others.' },
  { id: 'ipip_bfas_038', domain: 'Agreeableness', aspect: 'Politeness', keyed: '-', text: 'Seek conflict.' },
  { id: 'ipip_bfas_039', domain: 'Agreeableness', aspect: 'Politeness', keyed: '-', text: 'Love a good fight.' },
  { id: 'ipip_bfas_040', domain: 'Agreeableness', aspect: 'Politeness', keyed: '-', text: 'Am out for my own personal gain.' },
  { id: 'ipip_bfas_041', domain: 'Conscientiousness', aspect: 'Industriousness', keyed: '+', text: 'Carry out my plans.' },
  { id: 'ipip_bfas_042', domain: 'Conscientiousness', aspect: 'Industriousness', keyed: '+', text: 'Finish what I start.' },
  { id: 'ipip_bfas_043', domain: 'Conscientiousness', aspect: 'Industriousness', keyed: '+', text: 'Get things done quickly.' },
  { id: 'ipip_bfas_044', domain: 'Conscientiousness', aspect: 'Industriousness', keyed: '+', text: 'Always know what I am doing.' },
  { id: 'ipip_bfas_045', domain: 'Conscientiousness', aspect: 'Industriousness', keyed: '-', text: 'Waste my time.' },
  { id: 'ipip_bfas_046', domain: 'Conscientiousness', aspect: 'Industriousness', keyed: '-', text: 'Find it difficult to get down to work.' },
  { id: 'ipip_bfas_047', domain: 'Conscientiousness', aspect: 'Industriousness', keyed: '-', text: 'Mess things up.' },
  { id: 'ipip_bfas_048', domain: 'Conscientiousness', aspect: 'Industriousness', keyed: '-', text: "Don't put my mind on the task at hand." },
  { id: 'ipip_bfas_049', domain: 'Conscientiousness', aspect: 'Industriousness', keyed: '-', text: 'Postpone decisions.' },
  { id: 'ipip_bfas_050', domain: 'Conscientiousness', aspect: 'Industriousness', keyed: '-', text: 'Am easily distracted.' },
  { id: 'ipip_bfas_051', domain: 'Conscientiousness', aspect: 'Orderliness', keyed: '+', text: 'Like order.' },
  { id: 'ipip_bfas_052', domain: 'Conscientiousness', aspect: 'Orderliness', keyed: '+', text: 'Keep things tidy.' },
  { id: 'ipip_bfas_053', domain: 'Conscientiousness', aspect: 'Orderliness', keyed: '+', text: 'Follow a schedule.' },
  { id: 'ipip_bfas_054', domain: 'Conscientiousness', aspect: 'Orderliness', keyed: '+', text: 'Want everything to be "just right."' },
  { id: 'ipip_bfas_055', domain: 'Conscientiousness', aspect: 'Orderliness', keyed: '+', text: 'See that rules are observed.' },
  { id: 'ipip_bfas_056', domain: 'Conscientiousness', aspect: 'Orderliness', keyed: '+', text: 'Want every detail taken care of.' },
  { id: 'ipip_bfas_057', domain: 'Conscientiousness', aspect: 'Orderliness', keyed: '-', text: 'Leave my belongings around.' },
  { id: 'ipip_bfas_058', domain: 'Conscientiousness', aspect: 'Orderliness', keyed: '-', text: 'Am not bothered by messy people.' },
  { id: 'ipip_bfas_059', domain: 'Conscientiousness', aspect: 'Orderliness', keyed: '-', text: 'Am not bothered by disorder.' },
  { id: 'ipip_bfas_060', domain: 'Conscientiousness', aspect: 'Orderliness', keyed: '-', text: 'Dislike routine.' },
  { id: 'ipip_bfas_061', domain: 'Extraversion', aspect: 'Enthusiasm', keyed: '+', text: 'Make friends easily.' },
  { id: 'ipip_bfas_062', domain: 'Extraversion', aspect: 'Enthusiasm', keyed: '+', text: 'Warm up quickly to others.' },
  { id: 'ipip_bfas_063', domain: 'Extraversion', aspect: 'Enthusiasm', keyed: '+', text: "Show my feelings when I'm happy." },
  { id: 'ipip_bfas_064', domain: 'Extraversion', aspect: 'Enthusiasm', keyed: '+', text: 'Have a lot of fun.' },
  { id: 'ipip_bfas_065', domain: 'Extraversion', aspect: 'Enthusiasm', keyed: '+', text: 'Laugh a lot.' },
  { id: 'ipip_bfas_066', domain: 'Extraversion', aspect: 'Enthusiasm', keyed: '-', text: 'Am hard to get to know.' },
  { id: 'ipip_bfas_067', domain: 'Extraversion', aspect: 'Enthusiasm', keyed: '-', text: 'Keep others at a distance.' },
  { id: 'ipip_bfas_068', domain: 'Extraversion', aspect: 'Enthusiasm', keyed: '-', text: 'Reveal little about myself.' },
  { id: 'ipip_bfas_069', domain: 'Extraversion', aspect: 'Enthusiasm', keyed: '-', text: 'Rarely get caught up in the excitement.' },
  { id: 'ipip_bfas_070', domain: 'Extraversion', aspect: 'Enthusiasm', keyed: '-', text: 'Am not a very enthusiastic person.' },
  { id: 'ipip_bfas_071', domain: 'Extraversion', aspect: 'Assertiveness', keyed: '+', text: 'Take charge.' },
  { id: 'ipip_bfas_072', domain: 'Extraversion', aspect: 'Assertiveness', keyed: '+', text: 'Have a strong personality.' },
  { id: 'ipip_bfas_073', domain: 'Extraversion', aspect: 'Assertiveness', keyed: '+', text: 'Know how to captivate people.' },
  { id: 'ipip_bfas_074', domain: 'Extraversion', aspect: 'Assertiveness', keyed: '+', text: 'See myself as a good leader.' },
  { id: 'ipip_bfas_075', domain: 'Extraversion', aspect: 'Assertiveness', keyed: '+', text: 'Can talk others into doing things.' },
  { id: 'ipip_bfas_076', domain: 'Extraversion', aspect: 'Assertiveness', keyed: '+', text: 'Am the first to act.' },
  { id: 'ipip_bfas_077', domain: 'Extraversion', aspect: 'Assertiveness', keyed: '-', text: 'Do not have an assertive personality.' },
  { id: 'ipip_bfas_078', domain: 'Extraversion', aspect: 'Assertiveness', keyed: '-', text: 'Lack the talent for influencing people.' },
  { id: 'ipip_bfas_079', domain: 'Extraversion', aspect: 'Assertiveness', keyed: '-', text: 'Wait for others to lead the way.' },
  { id: 'ipip_bfas_080', domain: 'Extraversion', aspect: 'Assertiveness', keyed: '-', text: 'Hold back my opinions.' },
  { id: 'ipip_bfas_081', domain: 'Openness', aspect: 'Intellect', keyed: '+', text: 'Am quick to understand things.' },
  { id: 'ipip_bfas_082', domain: 'Openness', aspect: 'Intellect', keyed: '+', text: 'Can handle a lot of information.' },
  { id: 'ipip_bfas_083', domain: 'Openness', aspect: 'Intellect', keyed: '+', text: 'Like to solve complex problems.' },
  { id: 'ipip_bfas_084', domain: 'Openness', aspect: 'Intellect', keyed: '+', text: 'Have a rich vocabulary.' },
  { id: 'ipip_bfas_085', domain: 'Openness', aspect: 'Intellect', keyed: '+', text: 'Think quickly.' },
  { id: 'ipip_bfas_086', domain: 'Openness', aspect: 'Intellect', keyed: '+', text: 'Formulate ideas clearly.' },
  { id: 'ipip_bfas_087', domain: 'Openness', aspect: 'Intellect', keyed: '-', text: 'Have difficulty understanding abstract ideas.' },
  { id: 'ipip_bfas_088', domain: 'Openness', aspect: 'Intellect', keyed: '-', text: 'Avoid philosophical discussions.' },
  { id: 'ipip_bfas_089', domain: 'Openness', aspect: 'Intellect', keyed: '-', text: 'Avoid difficult reading material.' },
  { id: 'ipip_bfas_090', domain: 'Openness', aspect: 'Intellect', keyed: '-', text: 'Learn things slowly.' },
  { id: 'ipip_bfas_091', domain: 'Openness', aspect: 'Openness', keyed: '+', text: 'Enjoy the beauty of nature.' },
  { id: 'ipip_bfas_092', domain: 'Openness', aspect: 'Openness', keyed: '+', text: 'Believe in the importance of art.' },
  { id: 'ipip_bfas_093', domain: 'Openness', aspect: 'Openness', keyed: '+', text: 'Love to reflect on things.' },
  { id: 'ipip_bfas_094', domain: 'Openness', aspect: 'Openness', keyed: '+', text: 'Get deeply immersed in music.' },
  { id: 'ipip_bfas_095', domain: 'Openness', aspect: 'Openness', keyed: '+', text: 'See beauty in things that others might not notice.' },
  { id: 'ipip_bfas_096', domain: 'Openness', aspect: 'Openness', keyed: '+', text: 'Need a creative outlet.' },
  { id: 'ipip_bfas_097', domain: 'Openness', aspect: 'Openness', keyed: '-', text: 'Do not like poetry.' },
  { id: 'ipip_bfas_098', domain: 'Openness', aspect: 'Openness', keyed: '-', text: 'Seldom get lost in thought.' },
  { id: 'ipip_bfas_099', domain: 'Openness', aspect: 'Openness', keyed: '-', text: 'Seldom daydream.' },
  { id: 'ipip_bfas_100', domain: 'Openness', aspect: 'Openness', keyed: '-', text: 'Seldom notice the emotional aspects of paintings and pictures.' },
];

const BAND_COPY: Record<IpipBfasBand, string> = {
  low: 'lower expressed tendency in this prototype band',
  mid: 'balanced or situational tendency in this prototype band',
  high: 'stronger expressed tendency in this prototype band',
};

const emptyAggregate = (): IpipBfasAggregate => ({
  rawAverage: null,
  displayValue: null,
  itemCount: 0,
  answeredCount: 0,
});

const makeAggregateRecord = <K extends string>(keys: readonly K[]): Record<K, IpipBfasAggregate> =>
  Object.fromEntries(keys.map((key) => [key, emptyAggregate()])) as Record<K, IpipBfasAggregate>;

const toDisplayValue = (rawAverage: number | null) =>
  rawAverage === null ? null : Math.round(((rawAverage - 1) / 4) * 100);

const toBand = (rawAverage: number | null): IpipBfasBand => {
  if (rawAverage === null) return 'mid';
  if (rawAverage < 2.65) return 'low';
  if (rawAverage > 3.35) return 'high';
  return 'mid';
};

const bandFor = (rawAverage: number | null): IpipBfasDisplayBand => {
  const band = toBand(rawAverage);
  return { band, tendency: BAND_COPY[band] };
};

const isValidResponse = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5;

export function canScoreIpipBfasLocale(locale: string): boolean {
  return locale.toLowerCase().startsWith('en');
}

export function scoreIpipBfasItem(item: IpipBfasItem, response: number): number {
  if (!isValidResponse(response)) {
    throw new Error(`Invalid IPIP-BFAS response for ${item.id}`);
  }
  return item.keyed === '-' ? 6 - response : response;
}

export function scoreIpipBfasResponses(responses: Record<string, number>): IpipBfasResult {
  const itemScores: Record<string, number> = {};
  const aspectValues = Object.fromEntries(IPIP_BFAS_ASPECTS.map((aspect) => [aspect, [] as number[]])) as Record<IpipBfasAspect, number[]>;
  const domainValues = Object.fromEntries(IPIP_BFAS_DOMAINS.map((domain) => [domain, [] as number[]])) as Record<IpipBfasDomain, number[]>;
  const invalid = new Set<string>();

  for (const item of IPIP_BFAS_ITEMS) {
    const response = responses[item.id];
    if (!isValidResponse(response)) {
      if (response !== undefined) invalid.add(item.id);
      continue;
    }
    const scored = scoreIpipBfasItem(item, response);
    itemScores[item.id] = scored;
    aspectValues[item.aspect].push(scored);
    domainValues[item.domain].push(scored);
  }

  const aspectScores = makeAggregateRecord(IPIP_BFAS_ASPECTS);
  for (const aspect of IPIP_BFAS_ASPECTS) {
    const values = aspectValues[aspect];
    const expected = IPIP_BFAS_ITEMS.filter((item) => item.aspect === aspect).length;
    const rawAverage = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    aspectScores[aspect] = {
      rawAverage,
      displayValue: toDisplayValue(rawAverage),
      itemCount: expected,
      answeredCount: values.length,
    };
  }

  const domainScores = makeAggregateRecord(IPIP_BFAS_DOMAINS);
  for (const domain of IPIP_BFAS_DOMAINS) {
    const values = domainValues[domain];
    const expected = IPIP_BFAS_ITEMS.filter((item) => item.domain === domain).length;
    const rawAverage = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
    domainScores[domain] = {
      rawAverage,
      displayValue: toDisplayValue(rawAverage),
      itemCount: expected,
      answeredCount: values.length,
    };
  }

  const rawResponses = IPIP_BFAS_ITEMS.map((item) => responses[item.id]).filter(isValidResponse);
  const complete = rawResponses.length === IPIP_BFAS_ITEMS.length;
  const qualityFlags: IpipBfasQualityFlag[] = [];
  if (!complete) qualityFlags.push('incomplete');
  if (invalid.size > 0) qualityFlags.push('out_of_range');
  if (complete && new Set(rawResponses).size === 1) qualityFlags.push('straightlining');

  const aspectBands = Object.fromEntries(
    IPIP_BFAS_ASPECTS.map((aspect) => [aspect, bandFor(aspectScores[aspect].rawAverage)]),
  ) as Record<IpipBfasAspect, IpipBfasDisplayBand>;

  const domainBands = Object.fromEntries(
    IPIP_BFAS_DOMAINS.map((domain) => [domain, bandFor(domainScores[domain].rawAverage)]),
  ) as Record<IpipBfasDomain, IpipBfasDisplayBand>;

  return {
    instrumentType: 'ipip_bfas_100',
    scoringVersion: IPIP_BFAS_SCORING_VERSION,
    evidenceLabel: 'HEURISTIC',
    sourceUrl: IPIP_BFAS_SOURCE_URL,
    complete,
    qualityFlags,
    itemScores,
    aspectScores,
    domainScores,
    aspectBands,
    domainBands,
  };
}

export const SAMPLE_IPIP_BFAS_RESPONSES: Record<string, number> = Object.fromEntries(
  IPIP_BFAS_ITEMS.map((item, index) => {
    const pattern = [4, 5, 3, 4, 2, 5, 3, 4, 2, 3];
    return [item.id, pattern[index % pattern.length]];
  }),
);
