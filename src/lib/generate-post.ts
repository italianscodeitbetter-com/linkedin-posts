import { supabase } from '@/lib/supabase'

export async function generatePostWithAnthropic(params: {
  prompt: string
  style: string
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
