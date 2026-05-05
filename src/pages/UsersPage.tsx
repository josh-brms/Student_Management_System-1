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
    <div className="p-6 max-w-4xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} registered users</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <UserPlus size={14} /> New user
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="text-blue-500" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                        {initials(u.name)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 leading-none">{u.name}</p>
                        {u.id === currentProfile?.id && (
                          <span className="text-[10px] text-gray-400 mt-0.5 inline-block">You</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><Badge value={u.role} /></td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setEditUser(u)}>Edit</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

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
    <Modal title="New user" onClose={onClose}>
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
    <Modal title="Edit user" onClose={onClose}>
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
