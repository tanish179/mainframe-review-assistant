/**
 * Universal Serverless Adapter
 * Transparently supports:
 * 1. Netlify Functions v2 (Web standard Request -> Response)
 * 2. Vercel Serverless Functions (Node.js req, res)
 * 3. Local Express (req, res)
 */
export function createServerlessHandler(handlerFn) {
  return async function (req, resOrContext) {
    const isNodeExpress = resOrContext && typeof resOrContext.status === "function";

    // Handle CORS preflight
    const method = req.method ? req.method.toUpperCase() : "GET";
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (method === "OPTIONS") {
      if (isNodeExpress) {
        for (const [k, v] of Object.entries(corsHeaders)) {
          resOrContext.setHeader(k, v);
        }
        return resOrContext.status(200).end();
      }
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    // Parse request body
    let body = req.body;
    if (!isNodeExpress && (method === "POST" || method === "PUT" || method === "PATCH")) {
      try {
        if (typeof req.json === "function") {
          body = await req.json();
        } else if (typeof req.text === "function") {
          const raw = await req.text();
          body = raw ? JSON.parse(raw) : {};
        }
      } catch (e) {
        body = {};
      }
    }

    // Extract headers
    let authHeader = "";
    if (req.headers) {
      if (typeof req.headers.get === "function") {
        authHeader = req.headers.get("authorization") || "";
      } else {
        authHeader = req.headers.authorization || "";
      }
    }

    const context = {
      method,
      body: body || {},
      authHeader,
      req,
    };

    try {
      const { status = 200, data = {}, headers = {} } = await handlerFn(context);
      const combinedHeaders = { ...corsHeaders, ...headers, "Content-Type": "application/json" };

      if (isNodeExpress) {
        for (const [k, v] of Object.entries(combinedHeaders)) {
          resOrContext.setHeader(k, v);
        }
        return resOrContext.status(status).json(data);
      }

      return new Response(JSON.stringify(data), {
        status,
        headers: combinedHeaders,
      });
    } catch (err) {
      console.error("[Serverless Error]", err);
      if (isNodeExpress) {
        return resOrContext.status(500).json({ error: "Internal server error" });
      }
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  };
}
