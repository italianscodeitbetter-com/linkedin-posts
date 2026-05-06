import { supabase } from '@/lib/supabase'

/**
 * Calls the `linkedin-proxy` Edge Function (user JWT + LinkedIn OAuth token).
 * After LinkedIn sign-in: `const { data: { session } } = await supabase.auth.getSession()`
 * then pass `session.provider_token`.
 */
export async function fetchLinkedInUserInfo(linkedinAccessToken: string) {
  if (!supabase) {
    throw new Error(
      'Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY'
    )
  }

  return supabase.functions.invoke('linkedin-proxy', {
    headers: {
      'x-linkedin-access-token': linkedinAccessToken,
    },
  })
}
