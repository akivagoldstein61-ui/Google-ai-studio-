import { SYSTEM_INSTRUCTIONS } from "@/ai/policies";
import { DateIdeasSchema } from "@/ai/schemas";
import { capabilityRouter } from "@/ai/capabilityRouter";
import { outputValidators } from "@/ai/outputValidators";
import { PROMPT_TEMPLATES } from "@/ai/prompts";
import { getAI } from "./aiService";

export const aiDatePlannerService = {
  async planDate(params: { area: string; time: string; preferences: string; budget: string }) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute('date_planner'),
      contents: PROMPT_TEMPLATES.DATE_PLANNER(params) + "\n\nIMPORTANT: You must return ONLY valid JSON matching the expected schema. Do not include markdown formatting like ```json.",
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.DATE_PLANNER,
        tools: [{ googleSearch: {} }] // Note: Maps grounding is simulated via Search here due to SDK limits, but conceptually it's Maps
      }
    });
    
    let text = response.text || "{}";
    // Clean up potential markdown formatting
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      return outputValidators.validateDatePlanner(JSON.parse(text));
    } catch (e) {
      console.error("Failed to parse date planner JSON:", text);
      throw e;
    }
  }
};
