import { GoogleGenerativeAI } from "@google/generative-ai";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || null;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || null;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * Universal Serverless AI Dispatcher
 * Priority 1: Google Gemini (1,500 free requests/day, fast direct inference)
 * Priority 2: OpenRouter (50 free requests/day or custom models)
 * Priority 3: null (triggers smart local template fallback)
 */
export async function queryAI(prompt) {
  // 1. Try Gemini first if key is present
  if (GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const out = await model.generateContent(prompt);
      const text = out.response.text().trim();
      if (text) {
        return text.replace(/^["']|["']$/g, "").trim();
      }
    } catch (geminiErr) {
      console.warn("Gemini serverless call failed or rate-limited:", geminiErr.message);
    }
  }

  // 2. Try OpenRouter backup
  if (OPENROUTER_API_KEY) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(12000),
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://mainframecomputers.in",
          "X-Title": "Mainframe Review Assistant",
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        let text = data.choices?.[0]?.message?.content?.trim() || "";
        if (!text && data.choices?.[0]?.message?.reasoning) {
          text = data.choices[0].message.reasoning.trim();
        }
        if (text) {
          return text.replace(/^["']|["']$/g, "").trim();
        }
      } else {
        const err = await res.json().catch(() => ({}));
        console.warn("OpenRouter API returned error:", err?.error?.message || res.status);
      }
    } catch (openRouterErr) {
      console.warn("OpenRouter serverless call failed:", openRouterErr.message);
    }
  }

  return null;
}
