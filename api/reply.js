import { createServerlessHandler } from "./_adapter.js";
import { queryAI } from "./_ai.js";

export default createServerlessHandler(async ({ method, body }) => {
  if (method !== "POST") {
    return { status: 405, data: { error: "Method not allowed" } };
  }

  const { review } = body || {};
  if (!review) {
    return { status: 400, data: { error: "Review text is required" } };
  }

  const prompt = `Write a warm, professional owner reply as Mainframe Computers to this customer review. Thank them, reference something specific they mentioned, under 2 complete sentences. Always finish the sentence completely. If negative: apologize sincerely, offer a free re-check, invite them back. Output ONLY the reply.

Review: "${review}"`;

  try {
    let reply = "";
    try {
      reply = await queryAI(prompt);
    } catch (err) {
      console.warn("AI reply error, using template:", err.message);
      reply = null;
    }

    if (!reply) {
      const isNeg = /bad|poor|worst|disappoint|slow|broken|issue|problem|refund|not happy|angry/i.test(review);
      const mentions = review.match(/screen|battery|keyboard|charger|data|virus|speed|repair|upgrade|laptop|desktop|parts|pricing|price|service/i);
      const noun = mentions ? mentions[0].toLowerCase() : "your device";

      const posPool = [
        `Thank you for the kind words — glad the ${noun} work came together well. We appreciate you choosing Mainframe!`,
        `Thanks a lot for sharing this! Happy the ${noun} was sorted quickly. See you next time at Mainframe.`,
        `We really appreciate the positive feedback, and glad we could help with the ${noun}. Thank you for trusting Mainframe!`,
        `Thank you so much! It means a lot to hear that about our ${noun} service. Do visit us again!`,
      ];

      const negPool = [
        `We're sorry to hear this about the ${noun}. Please bring the device back for a free re-check — we'd love to make it right.`,
        `Apologies for the trouble with the ${noun}. Do visit us again; we'll re-check it free of charge and sort it out.`,
        `Really sorry we missed the mark on the ${noun}. Bring it in anytime for a free inspection so we can fix it properly.`,
      ];

      const pool = isNeg ? negPool : posPool;
      reply = pool[Math.floor(Math.random() * pool.length)];
    }

    return { status: 200, data: { reply } };
  } catch (e) {
    return { status: 500, data: { error: "Failed to generate reply" } };
  }
});
