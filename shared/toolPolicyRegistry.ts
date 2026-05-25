/**
 * Kesher Tool Policy Registry
 * Defines what each AI skill is and is NOT allowed to do.
 * Enforced at the server router level.
 */

export interface ToolPolicy {
  skillSlug: string;
  allowedSignals: string[];
  prohibitedSignals: string[];
  outputConstraints: string[];
  humanApprovalRequired: boolean;
  approvalDescription: string;
  knownFailures: string[];
}

export const TOOL_POLICY_REGISTRY: ToolPolicy[] = [
  {
    skillSlug: "bio-coach",
    allowedSignals: ["currentBio", "intent"],
    prohibitedSignals: ["personalityScores", "tasteVector", "likeHistory", "privateAnswers"],
    outputConstraints: [
      "Suggestions must be framed as optional",
      "No invented facts",
      "Non-clinical tone",
    ],
    humanApprovalRequired: true,
    approvalDescription: "User must click 'Apply' to use any suggestion",
    knownFailures: ["May produce generic suggestions for short bios"],
  },
  {
    skillSlug: "why-match",
    allowedSignals: ["displayName", "bio", "observance", "location", "relationshipIntent", "gender"],
    prohibitedSignals: ["personalityScores", "tasteVector", "likeHistory", "privateAnswers", "messageHistory"],
    outputConstraints: [
      "Must cite only public profile fields",
      "Caveat always present",
      "No certainty claims",
      "No personality inference language",
    ],
    humanApprovalRequired: false,
    approvalDescription: "Displayed inline — informational only",
    knownFailures: ["May hallucinate shared signals if profiles are sparse"],
  },
  {
    skillSlug: "message-safety-scan",
    allowedSignals: ["messageContent"],
    prohibitedSignals: ["userIdentity", "conversationHistory", "profileData"],
    outputConstraints: [
      "Never blocks sending",
      "Advisory only",
      "Non-judgmental language",
    ],
    humanApprovalRequired: false,
    approvalDescription: "User decides whether to edit or send after seeing result",
    knownFailures: ["False positives on Hebrew idioms", "May miss subtle manipulation"],
  },
  {
    skillSlug: "rephrase",
    allowedSignals: ["draftMessage"],
    prohibitedSignals: ["userIdentity", "conversationHistory", "profileData"],
    outputConstraints: [
      "Must preserve original intent",
      "No pressure language added",
      "At least 2 alternatives",
    ],
    humanApprovalRequired: true,
    approvalDescription: "User selects an alternative or keeps original",
    knownFailures: ["Intent drift in very short messages"],
  },
  {
    skillSlug: "openers",
    allowedSignals: ["matchProfileSummary"],
    prohibitedSignals: ["personalityScores", "tasteVector", "privateAnswers"],
    outputConstraints: [
      "Based on public info only",
      "No pickup lines",
      "No pressure language",
      "3 openers returned",
    ],
    humanApprovalRequired: true,
    approvalDescription: "User selects and edits before sending",
    knownFailures: ["May be generic if profile is sparse"],
  },
  {
    skillSlug: "date-ideas",
    allowedSignals: ["sharedInterests"],
    prohibitedSignals: ["personalityScores", "tasteVector", "privateAnswers"],
    outputConstraints: [
      "Each idea must include safetyNote",
      "Accessible and low-pressure ideas",
      "3 ideas returned",
    ],
    humanApprovalRequired: true,
    approvalDescription: "User shares idea manually in chat",
    knownFailures: ["May suggest inaccessible venues"],
  },
  {
    skillSlug: "personality-summary",
    allowedSignals: ["bio", "intent", "observance"],
    prohibitedSignals: ["personalityScores", "tasteVector", "privateAnswers", "likeHistory"],
    outputConstraints: [
      "Non-clinical language only",
      "Caveat always present",
      "No diagnosis",
      "Not shown to matches",
    ],
    humanApprovalRequired: false,
    approvalDescription: "Displayed to user only — informational",
    knownFailures: ["May sound clinical for users with detailed bios"],
  },
  {
    skillSlug: "pair-insight",
    allowedSignals: ["publicProfileFields"],
    prohibitedSignals: ["personalityScores", "tasteVector", "privateAnswers", "messageHistory"],
    outputConstraints: [
      "Consent gate enforced server-side",
      "Caveat always present",
      "Not shared with match",
      "No clinical language",
    ],
    humanApprovalRequired: true,
    approvalDescription: "Requires explicit consent before generation",
    knownFailures: ["May over-claim compatibility for profiles with similar values"],
  },
  {
    skillSlug: "safety-advice",
    allowedSignals: ["situation"],
    prohibitedSignals: ["userIdentity", "matchIdentity", "conversationHistory"],
    outputConstraints: [
      "General advice only",
      "Always recommend professional help for serious situations",
      "Non-judgmental",
      "Resources list non-empty",
    ],
    humanApprovalRequired: false,
    approvalDescription: "Displayed inline — informational",
    knownFailures: ["May be too generic for specific situations"],
  },
  {
    skillSlug: "moderation-summary",
    allowedSignals: ["reportContent", "reportReason", "reportDetails"],
    prohibitedSignals: ["reporterIdentity", "reportedUserProfile"],
    outputConstraints: [
      "DRAFT ONLY — caveat always present",
      "Confidence level always included",
      "Conservative suggestions",
      "Moderator-only access",
    ],
    humanApprovalRequired: true,
    approvalDescription: "Moderator must explicitly select and confirm action",
    knownFailures: ["May suggest overly conservative actions", "May hallucinate context"],
  },
];

export default TOOL_POLICY_REGISTRY;
