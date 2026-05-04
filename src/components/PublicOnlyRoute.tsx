import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '@/context/auth-context'

type PublicOnlyRouteProps = {
  children: ReactNode
}

/** Login / register: se già autenticato, vai alla home. */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
