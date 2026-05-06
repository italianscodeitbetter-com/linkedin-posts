import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { Header } from '@/components/header'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PublicOnlyRoute } from '@/components/PublicOnlyRoute'
import { useAuth } from '@/context/auth-context'
import AuthCallbackPage from '@/lib/auth-callback'
import CalendarPage from '@/pages/calendar'
import HomePage from '@/pages/home'
import LoginPage from '@/pages/login'
import RegisterPage from '@/pages/register'
import ResetPasswordPage from '@/pages/reset-password'
import PostDetailPage from '@/pages/post-detail'
import SavedDraftsPage from '@/pages/saved'
import UserProfile from './pages/UserProfile'

export default function App() {
  const location = useLocation()
  const { user } = useAuth()
  const path = location.pathname
  const isAuthPath = path.startsWith('/auth/')
  const isPublicAuthPage = path === '/login' || path === '/register'
  const showPostLoginHeader = Boolean(user) && !isAuthPath && !isPublicAuthPage

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      {showPostLoginHeader ? <Header className="pt-8" /> : null}
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post-detail"
          element={
            <ProtectedRoute>
              <PostDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved"
          element={
            <ProtectedRoute>
              <SavedDraftsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
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
    </div>
  )
}
