import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1"

const ALLOWED_STYLES = new Set([
  "Professionale",
  "Storytelling",
  "Tecnico",
  "Ispirazionale",
  "Educativo",
  "Promozionale",
])

function corsHeaders(req: Request): HeadersInit {
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
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  }
}

function buildSystemPrompt(style: string): string {
  return [
    "Sei un copywriter LinkedIn esperto in personal branding B2B.",
    "Scrivi in italiano, chiaro e naturale.",
    `Stile richiesto: ${style}.`,
    "Output richiesto:",
    "- Hook iniziale breve (1 riga).",
    "- Corpo con 3-6 paragrafi brevi.",
    "- Chiusura con CTA concreta.",
    "- 4-6 hashtag pertinenti alla fine.",
    "Evita claim non verificabili e toni troppo artificiali.",
  ].join("\n")
}

function resolveAnthropicModel(rawModel: string | undefined): string {
  if (!rawModel) return "claude-sonnet-4-6"
  const cleaned = rawModel.trim()
  if (!cleaned) return "claude-sonnet-4-6"
  // Accept both "claude-..." and "model: claude-..."
  return cleaned.replace(/^model\s*:\s*/i, "")
}

async function callAnthropic(params: {
  apiKey: string
  model: string
  style: string
  prompt: string
}) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": params.apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: params.model,
      max_tokens: 900,
      temperature: 0.7,
      system: buildSystemPrompt(params.style),
      messages: [{ role: "user", content: params.prompt }],
    }),
  })

  const json = await response.json().catch(() => null)
  return { response, json }
}

Deno.serve(async (req) => {
  const headers = corsHeaders(req)

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...headers, "Content-Type": "application/json" },
    })
  }

  const authHeader = req.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...headers, "Content-Type": "application/json" },
    })
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

  const body = await req.json().catch(() => null)
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : ""
  const style = typeof body?.style === "string" ? body.style.trim() : ""

  if (!prompt || prompt.length < 10) {
    return new Response(
      JSON.stringify({ error: "Prompt troppo corto (minimo 10 caratteri)" }),
      { status: 400, headers: { ...headers, "Content-Type": "application/json" } }
    )
  }
  if (!ALLOWED_STYLES.has(style)) {
    return new Response(JSON.stringify({ error: "Stile non valido" }), {
      status: 400,
      headers: { ...headers, "Content-Type": "application/json" },
    })
  }

  const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY")
  if (!anthropicApiKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY non configurata" }),
      { status: 500, headers: { ...headers, "Content-Type": "application/json" } }
    )
  }

  const configuredModel = resolveAnthropicModel(Deno.env.get("ANTHROPIC_MODEL"))
  const candidateModels = [
    configuredModel,
    "claude-sonnet-4-6",
    "claude-3-5-sonnet-20241022",
  ].filter((value, index, arr) => arr.indexOf(value) === index)

  let anthropicRes: Response | null = null
  let anthropicJson: unknown = null
  let usedModel = configuredModel

  for (const model of candidateModels) {
    const attempt = await callAnthropic({
      apiKey: anthropicApiKey,
      model,
      style,
      prompt,
    })
    anthropicRes = attempt.response
    anthropicJson = attempt.json
    usedModel = model

    if (anthropicRes.ok) break

    const errMessage =
      typeof (anthropicJson as { error?: { message?: string } })?.error?.message ===
      "string"
        ? (anthropicJson as { error: { message: string } }).error.message
        : ""
    const isModelError =
      errMessage.toLowerCase().includes("model") ||
      errMessage.toLowerCase().includes("not_found_error")
    if (!isModelError) break
  }

  if (!anthropicRes) {
    return new Response(JSON.stringify({ error: "Errore provider AI" }), {
      status: 502,
      headers: { ...headers, "Content-Type": "application/json" },
    })
  }

  if (!anthropicRes.ok) {
    const message =
      typeof (anthropicJson as { error?: { message?: string } })?.error?.message ===
      "string"
        ? (anthropicJson as { error: { message: string } }).error.message
        : `Errore provider AI sul modello ${usedModel}`
    return new Response(JSON.stringify({ error: message }), {
      status: 502,
      headers: { ...headers, "Content-Type": "application/json" },
    })
  }

  const generatedText =
    Array.isArray((anthropicJson as { content?: unknown[] })?.content)
      ? ((anthropicJson as { content: unknown[] }).content)
          .filter((item: unknown) =>
            typeof item === "object" &&
            item !== null &&
            "type" in item &&
            (item as { type?: string }).type === "text"
          )
          .map((item: unknown) => (item as { text?: string }).text ?? "")
          .join("\n")
          .trim()
      : ""

  if (!generatedText) {
    return new Response(JSON.stringify({ error: "Nessun contenuto generato" }), {
      status: 502,
      headers: { ...headers, "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify({ text: generatedText, style }), {
    status: 200,
    headers: { ...headers, "Content-Type": "application/json" },
  })
})
