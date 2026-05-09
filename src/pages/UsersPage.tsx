import { useEffect, useState } from 'react'
import { UserPlus, Edit2, Trash2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { fetchAllProfiles, updateProfile, adminCreateUser } from '../lib/userApi'
import { Topbar } from '../components/Topbar'
import type { Profile, UserFormValues } from '../types'

export function UsersPage() {
  const { profile: currentProfile } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<Profile | null>(null)
  const [formData, setFormData] = useState({name: '', email: '', role: 'student', password: ''})

  async function load() {
    setLoading(true)
    try {
      const data = await fetchAllProfiles()
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { error } = await adminCreateUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role as 'student' | 'admin'
      })
      if (error) throw new Error(error)
      setShowModal(false)
      setFormData({name: '', email: '', role: 'student', password: ''})
      load()
    } catch (err) {
      alert((err as Error).message)
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' })
  }

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  const stats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    admins: users.filter(u => u.role === 'admin').length
  }

  return (
    <div className="main">
      <Topbar title="User Management" onNewClick={() => setShowModal(true)} showNewButton />
      <div className="content">
        {/* Stats */}
        <div className="stats-row" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
          <div className="stat-card">
            <div className="stat-label">Total users</div>
            <div className="stat-val">{stats.total}</div>
            <div className="stat-sub">registered</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Students</div>
            <div className="stat-val">{stats.students}</div>
            <div className="stat-sub">active</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Admins</div>
            <div className="stat-val">{stats.admins}</div>
            <div className="stat-sub">active</div>
          </div>
        </div>

        {/* Users table */}
        {loading ? (
          <div style={{textAlign: 'center', padding: '60px 20px', color: 'var(--muted)'}}>
            <div className="spinner" style={{margin: '0 auto 16px'}}></div>
            <p>Loading users...</p>
          </div>
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th style={{width: 100}}></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div 
                        className="avatar"
                        style={{background: u.role === 'admin' ? '#1C1B18' : 'var(--bg)', color: u.role === 'admin' ? '#fff' : 'var(--text)'}}
                      >
                        {initials(u.name)}
                      </div>
                      <div>
                        <div style={{fontWeight:500,fontSize:14}}>{u.name}</div>
                        <div style={{fontSize:12,color:'var(--muted)'}}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="badge"
                      style={u.role === 'admin' 
                        ? {background:'#1C1B18',color:'#fff'} 
                        : {background:'var(--bg)',color:'var(--muted)',border:'0.5px solid var(--border)'}}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td><div style={{fontSize:12,color:'var(--muted)'}}>{formatDate(u.created_at)}</div></td>
                  <td>
                    <span 
                      className="badge"
                      style={{background:'var(--done-bg)',color:'var(--done-text)'}}
                    >
                      active
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="row-btn" onClick={() => setEditUser(u)}>Edit</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Create/Edit modal */}
      {showModal && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-title">Add new user</div>
            <div className="modal-sub">Create a student or admin account</div>
            <form onSubmit={handleCreate}>
              <div className="form-field">
                <label>Full name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Maria Santos"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label>Email *</label>
                  <input 
                    type="email"
                    required
                    placeholder="user@dwcl.edu"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="form-field">
                  <label>Role</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="student">student</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>
              <div className="form-field">
                <label>Temporary password *</label>
                <input 
                  type="password"
                  required
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => {setShowModal(false); setFormData({name: '', email: '', role: 'student', password: ''});}}>Cancel</button>
                <button type="submit" className="btn-save">Create user</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
