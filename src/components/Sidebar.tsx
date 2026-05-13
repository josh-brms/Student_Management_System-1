import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Users, LogOut, Calendar, BarChart3, BookOpen, Bell, Sun, Moon } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { ProfileEditModal } from './ProfileEditModal'
import { countUnread } from '../lib/notificationApi'

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('tm-theme') as 'light' | 'dark') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('tm-theme', theme)
  }, [theme])

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light')
  return { theme, toggle }
}

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { theme, toggle } = useTheme()
  const isAdmin = profile?.role === 'admin'

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  useEffect(() => {
    if (!profile?.user_id) return
    countUnread(profile.user_id).then(setUnreadCount).catch(() => {})
    const interval = setInterval(() => {
      countUnread(profile.user_id).then(setUnreadCount).catch(() => {})
    }, 60_000)
    return () => clearInterval(interval)
  }, [profile?.user_id])

  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-item active' : 'nav-item'

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-inner">
          <div className="sidebar-brand-mark" />
          <div>
            TaskMate
            <span>{isAdmin ? 'Admin Panel' : 'Student Portal'}</span>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        <NavLink to="/dashboard" className={navClass}>
          <div className="nav-icon"><LayoutDashboard size={16} /></div>
          {isAdmin ? 'Overview' : 'Dashboard'}
        </NavLink>

        <NavLink to="/tasks" className={navClass}>
          <div className="nav-icon"><CheckSquare size={16} /></div>
          {isAdmin ? 'All Tasks' : 'My Tasks'}
        </NavLink>

        {!isAdmin && (
          <NavLink to="/subjects" className={navClass}>
            <div className="nav-icon"><BookOpen size={16} /></div>
            Subjects
          </NavLink>
        )}

        <NavLink to="/calendar" className={navClass}>
          <div className="nav-icon"><Calendar size={16} /></div>
          Calendar
        </NavLink>

        <NavLink to="/notifications" className={navClass}>
          <div className="nav-icon" style={{ position: 'relative' }}>
            <Bell size={16} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: '#EF4444', color: '#fff',
                borderRadius: '50%', width: 14, height: 14,
                fontSize: 9, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          Notifications
          {unreadCount > 0 && (
            <span style={{ marginLeft: 'auto', background: '#EF4444', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10, fontWeight: 700 }}>
              {unreadCount}
            </span>
          )}
        </NavLink>

        {isAdmin && (
          <>
            <NavLink to="/analytics" className={navClass}>
              <div className="nav-icon"><BarChart3 size={16} /></div>
              Analytics
            </NavLink>
            <NavLink to="/users" className={navClass}>
              <div className="nav-icon"><Users size={16} /></div>
              Users
            </NavLink>
          </>
        )}
      </nav>

      <div className="sidebar-bottom">
        {/* Theme toggle */}
        <div style={{ marginBottom: 12 }}>
          <button onClick={toggle} className="theme-toggle" style={{ width: '100%', borderRadius: 8, height: 34, justifyContent: 'center', gap: 8, fontSize: 12, color: 'var(--muted)' }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            {theme === 'dark'
              ? <><Sun size={14} /> Light mode</>
              : <><Moon size={14} /> Dark mode</>
            }
          </button>
        </div>

        <button
          onClick={() => setShowProfileModal(true)}
          className="sidebar-user"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', width: '100%',
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 8px',
            borderRadius: 6, transition: 'background-color 0.2s'
          }}
        >
          <div className="avatar">{profile ? initials(profile.name) : '??'}</div>
          <div className="user-info">
            <div className="user-name">{profile?.name ?? '…'}</div>
            <div className="user-role">{profile?.role}</div>
          </div>
        </button>
        <button onClick={handleSignOut} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }} className="logout-btn">
          <LogOut size={14} /> Sign out
        </button>
      </div>

      {profile && (
        <ProfileEditModal
          isOpen={showProfileModal}
          profile={profile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  )
}
