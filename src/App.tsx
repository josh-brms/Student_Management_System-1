import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { Sidebar } from './components/Sidebar'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { DashboardPage } from './pages/DashboardPage'
import { TasksPage } from './pages/TasksPage'
import { UsersPage } from './pages/UsersPage'
import { Spinner } from './components/ui'

// ─── Protected layout ─────────────────────────────────────────────────────────
function AppLayout() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner className="text-blue-500" /></div>
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

// ─── Admin-only guard ─────────────────────────────────────────────────────────
function AdminOnly() {
  const { profile } = useAuth()
  if (profile && profile.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

// ─── Guest-only (redirect if already logged in) ───────────────────────────────
function GuestOnly() {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner className="text-blue-500" /></div>
  if (user) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest routes */}
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route element={<AdminOnly />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
