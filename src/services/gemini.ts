import { GoogleGenAI } from "@google/genai";

export const gemini = new GoogleGenAI({
  apiKey: (process.env as any).GEMINI_API_KEY || ''
});
