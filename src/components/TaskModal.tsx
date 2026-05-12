import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Modal, FormField, Input, Select, Textarea, Button } from './ui'
import { fetchSubjects } from '../lib/subjectApi'
import { useAuth } from '../lib/AuthContext'
import type { Task, TaskFormValues, Subject } from '../types'

interface Props {
  task?: Task | null
  onSave: (values: TaskFormValues) => Promise<void>
  onDelete?: (task: Task) => void
  onClose: () => void
}

const defaultForm: TaskFormValues = {
  title: '', description: '', type: 'assignment',
  priority: 'medium', status: 'pending', due_date: '', subject_id: null,
}

export function TaskModal({ task, onSave, onDelete, onClose }: Props) {
  const { profile } = useAuth()
  const subjectInputId = 'task-subject-input'
  const [form, setForm] = useState<TaskFormValues>(
    task ? {
      title:       task.title,
      description: task.description ?? '',
      type:        task.type,
      priority:    task.priority,
      status:      task.status,
      due_date:    task.due_date ?? '',
      subject_id:  task.subject_id ?? null,
    } : defaultForm
  )
  const [subjectInput, setSubjectInput] = useState(
    task?.subject ? (task.subject.code ? `${task.subject.code} · ${task.subject.name}` : task.subject.name) : ''
  )
  const [subjects,  setSubjects]  = useState<Subject[]>([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  useEffect(() => {
    if (profile?.user_id) {
      fetchSubjects(profile.user_id).then(setSubjects).catch(() => {})
    }
  }, [profile])

  useEffect(() => {
    if (!form.subject_id) {
      if (subjectInput) setSubjectInput('')
      return
    }
    const selectedSubject = subjects.find(s => s.subject_id === form.subject_id)
    if (selectedSubject) {
      setSubjectInput(selectedSubject.code ? `${selectedSubject.code} · ${selectedSubject.name}` : selectedSubject.name)
    }
  }, [form.subject_id, subjects])

  function set<K extends keyof TaskFormValues>(k: K, v: TaskFormValues[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.due_date)     { setError('Due date is required.'); return }
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
    <Modal title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <div className="space-y-4">

        <FormField label="Title">
          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title" />
        </FormField>

        <FormField label="Subject (optional)">
          <>
            <Input
              list={subjectInputId}
              value={subjectInput}
              onChange={e => {
                const value = e.target.value
                setSubjectInput(value)
                const normalized = value.trim().toLowerCase()
                const matched = subjects.find(s => {
                  const label = s.code ? `${s.code} · ${s.name}` : s.name
                  return label.toLowerCase() === normalized || s.name.toLowerCase() === normalized || (s.code?.toLowerCase() === normalized)
                })
                set('subject_id', matched ? matched.subject_id : null)
              }}
              placeholder="Type a subject"
            />
            <datalist id={subjectInputId}>
              {subjects.map(s => (
                <option key={s.subject_id} value={s.code ? `${s.code} · ${s.name}` : s.name} />
              ))}
            </datalist>
          </>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Type">
            <Select value={form.type} onChange={e => set('type', e.target.value as any)}>
              <option value="assignment">Assignment</option>
              <option value="quiz">Quiz</option>
              <option value="project">Project</option>
            </Select>
          </FormField>
          <FormField label="Priority">
            <Select value={form.priority} onChange={e => set('priority', e.target.value as any)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </FormField>
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

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="modal-footer">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          {task && onDelete && (
            <button type="button" className="row-btn danger" onClick={() => onDelete(task)}>
              <Trash2 size={14} style={{marginRight: 4}} /> Delete
            </button>
          )}
          <button type="submit" className="btn-save" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : task ? 'Save changes' : 'Save task'}
          </button>
        </div>
      </div>
    </Modal>
  )
}

