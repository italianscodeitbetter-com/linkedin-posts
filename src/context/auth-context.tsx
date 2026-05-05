import * as React from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export type AuthUser = {
  id: string
  email: string
  name?: string
}

function mapUser(user: User | null): AuthUser | null {
  if (!user) return null
  const meta = user.user_metadata as Record<string, unknown> | undefined
  const name =
    typeof meta?.full_name === 'string'
      ? meta.full_name
      : typeof meta?.name === 'string'
        ? meta.name
        : undefined
  return {
    id: user.id,
    email: user.email ?? '',
    name,
  }
}

type AuthContextValue = {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  supabaseReady: boolean
  signInWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>
  signUp: (params: {
    email: string
    password: string
    name: string
  }) => Promise<{ error: Error | null; needsEmailConfirmation: boolean }>
  /** OAuth redirect; user returns via `/auth/callback`. */
  signInWithLinkedIn: (params?: {
    nextPath?: string
  }) => Promise<{ error: Error | null }>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return
      setSession(s)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const user = React.useMemo(() => mapUser(session?.user ?? null), [session])

  const signInWithPassword = React.useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        return { error: new Error('Supabase non configurato') }
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error: error ? new Error(error.message) : null }
    },
    []
  )

  const signUp = React.useCallback(
    async ({
      email,
      password,
      name,
    }: {
      email: string
      password: string
      name: string
    }) => {
      if (!supabase) {
        return { error: new Error('Supabase non configurato'), needsEmailConfirmation: false }
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        return { error: new Error(error.message), needsEmailConfirmation: false }
      }
      const needsEmailConfirmation = Boolean(data.user) && !data.session
      return { error: null, needsEmailConfirmation }
    },
    []
  )

  const signInWithLinkedIn = React.useCallback(
    async (params?: { nextPath?: string }) => {
      if (!supabase) {
        return { error: new Error('Supabase non configurato') }
      }
      const callback = new URL(`${window.location.origin}/auth/callback`)
      const next = params?.nextPath
      if (
        next &&
        next.startsWith('/') &&
        !next.startsWith('//')
      ) {
        callback.searchParams.set('next', next)
      }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: callback.toString(),
        },
      })
      return { error: error ? new Error(error.message) : null }
    },
    []
  )

  const logout = React.useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const value = React.useMemo(
    () => ({
      user,
      session,
      loading,
      supabaseReady: isSupabaseConfigured(),
      signInWithPassword,
      signUp,
      signInWithLinkedIn,
      logout,
    }),
    [
      user,
      session,
      loading,
      signInWithPassword,
      signUp,
      signInWithLinkedIn,
      logout,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
