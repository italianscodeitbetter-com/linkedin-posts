import { supabase } from '@/lib/supabase'

export type SavedDraft = {
  id: string
  prompt: string
  style: string
  generated_text: string
  created_at: string
  scheduled_date?: string
  post_name?: string
  isPublished: boolean
}

export async function saveDraft(params: {
  prompt: string
  style: string
  generatedText: string
  isPublished: boolean
  postName?: string
  scheduled_date?: string
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
      isPublished: params.isPublished,
      scheduled_date: params.scheduled_date,
      ...(params.postName ? { post_name: params.postName } : {}),
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
    .select('id,prompt,style,generated_text,created_at,scheduled_date,post_name,isPublished')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as SavedDraft[]
}

export async function deleteDraft(id: string) {
  if (!supabase) {
    throw new Error(
      'Configura VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY'
    )
  }

  const { error } = await supabase
    .from('saved_drafts')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function updateDraft(
  id: string,
  params: {
    generated_text?: string
    scheduled_date?: string | null
    post_name?: string | null
    isPublished?: boolean
  }
) {
  if (!supabase) {
    throw new Error(
      'Configura VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY'
    )
  }

  const { error } = await supabase
    .from('saved_drafts')
    .update(params)
    .eq('id', id)

  if (error) throw new Error(error.message)
}
