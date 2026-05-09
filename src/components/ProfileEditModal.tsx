import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { updateProfile } from '../lib/userApi'
import { useAuth } from '../lib/AuthContext'
import type { Profile } from '../types'

interface ProfileEditModalProps {
  isOpen: boolean
  profile: Profile
  onClose: () => void
}

export function ProfileEditModal({ isOpen, profile, onClose }: ProfileEditModalProps) {
  const { user, refreshProfile } = useAuth()
  const [name, setName] = useState(profile.name)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Update name whenever profile changes
  useEffect(() => {
    setName(profile.name)
    setError('')
  }, [profile, isOpen])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setError('')
    setLoading(true)

    try {
      await updateProfile(user.id, { name: name.trim() })
      await refreshProfile()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Edit Profile</div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <X size={20} color="var(--muted)" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={loading}
            />
          </div>

          <div className="form-field">
            <label>Role</label>
            <input
              type="text"
              value={profile.role}
              disabled
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </div>

          {error && (
            <div style={{ color: 'var(--high-text)', fontSize: 12, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text)',
                borderRadius: 6,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 500,
                opacity: loading ? 0.5 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || name.trim() === profile.name}
              style={{
                padding: '10px 20px',
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: loading || name.trim() === profile.name ? 'not-allowed' : 'pointer',
                fontSize: 13,
                fontWeight: 500,
                opacity: loading || name.trim() === profile.name ? 0.5 : 1
              }}
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
