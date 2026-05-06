import { useEffect, useState } from 'react'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { fetchAllProfiles, updateProfile, adminCreateUser } from '../lib/userApi'
import { Card, Button, Badge, Modal, FormField, Input, Select, Spinner } from '../components/ui'
import type { Profile, UserFormValues } from '../types'

export function UsersPage() {
  const { profile: currentProfile } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editUser, setEditUser] = useState<Profile | null>(null)

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

  async function handleCreate(values: UserFormValues) {
    const { error } = await adminCreateUser(values)
    if (error) throw new Error(error)
    setShowModal(false)
    load()
  }

  async function handleEditSave(values: Partial<Pick<Profile, 'name' | 'role'>>) {
    if (!editUser) return
    await updateProfile(editUser.id, values)
    setEditUser(null)
    load()
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <div className="content">
      <div className="section-header">
        <div>
          <div className="section-title">Users</div>
          <div className="stat-sub">{users.length} registered users</div>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <UserPlus size={14} /> New user
        </Button>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="text-blue-500" /></div>
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:10}}>
                      <div className={`avatar`} style={{background: u.role === 'admin' ? '#1C1B18' : undefined, color: u.role === 'admin' ? '#fff' : undefined}}>{initials(u.name)}</div>
                      <div>
                        <div style={{fontWeight:500,fontSize:14}}>{u.name}</div>
                        {u.id === currentProfile?.id && <div className="user-role" style={{marginTop:2}}>You</div>}
                      </div>
                    </div>
                  </td>
                  <td><Badge value={u.role} /></td>
                  <td><div className="due-date">{formatDate(u.created_at)}</div></td>
                  <td>
                    <div className="row-actions">
                      <Button variant="ghost" size="sm" onClick={() => setEditUser(u)}>Edit</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <CreateUserModal onSave={handleCreate} onClose={() => setShowModal(false)} />}
      {editUser && <EditUserModal user={editUser} onSave={handleEditSave} onClose={() => setEditUser(null)} />}
    </div>
  )
}

// ─── Create User Modal ────────────────────────────────────────────────────────
function CreateUserModal({ onSave, onClose }: { onSave: (v: UserFormValues) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState<UserFormValues>({ name: '', email: '', password: '', role: 'student' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof UserFormValues>(k: K, v: UserFormValues[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSave() {
    if (!form.name || !form.email || !form.password) { setError('All fields are required.'); return }
    setLoading(true)
    try { await onSave(form) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Add new user" sub="Create a student or admin account" width="440px" onClose={onClose}>
      <div className="space-y-4">
        <FormField label="Full name"><Input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Juan dela Cruz" /></FormField>
        <FormField label="Email"><Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="user@gmail.com" /></FormField>
        <FormField label="Password"><Input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" /></FormField>
        <FormField label="Role">
          <Select value={form.role} onChange={e => set('role', e.target.value as any)}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </Select>
        </FormField>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>{loading ? 'Creating…' : 'Create user'}</Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Edit User Modal ──────────────────────────────────────────────────────────
function EditUserModal({ user, onSave, onClose }: { user: Profile; onSave: (v: Partial<Pick<Profile, 'name' | 'role'>>) => Promise<void>; onClose: () => void }) {
  const [name, setName] = useState(user.name)
  const [role, setRole] = useState(user.role)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    try { await onSave({ name, role }) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Edit user" sub="Update user details and role" width="440px" onClose={onClose}>
      <div className="space-y-4">
        <FormField label="Full name"><Input value={name} onChange={e => setName(e.target.value)} /></FormField>
        <FormField label="Role">
          <Select value={role} onChange={e => setRole(e.target.value as any)}>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </Select>
        </FormField>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </div>
    </Modal>
  )
}
