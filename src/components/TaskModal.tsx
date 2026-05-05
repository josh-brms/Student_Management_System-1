import { useState } from 'react'
import { Modal, FormField, Input, Select, Textarea, Button } from './ui'
import type { Task, TaskFormValues } from '../types'

interface Props {
  task?: Task | null
  onSave: (values: TaskFormValues) => Promise<void>
  onClose: () => void
}

const defaultForm: TaskFormValues = {
  title: '', description: '', type: 'assignment',
  priority: 'medium', status: 'pending', due_date: '',
}

export function TaskModal({ task, onSave, onClose }: Props) {
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

  async function handleSubmit() {
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
    <Modal title={task ? 'Edit task' : 'New task'} onClose={onClose}>
      <div className="space-y-4">
        <FormField label="Title" error={error && !form.title.trim() ? error : undefined}>
          <Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title" />
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

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Status">
            <Select value={form.status} onChange={e => set('status', e.target.value as any)}>
              <option value="pending">Pending</option>
              <option value="ongoing">Ongoing</option>
              <option value="done">Done</option>
            </Select>
          </FormField>
          <FormField label="Due date">
            <Input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} />
          </FormField>
        </div>

        <FormField label="Description">
          <Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional description..." />
        </FormField>

        {error && form.title.trim() && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving…' : task ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
