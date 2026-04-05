/**
 * Client-side date planner service — calls server-side proxy endpoint.
 *
 * All Gemini SDK usage has been moved to server/aiRoutes.ts.
 */

async function post(endpoint: string, body: Record<string, unknown>): Promise<any> {
  const res = await fetch(`/api/ai/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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
