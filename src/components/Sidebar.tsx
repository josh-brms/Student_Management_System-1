import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Users, LogOut, Calendar, BarChart3 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { ProfileEditModal } from './ProfileEditModal'

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const isAdmin = profile?.role === 'admin'

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        TaskMate
        <span>{isAdmin ? 'Admin Panel' : 'Student Portal'}</span>
      </div>

      <nav style={{flex: 1}}>
        <NavLink 
          to="/dashboard" 
          className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <div className="nav-icon"><LayoutDashboard size={16} /></div>
          {isAdmin ? 'Overview' : 'Dashboard'}
        </NavLink>
        <NavLink 
          to="/tasks" 
          className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
        >
          <div className="nav-icon"><CheckSquare size={16} /></div>
          {isAdmin ? 'All tasks' : 'My Tasks'}
        </NavLink>
        {!isAdmin && (
          <NavLink 
            to="/calendar" 
            className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <div className="nav-icon"><Calendar size={16} /></div>
            Calendar
          </NavLink>
        )}
        {isAdmin && (
          <NavLink 
            to="/analytics" 
            className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <div className="nav-icon"><BarChart3 size={16} /></div>
            Analytics
          </NavLink>
        )}
        {isAdmin && (
          <NavLink 
            to="/users" 
            className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}
          >
            <div className="nav-icon"><Users size={16} /></div>
            Users
          </NavLink>
        )}
      </nav>

      <div className="sidebar-bottom">
        <button
          onClick={() => setShowProfileModal(true)}
          className="sidebar-user"
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 8px',
            borderTop: '0.5px solid var(--border)',
            borderRadius: 6,
            transition: 'background-color 0.2s'
          }}
        >
          <div className="avatar">{profile ? initials(profile.name) : '??'}</div>
          <div className="user-info">
            <div className="user-name">{profile?.name ?? '…'}</div>
            <div className="user-role">{profile?.role}</div>
          </div>
        </button>
        <button 
          onClick={handleSignOut}
          style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6}}
          className="logout-btn"
        >
          <LogOut size={14} />Sign out
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
