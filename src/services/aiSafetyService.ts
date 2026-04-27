import { MessageSafetyScanSchema, ModerationSummarySchema } from "@/ai/schemas";
import { auth } from '@/firebase';

const getHeaders = async () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const aiSafetyService = {
  async scanMessageSafety(text: string) {
    try {
      const response = await fetch('/api/ai/message-safety', {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("INVALID_JSON_RESPONSE");
      }
      
      return await response.json();
    } catch (e: any) {
      if (e?.message !== "INVALID_JSON_RESPONSE") {
        console.error("Safety scan API call failed", e);
      }
      return { risk_level: 'low', categories: [], recommended_action: 'allow', short_rationale: '' };
    }
  },

  async summarizeModerationCase(reports: any[]) {
    try {
      const response = await fetch('/api/ai/moderation-summary', {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ reports })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("INVALID_JSON_RESPONSE");
      }
      
      return await response.json();
    } catch (e: any) {
      if (e?.message !== "INVALID_JSON_RESPONSE") {
        console.error("Moderation summary API call failed", e);
      }
      return { summary: "Failed to generate summary.", claims: [], evidence: [], riskLevel: "low", escalationRecommended: false };
    }
  },

  async getSafetyAdvice(question: string): Promise<string> {
    try {
      const response = await fetch('/api/ai/safety-advice', {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify({ question })
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.advice;
    } catch (e: any) {
      if (e?.message !== "INVALID_JSON_RESPONSE") {
        console.error("Safety advice API call failed", e);
      }
      return "Your safety is our priority. Please contact support if you have immediate concerns.";
    }
  }
};
