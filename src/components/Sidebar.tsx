import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Users, LogOut, GraduationCap } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const isAdmin = profile?.role === 'admin'

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const navClass = (isActive: boolean) => (isActive ? 'nav-item active' : 'nav-item')

  return (
    <div className="sidebar">
      <div className="sidebar-brand">STMS<span>CSPC 321 · Group 3</span></div>

      <nav style={{padding: '0 0 12px 0'}}>
        <NavLink to="/dashboard" className={({isActive}) => navClass(isActive)}>
          <div className="nav-icon"><LayoutDashboard size={16} /></div>
          Dashboard
        </NavLink>
        <NavLink to="/tasks" className={({isActive}) => navClass(isActive)}>
          <div className="nav-icon"><CheckSquare size={16} /></div>
          {isAdmin ? 'All tasks' : 'My tasks'}
        </NavLink>
        {isAdmin && (
          <NavLink to="/users" className={({isActive}) => navClass(isActive)}>
            <div className="nav-icon"><Users size={16} /></div>
            Users
          </NavLink>
        )}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="avatar">{profile ? initials(profile.name) : '??'}</div>
          <div className="user-info">
            <div className="user-name">{profile?.name ?? '…'}</div>
            <div className="user-role">{profile?.role}</div>
          </div>
        </div>
        <div className="logout-btn" onClick={handleSignOut}><LogOut size={14} />&nbsp;Sign out</div>
      </div>
    </div>
  )
}
