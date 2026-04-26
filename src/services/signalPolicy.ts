export const signalPolicy = {
  allowedSignals: [
    "user-set hard filters",
    "user-set soft preferences",
    "recommendation mode",
    "manual Taste Profile edits",
    "More like this",
    "Less like this",
    "likes and passes as weak prototype feedback"
  ],
  disabledSignals: [
    "dwell time",
    "revisits",
    "post-date feedback",
    "passive behavioral learning"
  ],
  bannedSignals: [
    "message text",
    "message sentiment",
    "response latency",
    "photo-derived traits",
    "attractiveness inference",
    "face/body descriptors",
    "inferred religion",
    "inferred ethnicity",
    "inferred politics",
    "inferred sexual orientation",
    "inferred health",
    "off-platform browsing",
    "ad-tech data",
    "contact graph",
    "payment status",
    "hidden popularity or desirability score",
    "safety reports as taste signals"
  ]
};

export function isSignalAllowed(signal: string): boolean {
  // basic check
  return signalPolicy.allowedSignals.includes(signal);
}
