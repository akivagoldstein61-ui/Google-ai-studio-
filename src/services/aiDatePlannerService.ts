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
      const response = await fetch('/api/ai/plan-date', {
        method: 'POST',
        headers: await getHeaders(),
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
