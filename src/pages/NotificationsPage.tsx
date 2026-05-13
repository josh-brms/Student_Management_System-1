import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { fetchNotifications, markAllRead, markOneRead } from '../lib/notificationApi'
import { Topbar } from '../components/Topbar'
import type { Notification } from '../types'

const TYPE_ICONS: Record<string, string> = {
  reminder:      '⏰',
  status_change: '🔄',
  system:        '🔔',
}

export function NotificationsPage() {
  const { profile } = useAuth()
  const userId = profile?.user_id

  const [notifs,   setNotifs]  = useState<Notification[]>([])
  const [loading,  setLoading] = useState(false)

  async function load() {
    if (!userId) return
    setLoading(true)
    try { setNotifs(await fetchNotifications(userId)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [userId])

  async function handleMarkAll() {
    if (!userId) return
    await markAllRead(userId)
    load()
  }

  async function handleMarkOne(n: Notification) {
    if (n.is_read) return
    await markOneRead(n.notification_id)
    setNotifs(ns => ns.map(x => x.notification_id === n.notification_id ? { ...x, is_read: true } : x))
  }

  const unread = notifs.filter(n => !n.is_read).length

  return (
    <div className="main">
      <Topbar title="Notifications" />
      <div className="content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 className="login-title">Notifications</h1>
            <p className="login-sub">{unread > 0 ? `${unread} unread` : 'All caught up!'}</p>
          </div>
          {unread > 0 && (
            <button className="row-btn" onClick={handleMarkAll} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : notifs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Bell size={32} /></div>
            <div className="empty-text">No notifications yet</div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {notifs.map((n, i) => (
              <div
                key={n.notification_id}
                onClick={() => handleMarkOne(n)}
                style={{
                  display: 'flex', gap: 14, padding: '14px 20px',
                  borderBottom: i < notifs.length - 1 ? '0.5px solid var(--border)' : 'none',
                  background: n.is_read ? 'transparent' : 'var(--ongoing-bg)',
                  cursor: n.is_read ? 'default' : 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ fontSize: 20, lineHeight: 1, marginTop: 2 }}>{TYPE_ICONS[n.type] ?? '🔔'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: n.is_read ? 400 : 600 }}>{n.message}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                    {new Date(n.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {' · '}<span style={{ textTransform: 'capitalize' }}>{n.type.replace('_', ' ')}</span>
                  </div>
                </div>
                {!n.is_read && (
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ongoing-text)', marginTop: 6, flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
