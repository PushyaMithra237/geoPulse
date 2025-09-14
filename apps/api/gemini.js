import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({ path: "./.env" });

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ Use the new stable model name
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
// or: const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function summarizeWithGemini(text) {
  try {
    const result = await model.generateContent(
      `Summarize this text in 2-3 sentences:\n\n${text}`
    );
    return result.response.text();
  } catch (err) {
    console.error("Gemini summarization error:", err);
    return "Failed to summarize.";
  }
}
