# Kesher — Israeli Privacy Law Amendment 13 Notice

> **Status:** Compliance scaffold. Final Hebrew copy must be reviewed by Israeli counsel before production launch (Gate 8).

---

## Scope

Amendment 13 to the Israeli Protection of Privacy Law (took effect August 14, 2025) introduces stricter requirements for any service that collects, processes, stores, or shares personal data of Israeli residents. Kesher is in scope because:

- It targets Israeli Jewish singles
- It collects sensitive identity, location, and religious-observance data
- It processes biometric (photo) data
- It uses AI inference layers on user-provided content
- Personality assessment data falls under "specially-sensitive personal information"

---

## Required Notice Components

The user-facing privacy notice (shown in onboarding and accessible from the AI Trust Hub) must cover, in plain Hebrew:

### 1. Identity of the controller
- Legal entity name (TBD — register at `Rasham HaHevarot`)
- Contact email and physical address
- DPO name and contact (required if processing specially-sensitive data at scale)

### 2. Purposes of processing
- Matchmaking and recommendations
- Safety / abuse prevention
- AI features (bio coaching, why-this-match, compatibility reflection)
- Service operation and analytics

### 3. Categories of data collected
- Identity: name, age, phone number, email
- Location: city / area (coarse only, never exact address)
- Religious observance: user-declared level only
- Photos
- Personality assessment responses (IPIP) — opt-in, deterministic scoring
- Behavioral signals: likes, passes, dwell time
- Messages: stored encrypted, accessed only for safety triage

### 4. Legal basis
- Performance of a contract (the service the user signed up for)
- Consent (separate consent for AI features, personality assessment, sharing)
- Legitimate interest (safety, fraud prevention)

### 5. Recipients & transfers
- Google Cloud (Tel Aviv region preferred for EU/IL data residency)
- Firebase (Google) for auth and data storage
- Vercel/Netlify for hosting
- Note: AI calls are server-side only. The Gemini API may receive content but never user identity data. Outputs do not train Google models when called via paid API.

### 6. Retention
- Active accounts: data retained while account exists
- Deleted accounts: 30-day grace period for restoration, then hard delete (except where required for legal/safety records)
- Personality scores: deleted on demand, no retention exceptions
- Messages: retained while conversation exists; deleted when both users delete the match
- Audit logs (safety actions): 12 months

### 7. User rights (Amendment 13)
The notice must explain — in plain Hebrew — that the user has the right to:
- **Access** their personal data
- **Rectify** inaccurate data
- **Delete** their data
- **Object** to certain processing
- **Withdraw consent** at any time
- **Export** their data in machine-readable format
- **File a complaint** with the Privacy Protection Authority (`הרשות להגנת הפרטיות`)

### 8. Specially-sensitive data
For personality assessment and religious observance data, the notice must explicitly confirm:
- Collection requires opt-in consent (not the default)
- Deletion is honored without explanation
- No automated decisions are made solely based on this data
- It is never shared with other users without granular, mutual, revocable consent

### 9. Automated decision-making (AI features)
The user must be told:
- Which features use AI
- What signals each feature uses (whitelist visible)
- That all AI outputs are drafts the user must approve
- The user may request manual review of any AI-influenced decision

### 10. International transfers
- Server data may be processed by Google Cloud (typically Tel Aviv `me-west1` region)
- Where data leaves Israel, the controller has confirmed adequate protection (SCCs / adequacy decisions)

---

## Implementation Status

| Component | File | Status |
|---|---|---|
| Notice text (Hebrew) | `src/features/onboarding/PrivacyNoticeScreen.tsx` | TODO — counsel review |
| AI Trust Hub disclosure | `src/features/settings/AITrustHub.tsx` | ✅ exists |
| Personality data deletion | `server/trustRoutes.ts` (`/personality/delete`) | ✅ wired |
| Personality data export | `server/trustRoutes.ts` (`/personality/export`) | ✅ wired |
| Account deletion (full) | `server/trustRoutes.ts` (`/delete-request`) | ✅ wired |
| Mutual consent records | `server/consentRoutes.ts` | ✅ wired |
| Audit logs | `server/aiRoutes.ts` (`routeMetadataLogger`) | ✅ wired |

---

## Gate 8 — Israeli Counsel Review

Before any production launch (not prototype), the following must be signed off by Israeli privacy counsel:

- [ ] Final Hebrew privacy notice reviewed for Amendment 13 compliance
- [ ] DPO appointed if processing specially-sensitive data at scale
- [ ] Data Processing Agreements (DPAs) with Google, Vercel, Firebase confirmed
- [ ] Israeli Privacy Authority registration filed
- [ ] Records of Processing Activities (ROPA) drafted
- [ ] Data breach notification procedure documented (72-hour authority notification)
- [ ] Cross-border transfer mechanism documented (SCCs / adequacy)
- [ ] DPIA (Data Protection Impact Assessment) for personality + AI features
- [ ] User-facing copy translated and reviewed
- [ ] Internal staff training on Amendment 13 obligations

Until all items pass, the personality assessment, compatibility reflection, and AI inference features remain `prototype_only` per `claims/personality.yml`.
