import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1"

/** CORS for browser calls from your Vite app. Tighten ALLOWED_ORIGIN in production. */
function cors(req: Request): HeadersInit {
  const allowOrigin = Deno.env.get("ALLOWED_ORIGIN") ?? "*"
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

  /**
   * OAuth access token from LinkedIn (OIDC), available on the client after sign-in:
   * `const { data: { session } } = await supabase.auth.getSession()`
   * `session.provider_token`
   *
   * Passing it here avoids storing LinkedIn secrets in this function; only logged-in
   * Supabase users can invoke the proxy.
   */
  const linkedInAccessToken = req.headers.get("x-linkedin-access-token")
  if (!linkedInAccessToken) {
    return new Response(
      JSON.stringify({
        error:
          "Missing X-LinkedIn-Access-Token. Use session.provider_token after signInWithOAuth with linkedin_oidc.",
      }),
      {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      }
    )
  }

  const target =
    new URL(req.url).searchParams.get("path") ?? "userinfo"

  const linkedInUrl =
    target === "userinfo"
      ? "https://api.linkedin.com/v2/userinfo"
      : null

  if (!linkedInUrl) {
    return new Response(
      JSON.stringify({
        error: 'Unsupported path. Use ?path=userinfo or extend the function for other LinkedIn REST endpoints.',
      }),
      {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      }
    )
  }

  const liRes = await fetch(linkedInUrl, {
    headers: { Authorization: `Bearer ${linkedInAccessToken}` },
  })

  const body = await liRes.text()
  const contentType =
    liRes.headers.get("Content-Type") ?? "application/json"

  return new Response(body, {
    status: liRes.status,
    headers: { ...headers, "Content-Type": contentType },
  })
})
