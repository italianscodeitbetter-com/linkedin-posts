import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1"

function cors(req: Request): HeadersInit {
  const allowedRaw = Deno.env.get("ALLOWED_ORIGINS") ?? Deno.env.get("ALLOWED_ORIGIN") ?? "*"
  const requestOrigin = req.headers.get("Origin") ?? ""

  let allowOrigin: string
  if (allowedRaw === "*") {
    allowOrigin = "*"
  } else {
    const allowed = allowedRaw.split(",").map((o) => o.trim())
    allowOrigin = allowed.includes(requestOrigin) ? requestOrigin : allowed[0]
  }

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    Vary: "Origin",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-linkedin-access-token",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  }
}

Deno.serve(async (req) => {
  const headers = cors(req)

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers })
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...headers, "Content-Type": "application/json" },
    })
  }

  const authHeader = req.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid Authorization bearer token" }),
      {
        status: 401,
        headers: { ...headers, "Content-Type": "application/json" },
      }
    )
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  })

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...headers, "Content-Type": "application/json" },
    })
  }

  // Resolve the LinkedIn access token: prefer the header, fall back to the DB.
  let linkedInAccessToken = req.headers.get("x-linkedin-access-token")

  if (!linkedInAccessToken) {
    const { data: tokenRow } = await supabase
      .from("linkedin_tokens")
      .select("access_token")
      .eq("user_id", user.id)
      .maybeSingle()

    linkedInAccessToken = tokenRow?.access_token ?? null
  }

  if (!linkedInAccessToken) {
    return new Response(
      JSON.stringify({
        error:
          "LinkedIn non connesso. Connetti il tuo account LinkedIn prima di pubblicare.",
      }),
      {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      }
    )
  }

  const target = new URL(req.url).searchParams.get("path") ?? "userinfo"

  // ── GET /v2/userinfo ──────────────────────────────────────────────────────
  if (target === "userinfo") {
    const liRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${linkedInAccessToken}` },
    })
    const body = await liRes.text()
    return new Response(body, {
      status: liRes.status,
      headers: { ...headers, "Content-Type": liRes.headers.get("Content-Type") ?? "application/json" },
    })
  }

  // ── POST /rest/posts ──────────────────────────────────────────────────────
  if (target === "post") {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Use POST for ?path=post" }), {
        status: 405,
        headers: { ...headers, "Content-Type": "application/json" },
      })
    }

    let text: string
    try {
      const body = await req.json()
      text = body.text
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      })
    }

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "Missing 'text' field" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      })
    }

    // Get member ID from userinfo to build the author URN
    const userinfoRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${linkedInAccessToken}` },
    })
    if (!userinfoRes.ok) {
      return new Response(
        JSON.stringify({ error: "Impossibile recuperare il profilo LinkedIn" }),
        { status: userinfoRes.status, headers: { ...headers, "Content-Type": "application/json" } }
      )
    }
    const { sub } = await userinfoRes.json() as { sub: string }

    // Save linkedin_sub for future reference
    await supabase
      .from("linkedin_tokens")
      .update({ linkedin_sub: sub, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)

    const postRes = await fetch("https://api.linkedin.com/rest/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${linkedInAccessToken}`,
        "Content-Type": "application/json",
        "LinkedIn-Version": "202304",
        "X-RestLi-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${sub}`,
        commentary: text,
        visibility: "PUBLIC",
        distribution: {
          feedDistribution: "MAIN_FEED",
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: "PUBLISHED",
        isReshareDisabledByAuthor: false,
      }),
    })

    const postBody = await postRes.text()
    return new Response(postBody || JSON.stringify({ ok: true }), {
      status: postRes.status,
      headers: {
        ...headers,
        "Content-Type": postRes.headers.get("Content-Type") ?? "application/json",
      },
    })
  }

  return new Response(
    JSON.stringify({ error: "Unsupported path. Use ?path=userinfo or ?path=post" }),
    { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
  )
})
