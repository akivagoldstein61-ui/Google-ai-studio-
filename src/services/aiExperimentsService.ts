import { FEATURE_FLAGS } from '@/ai/featureFlags';

export const aiExperimentsService = {
  getFeatureFlags() {
    return FEATURE_FLAGS;
  },

  getActiveExperiments() {
    return [
      {
        id: 'exp_bio_coach_v2',
        title: "Bio Coach Tone V2",
        status: "Running",
        traffic: "50%",
        metric: "Completion Rate",
        lift: "+4.2%",
        isPositive: true
      },
      {
        id: 'exp_why_match_values',
        title: "Why Match - Values Priority",
        status: "Running",
        traffic: "20%",
        metric: "First Message Rate",
        lift: "-1.5%",
        isPositive: false
      }
    ];
  },

  getEvalTools() {
    return [
      { id: 'eval_prompt_regression', title: "Prompt Regression Tester", description: "Compare outputs across prompt versions" },
      { id: 'eval_ranking_fairness', title: "Ranking Fairness Audit", description: "Simulate deck diversity and bias" },
      { id: 'eval_hebrew_safety', title: "Hebrew Safety Lexicon", description: "Stress-test toxicity on slang" }
    ];
  }
};
