import { GoogleGenAI } from '@google/genai';

async function test() {
  const ai = new GoogleGenAI({ apiKey: "INVALID_KEY" });
  try {
    await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Hello"
    });
  } catch (err) {
    console.log("Error status:", err.status);
    console.log("Error message:", err.message);
  }
}
test();
