import { useEffect, useState, useCallback } from 'react'
import { Plus, Search } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { fetchTasks, createTask, updateTask, deleteTask, cycleTaskStatus } from '../lib/taskApi'
import { Card, Button, Input, EmptyState, Spinner } from '../components/ui'
import { TaskCard } from '../components/TaskCard'
import { TaskModal } from '../components/TaskModal'
import type { Task, TaskFilter, TaskFormValues } from '../types'

const STATUS_TABS = ['all', 'pending', 'ongoing', 'done'] as const
const TYPE_TABS   = ['all', 'assignment', 'quiz', 'project'] as const

export function TasksPage() {
  const { user, profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TaskFilter>({ status: 'all', type: 'all', search: '' })
  const [showModal, setShowModal] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchTasks(user.id, isAdmin, filter)
      setTasks(data)
    } finally {
      setLoading(false)
    }
  }, [user, isAdmin, filter])

  useEffect(() => { load() }, [load])

  async function handleCreate(values: TaskFormValues) {
    if (!user) return
    await createTask(user.id, values)
    setShowModal(false)
    load()
  }

  async function handleEdit(values: TaskFormValues) {
    if (!editTask) return
    await updateTask(editTask.id, values)
    setEditTask(null)
    load()
  }

  async function handleDelete(task: Task) {
    setDeleteTarget(task)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await deleteTask(deleteTarget.id)
    setDeleteTarget(null)
    load()
  }

  async function handleCycle(task: Task) {
    await cycleTaskStatus(task)
    load()
  }

  function setFilterField<K extends keyof TaskFilter>(k: K, v: TaskFilter[K]) {
    setFilter(f => ({ ...f, [k]: v }))
  }

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
      active ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
    }`

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{isAdmin ? 'All tasks' : 'My tasks'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{tasks.length} task{tasks.length !== 1 ? 's' : ''} found</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> New task
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-3 mb-4">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-1">
              {STATUS_TABS.map(s => (
                <button key={s} className={tabClass(filter.status === s)} onClick={() => setFilterField('status', s)}>
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {TYPE_TABS.map(t => (
                <button key={t} className={tabClass(filter.type === t)} onClick={() => setFilterField('type', t)}>
                  {t === 'all' ? 'All types' : t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={filter.search}
              onChange={e => setFilterField('search', e.target.value)}
              placeholder="Search tasks…"
              className="pl-7 w-44"
            />
          </div>
        </div>
      </Card>

      {/* Task list */}
      <Card>
        <div className="p-3">
          {loading ? (
            <div className="flex justify-center py-16"><Spinner className="text-blue-500" /></div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2"/></svg>}
              message="No tasks match your filters."
              action={<Button variant="primary" size="sm" onClick={() => setShowModal(true)}><Plus size={13} /> Create task</Button>}
            />
          ) : (
            <div className="space-y-2">
              {tasks.map(task => (
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

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">Delete task?</h2>
            <p className="text-sm text-gray-500 mb-5">"{deleteTarget.title}" will be permanently removed.</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {showModal && <TaskModal onSave={handleCreate} onClose={() => setShowModal(false)} />}
      {editTask && <TaskModal task={editTask} onSave={handleEdit} onClose={() => setEditTask(null)} />}
    </div>
  )
}
