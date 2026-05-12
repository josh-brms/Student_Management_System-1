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
    <div className={`group flex gap-3 rounded-xl p-3.5 ring-1 transition-all hover:ring-gray-300 ${task.status === 'done' ? 'ring-gray-100 bg-gray-50/60' : 'ring-gray-200 bg-white'}`}>
      <button
        onClick={() => onCycle(task)}
        title="Click to cycle status"
        className="mt-0.5 shrink-0 text-gray-400 hover:text-blue-500 transition-colors"
      >
        {task.status === 'done'
          ? <CheckCircle2 size={18} className="text-emerald-500" />
          : task.status === 'ongoing'
          ? <Clock size={18} className="text-blue-500" />
          : <Circle size={18} />
        }
      </button>

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium leading-snug ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="mt-0.5 text-xs text-gray-400 truncate">{task.description}</p>
        )}
        {task.subject && (
          <span
            className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
            style={{ background: task.subject.color_hex + '22', color: task.subject.color_hex }}
          >
            {task.subject.code ?? task.subject.name}
          </span>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge value={task.type} />
          <Badge value={task.priority} />
          <Badge value={task.status} />
          {task.due_date && (
            <span className={`text-xs ${overdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
              {overdue ? '⚠ ' : ''}Due {formatDate(task.due_date)}
            </span>
          )}
          {showOwner && task.user && (
            <span className="text-xs text-gray-400">· {task.user.name}</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" onClick={() => onEdit(task)} title="Edit">
          <Pencil size={13} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(task)} title="Delete" className="hover:text-red-500 hover:bg-red-50">
          <Trash2 size={13} />
        </Button>
      </div>
    </div>
  )
}
