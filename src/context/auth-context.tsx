import * as React from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export type AuthUser = {
  id: string
  email: string
  name?: string
  avatarUrl?: string
}

function firstString(
  ...values: Array<unknown>
): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }
  return undefined
}

function mapUser(user: User | null): AuthUser | null {
  if (!user) return null
  const meta = user.user_metadata as Record<string, unknown> | undefined
  const firstIdentity = user.identities?.[0]?.identity_data as
    | Record<string, unknown>
    | undefined
  const name =
    firstString(meta?.full_name, meta?.name, firstIdentity?.name)
  const avatarUrl = firstString(
    // LinkedIn OIDC commonly exposes `picture`.
    meta?.picture,
    // Common provider keys we may receive from Supabase metadata.
    meta?.avatar_url,
    meta?.profile_picture,
    firstIdentity?.picture,
    firstIdentity?.avatar_url
  )
  return {
    id: user.id,
    email: user.email ?? '',
    name,
    avatarUrl,
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
  requestPasswordReset: (
    email: string
  ) => Promise<{ error: Error | null }>
  updatePassword: (
    password: string
  ) => Promise<{ error: Error | null }>
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

  const requestPasswordReset = React.useCallback(async (email: string) => {
    if (!supabase) {
      return { error: new Error('Supabase non configurato') }
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { error: error ? new Error(error.message) : null }
  }, [])

  const updatePassword = React.useCallback(async (password: string) => {
    if (!supabase) {
      return { error: new Error('Supabase non configurato') }
    }
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error ? new Error(error.message) : null }
  }, [])

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
      requestPasswordReset,
      updatePassword,
      logout,
    }),
    [
      user,
      session,
      loading,
      signInWithPassword,
      signUp,
      signInWithLinkedIn,
      requestPasswordReset,
      updatePassword,
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
