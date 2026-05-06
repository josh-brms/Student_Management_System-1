import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, AlertCircle, LayoutList, ChevronRight } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { fetchTasks, fetchTaskStats } from '../lib/taskApi'
import { Card, Spinner } from '../components/ui'
import { TaskCard } from '../components/TaskCard'
import { updateTask, deleteTask, cycleTaskStatus } from '../lib/taskApi'
import { TaskModal } from '../components/TaskModal'
import type { Task, TaskFormValues } from '../types'

interface Stats { total: number; pending: number; ongoing: number; done: number; overdue: number }

export function DashboardPage() {
  const { user, profile } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const [stats, setStats] = useState<Stats | null>(null)
  const [recent, setRecent] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [editTask, setEditTask] = useState<Task | null>(null)

  async function load() {
    if (!user) return
    setLoading(true)
    try {
      const [s, t] = await Promise.all([
        fetchTaskStats(user.id, isAdmin),
        fetchTasks(user.id, isAdmin, { status: 'all', type: 'all', search: '' }),
      ])
      setStats(s)
      setRecent(t.slice(0, 5))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user, isAdmin])

  async function handleCycle(task: Task) {
    await cycleTaskStatus(task)
    load()
  }

  async function handleEdit(values: TaskFormValues) {
    if (!editTask) return
    await updateTask(editTask.id, values)
    setEditTask(null)
    load()
  }

  async function handleDelete(task: Task) {
    if (!confirm(`Delete "${task.title}"?`)) return
    await deleteTask(task.id)
    load()
  }

  const statCards = [
    { label: 'Total tasks', value: stats?.total ?? 0, icon: LayoutList, color: 'text-gray-600 bg-gray-100' },
    { label: 'Pending', value: stats?.pending ?? 0, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Ongoing', value: stats?.ongoing ?? 0, icon: AlertCircle, color: 'text-blue-600 bg-blue-50' },
    { label: 'Done', value: stats?.done ?? 0, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
  ]

  return (
    <div className="content">
      <div style={{marginBottom: 18}}>
        <h1 className="login-title">Good day, {profile?.name?.split(' ')[0] ?? 'there'} 👋</h1>
        <p className="login-sub">Here's an overview of your academic tasks.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Spinner className="text-blue-500" /></div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="stats-row">
            {statCards.map(s => (
              <div key={s.label} className="stat-card">
                <div className="stat-label">{s.label}</div>
                <div className="stat-val">{s.value}</div>
                <div className="stat-sub">{s.label.toLowerCase().includes('total') ? 'all tasks' : ''}</div>
              </div>
            ))}
          </div>

          {stats && stats.overdue > 0 && (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl bg-red-50 ring-1 ring-red-200 px-4 py-3">
              <AlertCircle size={15} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">
                You have <strong>{stats.overdue}</strong> overdue task{stats.overdue > 1 ? 's' : ''}. Review them soon.
              </p>
            </div>
          )}

          {/* Recent tasks */}
          <Card>
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Recent tasks</h2>
              <Link to="/tasks" className="flex items-center gap-0.5 text-xs text-blue-600 hover:underline">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div style={{padding: 16}}>
              {recent.length === 0 ? (
                <p style={{textAlign: 'center', color: 'var(--muted)', fontSize: 14}}>No tasks yet. Create one to get started.</p>
              ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                  {recent.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={setEditTask}
                      onDelete={handleDelete}
                      onCycle={handleCycle}
                      showOwner={isAdmin}
                    />
                  ))}
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      {editTask && (
        <TaskModal task={editTask} onSave={handleEdit} onClose={() => setEditTask(null)} />
      )}

      {/* Ensure page uses proper topbar styling if present */}
    </div>
  )
}
