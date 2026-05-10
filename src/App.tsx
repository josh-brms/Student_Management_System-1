import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { Sidebar } from './components/Sidebar'
import { LoginPage, AdminLoginPage, RegisterPage } from './pages/AuthPages'
import { DashboardPage } from './pages/DashboardPage'
import { TasksPage } from './pages/TasksPage'
import { UsersPage } from './pages/UsersPage'
import { CalendarPage } from './pages/CalendarPage'
import { ProfilePage } from './pages/ProfilePage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { Spinner } from './components/ui'

// ─── Protected layout ─────────────────────────────────────────────────────────
function AppLayout() {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center'}}><div className="spinner"></div></div>
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="app">
      <Sidebar />
      <Outlet />
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
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route element={<AdminOnly />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
