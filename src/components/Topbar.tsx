import { Plus } from 'lucide-react'

interface TopbarProps {
  title: string
  onNewClick?: () => void
  showNewButton?: boolean
}

export function Topbar({ title, onNewClick, showNewButton = false }: TopbarProps) {
  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      <div className="topbar-actions">
        {showNewButton && onNewClick && (
          <button onClick={onNewClick} className="btn-new">
            <Plus size={12} />
            New task
          </button>
        )}
      </div>
    </div>
  )
}
