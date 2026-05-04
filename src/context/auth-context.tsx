import * as React from 'react'

const AUTH_STORAGE_KEY = 'linkedin-posts-session'

export type AuthUser = {
  email: string
  name?: string
}

type AuthContextValue = {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (
      parsed &&
      typeof parsed === 'object' &&
      'email' in parsed &&
      typeof (parsed as AuthUser).email === 'string'
    ) {
      return parsed as AuthUser
    }
  } catch {
    /* ignore */
  }
  return null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(() =>
    typeof window === 'undefined' ? null : readStoredUser()
  )

  const login = React.useCallback((next: AuthUser) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next))
    setUser(next)
  }, [])

  const logout = React.useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setUser(null)
  }, [])

  const value = React.useMemo(
    () => ({ user, login, logout }),
    [user, login, logout]
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
