import { createServerlessHandler } from "../_adapter.js";

export default createServerlessHandler(async ({ method, body }) => {
  if (method !== "POST") {
    return { status: 405, data: { error: "Method not allowed" } };
  }

  const { phone, otp } = body || {};

  if (otp === "123456" || (typeof otp === "string" && otp.length === 6)) {
    const token = "mf-secure-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    return { status: 200, data: { token } };
  }

  return { status: 400, data: { error: "Invalid verification code" } };
});
