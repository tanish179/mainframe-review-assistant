import { createServerlessHandler } from "../_adapter.js";

export default createServerlessHandler(async ({ method, body }) => {
  if (method !== "POST") {
    return { status: 405, data: { error: "Method not allowed" } };
  }

  const { phone } = body || {};
  if (!/^\d{10}$/.test(phone || "")) {
    return { status: 400, data: { error: "Enter a valid 10-digit mobile number" } };
  }

  return { status: 200, data: { ok: true } };
});
