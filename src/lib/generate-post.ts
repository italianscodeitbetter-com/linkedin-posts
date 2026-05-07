import { supabase } from '@/lib/supabase'
import type { UserProfile } from './user-profile'

export async function generatePostWithAnthropic(params: {
  prompt: string
  style: string,
  postlength: string
  user: UserProfile | null
}) {
  if (!supabase) {
    throw new Error(
      'Configura VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY'
    )
  }

  const { data, error } = await supabase.functions.invoke('generate-post', {
    body: {
      prompt: params.prompt,
      style: params.style,
      postlength: params.postlength,
      role: params.user?.role ?? null,
      role_description: params.user?.role_description ?? null,
      company_description: params.user?.company_description ?? null,
    },
  })

  if (error) {
    throw new Error(error.message || 'Errore generazione post')
  }

  if (!data || typeof data.text !== 'string') {
    throw new Error('Risposta non valida dalla funzione AI')
  }

  return data.text
}
