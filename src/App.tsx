import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { Sidebar } from './components/Sidebar'
import { LoginPage, AdminLoginPage, RegisterPage } from './pages/AuthPages'
import { DashboardPage } from './pages/DashboardPage'
import { TasksPage } from './pages/TasksPage'
import { UsersPage } from './pages/UsersPage'
import { CalendarPage } from './pages/CalendarPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { Spinner } from './components/ui'

function AppLayout() {
  const { supabaseUser, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner className="text-blue-500" /></div>
  if (!supabaseUser) return <Navigate to="/login" replace />
  return (
    <div className="app">
      <Sidebar />
      <Outlet />
    </div>
  )
}

function AdminOnly() {
  const { profile } = useAuth()
  if (profile && profile.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <Outlet />
}

function GuestOnly() {
  const { supabaseUser, loading } = useAuth()
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner className="text-blue-500" /></div>
  if (supabaseUser) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route element={<AdminOnly />}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
