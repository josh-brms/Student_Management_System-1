import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ChevronRight, CheckCircle2, Clock, LayoutList } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { fetchTasks, fetchTaskStats, updateTask, deleteTask, cycleTaskStatus } from '../lib/taskApi'
import { Card, Spinner } from '../components/ui'
import { TaskCard } from '../components/TaskCard'
import { TaskModal } from '../components/TaskModal'
import type { Task, TaskFormValues } from '../types'

interface Stats { total: number; pending: number; ongoing: number; done: number; overdue: number }

export function DashboardPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const userId = profile?.user_id

  const [stats,    setStats]    = useState<Stats | null>(null)
  const [recent,   setRecent]   = useState<Task[]>([])
  const [loading,  setLoading]  = useState(true)
  const [editTask, setEditTask] = useState<Task | null>(null)

  async function load() {
    if (!userId) return
    setLoading(true)
    try {
      const [s, t] = await Promise.all([
        fetchTaskStats(userId, isAdmin),
        fetchTasks(userId, isAdmin, { status: 'all', type: 'all', subject_id: 'all', search: '' }),
      ])
      setStats(s)
      setRecent(t.slice(0, 5))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [userId, isAdmin])

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

  const statCards = [
    { label: 'Total tasks', value: stats?.total   ?? 0, icon: LayoutList,  color: 'text-gray-600 bg-gray-100' },
    { label: 'Pending',     value: stats?.pending  ?? 0, icon: Clock,        color: 'text-amber-600 bg-amber-50' },
    { label: 'Ongoing',     value: stats?.ongoing  ?? 0, icon: AlertCircle,  color: 'text-blue-600 bg-blue-50' },
    { label: 'Done',        value: stats?.done     ?? 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  ]

  return (
    <div className="main">
      <div className="content">
        <div style={{marginBottom: 28}}>
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
            <div className="stat-val" style={{color: 'var(--pending-text)'}}>{stats?.pending ?? 0}</div>
            <div className="stat-sub">not started</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Ongoing</div>
            <div className="stat-val" style={{color: 'var(--ongoing-text)'}}>{stats?.ongoing ?? 0}</div>
            <div className="stat-sub">in progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Done</div>
            <div className="stat-val" style={{color: 'var(--done-text)'}}>{stats?.done ?? 0}</div>
            <div className="stat-sub">completed</div>
          </div>
        </div>

        {loading ? (
          <div style={{textAlign: 'center', padding: '60px 20px', color: 'var(--muted)'}}>
            <div className="spinner" style={{margin: '0 auto 16px'}}></div>
            <p>Loading...</p>
          </div>
        ) : recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">○</div>
            <div className="empty-text">No tasks yet</div>
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
                const due = t.due_date ? new Date(t.due_date) : new Date()
                const overdue = t.due_date && due < today && t.status !== 'done'
                const dueFmt = due.toLocaleDateString('en-PH', {month: 'short', day: 'numeric'})
                return (
                  <tr key={t.task_id}>
                    <td>
                      <div className="task-name">{t.title}</div>
                      {t.description && <div className="task-desc">{t.description}</div>}
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
