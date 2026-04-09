/**
 * Client-side AI safety service — calls server-side proxy endpoints.
 *
 * All Gemini SDK usage has been moved to server/aiRoutes.ts.
 */

import { authFetch } from './authFetch';

async function post(endpoint: string, body: Record<string, unknown>): Promise<any> {
  const res = await authFetch(`/api/ai/${endpoint}`, {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Server error" }));
    throw new Error(err.error || `AI request failed: ${res.status}`);
  }

  return res.json();
}

export const aiSafetyService = {
  async scanMessage(params: { message_text: string; context: string }) {
    return post("safety-scan", params);
  },

  async getSafetyAdvice(question: string): Promise<string> {
    const data = await post("safety-advice", { question });
    return data.advice || "Your safety is our priority. Please contact support if you have immediate concerns.";
  }
};
