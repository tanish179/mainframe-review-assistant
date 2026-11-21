import express from "express";
import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

if (fs.existsSync(".env")) {
  process.loadEnvFile(".env");
}

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 4000;
const DATA = path.join(process.cwd(), "data.json");
const store = fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA)) : { feedback: [], reviews: [], otps: {} };
const save = () => fs.writeFileSync(DATA, JSON.stringify(store, null, 2));

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || null;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";

async function queryAI(prompt) {
  // 1. Try Gemini first if key is provided (1,500 free requests/day)
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });
      const out = await model.generateContent(prompt);
      const text = out.response.text().trim();
      if (text) {
        return text.replace(/^["']|["']$/g, "").trim();
      }
    } catch (geminiErr) {
      console.warn("Gemini API call failed or rate-limited, switching to fallback:", geminiErr.message);
    }
  }

  // 2. Try OpenRouter (50 free requests/day or backup provider)
  if (OPENROUTER_API_KEY) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        signal: AbortSignal.timeout(12000),
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "Mainframe Review Assistant",
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [{ role: "user", content: prompt }],
          max_tokens: 350,
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
        const errData = await res.json().catch(() => ({}));
        console.warn("OpenRouter API returned error:", errData?.error?.message || res.status);
      }
    } catch (openRouterErr) {
      console.warn("OpenRouter call failed or timed out:", openRouterErr.message);
    }
  }

  // 3. Fallback to smart local template if both providers are exhausted or unavailable
  return null;
}

const ipHits = {};
const rateLimited = (ip) => {
  const isLocal = ip === "127.0.0.1" || ip === "::1" || ip?.includes("192.168.") || ip?.includes("172.");
  const maxAllowed = isLocal ? 100 : 5;
  const now = Date.now();
  ipHits[ip] = (ipHits[ip] || []).filter((t) => now - t < 86400000);
  if (ipHits[ip].length >= maxAllowed) return true;
  ipHits[ip].push(now);
  return false;
};

app.post("/api/generate", async (req, res) => {
  if (rateLimited(req.ip)) return res.status(429).json({ error: "Too many requests. Try tomorrow!" });
  const { rating = "Excellent", services = [], liked = [] } = req.body;
  
  const serviceStr = services.length > 0 ? services.join(", ") : "Laptop Repair & Service";
  const likedStr = liked.length > 0 ? liked.join(", ") : "Fast service & Genuine parts";

  const prompt = `You are an authentic Indian customer writing a genuine 5-star Google Maps review for "Mainframe Computers" located in Rajarampuri, Kolhapur.

GOAL: Help Mainframe Computers rank #1 on Google Maps for local searches like "laptop repair in Kolhapur", "computer shop in Rajarampuri", "PC build Kolhapur".

STRICT RULES:
1. First-person ("I got my...", "Visited for...", "Best place in...").
2. 1 to 2 complete, punchy sentences. Maximum 28-35 words. Always finish the sentence with proper punctuation.
3. Naturally weave in:
   - The specific service: "${serviceStr}"
   - The highlight: "${likedStr}"
   - A natural local keyword organically (e.g., "in Kolhapur" or "in Rajarampuri" or "near Rajarampuri").
4. Sound 100% human and conversational. DO NOT sound like a paid marketing bot. No hashtag, no emojis, no quotation marks.
5. Output ONLY the raw review sentence.

Customer Experience Details:
- Rating: ${rating}
- Service: ${serviceStr}
- Highlight: ${likedStr}`;

  try {
    let generated = "";
    try {
      generated = await queryAI(prompt);
    } catch (apiErr) {
      console.warn("AI API call failed, falling back to smart template:", apiErr.message);
      generated = null;
    }

    if (!generated) {
      const primaryService = services[0] || "laptop repair";
      const primaryLiked = liked[0] || "genuine parts";
      
      const templates = [
        `Got my ${primaryService.toLowerCase()} done at Mainframe Computers in Rajarampuri. Really impressed with their ${primaryLiked.toLowerCase()} and quick turnaround. Definitely the best computer service in Kolhapur!`,
        `Visited Mainframe Computers for ${primaryService.toLowerCase()}. Appreciated the ${primaryLiked.toLowerCase()} and honest advice. One of the most reliable computer repair shops in Kolhapur.`,
        `Super fast ${primaryService.toLowerCase()} service at Mainframe Computers, Rajarampuri. Great pricing and ${primaryLiked.toLowerCase()}. Highly recommended for any PC or laptop issues in Kolhapur!`,
        `Had a great experience with ${primaryService.toLowerCase()} at Mainframe. Staff is polite, ${primaryLiked.toLowerCase()} was as promised, and charges are fair. Highly recommended in Kolhapur!`
      ];
      generated = templates[Math.floor(Math.random() * templates.length)];
    }

    store.reviews.unshift({
      text: generated,
      rating,
      services,
      liked,
      counter: req.body.counter || "General",
      at: new Date().toISOString()
    });
    save();
    res.json({ review: generated });
  } catch (e) {
    res.status(500).json({ error: "Failed to generate review. Write a quick line yourself!" });
  }
});

app.post("/api/feedback", (req, res) => {
  store.feedback.unshift({ ...req.body, at: new Date().toISOString() });
  save();
  console.log(`FEEDBACK -> wa.me/?text=${encodeURIComponent(`Unhappy customer: ${req.body.name} ${req.body.phone} - ${req.body.message}`)}`);
  res.json({ ok: true });
});

app.get("/review", (req, res) => {
  res.redirect("https://search.google.com/local/writereview?placeid=ChIJ7bbz-CwBwTsReJz4vKgjBtY");
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(process.cwd(), "dist")));
  app.get("*", (_, res) => res.sendFile(path.join(process.cwd(), "dist/index.html")));
}

app.listen(PORT, () => console.log(`Server on :${PORT}`));
