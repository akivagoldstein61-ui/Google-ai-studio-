/**
 * Client-side date planner service — calls server-side proxy endpoint.
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

export const aiDatePlannerService = {
  async planDate(params: { area: string; time: string; preferences: string; budget: string }) {
    return post("date-planner", params);
  }
};
