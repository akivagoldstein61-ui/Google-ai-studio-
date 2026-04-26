import { TastePattern } from '../types';

let mockTasteProfile: TastePattern[] = [
  {
    id: "tp1",
    category: "Communication",
    value: "Values thoughtful prompt answers",
    sourceClass: "explicit_feedback",
    provenanceSummary: "You clicked 'More like this' on a detailed bio.",
    confidence: 0.8,
    supportCount: 3,
    distinctSessionCount: 2,
    lastConfirmedAt: new Date().toISOString(),
    decayHalfLifeDays: 30,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    userLocked: false,
    userHidden: false,
    rankWeightCap: 1.0,
    eligibleForRanking: true,
    sensitivityTier: 1
  }
];

export const tasteProfileService = {
  async getTasteProfile(): Promise<TastePattern[]> {
    return Promise.resolve([...mockTasteProfile]);
  },

  async updateTasteProfile(patterns: TastePattern[]): Promise<void> {
    mockTasteProfile = [...patterns];
    return Promise.resolve();
  },

  async addPattern(pattern: Omit<TastePattern, 'id'>): Promise<TastePattern> {
    const newPattern = { ...pattern, id: `tp_${Date.now()}` };
    mockTasteProfile.push(newPattern);
    return Promise.resolve(newPattern);
  },

  async reset(): Promise<void> {
    mockTasteProfile = [];
    return Promise.resolve();
  }
};
