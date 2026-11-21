import { createServerlessHandler } from "./_adapter.js";

export default createServerlessHandler(async ({ method, body }) => {
  if (method !== "POST") {
    return { status: 405, data: { error: "Method not allowed" } };
  }

  const { name, phone, message, rating, services, liked, counter } = body || {};

  // Silent handling: logs in serverless execution console without triggering external alerts
  console.log(`[Feedback Logged] Name: ${name || "Anonymous"} | Contact: ${phone || "N/A"} | Rating: ${rating || "Unspecified"} | Desk: ${counter || "General"}`);

  return { status: 200, data: { ok: true, status: "logged" } };
});
