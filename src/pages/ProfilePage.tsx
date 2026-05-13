import { useEffect, useState } from 'react'
import { Topbar } from '../components/Topbar'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { updateProfile } from '../lib/userApi'

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setName(profile?.name ?? '')
    setPassword('')
    setError('')
  }, [profile])

  if (!profile || !user) {
    return (
      <div className="main">
        <Topbar title="Profile" />
        <div className="content">
          <div className="spinner" />
        </div>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setError('')
    setLoading(true)

    try {
      await updateProfile(user.id, { name: name.trim() })

      if (password.trim()) {
        if (password.trim().length < 8) {
          throw new Error('Password must be at least 8 characters.')
        }

        const { error: passwordError } = await supabase.auth.updateUser({ password: password.trim() })
        if (passwordError) throw new Error(passwordError.message)
      }

      await refreshProfile()
      setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="main">
      <Topbar title="Profile" />
      <div className="content">
        <div className="card" style={{maxWidth: 480}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20}}>
            <div className="avatar" style={{width: 52, height: 52, fontSize: 18}}>
              {profile.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div style={{fontSize: 18, fontWeight: 500, color: 'var(--text)'}}>{profile.name}</div>
              <div style={{fontSize: 13, color: 'var(--muted)'}}>
                {user.email} · {profile.role === 'admin' ? 'Administrator' : 'Student'}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>Full name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                value={user.email ?? ''}
                disabled
                style={{opacity: 0.7, cursor: 'not-allowed'}}
              />
            </div>

            <div className="form-field">
              <label>New password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                disabled={loading}
              />
            </div>

            {error && <div style={{color: 'var(--high-text)', fontSize: 12, marginBottom: 16}}>{error}</div>}

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || (!name.trim() || name.trim() === profile.name && !password.trim())}
            >
              {loading ? 'Saving changes…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
