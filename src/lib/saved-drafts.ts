import { supabase } from '@/lib/supabase'

export type SavedDraft = {
  id: string
  prompt: string
  style: string
  generated_text: string
  created_at: string
}

export async function saveDraft(params: {
  prompt: string
  style: string
  generatedText: string
}) {
  if (!supabase) {
    throw new Error(
      'Configura VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY'
    )
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Utente non autenticato')
  }

  const { data, error } = await supabase
    .from('saved_drafts')
    .insert({
      user_id: user.id,
      prompt: params.prompt,
      style: params.style,
      generated_text: params.generatedText,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function listSavedDrafts() {
  if (!supabase) {
    throw new Error(
      'Configura VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY'
    )
  }

  const { data, error } = await supabase
    .from('saved_drafts')
    .select('id,prompt,style,generated_text,created_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as SavedDraft[]
}
