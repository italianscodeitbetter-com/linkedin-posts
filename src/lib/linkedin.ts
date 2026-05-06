import { supabase } from '@/lib/supabase'

const PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/linkedin-proxy`

/** Returns the LinkedIn access token: session provider_token first, then DB. */
async function resolveLinkedInToken(): Promise<string | null> {
  if (!supabase) return null

  // provider_token is stored in the Supabase session right after OAuth
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.provider_token) return session.provider_token

  // Fall back to the persisted token in the DB
  const { data } = await supabase
    .from('linkedin_tokens')
    .select('access_token, expires_at')
    .maybeSingle()

  if (!data?.access_token) return null
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null
  return data.access_token
}

/** True if the user has a valid LinkedIn token available. */
export async function isLinkedInConnected(): Promise<boolean> {
  return Boolean(await resolveLinkedInToken())
}

/**
 * Starts the LinkedIn OAuth flow requesting the `w_member_social` scope.
 * After the OAuth redirect, auth-callback will save the provider_token to DB.
 * `returnTo` is the path the user should land on after completing OAuth.
 */
export function connectLinkedIn(returnTo = window.location.pathname) {
  if (!supabase) return

  const callbackUrl = new URL(`${window.location.origin}/auth/callback`)
  callbackUrl.searchParams.set('next', returnTo)

  void supabase.auth.signInWithOAuth({
    provider: 'linkedin_oidc',
    options: {
      scopes: 'openid profile w_member_social',
      redirectTo: callbackUrl.toString(),
    },
  })
}

/** Publishes `text` to the authenticated user's LinkedIn feed. */
export async function publishToLinkedIn(text: string): Promise<void> {
  if (!supabase) throw new Error('Supabase non configurato')

  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) throw new Error('Non autenticato')

  const linkedInToken = await resolveLinkedInToken()
  if (!linkedInToken) {
    throw new Error(
      'LinkedIn non connesso. Usa il pulsante "Connetti LinkedIn" per autorizzare la pubblicazione.'
    )
  }

  const res = await fetch(`${PROXY_URL}?path=post`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      'x-linkedin-access-token': linkedInToken,
    },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) {
    let message = `Errore LinkedIn (${res.status})`
    try {
      const err = await res.json() as { error?: string; message?: string }
      message = err.error ?? err.message ?? message
    } catch {
      // ignore parse error
    }
    throw new Error(message)
  }
}

/**
 * Called from auth-callback after a successful OAuth exchange.
 * Saves the provider_token (LinkedIn access token) to the DB for persistence.
 */
export async function saveLinkedInTokenFromSession(): Promise<void> {
  if (!supabase) return

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.provider_token) return

  const isLinkedInSession =
    session.user.app_metadata?.provider === 'linkedin_oidc' ||
    session.user.identities?.some((id) => id.provider === 'linkedin_oidc')

  if (!isLinkedInSession) return

  await supabase.from('linkedin_tokens').upsert(
    {
      user_id: session.user.id,
      access_token: session.provider_token,
      // LinkedIn tokens last 60 days by default; null means "unknown expiry"
      expires_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )
}
