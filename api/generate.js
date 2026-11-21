import { queryAI } from "./_ai.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { rating = "Excellent", services = [], liked = [] } = req.body || {};

  const serviceStr = services.length > 0 ? services.join(", ") : "Laptop Repair & Service";
  const likedStr = liked.length > 0 ? liked.join(", ") : "Fast service & Genuine parts";

  // Google Maps Local SEO Optimized Prompt
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
    } catch (err) {
      console.warn("AI generation error, using SEO fallback template:", err.message);
      generated = null;
    }

    if (!generated) {
      // High-converting local SEO fallback templates
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

    return res.status(200).json({ review: generated });
  } catch (error) {
    return res.status(500).json({ error: "Failed to generate review. Write a quick line yourself!" });
  }
}
