import { Route, Routes, useLocation } from 'react-router-dom'

import { PostLoginHeader } from '@/components/PostLoginHeader'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/components/PublicOnlyRoute'
import { useAuth } from '@/context/auth-context'
import AuthCallbackPage from '@/lib/auth-callback'
import HomePage from '@/pages/home'
import LoginPage from '@/pages/login'
import RegisterPage from '@/pages/register'
import ResetPasswordPage from '@/pages/reset-password'

export default function App() {
  const location = useLocation()
  const { user } = useAuth()
  const path = location.pathname
  const isAuthPath = path.startsWith('/auth/')
  const isPublicAuthPage = path === '/login' || path === '/register'
  const showPostLoginHeader = Boolean(user) && !isAuthPath && !isPublicAuthPage

  return (
    <>
      {showPostLoginHeader ? <PostLoginHeader className="pt-8" /> : null}
      <Routes>
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
      </Routes>
    </>
  )
}
