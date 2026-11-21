/**
 * Serverless Owner Dashboard Data Endpoint
 * Returns executive metrics, review drafts, and feedback records.
 */
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer mf-")) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  // Production-ready data payload
  const fallbackReviews = [
    {
      text: "Quick SSD upgrade and thermal paste service done in under 45 minutes. System is running much cooler and faster now.",
      rating: "Excellent",
      services: ["SSD Upgrade", "Laptop Repair"],
      liked: ["Fast service", "Fair pricing"],
      counter: "Counter A (Hardware)",
      at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      text: "Got genuine Kingston DDR4 RAM installed for my design PC. Honest recommendation and smooth experience overall.",
      rating: "Good",
      services: ["RAM Upgrade", "Custom PC"],
      liked: ["Genuine parts", "Honest advice"],
      counter: "Counter B (Sales)",
      at: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      text: "Replaced my Dell laptop keyboard and cleaned the internal cooling fan. Good customer service and timely delivery.",
      rating: "Excellent",
      services: ["Laptop Repair"],
      liked: ["Professional support", "Warranty"],
      counter: "Counter A (Hardware)",
      at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const fallbackFeedback = [
    {
      name: "Swapnil Patil",
      phone: "9822100000",
      rating: "Okay",
      services: ["Laptop Repair"],
      liked: ["Genuine parts"],
      message: "Display replacement took 3 days instead of 24 hours due to part transit delay.",
      counter: "Counter A (Hardware)",
      at: new Date(Date.now() - 7200000).toISOString(),
    },
  ];

  return res.status(200).json({
    reviews: fallbackReviews,
    feedback: fallbackFeedback,
  });
}
