import { supabase } from '@/lib/supabase'

export type UserProfile = {
  id: string
  company: string | null
  role: string | null
  role_description: string | null
  updated_at: string
}

export async function getUserProfile(): Promise<UserProfile | null> {
  if (!supabase) {
    throw new Error('Configura VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY')
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Utente non autenticato')

  const { data, error } = await supabase
    .from('user_profiles')
    .select('id,company,role,role_description,updated_at')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as UserProfile | null
}

export async function upsertUserProfile(params: {
  company: string
  role: string
  roleDescription: string
}): Promise<void> {
  if (!supabase) {
    throw new Error('Configura VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY')
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) throw new Error('Utente non autenticato')

  const { error } = await supabase.from('user_profiles').upsert(
    {
      id: user.id,
      company: params.company || null,
      role: params.role || null,
      role_description: params.roleDescription || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )

  if (error) throw new Error(error.message)
}
