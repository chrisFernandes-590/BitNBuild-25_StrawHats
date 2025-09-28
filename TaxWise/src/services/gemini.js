import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY is not set in the environment variables.");
}

const ai = new GoogleGenAI({ apiKey });

async function generateTips(csvContent) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following financial data and provide tax-saving/optimization tips:\n\n${csvContent}`,
    });
    return response.text;
  } catch (error) {
    if (error?.error?.code === 503) {
      throw new Error("The AI service is currently unavailable. Please try again later.");
    }
    console.error("Error in generateTips:", error);
    throw new Error("An unexpected error occurred while generating AI tips.");
  }
}

export default generateTips;