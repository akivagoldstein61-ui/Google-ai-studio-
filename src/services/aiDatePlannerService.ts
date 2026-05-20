import { isPrototypeDemoMode } from '@/lib/prototypeMode';
import { buildJsonAuthHeaders } from './authHeaders';

export const aiDatePlannerService = {
  async planDate(params: { 
    locationScope: string; 
    locationValue: string; 
    time: string; 
    budget: string; 
    vibe: string; 
    transport: string; 
    constraints: string; 
  }) {
    try {
      if (isPrototypeDemoMode()) {
        return { venues: [], how_to_choose_tip: 'Demo mode: date planner is mocked and does not call the API.' };
      }

      const response = await fetch('/api/ai/plan-date', {
        method: 'POST',
        headers: await buildJsonAuthHeaders(),
        body: JSON.stringify({ params })
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
        console.error("Date planner API call failed", e);
      }
      return { venues: [], how_to_choose_tip: "" };
    }
  }
};
