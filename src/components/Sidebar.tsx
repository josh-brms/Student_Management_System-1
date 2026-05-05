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

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
    }`

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white px-3 py-4 shrink-0">
      {/* Logo */}
      <div className="mb-6 px-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <GraduationCap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-none">STMS</p>
            <p className="text-[10px] text-gray-400 mt-0.5">CSPC 321 · Group 3</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        <NavLink to="/dashboard" className={navLinkClass}>
          <LayoutDashboard size={15} /> Dashboard
        </NavLink>
        <NavLink to="/tasks" className={navLinkClass}>
          <CheckSquare size={15} /> {isAdmin ? 'All tasks' : 'My tasks'}
        </NavLink>
        {isAdmin && (
          <NavLink to="/users" className={navLinkClass}>
            <Users size={15} /> Users
          </NavLink>
        )}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 pt-3 mt-2">
        <div className="flex items-center gap-2.5 px-2 mb-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            {profile ? initials(profile.name) : '?'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-gray-800">{profile?.name ?? '…'}</p>
            <p className="text-[10px] text-gray-400 capitalize">{profile?.role}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
        >
          <LogOut size={14} /> Log out
        </button>
      </div>
    </aside>
  )
}
