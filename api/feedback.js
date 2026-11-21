/**
 * Serverless Private Feedback Handler
 * Intercepts dissatisfied customer submissions cleanly and silently.
 * Does NOT send external notifications, SMS, or spam.
 */
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

  const { name, phone, message, rating, services, liked, counter } = req.body || {};

  // Silent handling: logs in serverless execution console without triggering external alerts
  console.log(`[Feedback Logged] Name: ${name || "Anonymous"} | Contact: ${phone || "N/A"} | Rating: ${rating || "Unspecified"} | Desk: ${counter || "General"}`);

  // Return success response to the customer immediately
  return res.status(200).json({ ok: true, status: "logged" });
}
