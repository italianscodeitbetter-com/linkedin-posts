import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { supabase } from '@/lib/supabase'

/** Completes PKCE OAuth (es. LinkedIn): scambia `code` nella query per la sessione. */
export default function AuthCallbackPage() {
  const navigate = useNavigate()

  React.useEffect(() => {
    let cancelled = false

    async function finish() {
      if (!supabase) {
        toast.error('Configura VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY')
        navigate('/login', { replace: true })
        return
      }

      const url = new URL(window.location.href)
      const nextRaw = url.searchParams.get('next')
      const safeNext =
        nextRaw &&
          nextRaw.startsWith('/') &&
          !nextRaw.startsWith('//')
          ? nextRaw
          : '/'

      const hasCode = url.searchParams.has('code')

      if (hasCode) {
        const { error } =
          await supabase.auth.exchangeCodeForSession(window.location.href)
        if (error && !cancelled) {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) {
            toast.error(error.message)
            navigate('/login', { replace: true })
            return
          }
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session && !cancelled) {
          toast.error('Sessione non disponibile')
          navigate('/login', { replace: true })
          return
        }
      }

      if (!cancelled) {
        navigate(safeNext, { replace: true })
      }
    }

    void finish()
    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2">
      <p className="text-sm text-muted-foreground">Accesso in corso…</p>
    </div>
  )
}
