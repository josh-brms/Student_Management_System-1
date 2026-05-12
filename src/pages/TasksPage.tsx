import { useEffect, useState, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { fetchTasks, createTask, updateTask, deleteTask } from '../lib/taskApi'
import { Topbar } from '../components/Topbar'
import { TaskModal } from '../components/TaskModal'
import type { Task, TaskFilter, TaskFormValues } from '../types'

const STATUS_TABS = ['all', 'pending', 'ongoing', 'done'] as const
const TYPE_TABS   = ['all', 'assignment', 'quiz', 'project'] as const

export function TasksPage() {
  const { profile, loading: authLoading } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const userId  = profile?.user_id

  const [tasks,        setTasks]        = useState<Task[]>([])
  const [loading,      setLoading]      = useState(false)
  const [filter,       setFilter]       = useState<TaskFilter>({ status: 'all', type: 'all', subject_id: 'all', search: '' })
  const [showModal,    setShowModal]    = useState(false)
  const [editTask,     setEditTask]     = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await fetchTasks(userId, isAdmin, filter)
      setTasks(data)
    } finally {
      setLoading(false)
    }
  }, [userId, isAdmin, filter])

  useEffect(() => {
    if (!authLoading && userId) load()
  }, [authLoading, userId, isAdmin, filter])

  async function handleCreate(values: TaskFormValues) {
    if (!userId) return
    await createTask(userId, values)
    setShowModal(false)
    load()
  }

  async function handleEdit(values: TaskFormValues) {
    if (!editTask || !userId) return
    await updateTask(editTask.task_id, userId, values)
    setEditTask(null)
    load()
  }

  async function handleDelete() {
    if (!deleteTarget || !userId) return
    await deleteTask(deleteTarget.task_id, userId)
    setDeleteTarget(null)
    load()
  }

  function setFilterField<K extends keyof TaskFilter>(k: K, v: TaskFilter[K]) {
    setFilter(f => ({ ...f, [k]: v }))
  }

  function getStatusBadgeClass(status: string): string {
    return `badge badge-${status}`
  }

  function getPriorityBadgeClass(priority: string): string {
    return `badge badge-${priority === 'high' ? 'high' : priority === 'medium' ? 'medium' : 'low'}`
  }

  function getTypeBadgeClass(type: string): string {
    return `badge badge-${type}`
  }

  return (
    <div className="main">
      <Topbar title={isAdmin ? 'All tasks' : 'My tasks'} onNewClick={() => setShowModal(true)} showNewButton />
      <div className="content">
        <div className="card" style={{marginBottom: 20, padding: '16px 20px'}}>
          <div className="filter-row">
            <div>
              {STATUS_TABS.map(s => (
                <button
                  key={s}
                  className={`filter-chip ${filter.status === s ? 'active' : ''}`}
                  onClick={() => setFilterField('status', s)}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="filter-sep" style={{margin: '0 8px'}} />
            <div>
              {TYPE_TABS.map(t => (
                <button
                  key={t}
                  className={`filter-chip ${filter.type === t ? 'active' : ''}`}
                  onClick={() => setFilterField('type', t)}
                >
                  {t === 'all' ? 'All types' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={filter.search}
              onChange={e => setFilterField('search', e.target.value)}
              placeholder="Search tasks…"
              className="search-box"
              style={{marginLeft: 'auto', maxWidth: 200}}
            />
          </div>
        </div>

        {loading ? (
          <div style={{textAlign: 'center', padding: '60px 20px', color: 'var(--muted)'}}>
            <div className="spinner" style={{margin: '0 auto 16px'}}></div>
            <p>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">○</div>
            <div className="empty-text">No tasks found</div>
            <button className="btn-new" onClick={() => setShowModal(true)} style={{margin: '0 auto'}}>
              <Plus size={12} /> New task
            </button>
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
                <th style={{width: 100}}></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => {
                const today = new Date()
                const due = t.due_date ? new Date(t.due_date) : new Date()
                const overdue = t.due_date && due < today && t.status !== 'done'
                const dueFmt = due.toLocaleDateString('en-PH', {month: 'short', day: 'numeric', year: 'numeric'})
                return (
                  <tr key={t.task_id}>
                    <td>
                      <div className="task-name">{t.title}</div>
                      {t.description && <div className="task-desc">{t.description}</div>}
                    </td>
                    <td><span className={getTypeBadgeClass(t.type)}>{t.type}</span></td>
                    <td><span className={getPriorityBadgeClass(t.priority)}>{t.priority}</span></td>
                    <td><span className={getStatusBadgeClass(t.status)}>{t.status}</span></td>
                    <td><div className={`due-date ${overdue ? 'due-overdue' : ''}`}>{dueFmt}{overdue ? ' · overdue' : ''}</div></td>
                    <td>
                      <div className="row-actions">
                        <button className="row-btn" onClick={() => setEditTask(t)}>Edit</button>
                        <button className="row-btn danger" onClick={() => setDeleteTarget(t)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {(showModal || editTask) && (
        <TaskModal
          task={editTask ?? undefined}
          onSave={editTask ? handleEdit : handleCreate}
          onDelete={editTask ? () => deleteTarget && handleDelete() : undefined}
          onClose={() => { setShowModal(false); setEditTask(null); }}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay open">
          <div className="modal" style={{width: 320}}>
            <div className="modal-title">Delete task?</div>
            <div className="modal-sub">{deleteTarget.title}</div>
            <p style={{fontSize: 13, color: 'var(--muted)', marginBottom: 20}}>
              This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-save" onClick={handleDelete} style={{background: '#B91C1C'}}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
