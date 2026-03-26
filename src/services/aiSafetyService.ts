import { SYSTEM_INSTRUCTIONS } from "@/ai/policies";
import { SafetyScanSchema } from "@/ai/schemas";
import { capabilityRouter } from "@/ai/capabilityRouter";
import { outputValidators } from "@/ai/outputValidators";
import { PROMPT_TEMPLATES } from "@/ai/prompts";
import { getAI } from "./aiService";

export const aiSafetyService = {
  async scanMessage(params: { message_text: string; context: string }) {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute('safety_scan'),
      contents: PROMPT_TEMPLATES.SAFETY_SCAN(params),
      config: {
        systemInstruction: SYSTEM_INSTRUCTIONS.SAFETY_SCAN,
        responseMimeType: "application/json",
        responseSchema: SafetyScanSchema,
      }
    });
    return outputValidators.validateSafetyScan(JSON.parse(response.text || "{}"));
  },

  async getSafetyAdvice(question: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: capabilityRouter.getRoute('safety_advice'),
      contents: PROMPT_TEMPLATES.SAFETY_ADVICE(question),
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text || "Your safety is our priority. Please contact support if you have immediate concerns.";
  }
};
