import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ChevronRight } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { fetchTasks, fetchTaskStats, updateTask, deleteTask, cycleTaskStatus } from '../lib/taskApi'
import { TaskModal } from '../components/TaskModal'
import type { Task, TaskFormValues } from '../types'

interface Stats { total: number; pending: number; ongoing: number; done: number; overdue: number }

export function DashboardPage() {
  const { profile, loading: authLoading } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const userId  = profile?.user_id

  const [stats,    setStats]    = useState<Stats | null>(null)
  const [recent,   setRecent]   = useState<Task[]>([])
  const [loading,  setLoading]  = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [error,    setError]    = useState<string | null>(null)

  async function load() {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const [s, t] = await Promise.all([
        fetchTaskStats(userId, isAdmin),
        fetchTasks(userId, isAdmin, { status: 'all', type: 'all', subject_id: 'all', search: '' }),
      ])
      setStats(s)
      setRecent(t.slice(0, 5))
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load tasks.')
    } finally {
      setLoading(false)
    }
  }

  // Wait for auth to finish before loading
  useEffect(() => {
    if (!authLoading && userId) load()
  }, [authLoading, userId, isAdmin])

  async function handleCycle(task: Task) {
    if (!userId) return
    await cycleTaskStatus(task, userId)
    load()
  }

  async function handleEdit(values: TaskFormValues) {
    if (!editTask || !userId) return
    await updateTask(editTask.task_id, userId, values)
    setEditTask(null)
    load()
  }

  async function handleDelete(task: Task) {
    if (!userId) return
    if (!confirm(`Delete "${task.title}"?`)) return
    await deleteTask(task.task_id, userId)
    load()
  }

  // Still waiting for auth session + profile
  if (authLoading || (!profile && !authLoading)) {
    return (
      <div className="main">
        <div className="content" style={{ textAlign: 'center', paddingTop: 80 }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p style={{ color: 'var(--muted)' }}>Loading your profile…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="main">
      <div className="content">
        <div style={{ marginBottom: 28 }}>
          <h1 className="login-title">Good day, {profile?.name?.split(' ')[0] ?? 'there'} 👋</h1>
          <p className="login-sub">Here's an overview of your academic tasks.</p>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total</div>
            <div className="stat-val">{stats?.total ?? 0}</div>
            <div className="stat-sub">all tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-val" style={{ color: 'var(--pending-text)' }}>{stats?.pending ?? 0}</div>
            <div className="stat-sub">not started</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Ongoing</div>
            <div className="stat-val" style={{ color: 'var(--ongoing-text)' }}>{stats?.ongoing ?? 0}</div>
            <div className="stat-sub">in progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Done</div>
            <div className="stat-val" style={{ color: 'var(--done-text)' }}>{stats?.done ?? 0}</div>
            <div className="stat-sub">completed</div>
          </div>
        </div>

        {stats && stats.overdue > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 16px', marginBottom: 20 }}>
            <AlertCircle size={15} color="#dc2626" />
            <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>
              You have <strong>{stats.overdue}</strong> overdue task{stats.overdue > 1 ? 's' : ''}.
            </p>
          </div>
        )}

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Recent tasks</h2>
          <Link to="/tasks" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 2 }}>
            View all <ChevronRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p>Loading tasks…</p>
          </div>
        ) : recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">○</div>
            <div className="empty-text">No tasks yet. <Link to="/tasks" style={{ color: 'var(--accent)' }}>Create one →</Link></div>
          </div>
        ) : (
          <table className="task-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(t => {
                const today = new Date()
                const due = t.due_date ? new Date(t.due_date) : null
                const overdue = due && due < today && t.status !== 'done'
                const dueFmt = due?.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' }) ?? '—'
                return (
                  <tr key={t.task_id} style={{ cursor: 'pointer' }} onClick={() => setEditTask(t)}>
                    <td>
                      <div className="task-name">{t.title}</div>
                      {t.description && <div className="task-desc">{t.description}</div>}
                      {t.subject && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: t.subject.color_hex + '22', color: t.subject.color_hex }}>
                          {t.subject.code ?? t.subject.name}
                        </span>
                      )}
                    </td>
                    <td><span className="badge badge-type">{t.type}</span></td>
                    <td><span className="badge badge-priority">{t.priority}</span></td>
                    <td><span className="badge badge-status">{t.status}</span></td>
                    <td><div className={`due-date ${overdue ? 'due-overdue' : ''}`}>{dueFmt}{overdue ? ' · overdue' : ''}</div></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {editTask && (
        <TaskModal
          task={editTask}
          onSave={handleEdit}
          onDelete={handleDelete}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  )
}
