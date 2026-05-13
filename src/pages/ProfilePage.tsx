import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { ProfileEditModal } from '../components/ProfileEditModal'

function initials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function ProfilePage() {
  // ✅ Correct: AuthContextValue exposes `profile` (DB row) and `supabaseUser` (auth obj)
  //    There is NO `user` property — that's what caused the TS2339 build error.
  const { profile, supabaseUser } = useAuth()
  const [editOpen, setEditOpen] = useState(false)

  if (!profile) {
    return (
      <div className="content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div className="spinner" />
      </div>
    )
  }

  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const lastLogin = profile.last_login_at
    ? new Date(profile.last_login_at).toLocaleDateString('en-PH', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'Never'

  return (
    <div className="content">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="topbar" style={{ marginBottom: 24, background: 'transparent', border: 'none', padding: 0, height: 'auto' }}>
        <div className="topbar-title">My Profile</div>
        <div className="topbar-actions">
          <button className="btn-new" onClick={() => setEditOpen(true)}>
            Edit Profile
          </button>
        </div>
      </div>

      {/* ── Profile card ─────────────────────────────────────────── */}
      <div className="card" style={{ maxWidth: 560, marginBottom: 20 }}>
        {/* Avatar + name row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div
            className="avatar"
            style={{ width: 56, height: 56, fontSize: 18, fontWeight: 600, flexShrink: 0 }}
          >
            {initials(profile.name)}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)' }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
              {profile.email}
            </div>
          </div>
          <span
            className="badge"
            style={{
              marginLeft: 'auto',
              background: profile.role === 'admin' ? 'var(--ongoing-bg)' : 'var(--done-bg)',
              color: profile.role === 'admin' ? 'var(--ongoing-text)' : 'var(--done-text)',
            }}
          >
            {profile.role}
          </span>
        </div>

        {/* Detail rows */}
        <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <ProfileRow label="Full name"      value={profile.name} />
          <ProfileRow label="Email address"  value={profile.email} />
          {/* supabaseUser.id is the auth UUID — safe to display for reference */}
          <ProfileRow label="Account ID"     value={supabaseUser?.id ?? '—'} mono />
          <ProfileRow label="Role"           value={profile.role} />
          <ProfileRow label="Account status" value={profile.is_active ? 'Active' : 'Inactive'} />
          <ProfileRow label="Member since"   value={joinedDate} />
          <ProfileRow label="Last login"     value={lastLogin} />
        </div>
      </div>

      {/* ── Edit modal ───────────────────────────────────────────── */}
      <ProfileEditModal
        isOpen={editOpen}
        profile={profile}
        onClose={() => setEditOpen(false)}
      />
    </div>
  )
}

// ── Small helper ──────────────────────────────────────────────────────────────
function ProfileRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{
        fontSize: 13,
        color: 'var(--text)',
        textAlign: 'right',
        fontFamily: mono ? 'var(--font-mono, monospace)' : 'inherit',
        wordBreak: 'break-all',
      }}>
        {value}
      </span>
    </div>
  )
}
