import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { Task, TaskFormValues } from '../types'

interface Props {
  task?: Task | null
  onSave: (values: TaskFormValues) => Promise<void>
  onDelete?: (task: Task) => void
  onClose: () => void
}

const defaultForm: TaskFormValues = {
  title: '', description: '', type: 'assignment',
  priority: 'medium', status: 'pending', due_date: '',
}

export function TaskModal({ task, onSave, onDelete, onClose }: Props) {
  const [form, setForm] = useState<TaskFormValues>(
    task ? {
      title: task.title,
      description: task.description ?? '',
      type: task.type,
      priority: task.priority,
      status: task.status,
      due_date: task.due_date ?? '',
    } : defaultForm
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof TaskFormValues>(k: K, v: TaskFormValues[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required.'); return }
    setLoading(true)
    try {
      await onSave(form)
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal-title">{task ? 'Edit task' : 'Create new task'}</div>
        <div className="modal-sub">{task ? 'Update the details of this task' : 'Add a new academic task to your list'}</div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Task title *</label>
            <input 
              type="text"
              required
              value={form.title} 
              onChange={e => set('title', e.target.value)} 
              placeholder="e.g. Calculus Problem Set 3"
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Type *</label>
              <select value={form.type} onChange={e => set('type', e.target.value as any)}>
                <option value="assignment">Assignment</option>
                <option value="quiz">Quiz</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div className="form-field">
              <label>Priority *</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value as any)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>Due date *</label>
              <input 
                type="date" 
                required
                value={form.due_date} 
                onChange={e => set('due_date', e.target.value)} 
              />
            </div>
            <div className="form-field">
              <label>Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value as any)}>
                <option value="pending">Pending</option>
                <option value="ongoing">Ongoing</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="form-field">
            <label>Description</label>
            <textarea 
              value={form.description} 
              onChange={e => set('description', e.target.value)} 
              placeholder="Optional details about this task..."
            />
          </div>

          {error && <p style={{fontSize: '12px', color: '#B91C1C', marginBottom: '12px'}}>{error}</p>}

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            {task && onDelete && (
              <button type="button" className="row-btn danger" onClick={() => onDelete(task)}>
                <Trash2 size={14} style={{marginRight: 4}} /> Delete
              </button>
            )}
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? 'Saving…' : task ? 'Save changes' : 'Save task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

