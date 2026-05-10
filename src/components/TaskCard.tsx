import { CheckCircle2, Circle, Clock, Pencil, Trash2 } from 'lucide-react'
import { Badge, Button } from './ui'
import type { Task } from '../types'

interface Props {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onCycle: (task: Task) => void
  showOwner?: boolean
}

function formatDate(d: string | null) {
  if (!d) return null
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

function isOverdue(task: Task) {
  if (!task.due_date || task.status === 'done') return false
  return task.due_date < new Date().toISOString().slice(0, 10)
}

export function TaskCard({ task, onEdit, onDelete, onCycle, showOwner }: Props) {
  const overdue = isOverdue(task)
  return (
    <div className={`task-list-item ${task.status === 'done' ? 'bg-gray-50/60' : ''}`}>
      <button className="status-btn" onClick={() => onCycle(task)} title="Toggle status">
        {task.status === 'done' ? <CheckCircle2 size={18} style={{color:'#16a34a'}} /> : task.status === 'ongoing' ? <Clock size={18} style={{color:'#1356A0'}} /> : <Circle size={18} />}
      </button>

      <div className="task-body">
        <div className={`task-title ${task.status === 'done' ? 'line-through' : ''}`}>{task.title}</div>
        {task.description && <div className="task-desc">{task.description}</div>}
        <div className="task-meta">
          <Badge value={task.type} />
          <Badge value={task.priority} />
          <Badge value={task.status} />
          {task.due_date && <span className={`due-date ${overdue ? 'due-overdue' : ''}`}>{overdue ? '⚠ ' : ''}Due {formatDate(task.due_date)}</span>}
          {showOwner && task.profile && <span className="text-xs" style={{color:'var(--muted)'}}>· {task.profile.name}</span>}
        </div>
      </div>

      <div className="task-actions">
        <Button variant="ghost" size="sm" onClick={() => onEdit(task)} title="Edit"><Pencil size={13} /></Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(task)} title="Delete"><Trash2 size={13} /></Button>
      </div>
    </div>
  )
}
